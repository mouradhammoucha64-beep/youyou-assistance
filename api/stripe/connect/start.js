import {
  authenticatedCompany,
  cleanText,
  requestOrigin,
  stripeAccountState,
  stripeClient,
  updateCompanyStripe,
} from "../../../server/stripe-shared.js";

function errorResponse(res, error) {
  const message = String(error?.message || "");
  if (message === "AUTH_REQUIRED") return res.status(401).json({ error: "Sign in again to connect Stripe." });
  if (message === "COMPANY_NOT_FOUND") return res.status(404).json({ error: "Your company workspace was not found." });
  console.error("YOUYOU Stripe Connect start:", error);
  return res.status(500).json({ error: "Stripe onboarding could not be started. Please try again." });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { user, company, serviceConfig } = await authenticatedCompany(req);
    const stripe = stripeClient();
    let account = null;

    if (/^acct_[A-Za-z0-9]+$/.test(String(company.stripe_account_id || ""))) {
      account = await stripe.accounts.retrieve(company.stripe_account_id);
    } else {
      const website = cleanText(company.website_url, 240);
      const accountData = {
        type: "standard",
        email: cleanText(company.business_email || user.email, 180) || undefined,
        metadata: {
          youyou_company_id: String(company.id),
          youyou_workspace: "true",
        },
      };
      if (/^https:\/\//i.test(website)) {
        accountData.business_profile = { url: website };
      } else {
        accountData.business_profile = {
          product_description: cleanText(company.business_description || company.industry || "Online sales through YOUYOU", 240),
        };
      }
      account = await stripe.accounts.create(accountData);
    }

    const accountState = stripeAccountState(account);
    await updateCompanyStripe(company.id, {
      stripe_account_id: account.id,
      stripe_connect_status: accountState.status,
      stripe_charges_enabled: accountState.chargesEnabled,
      stripe_payouts_enabled: accountState.payoutsEnabled,
    }, serviceConfig);

    const origin = requestOrigin(req);
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/settings?stripe=refresh`,
      return_url: `${origin}/dashboard/settings?stripe=return`,
      type: "account_onboarding",
      collection_options: { fields: "eventually_due" },
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    return errorResponse(res, error);
  }
}
