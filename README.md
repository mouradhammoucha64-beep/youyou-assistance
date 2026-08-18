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
