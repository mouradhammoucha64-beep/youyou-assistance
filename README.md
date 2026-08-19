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
