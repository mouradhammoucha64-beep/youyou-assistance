import {
  authenticatedCompany,
  cleanText,
  createStripeMerchantAccount,
  parseRequestBody,
  requestOrigin,
  stripeAccountState,
  stripeClient,
  updateCompanyStripe,
} from "../../../server/stripe-shared.js";

function errorResponse(res, error, stage = "start") {
  const message = String(error?.message || "");
  if (message === "AUTH_REQUIRED") return res.status(401).json({ error: "Sign in again to connect Stripe." });
  if (message === "COMPANY_NOT_FOUND") return res.status(404).json({ error: "Your company workspace was not found." });
  if (error?.code === "YOUYOU_EMAIL_INVALID") return res.status(400).json({ error: "Enter a valid Stripe email address." });
  if (error?.code === "YOUYOU_STRIPE_ALREADY_ACTIVE") return res.status(409).json({ error: "This Stripe account is already active and cannot be replaced here." });
  const stripeCode = String(error?.code || error?.raw?.code || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 80);
  console.error("YOUYOU Stripe Connect start:", { stage, stripeCode, error });

  if (/platform profile|business model|signed up for connect|complete (?:your )?connect setup/i.test(message)) {
    return res.status(409).json({
      error: "Finish your Stripe Connect platform setup, then try again.",
      diagnostic: stage,
    });
  }
  if (/branding/i.test(message)) {
    return res.status(409).json({
      error: "Save your Stripe Connect branding, then try again.",
      diagnostic: stage,
    });
  }
  if (/not configured/i.test(message)) {
    return res.status(503).json({
      error: "The payment service is not configured yet.",
      diagnostic: stage,
    });
  }
  const diagnostic = stripeCode ? `${stage}:${stripeCode}` : stage;
  return res.status(500).json({
    error: `Stripe onboarding could not be started (${diagnostic}).`,
    diagnostic,
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let stage = "authenticate";
  try {
    const { user, company, serviceConfig } = await authenticatedCompany(req);
    const stripe = stripeClient();
    const body = parseRequestBody(req);
    const requestedEmail = cleanText(body.email, 180);
    const restart = body.restart === true;
    let account = null;

    stage = "retrieve_account";
    if (/^acct_[A-Za-z0-9]+$/.test(String(company.stripe_account_id || ""))) {
      account = await stripe.accounts.retrieve(company.stripe_account_id);
      if (restart) {
        if (account.charges_enabled || account.payouts_enabled) {
          const error = new Error("An active Stripe account cannot be replaced.");
          error.code = "YOUYOU_STRIPE_ALREADY_ACTIVE";
          throw error;
        }
        account = null;
      }
    }

    if (!account) {
      stage = "create_account_v2";
      const createdAccount = await createStripeMerchantAccount({ company, user, contactEmail: requestedEmail });
      stage = "retrieve_created_account";
      account = await stripe.accounts.retrieve(createdAccount.id);
    }

    stage = "save_account";
    const accountState = stripeAccountState(account);
    await updateCompanyStripe(company.id, {
      stripe_account_id: account.id,
      stripe_connect_status: accountState.status,
      stripe_charges_enabled: accountState.chargesEnabled,
      stripe_payouts_enabled: accountState.payoutsEnabled,
    }, serviceConfig);

    stage = "create_account_link";
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
    return errorResponse(res, error, stage);
  }
}
