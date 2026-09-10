import { cleanSlug, cleanText, publishedCheckoutOffer, stripeClient } from "../../server/stripe-shared.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const slug = cleanSlug(req.query?.slug);
    const sessionId = cleanText(req.query?.session_id, 120);
    if (!slug || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) return res.status(400).json({ error: "Invalid payment reference." });
    const row = await publishedCheckoutOffer(slug);
    const connectedAccount = cleanText(row?.stripe_account_id || process.env.STRIPE_TEST_CONNECTED_ACCOUNT_ID, 80);
    if (!row?.page_id || !/^acct_[A-Za-z0-9]+$/.test(connectedAccount)) return res.status(404).json({ error: "Payment account not found." });
    const session = await stripeClient().checkout.sessions.retrieve(sessionId, {}, { stripeAccount: connectedAccount });
    const matchesPage = String(session.metadata?.landing_page_id || "") === String(row.page_id);
    if (!matchesPage) return res.status(404).json({ error: "Payment reference not found." });
    return res.status(200).json({ paid: session.payment_status === "paid", status: session.payment_status });
  } catch (error) {
    console.error("YOUYOU Stripe verify:", error);
    return res.status(500).json({ error: "Payment confirmation is temporarily unavailable." });
  }
}

