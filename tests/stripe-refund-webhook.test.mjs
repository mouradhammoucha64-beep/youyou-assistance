import test from "node:test";
import assert from "node:assert/strict";

import { refundedPaymentStatus, saveRefundedOrder, saveOrder } from "../api/stripe/webhook.js";

test("duplicate and reordered checkout/refund deliveries preserve full refunds and fulfilment", async (t) => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_SECRET_KEY = "test-service-key";
  let stored;
  globalThis.fetch = async (url, options) => {
    const query = new URL(url).searchParams;
    const row = JSON.parse(options.body);
    if (options.method === "POST") {
      if (!stored) stored = { ...row, order_status:"confirmed" };
      else assert.match(options.headers.Prefer, /ignore-duplicates/);
      return new Response(null, { status:204 });
    }
    const condition = query.get("status");
    const allowed = !condition || (condition === "neq.refunded" ? stored.status !== "refunded" : condition.slice(4,-1).split(",").includes(stored.status));
    if (allowed) stored = { ...stored, ...row };
    return new Response(JSON.stringify(allowed ? [stored] : []), { status:200 });
  };
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = oldKey;
  });
  const event = { account:"acct_Test123", type:"checkout.session.completed" };
  const session = { id:"cs_Test123", payment_intent:"pi_Test456", payment_status:"paid", amount_total:3000, metadata:{ company_id:"company1" } };
  await saveOrder(event, session);
  assert.equal(stored.status, "paid");
  const charge = { payment_intent:"pi_Test456", amount:3000, amount_refunded:3000, refunded:true };
  await saveRefundedOrder(event, charge);
  await saveRefundedOrder(event, charge);
  await saveOrder(event, session);
  await saveRefundedOrder(event, { ...charge, amount_refunded:1000, refunded:false });
  assert.equal(stored.status, "refunded");
  assert.equal(stored.order_status, "confirmed");
  assert.equal(stored.amount_total, 3000);
});

test("maps full and partial Stripe refunds to order payment statuses", () => {
  assert.equal(refundedPaymentStatus({ amount:3000, amount_refunded:3000, refunded:true }), "refunded");
  assert.equal(refundedPaymentStatus({ amount:3000, amount_refunded:1200, refunded:false }), "partially_refunded");
  assert.equal(refundedPaymentStatus({ amount:3000, amount_refunded:0, refunded:false }), null);
});

test("refund updates are scoped to the connected account and PaymentIntent", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-service-key";

  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response('[{"id":"order_1"}]', { status:200 });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = originalKey;
  });

  const matched = await saveRefundedOrder(
    { account:"acct_Test123" },
    { payment_intent:"pi_Test456", amount:3000, amount_refunded:3000, refunded:true }
  );

  assert.equal(matched, true);
  assert.match(request.url, /connected_account_id=eq\.acct_Test123/);
  assert.match(request.url, /payment_intent_id=eq\.pi_Test456/);
  assert.equal(request.options.method, "PATCH");
  assert.equal(JSON.parse(request.options.body).status, "refunded");
});

test("refund events without safe Connect identifiers are ignored", async () => {
  assert.equal(await saveRefundedOrder({}, { amount:3000, amount_refunded:3000, refunded:true }), false);
  assert.equal(await saveRefundedOrder({ account:"acct_Test123" }, { payment_intent:null, amount:3000, amount_refunded:3000, refunded:true }), false);
});
