import {
  authenticatedCompany,
  stripeAccountState,
  stripeClient,
  updateCompanyStripe,
} from "../../../server/stripe-shared.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { company, serviceConfig } = await authenticatedCompany(req);
    const accountId = String(company.stripe_account_id || "");
    if (!/^acct_[A-Za-z0-9]+$/.test(accountId)) {
      return res.status(200).json({
        status: "not_connected",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirementsDue: 0,
      });
    }

    const account = await stripeClient().accounts.retrieve(accountId);
    const accountState = stripeAccountState(account);
    await updateCompanyStripe(company.id, {
      stripe_connect_status: accountState.status,
      stripe_charges_enabled: accountState.chargesEnabled,
      stripe_payouts_enabled: accountState.payoutsEnabled,
    }, serviceConfig);

    return res.status(200).json({
      ...accountState,
      accountLabel: accountState.status === "connected" ? `Stripe ••••${account.id.slice(-4)}` : "Stripe onboarding",
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (message === "AUTH_REQUIRED") return res.status(401).json({ error: "Sign in again to check Stripe." });
    if (message === "COMPANY_NOT_FOUND") return res.status(404).json({ error: "Your company workspace was not found." });
    console.error("YOUYOU Stripe Connect status:", error);
    return res.status(500).json({ error: "Stripe connection status could not be checked." });
  }
}
