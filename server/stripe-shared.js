import Stripe from "stripe";

const DEFAULT_SUPABASE_URL = "https://zprvmydgjxsifuhjplll.supabase.co";

export function stripeClient() {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(secretKey);
}

export async function createStripeMerchantAccount({ company, user }) {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");

  const businessEmail = cleanText(company?.business_email, 180);
  const userEmail = cleanText(user?.email, 180);
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const contactEmail = isEmail(businessEmail) ? businessEmail : isEmail(userEmail) ? userEmail : "";
  const displayName = cleanText(company?.name || company?.business_name || "YOUYOU merchant", 120);
  const countryCandidate = cleanText(company?.country, 2).toUpperCase();
  const country = countryCandidate === "CA" ? "CA" : "US";
  const body = {
    display_name: displayName,
    dashboard: "full",
    identity: { country },
    configuration: {
      merchant: {
        capabilities: {
          card_payments: { requested: true },
        },
      },
    },
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    metadata: {
      youyou_company_id: String(company.id),
      youyou_workspace: "true",
    },
    include: ["configuration.merchant", "defaults", "requirements"],
  };
  if (contactEmail) body.contact_email = contactEmail;

  const response = await fetch("https://api.stripe.com/v2/core/accounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      "Stripe-Version": "2026-08-26.dahlia",
      "Idempotency-Key": `youyou-merchant-${String(company.id)}`,
    },
    body: JSON.stringify(body),
  });
  const result = await jsonOrText(response);
  if (!response.ok || !/^acct_[A-Za-z0-9]+$/.test(String(result?.id || ""))) {
    const stripeError = result?.error || result || {};
    const error = new Error(String(stripeError?.message || `Stripe Accounts v2 creation failed (${response.status}).`));
    error.code = String(stripeError?.code || stripeError?.type || "");
    throw error;
  }
  return result;
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
  const serviceKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const key = service ? serviceKey : anonKey;
  if (!url || !key) {
    throw new Error(service ? "SUPABASE_SECRET_KEY is not configured." : "Supabase public API is not configured.");
  }
  return { url, key };
}

export async function publishedCheckoutOffer(slug) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/get_stripe_checkout_offer`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
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

export function bearerToken(req) {
  const header = String(req.headers?.authorization || req.headers?.Authorization || "").trim();
  const match = header.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] || "";
}

async function jsonOrText(response) {
  const text = await response.text();
  try { return JSON.parse(text || "{}"); } catch (_) { return { message: text }; }
}

export async function authenticatedCompany(req) {
  const token = bearerToken(req);
  if (!token) throw new Error("AUTH_REQUIRED");

  const publicConfig = supabaseConfig();
  const userResponse = await fetch(`${publicConfig.url}/auth/v1/user`, {
    headers: { apikey: publicConfig.key, Authorization: `Bearer ${token}` },
  });
  const user = await jsonOrText(userResponse);
  if (!userResponse.ok || !user?.id) throw new Error("AUTH_REQUIRED");

  const serviceConfig = supabaseConfig({ service: true });
  const profileResponse = await fetch(
    `${serviceConfig.url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=company_id&limit=1`,
    { headers: { apikey: serviceConfig.key, Accept: "application/json" } }
  );
  const profiles = await jsonOrText(profileResponse);
  const companyId = Array.isArray(profiles) ? profiles[0]?.company_id : null;
  if (!profileResponse.ok || !companyId) throw new Error("COMPANY_NOT_FOUND");

  const companyResponse = await fetch(
    `${serviceConfig.url}/rest/v1/companies?id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`,
    { headers: { apikey: serviceConfig.key, Accept: "application/json" } }
  );
  const companies = await jsonOrText(companyResponse);
  const company = Array.isArray(companies) ? companies[0] : null;
  if (!companyResponse.ok || !company?.id) throw new Error("COMPANY_NOT_FOUND");
  return { user, company, serviceConfig };
}

export async function updateCompanyStripe(companyId, values, serviceConfig = supabaseConfig({ service: true })) {
  const response = await fetch(
    `${serviceConfig.url}/rest/v1/companies?id=eq.${encodeURIComponent(companyId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceConfig.key,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }),
    }
  );
  const rows = await jsonOrText(response);
  if (!response.ok) throw new Error(`Stripe connection could not be saved (${response.status}).`);
  return Array.isArray(rows) ? rows[0] || null : rows;
}

export function stripeAccountState(account) {
  const chargesEnabled = Boolean(account?.charges_enabled);
  const payoutsEnabled = Boolean(account?.payouts_enabled);
  const detailsSubmitted = Boolean(account?.details_submitted);
  const requirementsDue = Array.isArray(account?.requirements?.currently_due)
    ? account.requirements.currently_due.length
    : 0;
  const status = chargesEnabled && payoutsEnabled
    ? "connected"
    : detailsSubmitted
      ? "restricted"
      : "pending";
  return {
    status,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    requirementsDue,
  };
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
