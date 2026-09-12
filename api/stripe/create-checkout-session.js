import {
  allowedColors,
  allowedVariants,
  amountInMinorUnits,
  bundles,
  cleanSlug,
  cleanText,
  currencyCode,
  parseRequestBody,
  publishedCheckoutOffer,
  requestOrigin,
  stripeAccountState,
  stripeClient,
  stripeTestMode,
  supabaseConfig,
} from "../../server/stripe-shared.js";

async function savePendingOrder({ row, session, metadata, customer, quantity, color, bundle, variants, amountTotal, currency, connectedAccount, productName }) {
  const { url, key } = supabaseConfig({ service:true });
  const response = await fetch(`${url}/rest/v1/stripe_orders?on_conflict=checkout_session_id`, {
    method:"POST",
    headers:{ apikey:key, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
    body:JSON.stringify({
      company_id:row.company_id,
      landing_page_id:row.page_id,
      connected_account_id:connectedAccount,
      checkout_session_id:session.id,
      payment_intent_id:typeof session.payment_intent === "string" ? session.payment_intent : null,
      product_name:productName,
      status:"processing",
      amount_total:amountTotal,
      currency:String(currency || "usd").toUpperCase(),
      customer_name:customer.name || null,
      customer_email:customer.email || null,
      customer_phone:customer.phone || null,
      customer_city:customer.city || null,
      customer_address:customer.address || null,
      quantity:Math.max(1, Number.parseInt(metadata.actual_quantity,10) || quantity || 1),
      color:color || null,
      bundle:bundle?.label || null,
      options:variants,
      customer_message:customer.message || null,
      updated_at:new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`Pending order storage failed (${response.status}): ${(await response.text()).slice(0,180)}`);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = parseRequestBody(req);
    const slug = cleanSlug(body.slug);
    if (!slug) return res.status(400).json({ error: "Invalid landing page." });

    const row = await publishedCheckoutOffer(slug);
    if (!row?.page_id || !row?.offer) return res.status(404).json({ error: "Published offer not found." });
    const offer = row.offer;
    if (String(offer.ctaAction || "") !== "stripe") return res.status(409).json({ error: "Stripe checkout is not enabled for this offer." });
    if (String(offer.commerceMode || "product") !== "product") return res.status(409).json({ error: "Online payment is available for product offers only." });

    const min = Math.max(1, Number.parseInt(offer.quantityMin, 10) || 1);
    const max = Math.max(min, Math.min(99, Number.parseInt(offer.quantityMax, 10) || 20));
    let quantity = Math.max(min, Math.min(max, Number.parseInt(body.quantity, 10) || min));
    let unitAmount = amountInMinorUnits(offer.price);

    const requestedBundle = cleanText(body.bundle, 80);
    const bundle = requestedBundle ? bundles(offer.bundleOptions).find((item) => item.label === requestedBundle) : null;
    if (requestedBundle && (!bundle || String(offer.bundleEnabled || "off") !== "on")) {
      return res.status(400).json({ error: "Invalid bundle selection." });
    }
    if (bundle) {
      quantity = bundle.quantity;
      if (bundle.price !== null) {
        const bundleTotal = amountInMinorUnits(bundle.price);
        if (bundleTotal % quantity === 0) unitAmount = bundleTotal / quantity;
        else { unitAmount = bundleTotal; quantity = 1; }
      }
    }

    const color = cleanText(body.color, 80);
    const colors = allowedColors(offer.productColors);
    if (color && !colors.includes(color)) return res.status(400).json({ error: "Invalid color selection." });

    const requestedVariants = body.variants && typeof body.variants === "object" && !Array.isArray(body.variants) ? body.variants : {};
    const variants = {};
    const allowed = allowedVariants(offer);
    for (const [name, values] of allowed.entries()) {
      const selected = cleanText(requestedVariants[name], 80);
      if (selected && !values.includes(selected)) return res.status(400).json({ error: `Invalid ${name} selection.` });
      if (selected) variants[name] = selected;
    }

    const customer = {
      name: cleanText(body.customer?.name, 120),
      phone: cleanText(body.customer?.phone, 40),
      email: cleanText(body.customer?.email, 180),
      city: cleanText(body.customer?.city, 100),
      address: cleanText(body.customer?.address, 300),
      message: cleanText(body.customer?.message, 300),
    };
    if (!customer.name || !customer.phone || !customer.city || !customer.address) {
      return res.status(400).json({ error: "Name, phone, city and address are required." });
    }
    if (customer.phone.replace(/\D/g, "").length < 7) return res.status(400).json({ error: "Invalid phone number." });
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return res.status(400).json({ error: "Invalid email address." });

    const connectedAccount = cleanText(row.stripe_account_id, 80);
    if (!/^acct_[A-Za-z0-9]+$/.test(connectedAccount)) throw new Error("This merchant has not connected Stripe yet.");

    const stripe = stripeClient();
    const connectedAccountState = stripeAccountState(await stripe.accounts.retrieve(connectedAccount));
    if (!connectedAccountState.chargesEnabled) throw new Error("This merchant's card payments are not active yet.");
    if (!stripeTestMode() && !connectedAccountState.payoutsEnabled) {
      throw new Error("This merchant must finish Stripe payouts before accepting live payments.");
    }

    const productName = cleanText(offer.name || row.page_name, 120) || "Product order";
    const optionSummary = [color ? `Color: ${color}` : "", ...Object.entries(variants).map(([key, value]) => `${key}: ${value}`), bundle ? `Bundle: ${bundle.label}` : ""].filter(Boolean).join(" · ");
    const metadata = {
      youyou_version: "9.0",
      landing_page_id: String(row.page_id),
      company_id: String(row.company_id),
      landing_slug: slug,
      product_name: productName,
      actual_quantity: String(bundle?.quantity || quantity),
      color,
      bundle: bundle?.label || "",
      options_json: JSON.stringify(variants).slice(0, 500),
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_city: customer.city,
      customer_address: customer.address,
      customer_message: customer.message,
    };

    const origin = requestOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: currencyCode(offer.currency),
          unit_amount: unitAmount,
          product_data: { name: productName, ...(optionSummary ? { description: optionSummary.slice(0, 500) } : {}) },
        },
        quantity,
      }],
      customer_email: customer.email || undefined,
      client_reference_id: String(row.page_id),
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/p/${encodeURIComponent(slug)}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/p/${encodeURIComponent(slug)}?payment=cancelled`,
      phone_number_collection: { enabled: false },
      submit_type: "pay",
    }, { stripeAccount: connectedAccount });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    try {
      await savePendingOrder({
        row, session, metadata, customer, quantity, color, bundle, variants,
        amountTotal:unitAmount * quantity,
        currency:session.currency || currencyCode(offer.currency),
        connectedAccount,
        productName,
      });
    } catch (storageError) {
      console.error("YOUYOU pending Stripe order:", storageError);
    }
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("YOUYOU Stripe checkout:", error);
    const message = /not configured|not connected|not active|finish Stripe payouts|valid selling price|lookup failed/i.test(String(error?.message || ""))
      ? String(error.message).slice(0, 220)
      : "Secure checkout could not be started. Please try again.";
    return res.status(500).json({ error: message });
  }
}
