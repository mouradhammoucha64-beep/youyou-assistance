# YOUYOU — Clean V1

YOUYOU is an AI customer-agent SaaS foundation built with Vite + Supabase.

## What is already included
- Landing page, login/signup, dashboard and responsive UI
- Supabase auth/workspace integration
- Conversations, leads, knowledge and overview sections
- Website widget
- Stable per-session conversation persistence in the widget
- Company-specific install snippet generated automatically in the dashboard
- Safe public Supabase configuration fallback for the browser

## Deploy to Vercel
1. Upload this entire project to GitHub (not individual files).
2. Import the repository in Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.

The app can use these Vercel environment variables when present:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- legacy `NEXT_PUBLIC_SUPABASE_URL`
- legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The included fallback is only the browser-safe Supabase URL + publishable key.

## Security rule
Never commit any Supabase service-role key, OpenAI API key, Stripe secret key, or webhook secret to this repository. Those belong in server-side environment variables only.

## Next product stage
Before connecting a paid AI API, finish/verify Supabase RLS, conversation/message policies, lead capture, AI settings persistence, and production QA. Then connect the AI engine to company knowledge + conversations.


## V3 Smart Inbox
Adds local pre-AI lead scoring, HOT/WARM/COLD badges, last-message previews, and smart summaries. External AI/WhatsApp integrations remain intentionally deferred.


## V3.1 Real Leads Dashboard
Qualified leads are generated from conversation intent scores (40+), with Hot/Warm filters, intent signals, smart summaries, last activity, and a placeholder state for future WhatsApp alerts.


## V3.1.1 Navigation Fix
Uses delegated sidebar navigation and explicit button types to make section switching reliable.


## V3.1.2 Sidebar Layer Fix
Ensures the sidebar remains above conversation layers and fully clickable.


## V3.1.3 Hard Sidebar Layout Fix
Pins the sidebar and offsets dashboard content so conversation layers can never overlap navigation.


## V3.2 Lead Contact Actions
Detects email and phone from conversation text, shows captured contact details, and exposes Email / Call / Open conversation actions. WhatsApp remains integration-ready but inactive.


## V3.3 Smart Contact Capture
Adds a zero-cost local buying-intent detector inside the website widget. When intent reaches the Hot threshold, YOUYOU asks the visitor for an email address or phone number. Contact details are then captured through the existing conversation message flow and become available to the Leads dashboard. No paid AI or WhatsApp integration is used in this version.


## V3.3.1 Premium UI Layout Fix
Polishes the landing hero mockup and fixes clipping/overflow in the Website Widget preview. No business logic, Supabase, scoring, or contact-capture behavior changed.


## V3.4 Lux UI Overhaul
A stronger visual redesign for the landing hero and Website Widget preview, with premium spacing, glass panels, refined gradients, a realistic chat device preview, and better visual hierarchy. Core application logic remains unchanged.


## V3.4.1 Landing Hero Final Fix
Fixes the desktop hero mockup squeezing issue while preserving the V3.4 Website Widget page and application logic.


## V3.4.2 Hero Right-Side Clipping Final Fix
Keeps the approved landing design while constraining the live assistant demo to the viewport and preventing right-side clipping.


## V3.4.3 Clean Hero Rebuild
Removed the accumulated conflicting hero patches and rebuilt the landing hero using the actual markup selectors (`hero-section`, `hero-visual`, `ai-window`, and `floating-card`). The approved Lux Website Widget preview is preserved.


## V3.4.4 Landing Cleanup
Removed the Sarah Johnson floating lead card from the landing hero entirely. The AI chat mockup and compact Working 24/7 status card remain.

## V3.5 Professional Knowledge Base
Replaces the old prompt-based knowledge entry flow with a professional Business Brain workspace. Includes a real form, quick-start templates, character counting, live search, saved-entry stats, polished knowledge cards, and responsive layout. This version keeps the existing Supabase `knowledge` table schema (`company_id`, `title`, `content`) and does not require a database migration or paid AI integration.


## V3.6 AI Control Persistence
AI Control Center is now functional and persists one configuration per company in Supabase. The duplicate Lead Capture select was removed; the lower green lead-capture toggle is the single source of truth. Agent name, tone, language, instructions, response style, and lead capture are loaded and saved from `public.ai_settings`. Run `supabase-ai-settings.sql` once in Supabase before testing Save configuration.


