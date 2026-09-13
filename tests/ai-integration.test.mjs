import test from "node:test";
import assert from "node:assert/strict";
import {
  AI_LIMITS,
  FALLBACK_REPLY,
  buildInstructions,
  createAiChatHandler,
  createAiStudioHandler,
  historyInput,
  publicError,
  responseText,
} from "../server/ai-chat.js";

const companyId = "11111111-1111-4111-8111-111111111111";
const conversationId = "22222222-2222-4222-8222-222222222222";

function responseRecorder() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

function env() {
  return {
    SUPABASE_URL: "https://database.example",
    SUPABASE_SECRET_KEY: "server-database-secret",
    OPENAI_API_KEY: "server-openai-secret",
  };
}

function chatFetch({ tenant = companyId, openAiStatus = 200, openAiCode = "" } = {}) {
  const calls = [];
  const mock = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (url === "https://api.openai.com/v1/responses") {
      if (openAiStatus !== 200) {
        return new Response(JSON.stringify({ error: { code: openAiCode } }), { status: openAiStatus });
      }
      return new Response(JSON.stringify({
        output: [{ content: [{ type: "output_text", text: "The studio is open until 6 PM." }] }],
      }));
    }
    if (String(url).includes("/companies?")) return new Response(JSON.stringify([{ id: companyId, name: "Test Company", city: "Toronto" }]));
    if (String(url).includes("/conversations?")) return new Response(JSON.stringify([{ id: conversationId, company_id: tenant }]));
    if (String(url).includes("/ai_settings?")) return new Response(JSON.stringify([{ agent_name: "Alex", tone: "Friendly", language: "English", response_style: "Concise" }]));
    if (String(url).includes("/knowledge?")) return new Response(JSON.stringify([{ title: "Hours", content: "Open until 6 PM." }]));
    if (String(url).includes("/landing_pages?")) return new Response(JSON.stringify([{ name: "Offer", content: { price: "$45" } }]));
    if (String(url).includes("/messages?") && !options.method) return new Response(JSON.stringify([{ sender: "visitor", content: "When do you close?" }]));
    if (String(url).endsWith("/messages") && options.method === "POST") return new Response("", { status: 201 });
    throw new Error(`Unexpected URL: ${url}`);
  };
  return { calls, mock };
}

test("chat sends a bounded server-side Responses API request and saves the answer", async () => {
  const { calls, mock } = chatFetch();
  const handler = createAiChatHandler({ fetchImpl: mock, env: env() });
  const res = responseRecorder();
  await handler({
    method: "POST",
    headers: { origin: "https://merchant.example", "x-forwarded-for": "203.0.113.10" },
    body: { companyId, conversationId, message: "When do you close?", slug: "offer" },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, reply: "The studio is open until 6 PM.", agentName: "Alex" });
  assert.equal(res.headers["Access-Control-Allow-Origin"], "https://merchant.example");
  const openAiCall = calls.find((call) => call.url.includes("api.openai.com"));
  assert.equal(openAiCall.options.headers.Authorization, "Bearer server-openai-secret");
  const payload = JSON.parse(openAiCall.options.body);
  assert.equal(payload.model, "gpt-5-mini");
  assert.equal(payload.max_output_tokens, AI_LIMITS.maxOutputTokens);
  assert.equal(payload.store, false);
  assert.ok(payload.input.length <= AI_LIMITS.maxHistoryMessages + 2);
  assert.ok(!openAiCall.options.body.includes("server-openai-secret"));
  const saved = calls.find((call) => call.url.endsWith("/messages") && call.options.method === "POST");
  assert.equal(JSON.parse(saved.options.body).sender, "agent");
});

