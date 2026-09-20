# Owner workspace

Route: `/dashboard/owner` on the application domain. The owner page is read-only.

## Access setup

1. Use an existing YOUYOU/Supabase login account.
2. In Supabase Authentication → Users, copy that account's **User UID**.
3. In Vercel project server environment variables, set `OWNER_USER_IDS` to that exact UUID. For multiple administrators use comma-separated UUIDs. Do not use an email, company ID, profile role, or a `VITE_` variable.
4. Existing Supabase public and service credentials are used server-side. No new database migration or RLS change is required.
5. Set this for the environment being tested (Preview first, then Production) and deploy the relevant commit.
6. Sign in through YOUYOU and open `/dashboard/owner`. Check that a normal merchant account gets denied.

The API validates the bearer token with Supabase Auth, then checks the verified user UUID against the server allowlist before accessing any cross-company data. Missing owner configuration fails closed. GET only; no delete, update, impersonation, payment or refund operations. All responses are private/no-store. Profiles and companies supplied by the client never authorize access.

## Data shown

- Company count, provisioned profile count, published landing-page count. Unavailable totals are shown as unavailable, never as fabricated zeroes.
- Registered Auth accounts (20/page): email, UUID, registration date, last sign-in.
- Workspaces (20/page): company name, UUID, stored Stripe Connect status. This is the application's recorded status, not a live Stripe capability check.
- YOUYOU subscription billing: explicitly not connected. No MRR or subscription status is inferred from merchant payments.

## Scope and validation

Owner layout has its own CSS and lazy-loaded module; merchant dashboard, home, builder, AI and Stripe workflows are not restyled or changed. Source integration is a single route check at application boot. Existing main AI fixes are retained.

Automated API tests cover exact allowlist matching, missing/invalid authentication, forged metadata/query IDs, method rejection, data minimization, bounded pagination and unavailable counts. Browser checks use mocked platform data and must not be represented as real owner/production validation. Final deployment needs owner and non-owner account checks against the live API.

The earlier audit-safety PR #1 remains a separate change; this owner branch does not silently merge it.
