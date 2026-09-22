# SEO workspace and Google Search Console setup

This release replaces the old SEO-only panels. Knowledge, business settings, merchant Stripe, owner access and subscription billing are not changed.

## Release sequence

1. Apply `supabase-v9.6-seo-workspace.sql` in the existing Supabase project's SQL Editor. The migration is additive and may be re-run. It creates only SEO tables and a quota function. Existing SEO was transient; it has no saved audit history to migrate. Business details are used as initial form suggestions; they are not overwritten.
2. Deploy the reviewed branch to a Vercel preview and verify configuration/draft/audit saves with an authenticated test workspace. Existing `SUPABASE_URL` (or `VITE_SUPABASE_URL`) and server-only `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) are required. Do not expose a service key in any `VITE_` variable.
3. Create/configure a Google Cloud project and enable **Google Search Console API** (`searchconsole.googleapis.com`). Configure **Google Auth Platform** branding, audience and contact information. For development use External / Testing and add the exact Google account used to test as a test user. Supply real public home/privacy/terms URLs when publishing the OAuth application; do not invent policy URLs.
4. In Data Access, request only `https://www.googleapis.com/auth/webmasters.readonly`.
5. Create an OAuth client of type **Web application**. Production authorized redirect URI, exactly:

   `https://www.youyouapp.com/api/seo`

   The callback intentionally has no `action` query parameter. Google supplies `code` and `state`. The app returns to `/dashboard/seo-growth?tab=google`. This is separate from Supabase sign-in and from the owner dashboard.
6. Add these Vercel **server-only** environment variables, then redeploy:

   | Name | Value |
   | --- | --- |
   | `APP_ORIGIN` | `https://www.youyouapp.com` |
   | `GOOGLE_SEARCH_CONSOLE_CLIENT_ID` | Web application's client ID |
   | `GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET` | Web application's client secret |
   | `SEO_TOKEN_ENCRYPTION_KEY` | A fresh 32-byte key encoded as base64 |

   Generate the encryption key in a trusted terminal with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` and paste it directly into Vercel. Do not commit or send secrets in chat. Keep this key stable: changing it makes stored Google refresh tokens unreadable and requires reconnecting accounts.

   For OAuth testing on a preview, use a stable HTTPS preview origin, a separate OAuth client with `<preview-origin>/api/seo`, and preview-scoped environment values. `APP_ORIGIN` must match the page where Connect Google is clicked; cross-host connection attempts are rejected. Never change production APP_ORIGIN solely to test a preview.
7. Open YOUYOU on the matching origin, sign in, and save **SEO configuration** with the actual website URL, service, market, description and Local / Online choice. Then open **Google Performance → Connect Google → Choose / change property → Use this property → Load Google performance**.
8. Finish release verification with two independent workspaces. Only merge/promote once database setup, deployment and the checklist below pass. External/Testing Google authorization can be short-lived; complete Google's required publishing/verification process before opening OAuth to all customers.

## Optional Google Maps preview

Local SEO always provides a Google Maps search link for a meaningful saved location. Online businesses do not need a map.

For an embedded map, enable **Maps Embed API** separately and set `VITE_GOOGLE_MAPS_EMBED_KEY`. This browser-visible key must be restricted to Maps Embed API and to the exact approved website referrers (for example `https://www.youyouapp.com/*`). A Google Maps billing account may be required even for a no-charge Embed SKU. Do not enable other paid Maps APIs for this feature. The map loads only when the customer clicks Preview map. Without the key, the external Maps link works and no embedded map request is made.

This is a location preview. It does not create/verify a Google Business Profile or fetch local rankings/reviews. Search Console OAuth and Maps are distinct services.

## Acceptance checklist

- SEO tabs, browser Back/Forward and Back to SEO Overview remain in SEO; refresh restores the selected tab.
- Configuration persists after logout/login. Local placeholders such as `test` do not count as complete. Online plans do not inject city/near-me phrases.
- Save and reload a page-specific SEO draft. Copy it and apply changes in the actual website editor; draft saving does not publish anything.
- Audit a public page, reopen its saved result and re-audit after a real correction. Technical signals are server-HTML observations, not proof of Google indexing.
- Google consent success returns to SEO; cancellation and expired state show a recoverable error. Choose a matching URL-prefix or domain property.
- A newly verified/empty site shows no-data copy, not fabricated metrics. Loaded reports identify property, dates and fetch time.
- Google revoked access prompts reconnection. Disconnect removes only this workspace's saved credentials and in-flight authorizations. To revoke YOUYOU at Google-account level, use Google's third-party connections settings; this can affect other workspaces using that same Google account.
- A second workspace cannot read the first one's drafts, audits, selected property or encrypted credentials. No Google tokens appear in browser network responses.
- Verify desktop and narrow mobile navigation/table scrolling on the deployed app.

## Scope and operational limits

- A website audit examines one fetched HTML page, its origin's `/robots.txt` and `/sitemap.xml`. It does not execute JavaScript, crawl the whole site, measure Core Web Vitals or prove indexability. Sitemap discovery at other paths and robots rule interpretation are outside this version.
- Keyword/content suggestions are deterministic starting points, not AI research, search volumes or keyword difficulty. Their drafts are editable.
- Google reports fetch final web search data for 28 or 90 days ending three days ago. Aggregate totals are requested separately from top-50 query/page tables, which may omit anonymized data. There is no scheduled background synchronization; refresh is explicit.
- The latest 20 audits are retained; the draft picker shows the latest 30 drafts. API requests are limited per authenticated company. Audits allow 3/minute and 30/day, Google reads 8/minute, and OAuth starts 5/minute. Limits are durable across server instances.
- Browser roles have no direct access to SEO tables. Server authorization derives company ID from the validated Supabase user's profile; client company IDs are ignored. This uses the existing project membership model and assumes profile/company membership updates are secured by the existing project policies.
- Refresh tokens are AES-256-GCM encrypted with company-bound authenticated data. OAuth uses a one-time stored state and a Secure/HttpOnly/SameSite browser cookie, followed by membership revalidation.

## Verification completed before live setup

Node unit/integration tests and the production build run locally. SQL migration/privileges/quota behavior are exercised in a local PostgreSQL-compatible runtime. A local browser workflow harness is provided in `tests/seo-browser.mjs`, using mocked provider/storage responses. It could not be executed in this environment because Chromium was unavailable and its download timed out. Deployed visual/interaction QA, real Google consent, actual Supabase deployment and live Google data remain to be verified.

References:
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- https://developers.google.com/webmaster-tools/v1/sites/list
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://developers.google.com/maps/documentation/embed/embedding-map
- https://developers.google.com/maps/documentation/urls/get-started
