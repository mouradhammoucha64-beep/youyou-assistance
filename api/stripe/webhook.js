import { stripeClient, supabaseConfig } from "../../server/stripe-shared.js";

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function saveOrder(event, session) {
  const { url, key } = supabaseConfig({ service: true });
  const meta = session.metadata || {};
  const row = {
    company_id: meta.company_id || null,
    landing_page_id: meta.landing_page_id || null,
    connected_account_id: event.account || null,
    checkout_session_id: session.id,
    payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
    status: session.payment_status === "paid" ? "paid" : "processing",
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
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Order storage failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
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
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await saveOrder(event, event.data.object);
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("YOUYOU Stripe webhook:", error);
    return res.status(400).send(`Webhook error: ${String(error?.message || "Invalid event").slice(0, 220)}`);
  }
}

