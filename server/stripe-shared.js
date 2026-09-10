import Stripe from "stripe";

const DEFAULT_SUPABASE_URL = "https://zprvmydgjxsifuhjplll.supabase.co";

export function stripeClient() {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(secretKey);
}

export function supabaseConfig({ service = false } = {}) {
  const url = String(
    process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");
  const anonKey = String(
    process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      ""
  ).trim();
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const key = service ? serviceKey : anonKey;
  if (!url || !key) {
    throw new Error(service ? "SUPABASE_SERVICE_ROLE_KEY is not configured." : "Supabase public API is not configured.");
  }
  return { url, key };
}

export async function publishedCheckoutOffer(slug) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/get_stripe_checkout_offer`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_slug: slug }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Checkout offer lookup failed (${response.status}): ${detail.slice(0, 240)}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : rows || null;
}

export function cleanText(value, max = 180) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanSlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(slug) ? slug : "";
}

export function requestOrigin(req) {
  const forwardedHost = cleanText(req.headers?.["x-forwarded-host"], 240);
  const host = forwardedHost || cleanText(req.headers?.host, 240);
  if (!/^[a-z0-9.-]+(?::\d{2,5})?$/i.test(host)) throw new Error("Invalid request host.");
  const forwardedProto = cleanText(req.headers?.["x-forwarded-proto"], 16).toLowerCase();
  const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : "https";
  return `${protocol}://${host}`;
}

export function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length <= 24_000) return JSON.parse(req.body || "{}");
  return {};
}

export function optionValues(value) {
  return String(value || "").split(",").map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 16);
}

export function allowedVariants(offer = {}) {
  const result = new Map();
  const add = (enabled, name, values) => {
    if (String(enabled || "off") !== "on") return;
    const options = optionValues(values);
    if (options.length) result.set(name, options);
  };
  add(offer.sizeEnabled, "Size", offer.sizeOptions);
  add(offer.weightEnabled, "Weight", offer.weightOptions);
  add(offer.volumeEnabled, "Volume", offer.volumeOptions);
  add(offer.unitsEnabled, "Units", offer.unitsOptions);
  if (String(offer.customOptionEnabled || "off") === "on") {
    add("on", cleanText(offer.customOptionName, 40) || "Option", offer.customOptionValues);
  }
  return result;
}

export function allowedColors(value) {
  return String(value || "").split("\n").map((line) => cleanText(line.split("|")[0], 80)).filter(Boolean).slice(0, 16);
}

export function bundles(value) {
  return String(value || "").split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 10).map((line) => {
    const [labelRaw, qtyRaw, priceRaw] = line.split("|");
    const quantity = Math.max(1, Math.min(99, Number.parseInt(qtyRaw, 10) || 1));
    const priceText = String(priceRaw || "").trim().replace(",", ".");
    const price = priceText === "" ? null : Math.max(0, Number(priceText) || 0);
    return { label: cleanText(labelRaw, 80) || `${quantity} items`, quantity, price };
  });
}

export function currencyCode(value) {
  const code = String(value || "USD").trim().toUpperCase();
  return code === "CAD" ? "cad" : "usd";
}

export function amountInMinorUnits(value) {
  const amount = Number(String(value || "").replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("This published offer does not have a valid selling price.");
  return Math.round(amount * 100);
}

