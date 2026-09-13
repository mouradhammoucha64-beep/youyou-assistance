import { stripeAccountState, stripeClient, supabaseConfig } from "../../server/stripe-shared.js";

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function saveOrder(event, session) {
  const { url, key } = supabaseConfig({ service: true });
  const meta = session.metadata || {};
  const row = {
    company_id: meta.company_id || null,
    landing_page_id: meta.landing_page_id || null,
    connected_account_id: event.account || null,
    checkout_session_id: session.id,
    payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
    product_name: meta.product_name || null,
    status: ["checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)
      ? "failed"
      : session.payment_status === "paid" ? "paid" : "processing",
    amount_total: Number(session.amount_total || 0),
    currency: String(session.currency || "usd").toUpperCase(),
    customer_name: meta.customer_name || session.customer_details?.name || null,
    customer_email: session.customer_details?.email || session.customer_email || null,
    customer_phone: meta.customer_phone || session.customer_details?.phone || null,
    customer_city: meta.customer_city || null,
    customer_address: meta.customer_address || null,
    quantity: Math.max(1, Number.parseInt(meta.actual_quantity, 10) || 1),
    color: meta.color || null,
    bundle: meta.bundle || null,
    options: (() => { try { return JSON.parse(meta.options_json || "{}"); } catch (_) { return {}; } })(),
    customer_message: meta.customer_message || null,
    paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const response = await fetch(`${url}/rest/v1/stripe_orders?on_conflict=checkout_session_id`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Order storage failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
  // Apply checkout updates atomically without overwriting a later refund or payment.
  const allowedStatuses = row.status === "paid" ? "processing,failed,paid" : "processing,failed";
  const update = await fetch(`${url}/rest/v1/stripe_orders?checkout_session_id=eq.${encodeURIComponent(session.id)}&connected_account_id=eq.${encodeURIComponent(event.account)}&status=in.(${allowedStatuses})`, {
    method: "PATCH",
    headers: { apikey:key, "Content-Type":"application/json", Prefer:"return=minimal" },
    body: JSON.stringify(row),
  });
  if (!update.ok) throw new Error(`Order update failed (${update.status}).`);
}

async function saveConnectedAccountState(account) {
  const { url, key } = supabaseConfig({ service:true });
  const state = stripeAccountState(account);
  const response = await fetch(`${url}/rest/v1/companies?stripe_account_id=eq.${encodeURIComponent(account.id)}`, {
    method:"PATCH",
    headers:{ apikey:key, "Content-Type":"application/json", Prefer:"return=minimal" },
    body:JSON.stringify({
      stripe_connect_status:state.status,
      stripe_charges_enabled:state.chargesEnabled,
      stripe_payouts_enabled:state.payoutsEnabled,
      updated_at:new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`Stripe account status storage failed (${response.status}).`);
}

export function refundedPaymentStatus(charge) {
  const amount = Number(charge?.amount || 0);
  const amountRefunded = Number(charge?.amount_refunded || 0);
  if (amountRefunded <= 0) return null;
  return charge?.refunded === true || (amount > 0 && amountRefunded >= amount)
    ? "refunded"
    : "partially_refunded";
}

export async function saveRefundedOrder(event, charge) {
  const connectedAccount = String(event?.account || "").trim();
  const paymentIntent = typeof charge?.payment_intent === "string"
    ? charge.payment_intent
    : charge?.payment_intent?.id || "";
  const status = refundedPaymentStatus(charge);
  if (!/^acct_[A-Za-z0-9]+$/.test(connectedAccount) || !/^pi_[A-Za-z0-9]+$/.test(paymentIntent) || !status) {
    return false;
  }

  const amountRefunded = Number(charge.amount_refunded);
  const amount = Number(charge.amount);
  if (!Number.isSafeInteger(amountRefunded) || !Number.isSafeInteger(amount) || amountRefunded <= 0 || amountRefunded > amount) {
    throw new Error("Invalid Stripe refund amount.");
  }
  const { url, key } = supabaseConfig({ service:true });
  const response = await fetch(
    `${url}/rest/v1/stripe_orders?connected_account_id=eq.${encodeURIComponent(connectedAccount)}&payment_intent_id=eq.${encodeURIComponent(paymentIntent)}${status === "partially_refunded" ? "&status=neq.refunded" : ""}&or=(amount_refunded.is.null,amount_refunded.lte.${amountRefunded})`,
    {
      method:"PATCH",
      headers:{
        apikey:key,
        "Content-Type":"application/json",
        Prefer:"return=representation",
      },
      body:JSON.stringify({ status, amount_refunded:amountRefunded, updated_at:new Date().toISOString() }),
    }
  );
  const body = await response.text();
  if (!response.ok && /amount_refunded/i.test(body) && /PGRST204|42703/.test(body)) {
    // During rollout retain V9.2 status sync, but request a retry for the amount.
    const fallback = await fetch(`${url}/rest/v1/stripe_orders?connected_account_id=eq.${encodeURIComponent(connectedAccount)}&payment_intent_id=eq.${encodeURIComponent(paymentIntent)}${status === "partially_refunded" ? "&status=neq.refunded" : ""}`, {
      method:"PATCH", headers:{ apikey:key, "Content-Type":"application/json", Prefer:"return=minimal" },
      body:JSON.stringify({ status, updated_at:new Date().toISOString() }),
    });
    if (!fallback.ok) throw new Error("Refund status storage failed during migration.");
    throw new Error("Apply supabase-v9.3-refund-amounts.sql to store refund amounts; retry this event afterwards.");
  }
  if (!response.ok) throw new Error(`Refunded order storage failed (${response.status}): ${body.slice(0,240)}`);
  try {
    const rows = JSON.parse(body || "[]");
    return Array.isArray(rows) && rows.length > 0;
  } catch (_) {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }
  try {
    const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    const signature = req.headers["stripe-signature"];
    const event = stripeClient().webhooks.constructEvent(await rawBody(req), signature, secret);
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) {
      await saveOrder(event, event.data.object);
    }
    if (event.type === "charge.refunded") {
      await saveRefundedOrder(event, event.data.object);
    }
    if (event.type === "account.updated") await saveConnectedAccountState(event.data.object);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("YOUYOU Stripe webhook:", error);
    return res.status(400).send(`Webhook error: ${String(error?.message || "Invalid event").slice(0, 220)}`);
  }
}
