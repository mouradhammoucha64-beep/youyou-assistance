# Audit safety release — activation gate

Changes are prepared on a separate branch. Do not merge to main until the database migration and publication origin are configured. Missing origin configuration deliberately returns 503 for published pages; missing SQL blocks new draft saves and SEO quotas.

## What changes

- Published HTML redirects to a separate host before it can execute. The publication host exposes only landing routes, the landing AI asset and visitor checkout/chat endpoints; login/dashboard/app asset routes redirect to the app origin. Middleware applies before Vercel rewrites. Builder previews use an opaque sandbox with source-checked scroll messages.
- `draft_content` stores edits; `content` remains the published offer read by existing checkout and AI code. Publishing atomically updates both. A DB trigger protects the live offer from old-client autosaves.
- Lead scores, summaries and extracted contact information use visitor-authored messages only.
- SEO requires login, a persistent per-user five-per-minute quota, DNS-pinned outbound connections, standard ports, streaming byte limits and timeouts through body completion.
- No Stripe/refund or AI module changes; no real AI calls or payments used in verification.

## Required setup (in order)

1. In Supabase SQL Editor, inspect pending legacy published edits:

```sql
select id, name, slug from public.landing_pages
where status='published' and content->>'hasUnpublishedChanges'='true';
```

If rows appear, deliberately republish or unpublish them through the existing UI after checking the intended live price. Do not blindly copy draft data into live offers. The migration aborts atomically if such rows remain. An empty list does not prove historical HTML matches every field; manually compare current live offer prices before rollout.

2. Apply `supabase-v9.6-audit-safety.sql` once; it is repeatable and preserves records. It adds draft/revision fields, a freeze trigger, and a private SEO quota table/function. Existing RLS and Stripe fields are not modified. Test locally passed on disposable PostgreSQL/PGlite; hosted application is still required.

3. Add `pages.youyouapp.com` (or another approved unused publication-only host) to this Vercel project. Follow Vercel's displayed DNS record and wait for valid DNS/TLS. Do not purchase a new domain. Do not enable Supabase authentication redirects to this host. Never use a hostname that previously hosted logged-in app sessions.

4. Set these server environment variables for the intended deployment:

```text
APP_ORIGIN=https://www.youyouapp.com
PUBLISHED_PAGES_ORIGIN=https://pages.youyouapp.com
```

Use the actual working application origin if different; these are proposed values, not verified domain ownership/configuration. No secret is needed in either variable. Use a separate publication host for Preview deployments if staging is required; do not mix staging data with the production publication host.

5. Merge/deploy only after setup. Existing app `/p/slug` URLs redirect to the publication host and preserve checkout return parameters. Confirm middleware is present in the Vercel build, since `vite build` alone does not compile platform middleware.

## Acceptance before marking live complete

- Logged-in app session remains inaccessible from a publication page; direct app `/api/published-page?slug=...` redirects too. On the publication host `/dashboard`, `/index.html`, and app assets cannot serve the authenticated application.
- Check published images/video, builder preview/scroll, form save, visitor chat and checkout success/cancel return flow in staging. Raw tenant HTML remains active on its isolated origin; this is origin isolation, not HTML sanitization or a guarantee against tenant phishing. Different tenant pages still share this publication host.
- Change a $45 draft to $55, wait for autosave, reload the editor: editor shows $55, public page and sandbox checkout show $45. Publish: both become $55.
- Verify sixth SEO audit within a minute returns 429, another user remains independent, public unauthenticated call returns 401.
- A visitor greeting plus the assistant's sales pitch must not become a HOT lead; business support email in agent text must not become a visitor contact.

## Verification performed

- 28 automated tests pass; production Vite build passes with the existing bundle-size warning.
- Disposable PostgreSQL migration check passes: rerun, draft/published separation, old-client autosave, publication revision, quota and permissions, rollback on legacy pending edits.
- No live Supabase migration, DNS configuration, Vercel middleware deployment or browser end-to-end validation has been performed yet. Do not count these as completed launch gates.

Run SQL checks locally with an external test-only PGlite installation:
`PGLITE_TEST_MODULE=/absolute/path/to/pglite/dist/index.js node scripts/check-audit-migration.mjs`.

Rollback: stop deployment if setup is incomplete. Keep the additive DB migration and freeze trigger; reverting to an old UI may not expose newer draft-only data. Do not drop draft_content or restore the unsafe same-origin publication behavior as a routine rollback.

Vercel routing reference: https://vercel.com/docs/routing-middleware/api