## V3.6.1
Fixed native dropdown option visibility for Tone and Language on dark UI.


## V3.6.2
Fixed Tone/Language native dropdown option text visibility on Windows/Edge by using dark option text on the OS white dropdown background.


## V3.6.3 — International Language Mode
Added Auto-detect (recommended) and Spanish to the AI agent language selector. Auto-detect is the default for new configurations and is intended for international customer conversations. No database migration is required because the existing language field already stores text values.


## V3.7 — PRO Business Settings

Professional business settings with persisted company profile, contact details,
country/timezone, business hours, widget controls, lead alert preferences,
workspace identity, and launch-stage billing placeholders.

Run `supabase-v3.7-business-settings.sql` once before testing Save.


## V3.7.1
Fixed Business Settings save error `Cannot coerce the result to a single JSON object` by removing the post-update `.select().single()` requirement. The update now saves directly and keeps the current workspace state in sync locally.


## V3.7.2
Added `Warm + Hot` as a Lead alert mode option. No SQL changes required.


## V3.8 — Website Widget Customization

Adds company-specific widget configuration:
- Enable / disable widget
- Welcome message
- Accent color
- Bottom-left / bottom-right position
- Live dashboard preview
- Public widget loads saved configuration automatically

Run `supabase-v3.8-widget-customization.sql` once before testing.


## V3.9 — QA & Dashboard Polish

This release applies the QA fixes found during the page-by-page dashboard review:

- Overview Leads counter now uses the same qualified-intent logic as the Leads page.
- Overview wording no longer says setup is incomplete after setup is complete.
- Conversation detail now shows an email extracted from visitor messages when `visitor_email` is empty.
- Dashboard / Leads / Knowledge dates are formatted consistently in English.
- "Local scoring preview" renamed to "Intent scoring preview".
- AI Control Center says "Configuration Ready" until the paid AI API is connected.
- Knowledge cards say "Ready for AI" instead of implying live AI is already connected.
- Real floating website launcher is hidden inside the admin dashboard to prevent overlap; the dedicated widget preview remains.
- Dark scrollbar polish for admin text areas.

No SQL migration is required for V3.9.


## V4.0 — Knowledge File Upload

Adds browser-side knowledge import for:
- PDF
- DOCX
- TXT
- CSV
- XLSX / XLS

Workflow:
1. Choose or drop a file.
2. YOUYOU extracts readable text locally in the browser.
3. Review/edit the extracted text.
4. Import it to the current company's Knowledge Base.
5. Long documents are automatically split into safe knowledge entries.

No new Supabase SQL is required. Only extracted text is saved to the existing `knowledge` table.


## V4.1 — Dashboard Routing

Each dashboard section now has its own URL:
- `/dashboard/overview`
- `/dashboard/conversations`
- `/dashboard/leads`
- `/dashboard/knowledge`
- `/dashboard/widget`
- `/dashboard/ai-control`
- `/dashboard/settings`

Browser Back/Forward and refresh on a dashboard route are supported through `vercel.json`.
No SQL migration is required.


## V4.2 — Landing Knowledge Import Showcase

Adds a premium landing-page section that sells the new Business Knowledge Import capability using an interactive-style mockup, file-format badges, progress state, benefits, and a signup CTA. No SQL migration required.


## V4.3 — Brand + Clean URLs

- Replaces the square `Y` navigation mark with a custom YOUYOU text wordmark.
- Adds a custom `YY` favicon so browsers no longer show the generic globe.
- Removes the trailing `/#` behavior from the YOUYOU home logo.
- Landing navigation scrolls smoothly without adding `#features`, `#how`, or `#pricing` to the URL.
- Auth back-home action restores the clean root URL.
- No SQL migration required.


## V4.4 — Landing FAQ

Adds a compact seven-question accordion FAQ, a FAQ navigation link, SEO Growth Center positioning, and a final signup CTA. No SQL migration required.


## V4.4.1 — FAQ Separate Page

Moves the full FAQ off the landing page to `/faq` so the landing stays shorter and more conversion-focused. No SQL required.


## V4.5 — Monthly Pricing

Replaces the old single $19 plan with three monthly tiers:
- Starter — $29/month
- Growth — $59/month
- Pro — $99/month

Growth is highlighted as Most Popular. Annual billing is intentionally not shown yet.
No SQL migration required.


