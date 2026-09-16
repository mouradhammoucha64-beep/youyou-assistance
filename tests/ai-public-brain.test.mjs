import test from "node:test";
import assert from "node:assert/strict";
import {
  FALLBACK_REPLY,
  buildInstructions,
  sanitizeReply,
} from "../server/ai-public-chat.js";

test("YOUYOU website widget receives platform knowledge and truthful handoff rules", () => {
  const instructions = buildInstructions({
    settings: { language: "English", response_style: "Detailed" },
    company: {
      name: "YOUYOU",
      website_url: "https://youyouapp.com",
      business_email: "contact@youyouapp.com",
      business_phone: "+1 555 0100",
    },
    knowledge: [],
    page: null,
    source: "website_widget",
    clientContext: "Page: YOUYOU\nURL: https://youyouapp.com\nContent: AI Growth Platform",
  });

  assert.match(instructions, /YOUYOU PLATFORM KNOWLEDGE/);
  assert.match(instructions, /Landing Pages \/ Landing Studio/);
  assert.match(instructions, /Starter \$29\/month/);
  assert.match(instructions, /NO FALSE HANDOFF RULE/);
  assert.match(instructions, /contact@youyouapp\.com/);
});

test("merchant landing widget prioritizes merchant page and does not receive YOUYOU platform brain", () => {
  const instructions = buildInstructions({
    settings: { language: "English" },
    company: {
      name: "Merchant Store",
      business_email: "sales@merchant.example",
    },
    knowledge: [{ title: "Delivery", content: "Delivery takes 2 business days." }],
    page: {
      name: "Glow Serum",
      content: { price: "$45", headline: "Glow Serum", guarantee: "30 days" },
    },
    source: "published_landing_page",
    clientContext: "Glow Serum $45 Buy now",
  });

  assert.match(instructions, /LANDING PAGE MODE/);
  assert.match(instructions, /Glow Serum/);
  assert.match(instructions, /Delivery takes 2 business days/);
  assert.doesNotMatch(instructions, /YOUYOU PLATFORM KNOWLEDGE/);
});

test("reply sanitizer removes invented contact email and false team handoff", () => {
  const cleaned = sanitizeReply(
    "I have sent your request to the support team. You can also email fake-support@youyouapp.com.",
    { business_email: "contact@youyouapp.com" },
    null,
    "Website: https://youyouapp.com Contact: contact@youyouapp.com"
  );

  assert.doesNotMatch(cleaned, /fake-support@youyouapp\.com/);
  assert.match(cleaned, /contact@youyouapp\.com/);
  assert.doesNotMatch(cleaned, /sent your request to the support team/i);
});

test("fallback never claims a message was sent or saved for a team", () => {
  assert.doesNotMatch(FALLBACK_REPLY, /team|sent|saved|forwarded|escalated/i);
});
