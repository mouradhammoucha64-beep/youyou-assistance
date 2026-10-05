# YOUYOU SEO V12 — Google Search Console restored on V11

V12 preserves the V11 SEO interface and audit fixes. It restores the Google OAuth backend from feat/seo-google-workspace and adds a Google Performance tab, connected status, website/property selection, 28/90-day reports, query/page/daily tables, empty/error states, and disconnect. The checklist counter no longer wraps. The selected tab survives refresh and the OAuth return opens Google Performance.

## Install

1. In GitHub Desktop select the existing repository and main. Keep the current checkout and its configuration.
2. Extract this archive. Copy the CONTENTS of youyou-assistance-main into the existing checkout, replacing matching files. Include all new api, server, shared and test files. Do not replace the checkout directory itself.
3. Review changes, commit `Restore Google Search Console on SEO V12`, then Push origin. Wait for Vercel Ready.
4. Check Vercel Production environment variable NAMES before changing anything. Existing values may already be correct. Never paste secrets into chat or GitHub.

Required server variables:
- SUPABASE_URL (or existing VITE_SUPABASE_URL)
- SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
- APP_ORIGIN = https://www.youyouapp.com (provided this domain serves this Vercel project)
- GOOGLE_SEARCH_CONSOLE_CLIENT_ID
- GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
- SEO_TOKEN_ENCRYPTION_KEY = an existing stable Base64-encoded 32-byte key

If the encryption key already exists, KEEP IT. Replacing it makes existing stored connections unreadable. If missing, generate privately in a trusted terminal:
`node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`
Set server secrets without the VITE_ prefix. Redeploy after environment changes.

5. In the EXISTING Supabase project, apply `supabase-v9.6-seo-workspace.sql` through SQL Editor if not already applied. The supplied migration is additive and re-runnable. It creates SEO storage and a rate-limit function, and restricts SEO table access to the service role. It does not delete business data.
6. Existing Google OAuth client: keep authorized redirect `https://www.youyouapp.com/api/seo`. Confirm Google Search Console API is enabled, read-only webmasters scope is allowed, and the test Google account is on the audience list if the OAuth app is in Testing. No need to create another client if the existing one matches.
7. Open the app on the SAME origin as APP_ORIGIN, sign in, then SEO → Google Performance. Save the actual website here, Connect Google, Choose / change property, Use this property, Load Google performance. The reporting website is separate from the business profile; saving it clears the selected property to prevent mismatched reports.

## What remains to verify live

- Production variables and Supabase migration are present.
- Real consent succeeds and returns to Google Performance.
- A matching property loads real data OR an honest no-data state.
- Two independent workspaces cannot access each other's Google connection.
- Desktop and mobile appearance on the deployed app.

Only after these checks should the Google integration be considered operational. This archive alone cannot confirm remote configuration or authorize a Google account.

## Verification and limits

54 Node tests pass, including OAuth browser/state binding, replay rejection, tenant-scoped storage, encrypted token isolation, quotas, property matching, empty reports and revoked access. Production Vite build passes (existing large-chunk warning). A separate mocked DOM interaction check passed for callback status, save website, select property, empty report, revoked access and disconnect. No real Google consent, live Supabase migration, or deployed visual test was performed here.

V11 audit still examines server HTML and does not execute JavaScript. Keyword/content suggestions remain planning suggestions, not keyword-volume research. Google reports are loaded on demand and show final web-search data for 28/90 days ending three days ago. Query/page tables are limited to 50 rows and may omit anonymized queries. This does not implement Google Business Profile, automatic website edits, or WhatsApp API.

The old branch's replacement SEO workspace UI, saved-audit implementation and optional Maps embedding were not activated; V11 remains the interface. Its database schema includes reserved draft/audit tables, but V12 does not claim that V11 audit history is persisted there.

Official references:
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