## V4.6 — Public Landing + Plans & Billing
Logged-in users can visit the public landing without logout. Dashboard adds View public website, Plans & Billing, and /dashboard/billing. Stripe checkout remains intentionally non-charging until the Stripe integration step. No SQL required.


## V4.7 — SEO Growth Center V1

Adds a new PRO dashboard route: `/dashboard/seo-growth`.

V1 uses real YOUYOU workspace data only:
- Business profile completeness
- Knowledge Base depth
- Local SEO foundation
- Prioritized quick wins
- Search snippet draft
- Service/local/FAQ page opportunities
- Practical content brief
- SEO foundation checklist

The score is explicitly an SEO readiness score, not a Google ranking score.
No keyword volume, live rankings or Search Console metrics are invented.
Google Search Console is displayed as a future real-data integration.

No SQL migration required.


## V4.7.1 — SEO Compact Polish

Keeps the V4.7 visual design while shortening the SEO page:
- Optimization Checklist shows 4 items by default with View all / Show less
- Google Search Console stays visible but becomes a compact card
- Search Console is marked as a free Google tool and future connection
- Hero and card spacing reduced slightly
- Disclaimer compressed into a small inline note
- No SQL migration required


## V4.7.2 — Dark Scrollbars
Replaces the bright/white scrollbar tracks with thin dark scrollbars across the dashboard and public pages. No SQL required.


## V4.8 — SEO Keyword Engine

Adds a practical keyword strategy layer to SEO Growth Center:
- Primary keyword
- Secondary keyword cluster
- Long-tail question ideas
- Dynamic keyword-aware Quick Wins
- Complete On-Page SEO Pack: title, H1, slug, meta description
- Local SEO plan
- Copy keyword / SEO pack actions
- Richer Analyze Workspace status
- Content Brief badge clarified as `CONTENT PLAN`

Important: keyword ideas are generated from the workspace and target market. V4.8 does not invent monthly search volume, keyword difficulty, live ranking position, or Search Console metrics. Those require real search-data integrations.

No SQL migration required.


## V4.8.1 — Functional SEO Fix

Improves SEO Growth Center V2 without changing its core design:
- More dynamic Quick Wins based on target service and city
- Stronger generated meta descriptions
- Analysis Summary with keyword ideas, page ideas, quick wins and setup gaps
- Richer Analyze Workspace status
- Length counters clearly marked as static counters
- Content Plan badge clarified as non-interactive
- Page idea indicator clarified as an idea label
- No SQL migration required

## V4.8.3 — Landing Motion + Compact PRO Design

Landing-only design pass. No dashboard feature changes and no SQL changes.

Changes:
- Features section converted from a tall 6-card grid into a responsive carousel
- Auto-slide every ~3.8 seconds with pause on interaction
- Desktop shows multiple cards; mobile uses swipe/snap with one focused card
- Added compact arrows and position dots
- Pricing cards reduced in height and spacing
- Pricing visual focus now follows the plan being hovered/focused
- Growth remains the default "Most Popular" plan without permanently locking the glow
- Mobile pricing becomes a horizontal swipe carousel instead of three stacked cards
- Final CTA reduced substantially in vertical size
- Reduced excessive spacing between landing sections
- Added subtle scroll-reveal motion for a more polished SaaS feel
- Respects prefers-reduced-motion accessibility setting
- WhatsApp AI section intentionally unchanged for later product discussion

Validation:
- main.js syntax check passed


## V4.9 — AI Growth Platform

Product-wide connection pass built on V4.8.3.

### Landing
- Repositions YOUYOU as an AI Growth Platform
- Adds connected 4-engine product visual: AI Conversations, SEO Growth, Revenue Rescue, WhatsApp AI
- Adds dedicated Revenue Rescue showcase
- Adds dedicated WhatsApp AI showcase
- Updates hero, stats, pricing language and final CTA
- Keeps the compact animated carousel and mobile behavior from V4.8.3

### Dashboard
- Adds `/dashboard/revenue-rescue`
- Adds `/dashboard/whatsapp-ai`
- Revenue Rescue analyzes existing conversation intent and inactivity, with no automatic sends
- WhatsApp AI page uses the saved business WhatsApp number for a real handoff test link when available
- WhatsApp Business API + AI API are clearly marked as pending production integrations
- Overview now links directly to SEO Growth, Revenue Rescue and WhatsApp AI

### Integration status
- No new SQL required
- No paid API required for this version
- Paddle/AI/WhatsApp API integrations are still deliberately deferred until final production wiring