test("chat fails closed when a conversation belongs to another company", async () => {
  const { calls, mock } = chatFetch({ tenant: "33333333-3333-4333-8333-333333333333" });
  const handler = createAiChatHandler({ fetchImpl: mock, env: env() });
  const res = responseRecorder();
  await handler({ method: "POST", headers: { "x-forwarded-for": "203.0.113.11" }, body: { companyId, conversationId, message: "Hello" } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, "conversation_not_allowed");
  assert.equal(calls.some((call) => call.url.includes("api.openai.com")), false);
});

test("exhausted API credit returns a graceful reply without exposing upstream details", async () => {
  const { mock } = chatFetch({ openAiStatus: 429, openAiCode: "credit_balance_exhausted" });
  const handler = createAiChatHandler({ fetchImpl: mock, env: env(), now: () => 1000 });
  const res = responseRecorder();
  await handler({ method: "POST", headers: { "x-forwarded-for": "203.0.113.12" }, body: { companyId, conversationId, message: "Hello" } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "ai_budget_unavailable");
  assert.equal(res.body.reply, FALLBACK_REPLY);
  assert.doesNotMatch(JSON.stringify(res.body), /credit_balance|server-openai-secret/);
});

test("AI Studio requires authentication before any tenant or OpenAI access", async () => {
  let calls = 0;
  const handler = createAiStudioHandler({ fetchImpl: async () => { calls += 1; return new Response("{}"); }, env: env() });
  const res = responseRecorder();
  await handler({ method: "POST", headers: {}, body: { action: "generate", brief: { idea: "An ad" } } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(calls, 0);
});

test("AI Studio authenticates the user, scopes business context, and caps generation", async () => {
  const userId = "44444444-4444-4444-8444-444444444444";
  const calls = [];
  const mock = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/auth/v1/user")) {
      assert.equal(options.headers.Authorization, "Bearer signed-in-session");
      return new Response(JSON.stringify({ id: userId }));
    }
    if (String(url).includes("/profiles?")) return new Response(JSON.stringify([{ company_id: companyId }]));
    if (String(url).includes("/companies?")) return new Response(JSON.stringify([{ id: companyId, name: "Test Company" }]));
    if (String(url).includes("/ai_settings?")) return new Response(JSON.stringify([{ tone: "Friendly", language: "English" }]));
    if (String(url).includes("/knowledge?")) return new Response(JSON.stringify([{ title: "Offer", content: "A 45 dollar beauty product." }]));
    if (url === "https://api.openai.com/v1/responses") {
      return new Response(JSON.stringify({ output_text: "Campaign ready." }));
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const handler = createAiStudioHandler({ fetchImpl: mock, env: env() });
  const res = responseRecorder();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer signed-in-session" },
    body: { action: "generate", brief: { idea: "Create a beauty product video", language: "English" } },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, output: "Campaign ready." });
  const openAiCall = calls.find((call) => call.url.includes("api.openai.com"));
  const payload = JSON.parse(openAiCall.options.body);
  assert.equal(payload.max_output_tokens, AI_LIMITS.studioMaxOutputTokens);
  assert.equal(payload.store, false);
  assert.match(payload.instructions, /45 dollar beauty product/);
  assert.ok(!openAiCall.options.body.includes("signed-in-session"));
});

test("helpers bound history, isolate instructions, and parse Responses output", () => {
  const history = Array.from({ length: 20 }, (_, index) => ({ sender: index % 2 ? "agent" : "visitor", content: `message ${index}` }));
  assert.equal(historyInput(history, "latest").length, AI_LIMITS.maxHistoryMessages + 1);
  const instructions = buildInstructions({
    settings: { language: "English", response_style: "Concise" },
    company: { name: "Acme" },
    knowledge: [{ title: "Policy", content: "No invented facts." }],
    page: null,
  });
  assert.match(instructions, /Never invent prices/);
  assert.match(instructions, /No invented facts/);
  assert.equal(responseText({ output_text: "  Hello  " }), "Hello");
  assert.equal(publicError({ status: 429, code: "project_spend_limit_exceeded" }).code, "ai_budget_unavailable");
});