## V4.10 — Desktop Final Pass / Batch A

- Overview motion + PRO/SMART/NEW badges
- Leads compact layout + copy email/phone fallbacks
- AI Control Center compact polish + dark selects
- Settings compact desktop layout
- Billing interactive focus + Paddle wording
- Mobile intentionally untouched

No SQL required.


## V4.11 — Desktop Final Pass / Batch B

Knowledge:
- Added compact collapsible treatment for Upload Knowledge and Manual Entry
- Reduced card/status visual weight
- Kept Saved Knowledge as the primary library area

Website Widget:
- Switched dashboard widget area to a single-column desktop stack
- Install code first, wide Live Preview below it, settings after
- Improved preview proportions and spacing
- Updated welcome wording
- Replaced verbose save status with compact synced/saved wording
- Added disabled “Continue on WhatsApp” preview hook for the future API connection

No SQL required.
Mobile intentionally untouched.


## V4.12 — Desktop Final Pass / Batch C

SEO Growth:
- Compact tabs: Keywords / On-page / Content / Local / Technical
- Duplicate readiness score removed from summary
- Weak internal/file-name keyword ideas filtered
- Stronger fallback meta description
- Quick Wins upgraded to action-first: Problem / Where / Fix / Why

Revenue Rescue:
- Compact badges and cards
- Workflow: Needs follow-up / Follow-up sent / Replied / Recovered
- Later states remain clearly API-dependent
- Clearer Email/Call action chips

WhatsApp AI:
- Completed / Pending / Locked / Planned states
- Stronger Human Takeover presentation
- Bigger preview and explicit handoff test wording
- Channel status strip without fake live metrics
- Actual future “Continue on WhatsApp” hook added to Website Widget preview

No SQL required.
Mobile intentionally untouched.


## V4.13 — SEO Final PRO
- SEO converted from static report into a working module
- Added Overview tab
- KPI cards are clickable and route to relevant work
- Business Profile opens Settings; Knowledge Depth opens Knowledge
- Keyword tab enriched with page/title/H1/slug/content angle/CTA
- Added related themes and clear “where to use this” guidance
- Reduced empty space and improved per-tab focus
- Desktop only; mobile remains untouched

No SQL required.


## V4.14 — Real Website Audit

Adds a real server-side public website audit inside SEO Growth Center.

Website Audit now:
- Accepts a public website URL
- Fetches the live page through a Vercel serverless endpoint (avoids browser CORS)
- Checks title, meta description, H1/H2, visible words, images/alt text, links, canonical, robots meta, viewport and language
- Checks basic robots.txt and /sitemap.xml presence
- Compares the live page against YOUYOU's target service + city
- Produces a score and action-first findings:
  Problem → Where → Fix → Suggested text/action → Why it matters
- Copyable audit action plan
- Links back into On-page and Content SEO work

Security:
- Only http/https public sites
- Blocks localhost/private IP targets
- Validates redirects
- Uses request timeout and body-size limits

Scope:
- Live single-page audit for the entered URL
- Not yet a full-site crawler
- No fake Google rankings, traffic, volume or difficulty data

No SQL migration required.


## V4.15 — SEO FINAL PRO
- Website URL is now visible directly in the main SEO Configuration row
- Main Run Website Audit button is visible immediately
- One click opens Website Audit and runs the real live-page audit
- Website Audit tab is marked LIVE
- Main URL and Audit URL stay synchronized
- Existing real server-side /api/seo-audit integration retained
- Existing PRO SEO strategy and tabs retained
- No SQL required

## V4.16 — AI Studio PRO Foundation

Review outcome before implementation:
- AI Studio should be a marketing workspace, not a generic prompt box.
- The client must have a large free-text idea field before generation.
- Business Info + Knowledge Base + tone should be reused automatically.
- Core creation types: Video Ad, Ad Copy, Social Post, Email, Landing Page, Campaign.
- Video Ad is a first-class workflow with duration, format, voice style and visual direction.
- Actual AI generation is NOT faked in this version. The UI prepares a structured creative brief and clearly marks the AI API as pending.
- Project persistence, image generation, voice generation and final video rendering come after the UI/workflow is approved.

No SQL required for this UI review build.


## V4.16.3 — AI Studio Full Project Route Fix
- Fixed the real root cause found in the full uploaded project: `studio` was rendered and initialized, but missing from `DASHBOARD_ROUTES`.
- Added `/dashboard/ai-studio`.
- Sidebar click now resolves to the AI Studio section instead of falling back to Overview.
- Direct browser navigation to `/dashboard/ai-studio` is supported by the existing Vercel dashboard rewrite.
- No SQL changes.


## V4.17 — Smart Landing Pages PRO Workshop

New standalone dashboard section: **Landing Pages**

What works now:
- 30 professional landing page presets
- Categories for Product, Service, Beauty & Wellness, Health, Hospitality, Real Estate, Digital and Campaign
- Visual editor with live desktop/mobile preview
- Product/service headline, description, benefits, offer and trust content
- Image URL, video URL and local image preview
- Custom accent/background/surface/text colors + palette presets
- LTR / RTL page direction
- Multi-currency pricing:
  USD, EUR, MAD, SAR, AED, QAR, KWD, BHD, OMR, EGP, DZD, TND
- Price display: show price / contact for price / hide price
- CTA actions: lead form / WhatsApp / call / email
- WhatsApp direct action
- Save drafts per workspace in browser local storage
- Edit, duplicate and delete saved drafts
- Export a self-contained HTML landing page
- No changes were made to SEO or AI Studio logic

Deliberately not faked:
- Public YOUYOU-hosted landing-page URLs
- Server-side publishing
- Cross-device draft storage
- Visits / leads / WhatsApp-click analytics

Those require the publishing database/backend and should be connected only after the builder UX is approved.


## V4.18 — Dedicated Landing Page Workspace

Landing Page creation/editing now opens in its own full-width workspace.

Routes:
- `/dashboard/landing-pages/new?template=<template-id>`
- `/dashboard/landing-pages/edit/<page-id>`

Changes:
- Create New opens a dedicated builder URL
- Selecting any of the 30 templates opens the dedicated builder URL
- Editing a saved page opens its own edit URL
- Builder no longer depends on the narrow dashboard content area
- Full-width live canvas remains visible while editing
- Sticky top bar with Back, Save and Export HTML
- Desktop / Mobile live preview
- Save converts a new workspace URL to a stable edit URL
- Existing draft storage, currencies, WhatsApp actions, templates and HTML export retained
- Added several light color palettes in the workspace preview controls
- SEO and AI Studio logic were not modified


## MASTER QA / UI CONSOLIDATION — 2026-08-24
- Reviewed the full uploaded project as the new master base.
- SEO compact/readability fix at 100% desktop zoom.
- AI Studio desktop typography/readability pass; generation workflow logic unchanged.
- Landing template gallery now includes light/pastel and dark themes with more varied visual layouts.
- Added automatic landing-page text contrast for light templates.
- Added public-site EN / FR / AR language switcher with Arabic RTL.
- Added Smart Landing Pages showcase to the public homepage.
- No SQL migration added.
- See `MASTER-AUDIT-2026-08-24.txt` for remaining production gaps.


## MASTER Premium Soft-Dark Theme
Visual polish applied on the latest full-project base.

Direction:
- Deep navy / graphite instead of near-black
- Soft violet accents
- Warm off-white text
- Lighter premium cards, forms and dashboard chrome
- Landing Page customer-created themes remain independent

No application logic or routes were changed.
See `PREMIUM-THEME-AUDIT-2026-08-24.txt`.


## V4.22 — Psychology Color + Sidebar Icon System
- Unified SVG sidebar icons
- Psychology-driven premium palette
- Subtle module identity colors
- Calm, premium, inclusive visual direction with restrained feminine warmth
- Functional logic unchanged

---

## V7.5 — Final Landing Engine Lock

The Landing Studio preview now runs the exact exported/published document in an iframe, so mobile media queries, theme colors, slider dimensions, video and spacing are evaluated by the same renderer used on public `/p/:slug` pages. V7.5 also adds renderer-version migration UX, newest-copy draft recovery, safer duplicated media handling, and RPC-only public snapshot retrieval. Existing V7.2 databases should run `supabase-v7.5-publish-security.sql` once.

## V7.7 — Workflow + Universal Builder

V7.7 adds shared WhatsApp number normalization, My Drafts search/status filters, live-link copying, universal hero layout/page-spacing controls, and reusable custom content sections that can be added, reordered and removed from the Landing Workspace. No new SQL migration is required beyond the V7.1/V7.2/V7.5 setup already included in the project.
