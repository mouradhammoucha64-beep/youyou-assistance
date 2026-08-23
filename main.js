import { createClient } from "@supabase/supabase-js";
import * as mammoth from "mammoth/mammoth.browser";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import "./style.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const app = document.querySelector("#app");

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

let state = {
  page: "landing",
  authMode: "login",
  user: null,
  profile: null,
  company: null,
  section: "overview",
  message: "",
  pendingPlan: null,
};


const DASHBOARD_ROUTES = {
  overview: "/dashboard/overview",
  conversations: "/dashboard/conversations",
  leads: "/dashboard/leads",
  knowledge: "/dashboard/knowledge",
  widget: "/dashboard/widget",
  ai: "/dashboard/ai-control",
  seo: "/dashboard/seo-growth",
  rescue: "/dashboard/revenue-rescue",
  whatsapp: "/dashboard/whatsapp-ai",
  settings: "/dashboard/settings",
  billing: "/dashboard/billing",
};

function sectionFromPath(pathname = window.location.pathname) {
  const match = Object.entries(DASHBOARD_ROUTES)
    .find(([, path]) => path === pathname);

  return match?.[0] || "overview";
}

function dashboardPath(section) {
  return DASHBOARD_ROUTES[section] || DASHBOARD_ROUTES.overview;
}

function navigateDashboard(section, { replace = false, renderPage = true } = {}) {
  const nextSection = DASHBOARD_ROUTES[section] ? section : "overview";
  const nextPath = dashboardPath(nextSection);

  state.section = nextSection;

  if (window.location.pathname !== nextPath) {
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ section: nextSection }, "", nextPath);
  }

  if (renderPage) renderDashboard();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   LANDING PAGE
========================= */

function renderLanding() {
  app.innerHTML = `
    <div class="landing">

      <header class="landing-nav">
        <a class="logo brand-home-link" href="/" aria-label="YOUYOU home">
          <span class="brand-wordmark" aria-label="YOUYOU">
            <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
          </span>
        </a>

        <nav class="landing-links">
          <a href="/" data-scroll-section="features">Features</a>
          <a href="/" data-scroll-section="how">How it works</a>
          <a href="/" data-scroll-section="pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>

        <div class="nav-actions">
          ${state.user
            ? `<button id="nav-dashboard" class="nav-login">Open dashboard</button>
               <button id="nav-billing" class="primary small">Plans & billing</button>`
            : `<button id="nav-login" class="nav-login">Log in</button>
               <button id="nav-start" class="primary small">Start free</button>`}
        </div>
      </header>

      <main>

        <section class="hero-section">

          <div class="hero-copy">

            <div class="eyebrow">
              <span class="pulse"></span>
              AI GROWTH PLATFORM
            </div>

            <h1>
              Turn more visitors into
              <span>customers and growth.</span>
            </h1>

            <p class="hero-text">
              YOUYOU brings AI conversations, SEO growth, Revenue Rescue
              and WhatsApp AI into one focused workspace for modern businesses.
            </p>

            <div class="hero-buttons">
              ${state.user
                ? `<button id="hero-dashboard" class="primary hero-btn">Open dashboard <span>→</span></button>
                   <button id="hero-pricing" class="secondary hero-btn">View plans</button>`
                : `<button id="hero-start" class="primary hero-btn">Start for free <span>→</span></button>
                   <button id="hero-login" class="secondary hero-btn">Log in</button>`}
            </div>

            <div class="trust">
              <span>✓ No credit card required</span>
              <span>✓ Setup in minutes</span>
              <span>✓ Available 24/7</span>
            </div>

          </div>

          <div class="hero-visual">

            <div class="glow glow-one"></div>
            <div class="glow glow-two"></div>

            <div class="ai-window">

              <div class="window-top">
                <div class="window-brand">
                  <span class="mini-logo">Y</span>
                  <div>
                    <strong>YOUYOU AI</strong>
                    <small>Online now</small>
                  </div>
                </div>

                <span class="online-dot"></span>
              </div>

              <div class="chat-area">

                <div class="message customer">
                  Hi! I have a question about your service.
                </div>

                <div class="message ai">
                  Hey! 👋 I'm YOUYOU, your AI assistant.
                  How can I help you today?
                </div>

                <div class="message customer">
                  How much does it cost?
                </div>

                <div class="message ai">
                  We have plans starting at
                  <strong>$29/month</strong>.
                  I can also help you choose the right plan.
                </div>

                <div class="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

              <div class="chat-input">
                <span>Ask YOUYOU anything...</span>
                <button>↑</button>
              </div>

            </div>

            <div class="floating-card live-card">
              <span class="live-dot"></span>
              <div>
                <small>AI AGENT</small>
                <strong>Working 24/7</strong>
              </div>
            </div>

          </div>

        </section>


        <section class="stats-section">
          <div>
            <strong>24/7</strong>
            <span>Always available</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Growth engines</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Unified workspace</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>Built for conversion</span>
          </div>
        </section>



        <section class="growth-platform-section" id="growth-platform">
          <div class="growth-platform-shell">
            <div class="growth-platform-copy">
              <div class="eyebrow"><span class="pulse"></span> YOUYOU SERVICES</div>
              <h2>Four growth engines.<br><span>One connected platform.</span></h2>
              <p>
                YOUYOU is designed to help a business get discovered, answer instantly,
                keep valuable leads moving and continue the conversation on WhatsApp.
              </p>
              <div class="growth-flow-line" aria-label="YOUYOU growth flow">
                <span>GET FOUND</span><i>→</i><span>ANSWER</span><i>→</i><span>QUALIFY</span><i>→</i><span>RESCUE</span>
              </div>
            </div>

            <div class="growth-engine-grid">
              <article class="growth-engine-card engine-conversations">
                <div class="growth-engine-icon">✦</div>
                <small>01 · WEBSITE AI</small>
                <h3>AI Conversations</h3>
                <p>Answer visitors 24/7, capture buying intent and turn questions into qualified opportunities.</p>
                <span class="engine-status">LIVE WORKFLOW</span>
              </article>

              <article class="growth-engine-card engine-seo">
                <div class="growth-engine-icon">↗</div>
                <small>02 · SEARCH GROWTH</small>
                <h3>SEO Growth</h3>
                <p>Find practical keyword, page and on-page opportunities without drowning in technical reports.</p>
                <span class="engine-status">GROWTH CENTER</span>
              </article>

              <article class="growth-engine-card engine-rescue">
                <div class="growth-engine-icon">↻</div>
                <small>03 · LEAD RECOVERY</small>
                <h3>Revenue Rescue</h3>
                <p>Spot promising leads that went quiet and surface the next best follow-up before the opportunity disappears.</p>
                <span class="engine-status">RECOVERY SIGNALS</span>
              </article>

              <article class="growth-engine-card engine-whatsapp">
                <div class="growth-engine-icon">◉</div>
                <small>04 · WHATSAPP AI</small>
                <h3>WhatsApp AI</h3>
                <p>Move customer conversations to WhatsApp and prepare the same business knowledge for AI-assisted replies.</p>
                <span class="engine-status">API READY</span>
              </article>
            </div>
          </div>
        </section>

        <section id="features" class="section">

          <div class="section-heading">
            <div class="eyebrow">WHY YOUYOU</div>

            <h2>
              One AI agent.
              <span>Everything handled.</span>
            </h2>

            <p>
              Give your website an intelligent assistant that works
              while you focus on growing your business.
            </p>
          </div>

          <div class="feature-carousel-shell">
            <button class="feature-carousel-arrow feature-carousel-prev" type="button" aria-label="Previous feature">←</button>

            <div class="feature-grid" id="feature-carousel">

            <article class="feature-card">
              <div class="feature-icon">◌</div>
              <h3>Smart conversations</h3>
              <p>
                Answer customer questions naturally and instantly,
                day or night.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">✦</div>
              <h3>Capture leads</h3>
              <p>
                Turn conversations into qualified opportunities
                automatically.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">▤</div>
              <h3>Knowledge base</h3>
              <p>
                Train YOUYOU with your products, services,
                policies and business information.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">◇</div>
              <h3>Website widget</h3>
              <p>
                Add your AI agent to your website with a simple
                installation.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">✧</div>
              <h3>AI control center</h3>
              <p>
                Control your agent's tone, language and lead
                capture settings.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon">↗</div>
              <h3>Built to grow</h3>
              <p>
                Start small and scale your AI customer experience
                as your business grows.
              </p>
            </article>

            </div>

            <button class="feature-carousel-arrow feature-carousel-next" type="button" aria-label="Next feature">→</button>
          </div>

          <div class="feature-carousel-dots" aria-label="Feature carousel navigation">
            <button class="feature-dot is-active" type="button" aria-label="Feature group 1"></button>
            <button class="feature-dot" type="button" aria-label="Feature group 2"></button>
            <button class="feature-dot" type="button" aria-label="Feature group 3"></button>
            <button class="feature-dot" type="button" aria-label="Feature group 4"></button>
            <button class="feature-dot" type="button" aria-label="Feature group 5"></button>
            <button class="feature-dot" type="button" aria-label="Feature group 6"></button>
          </div>

        </section>


        <section id="how" class="section how-section">

          <div class="section-heading">
            <div class="eyebrow">HOW IT WORKS</div>

            <h2>
              From setup to
              <span>your first lead.</span>
            </h2>
          </div>

          <div class="steps">

            <div class="step">
              <div class="step-number">01</div>
              <h3>Create your account</h3>
              <p>
                Sign up and create your workspace in less than a minute.
              </p>
            </div>

            <div class="step">
              <div class="step-number">02</div>
              <h3>Train YOUYOU</h3>
              <p>
                Add information about your business so your AI knows
                what to say.
              </p>
            </div>

            <div class="step">
              <div class="step-number">03</div>
              <h3>Launch your agent</h3>
              <p>
                Install the widget and let YOUYOU start talking
                to your visitors.
              </p>
            </div>

          </div>

        </section>



        <section class="landing-knowledge-section">

          <div class="landing-knowledge-shell">

            <div class="landing-knowledge-copy">
              <div class="eyebrow knowledge-eyebrow">
                <span class="knowledge-new-dot"></span>
                BUSINESS KNOWLEDGE IMPORT
              </div>

              <h2>
                Train your AI in
                <span>minutes, not weeks.</span>
              </h2>

              <p>
                Drop in the documents your business already uses. YOUYOU extracts
                the useful information and turns it into knowledge your AI can use
                when speaking with customers.
              </p>

              <div class="knowledge-format-row">
                <span>PDF</span>
                <span>DOCX</span>
                <span>XLSX</span>
                <span>CSV</span>
                <span>TXT</span>
              </div>

              <div class="knowledge-benefits">
                <div>
                  <span class="knowledge-check">✓</span>
                  <div>
                    <strong>Use the files you already have</strong>
                    <small>Pricing, services, FAQs, policies and internal business info.</small>
                  </div>
                </div>

                <div>
                  <span class="knowledge-check">✓</span>
                  <div>
                    <strong>Review before you save</strong>
                    <small>Extracted content stays editable before it enters your Knowledge Base.</small>
                  </div>
                </div>

                <div>
                  <span class="knowledge-check">✓</span>
                  <div>
                    <strong>Built for real businesses</strong>
                    <small>Long documents can be split into clean knowledge entries automatically.</small>
                  </div>
                </div>
              </div>

              <button id="knowledge-start" class="primary hero-btn knowledge-cta">
                Train my AI →
              </button>
            </div>

            <div class="knowledge-demo-card" aria-label="Business knowledge import demo">

              <div class="knowledge-demo-top">
                <div>
                  <small>YOUYOU BUSINESS BRAIN</small>
                  <strong>Knowledge import</strong>
                </div>
                <span class="knowledge-demo-live">● READY</span>
              </div>

              <div class="knowledge-drop-demo">
                <div class="knowledge-drop-demo-icon">⇧</div>
                <strong>Drop your business files here</strong>
                <span>YOUYOU reads the useful content for you.</span>
              </div>

              <div class="knowledge-demo-files">
                <div class="knowledge-demo-file file-one">
                  <span class="file-type pdf">PDF</span>
                  <div>
                    <strong>pricing-guide.pdf</strong>
                    <small>Pricing & packages</small>
                  </div>
                  <span class="file-state">✓</span>
                </div>

                <div class="knowledge-demo-file file-two">
                  <span class="file-type xlsx">XLS</span>
                  <div>
                    <strong>services.xlsx</strong>
                    <small>Services & details</small>
                  </div>
                  <span class="file-state">✓</span>
                </div>

                <div class="knowledge-demo-file file-three">
                  <span class="file-type docx">DOC</span>
                  <div>
                    <strong>customer-faq.docx</strong>
                    <small>Questions & answers</small>
                  </div>
                  <span class="file-state">✓</span>
                </div>
              </div>

              <div class="knowledge-processing">
                <div class="knowledge-processing-head">
                  <span>Building business knowledge</span>
                  <strong>100%</strong>
                </div>
                <div class="knowledge-progress-track">
                  <span></span>
                </div>
              </div>

              <div class="knowledge-result-grid">
                <div>
                  <small>CHARACTERS</small>
                  <strong>12,480</strong>
                </div>
                <div>
                  <small>FILES READ</small>
                  <strong>3</strong>
                </div>
                <div>
                  <small>STATUS</small>
                  <strong class="knowledge-ready-text">READY</strong>
                </div>
              </div>

              <div class="knowledge-ai-ready-row">
                <div class="knowledge-ai-pulse">Y</div>
                <div>
                  <small>BUSINESS KNOWLEDGE READY</small>
                  <strong>Your AI now has context to work with.</strong>
                </div>
                <span>✦</span>
              </div>

            </div>

          </div>

        </section>


        <section class="growth-showcase-section revenue-rescue-showcase">
          <div class="growth-showcase-copy">
            <div class="eyebrow">REVENUE RESCUE</div>
            <h2>Good leads go quiet.<br><span>YOUYOU helps you catch them.</span></h2>
            <p>
              Instead of letting a high-intent conversation disappear in the inbox,
              YOUYOU highlights stalled opportunities, contact availability and the next action to take.
            </p>
            <div class="showcase-points">
              <span>✓ Intent scoring</span>
              <span>✓ Stalled lead detection</span>
              <span>✓ Suggested next action</span>
            </div>
          </div>

          <div class="rescue-demo-card">
            <div class="rescue-demo-top"><small>REVENUE RESCUE</small><span>● WATCHING</span></div>
            <div class="rescue-lead-row">
              <div><strong>Website visitor</strong><small>Asked for pricing + demo</small></div>
              <b>86 HOT</b>
            </div>
            <div class="rescue-timeline">
              <span class="done">Conversation</span><i></i><span class="done">Qualified</span><i></i><span class="stalled">Went quiet</span><i></i><span class="next">Follow up</span>
            </div>
            <div class="rescue-next-action">
              <small>NEXT BEST ACTION</small>
              <strong>Follow up while intent is still high.</strong>
              <p>Contact details are available. Keep the conversation moving instead of losing the opportunity.</p>
            </div>
          </div>
        </section>

        <section class="growth-showcase-section whatsapp-showcase">
          <div class="whatsapp-demo-stage">
            <div class="whatsapp-phone">
              <div class="whatsapp-phone-head"><span class="wa-avatar">Y</span><div><strong>YOUYOU AI</strong><small>WhatsApp · Online</small></div><span>•••</span></div>
              <div class="wa-chat-body">
                <div class="wa-bubble incoming">Hi — can you help me choose the right plan?</div>
                <div class="wa-bubble outgoing">Absolutely. Tell me what you want to automate and I’ll guide you.</div>
                <div class="wa-bubble incoming">I need website leads and follow-up.</div>
                <div class="wa-bubble outgoing">Growth is a strong fit. I can also capture your details for the team.</div>
              </div>
              <div class="wa-compose"><span>Message</span><b>➤</b></div>
            </div>
            <div class="wa-bridge-pill">Website → WhatsApp → Dashboard</div>
          </div>

          <div class="growth-showcase-copy">
            <div class="eyebrow whatsapp-eyebrow">WHATSAPP AI</div>
            <h2>Don’t lose the customer<br><span>when they leave your website.</span></h2>
            <p>
              Prepare a smooth path from your website to WhatsApp. When the official WhatsApp Business API
              is connected, YOUYOU can use the same business context to support conversations there too.
            </p>
            <div class="showcase-points">
              <span>✓ Continue on WhatsApp</span>
              <span>✓ Shared business context</span>
              <span>✓ Human takeover ready</span>
            </div>
          </div>
        </section>

        <section id="pricing" class="pricing-section pricing-v45">

          <div class="section-heading pricing-heading">
            <div class="eyebrow">SIMPLE MONTHLY PRICING</div>

            <h2>
              Start with AI.
              <span>Upgrade when growth matters.</span>
            </h2>

            <p>
              Three clear plans. No annual commitment. Start free and choose the
              level that fits your business when you're ready.
            </p>
          </div>

          <div class="pricing-grid">

            <article class="pricing-plan pricing-starter">
              <div class="pricing-plan-top">
                <div class="pricing-plan-name">STARTER</div>
                <p class="pricing-plan-tagline">AI customer support for your website.</p>

                <div class="pricing-price">
                  <span class="pricing-currency">$</span>
                  <strong>29</strong>
                  <span class="pricing-period">/month</span>
                </div>
              </div>

              <div class="pricing-divider"></div>

              <ul class="pricing-feature-list">
                <li><span>✓</span> AI Customer Agent</li>
                <li><span>✓</span> Website Widget</li>
                <li><span>✓</span> Knowledge Base</li>
                <li><span>✓</span> PDF, Word & Excel import</li>
                <li><span>✓</span> Conversations Inbox</li>
                <li><span>✓</span> Basic lead capture</li>
              </ul>

              <button id="pricing-starter" class="pricing-plan-btn pricing-plan-btn-ghost" type="button">
                Start free →
              </button>

              <small class="pricing-plan-note">No credit card required</small>
            </article>


            <article class="pricing-plan pricing-growth">
              <div class="pricing-popular-badge">MOST POPULAR</div>

              <div class="pricing-plan-top">
                <div class="pricing-plan-name">GROWTH</div>
                <p class="pricing-plan-tagline">AI plus smarter lead conversion.</p>

                <div class="pricing-price">
                  <span class="pricing-currency">$</span>
                  <strong>59</strong>
                  <span class="pricing-period">/month</span>
                </div>
              </div>

              <div class="pricing-divider"></div>

              <ul class="pricing-feature-list">
                <li><span>✓</span> Everything in Starter</li>
                <li><span>✓</span> Lead qualification</li>
                <li><span>✓</span> Intent scoring</li>
                <li><span>✓</span> Revenue Rescue</li>
                <li><span>✓</span> Follow-up workflows</li>
                <li><span>✓</span> Growth analytics</li>
                <li><span>✓</span> WhatsApp handoff readiness</li>
              </ul>

              <button id="pricing-growth" class="pricing-plan-btn pricing-plan-btn-primary" type="button">
                Start free →
              </button>

              <small class="pricing-plan-note">Best for growing businesses</small>
            </article>


            <article class="pricing-plan pricing-pro">
              <div class="pricing-plan-top">
                <div class="pricing-plan-name">PRO</div>
                <p class="pricing-plan-tagline">AI, lead recovery and SEO growth.</p>

                <div class="pricing-price">
                  <span class="pricing-currency">$</span>
                  <strong>99</strong>
                  <span class="pricing-period">/month</span>
                </div>
              </div>

              <div class="pricing-divider"></div>

              <ul class="pricing-feature-list">
                <li><span>✓</span> Everything in Growth</li>
                <li><span>✓</span> SEO Growth Center</li>
                <li><span>✓</span> SEO opportunity insights</li>
                <li><span>✓</span> Service & local page ideas</li>
                <li><span>✓</span> Advanced AI controls</li>
                <li><span>✓</span> Higher usage limits</li>
                <li><span>✓</span> WhatsApp AI integration ready</li>
              </ul>

              <button id="pricing-pro" class="pricing-plan-btn pricing-plan-btn-ghost" type="button">
                Start free →
              </button>

              <small class="pricing-plan-note">Built for serious growth</small>
            </article>

          </div>

          <div class="pricing-bottom-note">
            <span>✓ Start free</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>

        </section>


        <section class="final-cta">

          <div class="cta-glow"></div>

          <div class="eyebrow">READY TO START?</div>

          <h2>
            One workspace to
            <span>answer, grow and recover.</span>
          </h2>

          <p>
            Start with your website AI, then unlock SEO growth, Revenue Rescue
            and WhatsApp AI as your business grows.
          </p>

          <button id="final-start" class="primary hero-btn">
            Create your free account →
          </button>

        </section>

      </main>

      <footer>

        <div class="footer-brand">
          <a class="logo brand-home-link" href="/" aria-label="YOUYOU home">
            <span class="brand-wordmark" aria-label="YOUYOU">
            <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
          </span>
          </a>

          <p>
            AI Growth Platform for modern businesses.
          </p>
        </div>

        <div class="footer-links">
          <a href="/" data-scroll-section="features">Features</a>
          <a href="/" data-scroll-section="how">How it works</a>
          <a href="/" data-scroll-section="pricing">Pricing</a>
          <button id="footer-login">Login</button>
        </div>

        <div class="copyright">
          © 2026 YOUYOU. All rights reserved.
        </div>

      </footer>

    </div>
  `;

  document.querySelector("#nav-login")?.addEventListener("click", showLogin);
  document.querySelector("#nav-start")?.addEventListener("click", showSignup);
  document.querySelector("#hero-start")?.addEventListener("click", showSignup);
  document.querySelector("#hero-login")?.addEventListener("click", showLogin);
  document.querySelector("#nav-dashboard")?.addEventListener("click", () => navigateDashboard("overview"));
  document.querySelector("#hero-dashboard")?.addEventListener("click", () => navigateDashboard("overview"));
  document.querySelector("#nav-billing")?.addEventListener("click", () => navigateDashboard("billing"));
  document.querySelector("#hero-pricing")?.addEventListener("click", () => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  document.querySelector("#knowledge-start")?.addEventListener("click", showSignup);
  setupLandingMotion();

  [["#pricing-starter","starter"],["#pricing-growth","growth"],["#pricing-pro","pro"]].forEach(([selector,plan]) => {
    document.querySelector(selector)?.addEventListener("click", () => {
      state.pendingPlan = plan;
      state.user ? navigateDashboard("billing") : showSignup();
    });
  });
  document.querySelector("#final-start").onclick = showSignup;

  document.querySelector("#footer-login").onclick = showLogin;

  document.querySelectorAll("[data-scroll-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const sectionId = link.dataset.scrollSection;
      const target = document.querySelector(`#${sectionId}`);

      if (window.location.pathname !== "/" || window.location.hash) {
        window.history.replaceState({}, "", "/");
      }

      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  document.querySelectorAll(".brand-home-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      if (window.location.pathname !== "/" || window.location.hash) {
        window.history.replaceState({}, "", "/");
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });
}




/* =========================
   FAQ
========================= */

function renderFaqPage() {
  app.innerHTML = `
    <div class="landing faq-page">
      <header class="landing-nav">
        <a class="logo brand-home-link" href="/" aria-label="YOUYOU home">
          <span class="brand-wordmark" aria-label="YOUYOU">
            <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
          </span>
        </a>
        <nav class="landing-links">
          <a href="/">Home</a>
          <a href="/#features">Features</a>
          <a href="/#pricing">Pricing</a>
          <a class="is-active" href="/faq">FAQ</a>
        </nav>
        <div class="nav-actions">
          <button id="faq-nav-login" class="nav-login">Log in</button>
          <button id="faq-nav-start" class="primary small">Start free</button>
        </div>
      </header>

      <main class="faq-page-main">
        <section id="faq" class="landing-faq-section">
        <div class="landing-faq-shell">
          <div class="landing-faq-head">
            <div class="eyebrow">FREQUENTLY ASKED QUESTIONS</div>
            <h2>Questions before you start?</h2>
            <p>Everything you need to know before adding YOUYOU to your business.</p>
          </div>

          <div class="landing-faq-list">
            <article class="landing-faq-item is-open">
              <button class="landing-faq-question" type="button" aria-expanded="true">
                <span>What is YOUYOU?</span><span class="faq-toggle">−</span>
              </button>
              <div class="landing-faq-answer">
                <p>YOUYOU is an AI customer agent workspace designed to help businesses answer visitors, capture leads, qualify opportunities and manage customer conversations from one place.</p>
              </div>
            </article>

            <article class="landing-faq-item">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>How quickly can I set it up?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>You can create your workspace, add business knowledge, customize your website widget and start testing in just a few minutes.</p>
              </div>
            </article>

            <article class="landing-faq-item">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>Can YOUYOU learn from my business files?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>Yes. You can import PDF, Word, Excel, CSV and TXT files. YOUYOU extracts readable business information and adds it to your Knowledge Base so it can be used as context.</p>
              </div>
            </article>

            <article class="landing-faq-item">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>Does YOUYOU work on any website?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>YOUYOU is installed using a lightweight website widget linked to your own workspace and business settings.</p>
              </div>
            </article>

            <article class="landing-faq-item">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>Can YOUYOU help identify serious leads?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>Yes. YOUYOU uses customer intent signals to help separate stronger opportunities from casual visitors, so your team can focus on the conversations that matter most.</p>
              </div>
            </article>

            <article class="landing-faq-item">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>Do I need a credit card to start?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>No. You can start without a credit card and explore the workspace before choosing a paid plan.</p>
              </div>
            </article>

            <article class="landing-faq-item landing-faq-seo">
              <button class="landing-faq-question" type="button" aria-expanded="false">
                <span>Can YOUYOU help my business rank higher on Google?</span><span class="faq-toggle">+</span>
              </button>
              <div class="landing-faq-answer">
                <p>Yes. YOUYOU’s SEO Growth Center is designed to help identify search opportunities, improve FAQs and metadata, and create stronger service and local content based on your business knowledge and real customer questions. Search rankings still depend on your website, competition and Google’s ranking systems.</p>
              </div>
            </article>
          </div>

          <div class="landing-faq-cta">
            <div>
              <small>READY WHEN YOU ARE</small>
              <strong>Start building your AI customer agent today.</strong>
            </div>
            <button id="faq-start" class="primary" type="button">Start for free →</button>
          </div>
        </div>
      </section>
      </main>

      <footer>
        <div class="footer-brand">
          <a class="logo" href="/">
            <span class="brand-wordmark" aria-label="YOUYOU">
              <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
            </span>
          </a>
          <p>AI customer agent for modern businesses.</p>
        </div>
      </footer>
    </div>
  `;

  document.querySelector("#faq-nav-login")?.addEventListener("click", showLogin);
  document.querySelector("#faq-nav-start")?.addEventListener("click", showSignup);
  document.querySelector("#faq-start")?.addEventListener("click", showSignup);

  document.querySelectorAll(".landing-faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".landing-faq-item");
      const isOpen = item?.classList.contains("is-open");
      document.querySelectorAll(".landing-faq-item").forEach((faqItem) => {
        faqItem.classList.remove("is-open");
        faqItem.querySelector(".landing-faq-question")?.setAttribute("aria-expanded", "false");
        const faqToggle = faqItem.querySelector(".faq-toggle");
        if (faqToggle) faqToggle.textContent = "+";
      });
      if (!isOpen && item) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        const toggle = button.querySelector(".faq-toggle");
        if (toggle) toggle.textContent = "−";
      }
    });
  });
}

/* =========================
   AUTH
========================= */

function renderAuth() {
  app.innerHTML = `
    <div class="auth-page">

      <button id="back-home" class="back-home">
        ← Back to YOUYOU
      </button>

      <div class="auth-card">

        <div class="auth-logo">
          <span class="brand-wordmark" aria-label="YOUYOU">
            <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
          </span>
        </div>

        <div class="eyebrow">
          ${state.authMode === "login" ? "WELCOME BACK" : "GET STARTED"}
        </div>

        <h1>
          ${
            state.authMode === "login"
              ? "Welcome back."
              : "Build your AI agent."
          }
        </h1>

        <p class="auth-description">
          ${
            state.authMode === "login"
              ? "Sign in to continue to your workspace."
              : "Create your account and launch your AI agent."
          }
        </p>

        ${
          state.message
            ? `<div class="auth-message">${escapeHtml(state.message)}</div>`
            : ""
        }

        <form id="auth-form">

          ${
            state.authMode === "signup"
              ? `
                <label>
                  Full name
                  <input name="full_name" type="text" required />
                </label>

                <label>
                  Company name
                  <input name="company_name" type="text" required />
                </label>
              `
              : ""
          }

          <label>
            Email
            <input name="email" type="email" required />
          </label>

          <label>
            Password
            <input name="password" type="password" minlength="6" required />
          </label>

          <button class="primary auth-submit">
            ${
              state.authMode === "login"
                ? "Sign in →"
                : "Create account →"
            }
          </button>

        </form>

        <div class="auth-switch">
          ${
            state.authMode === "login"
              ? `Don't have an account?
                 <button id="switch-auth">Create one</button>`
              : `Already have an account?
                 <button id="switch-auth">Sign in</button>`
          }
        </div>

      </div>

    </div>
  `;

  document.querySelector("#back-home").onclick = () => {
    state.page = "landing";
    state.message = "";
    window.history.replaceState({}, "", "/");
    render();
  };

  document.querySelector("#switch-auth").onclick = () => {
    state.authMode =
      state.authMode === "login" ? "signup" : "login";

    state.message = "";
    renderAuth();
  };

  document.querySelector("#auth-form").onsubmit = handleAuth;
}


function showLogin() {
  state.page = "auth";
  state.authMode = "login";
  state.message = "";
  renderAuth();
}


function showSignup() {
  state.page = "auth";
  state.authMode = "signup";
  state.message = "";
  renderAuth();
}


async function handleAuth(event) {
  event.preventDefault();

  if (!supabase) {
    state.message =
      "Supabase configuration is missing in Vercel.";
    renderAuth();
    return;
  }

  const form = new FormData(event.currentTarget);

  const email = form.get("email");
  const password = form.get("password");

  if (state.authMode === "login") {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      state.message = error.message;
      renderAuth();
      return;
    }

    await loadUser(data.user);
    return;
  }

  const fullName = form.get("full_name");
  const companyName = form.get("company_name");

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

  if (error) {
    state.message = error.message;
    renderAuth();
    return;
  }

  if (!data.session) {
    state.message =
      "Account created successfully. Check your email to confirm your account, then sign in.";
    renderAuth();
    return;
  }

  await loadUser(data.user);
}


/* =========================
   DASHBOARD
========================= */

async function loadUser(user, options = {}) {
  state.user = user;

  const { data } =
    await supabase
      .from("profiles")
      .select("*, companies(*)")
      .eq("id", user.id)
      .maybeSingle();

  state.profile = data || null;
  state.company = data?.companies || null;

  if (options.publicPage === "landing") { state.page = "landing"; renderLanding(); return; }
  if (options.publicPage === "faq") { state.page = "faq"; renderFaqPage(); return; }

  state.page = "dashboard";
  const requestedSection = sectionFromPath();
  const isDashboardPath = window.location.pathname.startsWith("/dashboard/");
  state.section = requestedSection;

  if (!isDashboardPath) {
    window.history.replaceState({ section: state.section }, "", dashboardPath(state.section));
  }
  renderDashboard();
}


function navItem(id, icon, label) {
  return `
    <button
      type="button"
      data-nav="${id}"
      class="${state.section === id ? "active" : ""}">
      <span>${icon}</span>
      ${label}
    </button>
  `;
}


function settingsOption(value, currentValue = "") {
  const selected = String(currentValue || "") === String(value) ? "selected" : "";
  return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(value)}</option>`;
}


function dashboardShell(content) {
  const company =
    state.company?.name || "Your workspace";

  const name =
    state.profile?.full_name ||
    state.user?.email?.split("@")[0] ||
    "there";

  app.innerHTML = `
    <div class="dashboard">

      <aside class="sidebar">

        <div>
          <div class="side-logo">
            <span class="brand-wordmark" aria-label="YOUYOU">
            <span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span>
          </span>
          </div>

          <div class="side-label">
            AI GROWTH PLATFORM
          </div>

          <nav class="dashboard-nav">
            ${navItem("overview", "⌂", "Overview")}
            ${navItem("conversations", "◌", "Conversations")}
            ${navItem("leads", "✦", "Leads")}
            ${navItem("knowledge", "▤", "Knowledge")}
            ${navItem("widget", "◇", "Website Widget")}
            ${navItem("ai", "✧", "AI Control Center")}
            ${navItem("studio", "✦", "AI Studio")}
            ${navItem("seo", "↗", "SEO Growth")}
            ${navItem("rescue", "↻", "Revenue Rescue")}
            ${navItem("whatsapp", "◉", "WhatsApp AI")}
            ${navItem("settings", "⚙", "Settings")}
            ${navItem("billing", "◈", "Plans & Billing")}
          </nav>
        </div>

        <div class="side-bottom">
          <div class="pro-badge">DEVELOPMENT ACCESS</div>
          <button id="view-website" class="sidebar-site-link" type="button">↗ View public website</button>
          <button id="logout" class="logout">Log out</button>
        </div>

      </aside>

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>
            <small>WORKSPACE</small>
            <h2>${escapeHtml(company)}</h2>
          </div>

          <div class="dashboard-header-actions">
            <button id="header-upgrade" class="dashboard-upgrade-btn" type="button">Plans</button>
            <div class="user-name">${escapeHtml(name)}</div>
          </div>

        </header>

        ${content}

      </main>

    </div>
  `;

  const sidebarNav = document.querySelector(".dashboard-nav");

  if (sidebarNav) {
    sidebarNav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-nav]");
      if (!button) return;

      event.preventDefault();
      const nextSection = button.dataset.nav;
      if (!nextSection) return;

      navigateDashboard(nextSection);
    });
  }

  document.querySelector("#view-website")?.addEventListener("click", () => {
    state.page = "landing";
    window.history.pushState({}, "", "/");
    renderLanding();
  });

  document.querySelector("#header-upgrade")?.addEventListener("click", () => navigateDashboard("billing"));

  if (state.section === "knowledge") knowledgePanelToggleInit();

  document.querySelector("#logout").onclick =
    async () => {
      await supabase.auth.signOut();

      state.user = null;
      state.profile = null;
      state.company = null;
      state.page = "landing";
      state.section = "overview";
      window.history.replaceState({}, "", "/");

      render();
    };
}


function getWidgetInstallCode() {
  const origin = window.location.origin;
  const companyId = state.company?.id || "YOUR_COMPANY_ID";
  return `<script src="${origin}/widget.js" data-company="${companyId}" defer></script>`;
}



function setupLandingMotion() {
  const featureTrack = document.querySelector("#feature-carousel");
  const featureCards = [...document.querySelectorAll("#feature-carousel .feature-card")];
  const featureDots = [...document.querySelectorAll(".feature-dot")];
  const prevFeature = document.querySelector(".feature-carousel-prev");
  const nextFeature = document.querySelector(".feature-carousel-next");

  if (featureTrack && featureCards.length) {
    let featureIndex = 0;
    let autoplayId = null;
    let resumeId = null;

    const cardStep = () => {
      const first = featureCards[0];
      if (!first) return featureTrack.clientWidth;
      const style = getComputedStyle(featureTrack);
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return first.getBoundingClientRect().width + gap;
    };

    const visibleCount = () => {
      if (window.innerWidth <= 700) return 1;
      if (window.innerWidth <= 1050) return 2;
      return 3;
    };

    const maxIndex = () => Math.max(0, featureCards.length - visibleCount());

    const paintDots = () => {
      const lastIndex = maxIndex();
      featureDots.forEach((dot, index) => {
        dot.hidden = index > lastIndex;
        dot.classList.toggle("is-active", index === featureIndex);
        dot.toggleAttribute("aria-current", index === featureIndex);
      });
    };

    const goToFeature = (index, behavior = "smooth") => {
      featureIndex = Math.min(Math.max(index, 0), maxIndex());
      featureTrack.scrollTo({ left: cardStep() * featureIndex, behavior });
      paintDots();
    };

    const stopAutoplay = () => {
      if (autoplayId) clearInterval(autoplayId);
      autoplayId = null;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoplayId = setInterval(() => {
        const next = featureIndex >= maxIndex() ? 0 : featureIndex + 1;
        goToFeature(next);
      }, 3800);
    };

    const pauseThenResume = () => {
      stopAutoplay();
      if (resumeId) clearTimeout(resumeId);
      resumeId = setTimeout(startAutoplay, 6500);
    };

    prevFeature?.addEventListener("click", () => {
      goToFeature(featureIndex <= 0 ? maxIndex() : featureIndex - 1);
      pauseThenResume();
    });

    nextFeature?.addEventListener("click", () => {
      goToFeature(featureIndex >= maxIndex() ? 0 : featureIndex + 1);
      pauseThenResume();
    });

    featureDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToFeature(Math.min(index, maxIndex()));
        pauseThenResume();
      });
    });

    featureTrack.addEventListener("pointerenter", stopAutoplay);
    featureTrack.addEventListener("pointerleave", startAutoplay);
    featureTrack.addEventListener("touchstart", pauseThenResume, { passive: true });
    featureTrack.addEventListener("scroll", () => {
      const step = cardStep();
      if (!step) return;
      featureIndex = Math.min(Math.max(Math.round(featureTrack.scrollLeft / step), 0), maxIndex());
      paintDots();
    }, { passive: true });

    window.addEventListener("resize", () => goToFeature(Math.min(featureIndex, maxIndex()), "auto"));
    paintDots();
    startAutoplay();
  }

  const pricingGrid = document.querySelector(".pricing-grid");
  const pricingPlans = [...document.querySelectorAll(".pricing-grid .pricing-plan")];

  if (pricingGrid && pricingPlans.length) {
    const setActivePlan = (plan) => {
      pricingPlans.forEach((item) => item.classList.toggle("is-active", item === plan));
    };

    const growthPlan = document.querySelector(".pricing-grid .pricing-growth");
    if (growthPlan) setActivePlan(growthPlan);

    pricingPlans.forEach((plan) => {
      plan.addEventListener("pointerenter", () => setActivePlan(plan));
      plan.addEventListener("focusin", () => setActivePlan(plan));
    });

    pricingGrid.addEventListener("pointerleave", () => {
      if (growthPlan) setActivePlan(growthPlan);
    });
  }

  const revealTargets = document.querySelectorAll(
    ".stats-section, .growth-platform-shell, .section-heading, .feature-carousel-shell, .steps, .landing-knowledge-shell, .growth-showcase-section, .pricing-grid, .final-cta"
  );

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach((node) => node.classList.add("landing-reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach((node) => observer.observe(node));
  }
}


function knowledgePanelToggleInit() {
  document.querySelectorAll("[data-knowledge-toggle]").forEach((button) => {
    button.onclick = () => {
      const key = button.dataset.knowledgeToggle;
      const panel = document.querySelector(`[data-knowledge-panel="${CSS.escape(key)}"]`);
      if (!panel) return;
      const open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      button.textContent = open ? "−" : "+";
      button.setAttribute("aria-expanded", open ? "true" : "false");
    };
  });
}


function initSeoProTabs() {
  const root = document.querySelector(".seo-growth-page");
  if (!root) return;

  const map = {
    overview: [".seo-overview-panel"],
    audit: [".seo-website-audit"],
    keywords: [".seo-keyword-lab"],
    onpage: [".seo-onpage-card", ".seo-opportunity-card", ".seo-search-preview"],
    content: [".seo-page-ideas-card", ".seo-brief-card"],
    local: [".seo-local-pack"],
    technical: [".seo-checklist-card", ".seo-console-card"],
  };

  Object.entries(map).forEach(([key, selectors]) => {
    selectors.forEach((selector) => root.querySelectorAll(selector).forEach((el) => {
      el.dataset.seoPanel = key;
    }));
  });

  const setTab = (key, targetSelector = "") => {
    root.dataset.activeSeoTab = key;

    root.querySelectorAll("[data-seo-tab]").forEach((btn) => {
      const active = btn.dataset.seoTab === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    root.querySelectorAll("[data-seo-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.seoPanel !== key;
    });

    requestAnimationFrame(() => {
      const target = targetSelector
        ? root.querySelector(targetSelector)
        : root.querySelector(`[data-seo-panel="${CSS.escape(key)}"]:not([hidden])`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  root.querySelectorAll("[data-seo-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.seoTab || "overview"));
  });

  root.querySelectorAll("[data-seo-go]").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.seoGo || "overview", btn.dataset.seoTarget || ""));
  });

  root.querySelectorAll("[data-dashboard-go]").forEach((btn) => {
    btn.addEventListener("click", () => navigateDashboard(btn.dataset.dashboardGo));
  });

  setTab("overview");
}


function initAiStudio() {
  const root = document.querySelector(".studio-page");
  if (!root) return;

  let currentType = "Video Ad";
  const idea = root.querySelector("#studio-idea");
  const videoSettings = root.querySelector("#studio-video-settings");
  const status = root.querySelector("#studio-status");
  const empty = root.querySelector("#studio-output-empty");
  const preview = root.querySelector("#studio-brief-preview");

  const setType = (type) => {
    currentType = type;
    root.querySelectorAll("[data-studio-type]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.studioType === type);
    });
    if (videoSettings) videoSettings.hidden = type !== "Video Ad";
  };

  root.querySelectorAll("[data-studio-type]").forEach((btn) => {
    btn.addEventListener("click", () => setType(btn.dataset.studioType || "Video Ad"));
  });

  root.querySelectorAll("[data-studio-example]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!idea) return;
      idea.value = btn.dataset.studioExample || "";
      idea.focus();
      if (status) status.textContent = "Idea added — review it before generation";
    });
  });

  root.querySelector("#studio-improve-idea")?.addEventListener("click", () => {
    if (!idea?.value.trim()) {
      if (status) status.textContent = "Write your idea first";
      idea?.focus();
      return;
    }
    if (status) status.textContent = "Improve Idea will activate with the AI API";
  });

  root.querySelector("#studio-generate")?.addEventListener("click", () => {
    const ideaText = idea?.value.trim() || "";
    if (!ideaText) {
      if (status) status.textContent = "Describe your idea before generating";
      idea?.focus();
      return;
    }

    const goal = root.querySelector("#studio-goal")?.value || "—";
    const platform = root.querySelector("#studio-platform")?.value || "—";
    const tone = root.querySelector("#studio-tone")?.value || "—";
    const language = root.querySelector("#studio-language")?.value || "—";
    const audience = root.querySelector("#studio-audience")?.value.trim() || "Use business context";
    const offer = root.querySelector("#studio-offer")?.value.trim() || "No specific offer";

    if (empty) empty.hidden = true;
    if (preview) {
      preview.hidden = false;
      preview.innerHTML = `
        <div class="studio-preview-head">
          <div><small>CREATIVE BRIEF</small><strong>${escapeHtml(currentType)}</strong></div>
          <span>READY FOR AI</span>
        </div>
        <p>${escapeHtml(ideaText)}</p>
        <div class="studio-preview-grid">
          <div><small>GOAL</small><strong>${escapeHtml(goal)}</strong></div>
          <div><small>PLATFORM</small><strong>${escapeHtml(platform)}</strong></div>
          <div><small>TONE</small><strong>${escapeHtml(tone)}</strong></div>
          <div><small>LANGUAGE</small><strong>${escapeHtml(language)}</strong></div>
          <div><small>AUDIENCE</small><strong>${escapeHtml(audience)}</strong></div>
          <div><small>OFFER</small><strong>${escapeHtml(offer)}</strong></div>
        </div>
        ${currentType === "Video Ad" ? `
          <div class="studio-preview-video">
            <small>VIDEO PLAN</small>
            <span>${escapeHtml(root.querySelector("#studio-duration")?.value || "30 sec")}</span>
            <span>${escapeHtml(root.querySelector("#studio-format")?.value || "9:16")}</span>
            <span>${escapeHtml(root.querySelector("#studio-voice")?.value || "Professional")}</span>
            <span>${escapeHtml(root.querySelector("#studio-visual")?.value || "Premium realistic")}</span>
          </div>` : ""}
        <div class="studio-preview-notice">
          This is the structured brief only. No AI content has been generated yet.
        </div>
      `;
    }
    if (status) status.textContent = "Creative brief ready for AI connection";
  });

  setType("Video Ad");
}

function renderDashboard() {
  const company =
    state.company?.name || "Your workspace";

  let body = "";

  if (state.section === "knowledge") {
    body = `
      <section class="knowledge-workspace">
        <div class="knowledge-hero dashboard-card">
          <div>
            <small>BUSINESS BRAIN</small>
            <h1>Knowledge Base</h1>
            <p>
              Teach YOUYOU about your business now, so your AI agent can use
              accurate company information when full AI replies are activated.
            </p>
          </div>

          <button id="add-knowledge" class="primary knowledge-new-btn">
            + New entry
          </button>
        </div>

        <div class="knowledge-stats">
          <div class="knowledge-stat">
            <span>ENTRIES</span>
            <strong id="knowledge-count">—</strong>
            <small>Saved business facts</small>
          </div>
          <div class="knowledge-stat">
            <span>CONTENT</span>
            <strong id="knowledge-char-total">—</strong>
            <small>Total characters</small>
          </div>
          <div class="knowledge-stat">
            <span>STATUS</span>
            <strong class="knowledge-ready">● READY</strong>
            <small>Workspace connected</small>
          </div>
        </div>

        <div class="knowledge-upload-card dashboard-card">
          <div class="knowledge-card-heading">
            <div>
              <div class="knowledge-inline-head"><small>UPLOAD KNOWLEDGE</small><button type="button" class="knowledge-collapse-toggle" data-knowledge-toggle="upload" aria-expanded="true">−</button></div>
              <h2>Import business files</h2>
              <p>
                Upload an existing document and turn it into knowledge for this workspace.
              </p>
            </div>
            <span class="knowledge-upload-badge">PDF · DOCX · TXT · CSV · XLSX</span>
          </div>

          <div id="knowledge-dropzone" class="knowledge-dropzone" tabindex="0" role="button">
            <input
              id="knowledge-file-input"
              type="file"
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls"
              hidden
            />
            <div class="knowledge-drop-icon">⇧</div>
            <strong>Drop a file here or choose a file</strong>
            <span>Maximum 10 MB. The file is parsed in your browser; only extracted text is saved.</span>
            <button id="choose-knowledge-file" class="knowledge-secondary" type="button">
              Choose file
            </button>
          </div>

          <div id="knowledge-file-result" class="knowledge-file-result" hidden>
            <div class="knowledge-file-meta">
              <div>
                <small>SELECTED FILE</small>
                <strong id="knowledge-file-name">—</strong>
                <span id="knowledge-file-info">—</span>
              </div>
              <button id="clear-knowledge-file" class="knowledge-secondary" type="button">
                Remove
              </button>
            </div>

            <label class="knowledge-field">
              <span>Extracted knowledge preview</span>
              <textarea
                id="knowledge-file-preview"
                rows="10"
                maxlength="30000"
                placeholder="Extracted text will appear here..."
              ></textarea>
            </label>

            <div class="knowledge-file-actions">
              <span id="knowledge-file-status" class="knowledge-form-status" aria-live="polite"></span>
              <button id="import-knowledge-file" class="primary" type="button">
                Import to Knowledge Base →
              </button>
            </div>
          </div>
        </div>

        <div class="knowledge-layout">
          <div class="dashboard-card knowledge-composer">
            <div class="knowledge-card-heading">
              <div>
                <small>ADD KNOWLEDGE</small>
                <h2>Business information</h2>
              </div>
              <span class="knowledge-manual-badge">Manual</span>
            </div>

            <label class="knowledge-field">
              <span>Title</span>
              <input
                id="knowledge-title"
                maxlength="100"
                placeholder="e.g. Services & pricing"
              />
            </label>

            <label class="knowledge-field">
              <span>Information</span>
              <textarea
                id="knowledge-content"
                rows="9"
                maxlength="6000"
                placeholder="Example: We offer website support Monday to Friday from 9 AM to 6 PM. Our starter plan costs..."
              ></textarea>
            </label>

            <div class="knowledge-form-meta">
              <span id="knowledge-char-count">0 / 6000</span>
              <span>Keep each entry focused on one topic.</span>
            </div>

            <div class="knowledge-template-wrap">
              <span class="knowledge-template-label">QUICK START</span>
              <div class="knowledge-templates">
                <button type="button" data-knowledge-template="services">Services & pricing</button>
                <button type="button" data-knowledge-template="hours">Hours & contact</button>
                <button type="button" data-knowledge-template="faq">Common FAQ</button>
                <button type="button" data-knowledge-template="policies">Policies</button>
              </div>
            </div>

            <div class="knowledge-form-actions">
              <button id="clear-knowledge" class="knowledge-secondary" type="button">
                Clear
              </button>
              <button id="save-knowledge" class="primary" type="button">
                Save to Knowledge Base
              </button>
            </div>

            <div id="knowledge-form-status" class="knowledge-form-status" aria-live="polite"></div>
          </div>

          <div class="dashboard-card knowledge-library">
            <div class="knowledge-library-head">
              <div>
                <small>YOUR LIBRARY</small>
                <h2>Saved knowledge</h2>
              </div>
              <div class="knowledge-search-wrap">
                <span>⌕</span>
                <input id="knowledge-search" placeholder="Search knowledge..." />
              </div>
            </div>

            <div id="knowledge-list" class="knowledge-list">
              Loading...
            </div>
          </div>
        </div>
      </section>
    `;
  }

  else if (state.section === "widget") {
    const savedWelcome =
      state.company?.widget_welcome_message ||
      "Hi! 👋 How can I help you today?";

    const savedStatus =
      state.company?.widget_status || "Enabled";

    body = `
      <section class="widget-page-v38">

        <div class="dashboard-grid widget-dashboard-stack">
          <div class="dashboard-card widget-deploy-card">
            <small>DEPLOYMENT</small>
            <h1>Website Widget</h1>

            <p>
              Install YOUYOU once. Your saved widget settings update automatically
              without changing this code.
            </p>

            <pre id="widget-code">${escapeHtml(getWidgetInstallCode())}</pre>

            <button id="copy-widget" class="primary">
              Copy install code
            </button>
          </div>

          <div class="dashboard-card widget-preview-card">
            <div class="widget-preview-top">
              <div>
                <small>LIVE PREVIEW</small>
                <h1>Your assistant</h1>
              </div>
              <span id="widget-preview-online" class="widget-online">
                ● ${savedStatus === "Disabled" ? "Disabled" : "Online"}
              </span>
            </div>

            <div id="widget-preview-device" class="widget-device">
              <div class="widget-device-head">
                <div id="widget-preview-avatar" class="widget-agent-avatar">Y</div>
                <div>
                  <strong>YOUYOU AI</strong>
                  <span>AI Customer Agent</span>
                </div>
                <span id="widget-preview-dot" class="widget-device-status">●</span>
              </div>

              <div class="preview-chat premium-preview-chat">
                <div id="widget-preview-welcome" class="preview-message">
                  ${escapeHtml(savedWelcome)}
                </div>

                <div id="widget-preview-user" class="preview-message user">
                  I need pricing and a demo.
                </div>

                <div class="preview-message">
                  Absolutely. I can help with that and connect you with the team.
                </div>
              </div>

              <button type="button" class="widget-whatsapp-handoff-pro" disabled title="Available after WhatsApp AI is connected">
                Continue on WhatsApp <span>COMING WITH WHATSAPP AI</span>
              </button>

              <div class="widget-device-input">
                <span>Ask YOUYOU anything...</span>
                <button id="widget-preview-send" type="button">↑</button>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card widget-customizer-v38">
          <div class="card-header">
            <div>
              <small>CUSTOMIZATION</small>
              <h1>Widget settings</h1>
              <p>
                These settings belong only to this company workspace.
              </p>
            </div>
            <span id="widget-config-status" class="ai-status">Loading...</span>
          </div>

          <div class="widget-customizer-grid-v38">

            <label>
              Widget status
              <select id="widget-config-enabled">
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
              <span>Turn the widget off without removing the script.</span>
            </label>

            <label>
              Position
              <select id="widget-config-position">
                <option value="Right">Bottom right</option>
                <option value="Left">Bottom left</option>
              </select>
              <span>Choose where the launcher appears.</span>
            </label>

            <label>
              Accent color
              <div class="widget-color-row-v38">
                <input id="widget-config-color" type="color" value="#22c55e" />
                <input id="widget-config-color-text" value="#22c55e" maxlength="7" />
              </div>
              <span>Used for the launcher and customer message color.</span>
            </label>

            <label class="widget-wide-v38">
              Welcome message
              <textarea
                id="widget-config-welcome"
                rows="4"
                maxlength="280"
                placeholder="Hi! How can I help you today?"
              >${escapeHtml(savedWelcome)}</textarea>
              <span>First message visitors see when they open YOUYOU.</span>
            </label>

          </div>

          <div class="widget-save-row-v38">
            <span>
              Settings are saved per company and loaded automatically by the installed widget.
            </span>
            <button id="save-widget-config" class="primary">
              Save widget settings →
            </button>
          </div>
        </div>

      </section>
    `;
  }

else if (state.section === "ai") {
  body = `
    <div class="dashboard-card ai-control-center">

      <div class="ai-header">
        <div>
          <small>AI CONTROL CENTER</small>
          <h1>Configure your AI agent</h1>
          <p>
            Control how YOUYOU talks to customers, captures leads
            and represents your business.
          </p>
        </div>

        <div class="ai-status ai-status-compact">
          <span>●</span> CONFIGURATION READY
        </div>
      </div>

      <div class="settings-grid">

        <label>
          Agent name
          <input
            id="agent-name"
            value="YOUYOU AI"
            placeholder="e.g. YOUYOU AI"
          />
        </label>

        <label>
          Tone
          <select id="agent-tone">
            <option>Professional</option>
            <option>Friendly</option>
            <option>Concise</option>
            <option>Warm</option>
          </select>
        </label>

        <label>
          Language
          <select id="agent-language">
            <option value="Auto-detect">Auto-detect (Recommended)</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
          <span class="ai-field-hint">Automatically reply in the customer's language.</span>
        </label>

      </div>

      <div class="ai-section">

        <div class="ai-section-title">
          <small>AI BEHAVIOR</small>
          <h2>Agent instructions</h2>
        </div>

        <p class="setting-description">
          Tell YOUYOU how your AI agent should behave when talking
          with your customers.
        </p>

        <textarea
          id="agent-instructions"
          rows="8"
          placeholder="Describe how your AI agent should behave..."
        >You are YOUYOU, an AI customer service agent.

Answer customers professionally, clearly and accurately.

Use the company's knowledge base whenever possible.

Never invent information. If you do not know the answer,
clearly say so and guide the customer to contact the company.

Help visitors understand products and services, answer questions,
and identify qualified leads.</textarea>

      </div>

      <div class="ai-section">

        <div class="ai-section-title">
          <small>RESPONSE STYLE</small>
          <h2>How should YOUYOU respond?</h2>
        </div>

        <div class="response-options">

          <label class="response-option">
            <input
              type="radio"
              name="response-style"
              value="Concise"
            />
            <div>
              <strong>Concise</strong>
              <span>Short and direct answers.</span>
            </div>
          </label>

          <label class="response-option">
            <input
              type="radio"
              name="response-style"
              value="Balanced"
              checked
            />
            <div>
              <strong>Balanced</strong>
              <span>Helpful answers with the right amount of detail.</span>
            </div>
          </label>

          <label class="response-option">
            <input
              type="radio"
              name="response-style"
              value="Detailed"
            />
            <div>
              <strong>Detailed</strong>
              <span>More context and explanation when needed.</span>
            </div>
          </label>

        </div>

      </div>

      <div class="ai-section">

        <div class="ai-section-title">
          <small>LEAD QUALIFICATION</small>
          <h2>Capture potential customers</h2>
        </div>

        <p class="setting-description">
          When enabled, YOUYOU can identify visitors who may be
          interested in your products or services.
        </p>

        <label class="toggle-row">
          <input
            id="lead-enabled"
            type="checkbox"
            checked
          />
          <span>Enable AI lead capture</span>
        </label>

      </div>

      <div class="ai-footer">

        <div>
          <small>STATUS</small>
          <strong id="ai-config-status">Configuration ready</strong>
        </div>

        <button id="save-ai-config" class="primary">
          Save configuration →
        </button>

      </div>

    </div>
  `;
}


else if (state.section === "studio") {
  const c = state.company || {};
  const companyName = c.name || "Your business";
  const businessIndustry = c.industry || "Business not set";
  const businessCity = c.city || "Location not set";

  body = `
    <section class="studio-page">
      <div class="studio-hero dashboard-card">
        <div>
          <div class="studio-kicker-row">
            <span class="studio-kicker">AI MARKETING STUDIO</span>
            <span class="studio-pro-pill">PRO WORKSPACE</span>
          </div>
          <h1>Turn one idea into campaign-ready content.</h1>
          <p>
            Start with your own idea. YOUYOU will combine it with your business context,
            brand voice and Knowledge Base when the AI generation layer is connected.
          </p>
        </div>
        <div class="studio-context-card">
          <small>USING BUSINESS CONTEXT</small>
          <strong>${escapeHtml(companyName)}</strong>
          <div class="studio-context-chips">
            <span>${escapeHtml(businessIndustry)}</span>
            <span>${escapeHtml(businessCity)}</span>
            <span>Knowledge connected</span>
          </div>
        </div>
      </div>

      <div class="studio-create-grid">
        <div class="studio-builder dashboard-card">
          <div class="studio-section-head">
            <div>
              <small>CREATE</small>
              <h2>What do you want to create?</h2>
            </div>
            <span class="studio-step">STEP 1</span>
          </div>

          <div class="studio-type-grid" role="radiogroup" aria-label="Content type">
            <button class="studio-type-card is-active" type="button" data-studio-type="Video Ad">
              <span>▶</span><strong>Video Ad</strong><small>Script · voice · scenes · visuals</small>
            </button>
            <button class="studio-type-card" type="button" data-studio-type="Ad Copy">
              <span>↗</span><strong>Ad Copy</strong><small>Meta · Google · TikTok · LinkedIn</small>
            </button>
            <button class="studio-type-card" type="button" data-studio-type="Social Post">
              <span>◎</span><strong>Social Post</strong><small>Posts · hooks · captions · CTA</small>
            </button>
            <button class="studio-type-card" type="button" data-studio-type="Email">
              <span>✉</span><strong>Email</strong><small>Campaigns · follow-up · reactivation</small>
            </button>
            <button class="studio-type-card" type="button" data-studio-type="Landing Page">
              <span>▤</span><strong>Landing Page</strong><small>Hero · benefits · CTA · FAQ</small>
            </button>
            <button class="studio-type-card" type="button" data-studio-type="Campaign">
              <span>✦</span><strong>Campaign</strong><small>Angle · audience · channels · content</small>
            </button>
          </div>

          <div class="studio-idea-block">
            <div class="studio-field-title">
              <div>
                <small>YOUR IDEA</small>
                <h3>Tell YOUYOU what you want to create.</h3>
              </div>
              <span>STEP 2</span>
            </div>
            <p>Describe the campaign, message, offer, style or idea in your own words.</p>
            <textarea id="studio-idea" rows="7" maxlength="2500" placeholder="Example: Create a 30-second Instagram Reel for a luxury spa in Miami. Target women 25–45, promote 20% off the first visit, calm premium style, focus on bookings."></textarea>
            <div class="studio-idea-footer">
              <div class="studio-example-chips">
                <button type="button" data-studio-example="Create a 30-second Instagram Reel promoting my main service with a strong booking CTA.">30-sec Reel</button>
                <button type="button" data-studio-example="Create a lead-generation campaign for my business with a clear offer and direct call to action.">Lead campaign</button>
                <button type="button" data-studio-example="Create a promotional social post that feels premium, clear and not pushy.">Premium promo</button>
              </div>
              <button id="studio-improve-idea" class="studio-ghost-btn" type="button">✦ Improve my idea</button>
            </div>
          </div>

          <div class="studio-settings-grid">
            <label>
              Goal
              <select id="studio-goal">
                <option>Sales</option><option>Leads</option><option>Awareness</option><option>Promotion</option><option>Retargeting</option><option>Launch</option>
              </select>
            </label>
            <label>
              Platform
              <select id="studio-platform">
                <option>Instagram</option><option>Facebook</option><option>TikTok</option><option>Google</option><option>LinkedIn</option><option>YouTube</option><option>Website</option>
              </select>
            </label>
            <label>
              Tone
              <select id="studio-tone">
                <option>Professional</option><option>Friendly</option><option>Premium</option><option>Direct</option><option>Warm</option><option>Energetic</option>
              </select>
            </label>
            <label>
              Language
              <select id="studio-language">
                <option>English</option><option>French</option><option>Spanish</option><option>Arabic</option>
              </select>
            </label>
            <label class="studio-span-2">
              Audience <span>Optional</span>
              <input id="studio-audience" placeholder="e.g. Women 25–45 in Miami" />
            </label>
            <label class="studio-span-2">
              Offer <span>Optional</span>
              <input id="studio-offer" placeholder="e.g. 20% off the first visit" />
            </label>
          </div>

          <div id="studio-video-settings" class="studio-video-settings">
            <div class="studio-mini-head">
              <div><small>VIDEO SETTINGS</small><strong>Voice + image creative direction</strong></div>
              <span>VIDEO AD</span>
            </div>
            <div class="studio-video-grid">
              <label>Duration
                <select id="studio-duration"><option>15 sec</option><option selected>30 sec</option><option>45 sec</option><option>60 sec</option></select>
              </label>
              <label>Format
                <select id="studio-format"><option>9:16 · Reels / TikTok</option><option>1:1 · Social Ad</option><option>16:9 · YouTube / Web</option></select>
              </label>
              <label>Voice style
                <select id="studio-voice"><option>Professional</option><option>Warm</option><option>Calm</option><option>Energetic</option><option>Premium</option></select>
              </label>
              <label>Visual style
                <select id="studio-visual"><option>Premium realistic</option><option>Clean commercial</option><option>Minimal product</option><option>Editorial</option><option>Bold social</option></select>
              </label>
            </div>
            <div class="studio-video-output-plan">
              <span>Hook</span><span>Scene plan</span><span>Voiceover</span><span>On-screen text</span><span>Image direction</span><span>CTA</span>
            </div>
          </div>

          <div class="studio-generate-row">
            <div>
              <small>GENERATION STATUS</small>
              <strong id="studio-status">Creative brief ready</strong>
              <span>AI generation is intentionally not connected yet.</span>
            </div>
            <button id="studio-generate" class="primary studio-generate-btn" type="button">Generate with AI →</button>
          </div>
        </div>

        <aside class="studio-side-column">
          <div class="studio-output dashboard-card">
            <div class="studio-section-head">
              <div><small>OUTPUT WORKSPACE</small><h2>Your creative will appear here.</h2></div>
              <span class="studio-api-badge">AI API LATER</span>
            </div>
            <div id="studio-output-empty" class="studio-output-empty">
              <div class="studio-output-icon">✦</div>
              <strong>Start with your idea.</strong>
              <p>Choose a content type, describe what you want, then set the goal and audience.</p>
              <div class="studio-output-list">
                <span>✓ Uses Business Info</span>
                <span>✓ Uses Knowledge Base</span>
                <span>✓ Uses your selected tone</span>
                <span>✓ Keeps the client in control</span>
              </div>
            </div>
            <div id="studio-brief-preview" class="studio-brief-preview" hidden></div>
          </div>

          <div class="studio-projects dashboard-card">
            <div class="studio-section-head compact">
              <div><small>PROJECTS</small><h2>Saved creative work</h2></div>
              <span>COMING NEXT</span>
            </div>
            <div class="studio-project-empty">
              <strong>No projects yet</strong>
              <span>Generated campaigns, ads and videos will be saved here per company.</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `;
}


else if (state.section === "seo") {
  const c = state.company || {};

  body = `
    <section class="seo-growth-page">

      <div class="seo-hero dashboard-card">
        <div class="seo-hero-copy">
          <div class="seo-kicker-row">
            <span class="seo-kicker">SEO GROWTH CENTER</span>
            <span class="seo-pro-pill">PRO</span>
          </div>

          <h1>Turn business knowledge into search growth.</h1>

          <p>
            Find SEO opportunities from your business profile and Knowledge Base,
            then turn them into stronger pages, FAQs and local search content.
          </p>

          <div class="seo-hero-actions">
            <button id="seo-refresh" class="primary" type="button">
              Analyze workspace →
            </button>

            <span id="seo-analysis-status" class="seo-analysis-status">
              Ready to analyze
            </span>
          </div>
        </div>

        <div class="seo-score-panel">
          <div class="seo-score-ring" id="seo-score-ring">
            <div class="seo-score-inner">
              <strong id="seo-score">—</strong>
              <span>/100</span>
            </div>
          </div>

          <div>
            <small>SEO READINESS</small>
            <strong id="seo-score-label">Analyzing...</strong>
            <span id="seo-score-subtext">
              Based on your workspace setup, not Google ranking data.
            </span>
          </div>
        </div>
      </div>


      <div class="seo-input-strip seo-audit-config dashboard-card">
        <div class="seo-input-strip-copy">
          <small>SEO CONFIGURATION</small>
          <strong>Connect the real website, then build the SEO plan around it.</strong>
          <span>Website Audit checks the live page. Strategy uses your service, city and workspace knowledge.</span>
        </div>

        <label class="seo-config-url">
          Website URL
          <input
            id="seo-focus-url"
            value="${escapeHtml(c.website_url || "")}"
            placeholder="https://yourwebsite.com"
            inputmode="url"
          />
        </label>

        <label>
          Target service
          <input
            id="seo-target-service"
            value="${escapeHtml(c.industry || "")}"
            placeholder="e.g. Emergency plumbing"
          />
        </label>

        <label>
          Target city
          <input
            id="seo-target-city"
            value="${escapeHtml(c.city || "")}"
            placeholder="e.g. Miami"
          />
        </label>

        <div class="seo-config-actions">
          <button id="seo-run-focus-audit" class="primary seo-run-audit-main" type="button">
            Run Website Audit →
          </button>
          <button id="seo-update-focus" class="seo-secondary-btn" type="button">
            Refresh strategy
          </button>
        </div>
      </div>



      <div class="seo-data-note">
        <span>i</span>
        <p>Workspace-based recommendations. Live rankings, clicks and impressions appear after real search integrations are connected.</p>
      </div>

      <div class="seo-pro-tabs dashboard-card" role="tablist" aria-label="SEO workspace">
        <button class="seo-pro-tab is-active" type="button" data-seo-tab="overview">Overview</button>
        <button class="seo-pro-tab" type="button" data-seo-tab="audit">Website Audit <span class="seo-tab-live">LIVE</span></button>
        <button class="seo-pro-tab" type="button" data-seo-tab="keywords">Keywords</button>
        <button class="seo-pro-tab" type="button" data-seo-tab="onpage">On-page</button>
        <button class="seo-pro-tab" type="button" data-seo-tab="content">Content</button>
        <button class="seo-pro-tab" type="button" data-seo-tab="local">Local</button>
        <button class="seo-pro-tab" type="button" data-seo-tab="technical">Technical</button>
      </div>

      <div class="seo-overview-panel" data-seo-panel="overview">
      <div class="seo-analysis-summary dashboard-card">
        <div class="seo-analysis-summary-head">
          <div>
            <small>ANALYSIS SUMMARY</small>
            <strong>What YOUYOU found in your workspace</strong>
          </div>
          <span class="seo-summary-scope">WORKSPACE SIGNALS</span>
        </div>

        <div class="seo-summary-grid">
          <button type="button" class="seo-kpi-card" data-seo-go="keywords">
            <small>KEYWORD IDEAS</small><strong id="seo-summary-keywords">—</strong><span>Open strategy →</span>
          </button>
          <button type="button" class="seo-kpi-card" data-seo-go="content" data-seo-target=".seo-page-ideas-card">
            <small>PAGE IDEAS</small><strong id="seo-summary-pages">—</strong><span>See opportunities →</span>
          </button>
          <button type="button" class="seo-kpi-card" data-seo-go="onpage" data-seo-target=".seo-opportunity-card">
            <small>QUICK WINS</small><strong id="seo-summary-wins">—</strong><span>Open action plan →</span>
          </button>
          <button type="button" class="seo-kpi-card" data-seo-go="technical" data-seo-target=".seo-checklist-card">
            <small>SETUP GAPS</small><strong id="seo-summary-gaps">—</strong><span>Fix setup →</span>
          </button>
        </div>
      </div>


      <div class="seo-metric-grid">
        <button type="button" class="seo-metric-card seo-metric-action" data-dashboard-go="settings">
          <div class="seo-metric-icon">◎</div>
          <div>
            <small>BUSINESS PROFILE</small>
            <strong id="seo-profile-score">—</strong>
            <span id="seo-profile-note">Checking business details...</span>
            <em>Open settings →</em>
          </div>
        </button>

        <button type="button" class="seo-metric-card seo-metric-action" data-dashboard-go="knowledge">
          <div class="seo-metric-icon">▤</div>
          <div>
            <small>KNOWLEDGE DEPTH</small>
            <strong id="seo-knowledge-count">—</strong>
            <span id="seo-knowledge-note">Checking saved knowledge...</span>
            <em>Open knowledge →</em>
          </div>
        </button>

        <button type="button" class="seo-metric-card seo-metric-action" data-seo-go="local">
          <div class="seo-metric-icon">⌖</div>
          <div>
            <small>LOCAL SEO</small>
            <strong id="seo-local-status">—</strong>
            <span id="seo-local-note">Checking location signals...</span>
            <em>Open local plan →</em>
          </div>
        </button>

        <button type="button" class="seo-metric-card seo-metric-action" data-seo-go="onpage" data-seo-target=".seo-opportunity-card">
          <div class="seo-metric-icon">✦</div>
          <div>
            <small>QUICK WINS</small>
            <strong id="seo-quickwin-count">—</strong>
            <span>Prioritized workspace opportunities</span>
            <em>Open action plan →</em>
          </div>
        </button>
      </div>



      </div>


      <section class="seo-website-audit dashboard-card" data-seo-panel="audit" hidden>
        <div class="seo-audit-head">
          <div>
            <div class="seo-audit-title-row">
              <span class="seo-kicker">REAL WEBSITE AUDIT</span>
              <span class="seo-live-pill">LIVE PAGE CHECK</span>
            </div>
            <h2>Analyze the real website, then turn problems into actions.</h2>
            <p>
              Enter a public website URL. YOUYOU checks the live page from the server,
              then connects the findings to your SEO service, city and workspace strategy.
            </p>
          </div>
        </div>

        <div class="seo-audit-source-note">
          <span>1</span>
          <p>Use the website URL above or paste another public page here. YOUYOU audits the real live page — not a demo score.</p>
        </div>

        <div class="seo-audit-runner">
          <label>
            Website URL
            <input
              id="seo-audit-url"
              value="${escapeHtml(c.website_url || "")}"
              placeholder="https://example.com"
              inputmode="url"
            />
          </label>

          <button id="seo-run-website-audit" class="primary" type="button">
            Run real website audit →
          </button>

          <span id="seo-audit-status" class="seo-audit-status">
            Ready
          </span>
        </div>

        <div id="seo-audit-empty" class="seo-audit-empty">
          <div class="seo-audit-empty-icon">⌁</div>
          <div>
            <strong>Paste a public website and run the audit.</strong>
            <p>
              YOUYOU will check on-page SEO, crawl signals, content structure,
              images, links, robots/sitemap basics and target-topic usage.
            </p>
          </div>
        </div>

        <div id="seo-audit-results" class="seo-audit-results" hidden>
          <div class="seo-audit-overview">
            <div class="seo-audit-score-card">
              <div class="seo-audit-score-ring" id="seo-audit-score-ring">
                <strong id="seo-audit-score">—</strong>
                <span>/100</span>
              </div>
              <div>
                <small>LIVE PAGE AUDIT</small>
                <strong id="seo-audit-label">—</strong>
                <span id="seo-audit-url-result">—</span>
              </div>
            </div>

            <div class="seo-audit-kpis">
              <div><small>TITLE</small><strong id="seo-audit-title-kpi">—</strong><span id="seo-audit-title-note">—</span></div>
              <div><small>META DESCRIPTION</small><strong id="seo-audit-meta-kpi">—</strong><span id="seo-audit-meta-note">—</span></div>
              <div><small>H1</small><strong id="seo-audit-h1-kpi">—</strong><span id="seo-audit-h1-note">—</span></div>
              <div><small>IMAGES</small><strong id="seo-audit-images-kpi">—</strong><span id="seo-audit-images-note">—</span></div>
            </div>
          </div>

          <div class="seo-audit-tech-grid">
            <article>
              <small>INDEXING</small>
              <strong id="seo-audit-indexing">—</strong>
              <span id="seo-audit-indexing-note">—</span>
            </article>
            <article>
              <small>CANONICAL</small>
              <strong id="seo-audit-canonical">—</strong>
              <span id="seo-audit-canonical-note">—</span>
            </article>
            <article>
              <small>ROBOTS.TXT</small>
              <strong id="seo-audit-robots">—</strong>
              <span id="seo-audit-robots-note">—</span>
            </article>
            <article>
              <small>SITEMAP</small>
              <strong id="seo-audit-sitemap">—</strong>
              <span id="seo-audit-sitemap-note">—</span>
            </article>
            <article>
              <small>WORDS</small>
              <strong id="seo-audit-words">—</strong>
              <span>Visible page text</span>
            </article>
            <article>
              <small>LINKS</small>
              <strong id="seo-audit-links">—</strong>
              <span id="seo-audit-links-note">—</span>
            </article>
          </div>

          <div class="seo-audit-target-check dashboard-card">
            <div>
              <small>WORKSPACE ↔ WEBSITE MATCH</small>
              <h3>Does the live page clearly target your chosen service and market?</h3>
            </div>
            <div id="seo-audit-target-signals" class="seo-audit-target-signals"></div>
          </div>

          <div class="seo-audit-action-head">
            <div>
              <small>ACTION PLAN</small>
              <h3>What to fix, where to fix it, and why.</h3>
            </div>
            <span id="seo-audit-issue-count">—</span>
          </div>

          <div id="seo-audit-findings" class="seo-audit-findings"></div>

          <div class="seo-audit-footer-actions">
            <button id="seo-copy-audit-plan" class="seo-secondary-btn" type="button">
              Copy action plan
            </button>
            <button class="seo-secondary-btn" type="button" data-seo-go="onpage">
              Open On-page SEO →
            </button>
            <button class="seo-secondary-btn" type="button" data-seo-go="content">
              Open Content ideas →
            </button>
          </div>

          <p class="seo-audit-disclaimer">
            This is a live single-page audit of the URL you entered. It is not yet a full-site crawler
            and it does not claim live Google rankings or keyword search volume.
          </p>
        </div>
      </section>

      <div class="seo-keyword-lab dashboard-card">
        <div class="seo-card-head">
          <div>
            <small>KEYWORD OPPORTUNITIES</small>
            <h2>Build a search strategy around what customers type.</h2>
            <p>
              YOUYOU creates practical keyword clusters from your service, city and
              business knowledge. Live search volume and ranking difficulty will only
              appear after real search-data integrations are connected.
            </p>
          </div>

          <span class="seo-keyword-badge">KEYWORD ENGINE V1</span>
        </div>

        <div class="seo-keyword-layout">
          <div class="seo-keyword-primary seo-strategy-panel">
            <div class="seo-strategy-head">
              <div>
                <small>PRIMARY KEYWORD</small>
                <strong id="seo-primary-keyword">—</strong>
                <span id="seo-primary-intent">Commercial intent</span>
              </div>
              <span class="seo-strategy-badge">PRIMARY TARGET</span>
            </div>

            <div class="seo-strategy-grid">
              <div><small>SUGGESTED PAGE</small><strong id="seo-strategy-page">—</strong></div>
              <div><small>SEO TITLE</small><strong id="seo-strategy-title">—</strong></div>
              <div><small>H1</small><strong id="seo-strategy-h1">—</strong></div>
              <div><small>URL SLUG</small><strong id="seo-strategy-slug">—</strong></div>
              <div><small>CONTENT ANGLE</small><strong id="seo-strategy-angle">—</strong></div>
              <div><small>CTA IDEA</small><strong id="seo-strategy-cta">—</strong></div>
            </div>

            <div class="seo-use-guide">
              <small>WHERE TO USE THIS</small>
              <div>
                <span>Service page</span><span>SEO title</span><span>H1</span>
                <span>Intro copy</span><span>FAQ</span><span>Internal links</span>
              </div>
            </div>
          </div>

          <div class="seo-keyword-clusters">
            <section>
              <div class="seo-keyword-cluster-head">
                <span>SECONDARY KEYWORDS</span>
                <button id="seo-copy-secondary" class="seo-mini-btn" type="button">Copy</button>
              </div>
              <div id="seo-secondary-keywords" class="seo-keyword-chips"></div>
            </section>

            <section>
              <div class="seo-keyword-cluster-head">
                <span>LONG-TAIL QUESTIONS</span>
                <button id="seo-copy-longtail" class="seo-mini-btn" type="button">Copy</button>
              </div>
              <div id="seo-longtail-keywords" class="seo-keyword-list"></div>
            </section>
          </div>

          <section class="seo-related-themes">
            <div class="seo-related-themes-head">
              <span>RELATED THEMES</span>
              <small>Expand supporting content without repeating the same keyword.</small>
            </div>
            <div id="seo-related-themes-list" class="seo-related-theme-chips"></div>
          </section>
        </div>

        <div class="seo-keyword-note">
          <span>i</span>
          <p>
            These are strategic keyword ideas generated from your workspace—not
            claimed monthly search-volume data.
          </p>
        </div>
      </div>


      <div class="seo-onpage-grid">
        <article class="seo-onpage-card dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>ON-PAGE SEO PACK</small>
              <h2>Ready-to-use page optimization</h2>
              <p>Use one clear topic per page and keep the content genuinely useful.</p>
            </div>
          </div>

          <div class="seo-onpage-fields">
            <div>
              <small>SEO TITLE</small>
              <strong id="seo-pack-title">—</strong>
            </div>

            <div>
              <small>H1</small>
              <strong id="seo-pack-h1">—</strong>
            </div>

            <div>
              <small>URL SLUG</small>
              <strong id="seo-pack-slug">—</strong>
            </div>

            <div>
              <small>META DESCRIPTION</small>
              <p id="seo-pack-description">—</p>
            </div>
          </div>

          <button id="seo-copy-onpage" class="seo-secondary-btn seo-full-btn" type="button">
            Copy complete SEO pack
          </button>
        </article>

        <article class="seo-local-pack dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>LOCAL SEO</small>
              <h2>Local visibility plan</h2>
              <p>Turn your business location into clearer local search signals.</p>
            </div>
          </div>

          <div id="seo-local-plan" class="seo-local-plan">
            <div class="seo-loading-row">Preparing local recommendations...</div>
          </div>
        </article>
      </div>


      <div class="seo-main-grid">

        <article class="seo-opportunity-card dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>QUICK WINS</small>
              <h2>Highest-priority opportunities</h2>
              <p>Start with the improvements that are easiest to act on.</p>
            </div>

            <span class="seo-live-badge">WORKSPACE ANALYSIS</span>
          </div>

          <div id="seo-quickwins" class="seo-quickwins">
            <div class="seo-loading-row">Analyzing your workspace...</div>
          </div>
        </article>


        <article class="seo-search-preview dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>SEARCH APPEARANCE</small>
              <h2>Google snippet preview</h2>
              <p>A draft preview based on your current business information.</p>
            </div>
          </div>

          <div class="seo-google-card">
            <div class="seo-google-domain" id="seo-preview-domain">
              yourwebsite.com
            </div>

            <div class="seo-google-title" id="seo-preview-title">
              Your business | Services
            </div>

            <div class="seo-google-description" id="seo-preview-description">
              Add your business description and services to generate a stronger
              search snippet preview.
            </div>
          </div>

          <div class="seo-preview-meta seo-preview-meta-static">
            <div>
              <small>TITLE LENGTH · COUNTER</small>
              <strong id="seo-title-length">—</strong>
            </div>

            <div>
              <small>DESCRIPTION LENGTH · COUNTER</small>
              <strong id="seo-description-length">—</strong>
            </div>
          </div>

          <button id="seo-copy-snippet" class="seo-secondary-btn seo-full-btn" type="button">
            Copy title + description
          </button>
        </article>

      </div>


      <div class="seo-secondary-grid">

        <article class="seo-page-ideas-card dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>CONTENT OPPORTUNITIES</small>
              <h2>Pages worth creating</h2>
              <p>Ideas are generated from your workspace information, not search-volume estimates.</p>
            </div>
          </div>

          <div id="seo-page-ideas" class="seo-page-ideas">
            <div class="seo-loading-row">Preparing page ideas...</div>
          </div>
        </article>


        <article class="seo-brief-card dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>CONTENT BRIEF</small>
              <h2>Draft the next useful page</h2>
              <p>A practical outline you can hand to a writer or use later with AI generation.</p>
            </div>

            <span class="seo-preview-pill seo-preview-pill-static">CONTENT PLAN</span>
          </div>

          <div id="seo-content-brief" class="seo-content-brief">
            <div class="seo-loading-row">Choose a focus and analyze the workspace.</div>
          </div>

          <button id="seo-copy-brief" class="seo-secondary-btn seo-full-btn" type="button">
            Copy content brief
          </button>
        </article>

      </div>


      <div class="seo-bottom-grid">

        <article class="seo-checklist-card dashboard-card">
          <div class="seo-card-head">
            <div>
              <small>SEO FOUNDATION</small>
              <h2>Optimization checklist</h2>
              <p>Build the foundation before chasing rankings.</p>
            </div>

            <div class="seo-checklist-head-actions">
              <strong id="seo-checklist-progress" class="seo-checklist-progress">—</strong>
              <button id="seo-toggle-checklist" class="seo-mini-btn" type="button">View all</button>
            </div>
          </div>

          <div id="seo-checklist" class="seo-checklist is-compact">
            <div class="seo-loading-row">Checking setup...</div>
          </div>
        </article>


        <article class="seo-console-card seo-console-card-compact dashboard-card">
          <div class="seo-console-orbit"></div>

          <div class="seo-console-compact-top">
            <div class="seo-console-icon">G</div>
            <div>
              <small>SEARCH PERFORMANCE</small>
              <h2>Google Search Console</h2>
            </div>
          </div>

          <p>
            Connect real queries, clicks, impressions and page performance later.
          </p>

          <div class="seo-console-points">
            <span>Real queries</span>
            <span>Real clicks</span>
            <span>Real impressions</span>
          </div>

          <div class="seo-console-status-row">
            <span>Free Google tool</span>
            <strong>Connection coming later</strong>
          </div>
        </article>

      </div>


      <div class="seo-disclaimer seo-disclaimer-compact">
        <span>i</span>
        <p>
          Recommendations use your YOUYOU workspace. Live rankings and Search Console data appear only after real integrations are connected.
        </p>
      </div>

    </section>
  `;
}


else if (state.section === "rescue") {
    body = `
      <section class="rescue-workspace">
        <div class="rescue-hero dashboard-card">
          <div>
            <small>REVENUE RESCUE</small>
            <h1>Catch valuable leads before they disappear.</h1>
            <p>YOUYOU reviews your existing conversations for buying intent, contact availability and inactivity so your team knows what deserves attention first.</p>
          </div>
          <div class="rescue-hero-status rescue-status-compact"><span>●</span> SIGNAL ENGINE READY</div>
        </div>

        <div class="rescue-metric-grid">
          <div class="dashboard-card"><small>AT-RISK LEADS</small><strong id="rescue-at-risk">—</strong><span>Qualified + quiet</span></div>
          <div class="dashboard-card"><small>HOT OPPORTUNITIES</small><strong id="rescue-hot">—</strong><span>Intent score 70+</span></div>
          <div class="dashboard-card"><small>CONTACTABLE</small><strong id="rescue-contactable">—</strong><span>Email or phone captured</span></div>
          <div class="dashboard-card"><small>FOLLOW-UP MODE</small><strong><span class="rescue-mode-pill">MANUAL</span></strong><span>Automation activates with APIs</span></div>
        </div>

        <div class="rescue-control-card dashboard-card">
          <div><small>OPPORTUNITY QUEUE</small><h2>Who should you follow up with next?</h2><p>Sorted by intent and inactivity. No message is sent automatically in this version.</p></div>
          <span class="rescue-safe-badge">NO AUTO-SEND</span>
        </div>
        <div class="rescue-workflow dashboard-card">
          <small>RESCUE WORKFLOW</small>
          <div class="rescue-workflow-steps">
            <span class="is-current">Needs follow-up</span>
            <span>Follow-up sent</span>
            <span>Replied</span>
            <span>Recovered</span>
          </div>
          <p>Only “Needs follow-up” is detected automatically today. Later stages activate when messaging integrations are connected.</p>
        </div>

        <div id="rescue-list" class="rescue-list">
          <div class="conversation-loading">Analyzing lead recovery signals...</div>
        </div>
      </section>
    `;
  }

  else if (state.section === "whatsapp") {
    const whatsappNumber = String(state.company?.whatsapp_number || "").trim();
    const normalizedWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappLaunchUrl = normalizedWhatsApp
      ? `https://wa.me/${normalizedWhatsApp}?text=${encodeURIComponent("Hi! I found you through your website and would like more information.")}`
      : "";

    body = `
      <section class="whatsapp-workspace">
        <div class="whatsapp-hero dashboard-card">
          <div>
            <small>WHATSAPP AI</small>
            <h1>Carry the customer conversation beyond your website.</h1>
            <p>Prepare your WhatsApp channel now. The direct handoff link works with a saved business number; AI replies require the official WhatsApp Business API and your AI API connection.</p>
          </div>
          <span class="whatsapp-api-status whatsapp-api-status-compact">API CONNECTION PENDING</span>
        </div>

        <div class="whatsapp-channel-status dashboard-card">
          <div><small>BUSINESS NUMBER</small><strong>${whatsappNumber ? "READY" : "NEEDED"}</strong></div>
          <div><small>WHATSAPP API</small><strong>PENDING</strong></div>
          <div><small>AI REPLIES</small><strong>LOCKED</strong></div>
          <div><small>HUMAN TAKEOVER</small><strong>PLANNED</strong></div>
        </div>

        <div class="whatsapp-layout">
          <div class="dashboard-card whatsapp-setup-card">
            <div class="whatsapp-section-head"><div><small>CHANNEL SETUP</small><h2>WhatsApp readiness</h2></div><span>${whatsappNumber ? "NUMBER READY" : "NUMBER NEEDED"}</span></div>

            <div class="whatsapp-readiness-list">
              <div class="${whatsappNumber ? "is-done" : "is-pending"}"><b>${whatsappNumber ? "✓" : "1"}</b><div><strong>Business WhatsApp number</strong><small>${whatsappNumber ? escapeHtml(whatsappNumber) : "Add your WhatsApp number in Business Settings."}</small></div><span>${whatsappNumber ? "COMPLETED" : "PENDING"}</span></div>
              <div class="is-pending"><b>2</b><div><strong>Official WhatsApp Business API</strong><small>Connect during the production integrations stage.</small></div><span>PENDING</span></div>
              <div class="is-locked"><b>3</b><div><strong>YOUYOU AI engine</strong><small>Uses the same Knowledge Base and AI controls after the official channel is connected.</small></div><span>LOCKED</span></div>
              <div class="is-takeover"><b>4</b><div><strong>Human takeover</strong><small>Your team keeps control of high-value or sensitive conversations when the live channel is connected.</small></div><span>READY PLAN</span></div>
            </div>

            <div class="whatsapp-actions">
              <button id="whatsapp-settings" class="secondary" type="button">Open Business Settings</button>
              ${whatsappLaunchUrl ? `<a class="primary whatsapp-test-link" href="${escapeHtml(whatsappLaunchUrl)}" target="_blank" rel="noopener">Test handoff — opens WhatsApp ↗</a>` : ""}
            </div>
          </div>

          <div class="dashboard-card whatsapp-preview-card">
            <div class="whatsapp-preview-label"><small>WEBSITE HANDOFF PREVIEW</small><span>DEMO</span></div>
            <div class="whatsapp-mini-phone">
              <div class="whatsapp-mini-head"><span>Y</span><div><strong>YOUYOU AI</strong><small>WhatsApp</small></div></div>
              <div class="whatsapp-mini-chat">
                <p>Hi — can you help me with pricing?</p>
                <p class="mine">Absolutely. I can guide you and connect you with the team.</p>
                <p>I want to continue here on WhatsApp.</p>
              </div>
              <div class="whatsapp-mini-input"><span>Message</span><b>➤</b></div>
            </div>
            <p class="whatsapp-preview-note">This is a product preview. Automatic AI replies are not enabled until the WhatsApp Business API and AI API are connected.</p>
          </div>
        </div>
      </section>
    `;
  }

else if (state.section === "billing") {
    const selectedPlan = state.pendingPlan || "growth";
    body = `
      <section class="billing-workspace">
        <div class="billing-hero dashboard-card">
          <div>
            <small>PLANS & BILLING</small>
            <h1>Choose the plan that fits your growth.</h1>
            <p>Your workspace is currently on development access. Secure Paddle checkout will be connected in the billing integration step.</p>
          </div>
          <span class="billing-status-pill">DEVELOPMENT ACCESS</span>
        </div>

        <div class="billing-plan-grid">
          <article class="billing-plan-card ${selectedPlan === "starter" ? "is-selected" : ""}" data-billing-card="starter">
            <div class="billing-plan-label">STARTER</div>
            <div class="billing-price"><strong>$29</strong><span>/month</span></div>
            <p>AI customer support for your website.</p>
            <ul><li>✓ AI Customer Agent</li><li>✓ Website Widget</li><li>✓ Knowledge Base + file import</li><li>✓ Conversations Inbox</li><li>✓ Basic lead capture</li></ul>
            <button class="billing-select-btn" data-billing-plan="Starter" type="button">Choose Starter →</button>
          </article>

          <article class="billing-plan-card billing-plan-featured ${selectedPlan === "growth" ? "is-selected" : ""}" data-billing-card="growth">
            <div class="billing-plan-popular">MOST POPULAR</div>
            <div class="billing-plan-label">GROWTH</div>
            <div class="billing-price"><strong>$59</strong><span>/month</span></div>
            <p>AI plus smarter lead conversion.</p>
            <ul><li>✓ Everything in Starter</li><li>✓ Lead qualification</li><li>✓ Intent scoring</li><li>✓ Revenue Rescue</li><li>✓ Follow-up workflows</li></ul>
            <button class="billing-select-btn billing-select-primary" data-billing-plan="Growth" type="button">Choose Growth →</button>
          </article>

          <article class="billing-plan-card ${selectedPlan === "pro" ? "is-selected" : ""}" data-billing-card="pro">
            <div class="billing-plan-label">PRO</div>
            <div class="billing-price"><strong>$99</strong><span>/month</span></div>
            <p>AI, lead recovery and SEO growth.</p>
            <ul><li>✓ Everything in Growth</li><li>✓ SEO Growth Center</li><li>✓ SEO opportunity insights</li><li>✓ Advanced AI controls</li><li>✓ Higher usage limits</li></ul>
            <button class="billing-select-btn" data-billing-plan="Pro" type="button">Choose Pro →</button>
          </article>
        </div>

        <div id="billing-message" class="billing-message dashboard-card">
          <div><small>CHECKOUT STATUS</small><strong>Paddle checkout is the next billing integration.</strong><p>No payment is taken yet. These buttons are ready to connect to secure checkout when Paddle is enabled.</p></div>
        </div>
      </section>
    `;
}

else if (state.section === "settings") {
    const c = state.company || {};

    body = `
      <div class="settings-page pro-settings">

        <div class="settings-page-header">
          <div>
            <small>WORKSPACE SETTINGS</small>
            <h1>Business settings</h1>
            <p>
              Keep the business details YOUYOU will use across your workspace,
              customer experience and future automations.
            </p>
          </div>

          <div class="settings-health">
            <span class="settings-health-dot"></span>
            Workspace connected
          </div>
        </div>

        <section class="settings-section-card">
          <div class="settings-section-head">
            <div class="settings-section-icon">01</div>
            <div>
              <small>BUSINESS PROFILE</small>
              <h2>Your company</h2>
              <p>Core information used to identify and understand the business.</p>
            </div>
          </div>

          <div class="pro-settings-grid">
            <label>
              Company name
              <input
                id="company-name"
                value="${escapeHtml(c.name || company)}"
                placeholder="e.g. Acme Home Services"
              />
            </label>

            <label>
              Industry
              <input
                id="company-industry"
                value="${escapeHtml(c.industry || "")}"
                placeholder="e.g. HVAC, Roofing, Med Spa"
              />
            </label>

            <label>
              Website
              <input
                id="company-website"
                type="url"
                value="${escapeHtml(c.website_url || "")}"
                placeholder="https://yourcompany.com"
              />
            </label>

            <label>
              Country
              <select id="company-country">
                ${settingsOption("United States", c.country)}
                ${settingsOption("France", c.country)}
                ${settingsOption("Spain", c.country)}
                ${settingsOption("Morocco", c.country)}
                ${settingsOption("United Arab Emirates", c.country)}
                ${settingsOption("Saudi Arabia", c.country)}
                ${settingsOption("United Kingdom", c.country)}
                ${settingsOption("Canada", c.country)}
                ${settingsOption("Other", c.country)}
              </select>
            </label>

            <label class="settings-span-2">
              Short business description
              <textarea
                id="company-description"
                rows="4"
                placeholder="What does your company do, who do you serve, and what makes the business different?"
              >${escapeHtml(c.business_description || "")}</textarea>
            </label>
          </div>
        </section>

        <section class="settings-section-card">
          <div class="settings-section-head">
            <div class="settings-section-icon">02</div>
            <div>
              <small>CONTACT & LOCATION</small>
              <h2>Customer contact details</h2>
              <p>Official details YOUYOU can reference when customers need to reach the business.</p>
            </div>
          </div>

          <div class="pro-settings-grid">
            <label>
              Business email
              <input
                id="business-email"
                type="email"
                value="${escapeHtml(c.business_email || "")}"
                placeholder="hello@yourcompany.com"
              />
            </label>

            <label>
              Business phone
              <input
                id="business-phone"
                value="${escapeHtml(c.business_phone || "")}"
                placeholder="+1 555 000 0000"
              />
            </label>

            <label>
              WhatsApp number
              <input
                id="whatsapp-number"
                value="${escapeHtml(c.whatsapp_number || "")}"
                placeholder="+1 555 000 0000"
              />
            </label>

            <label>
              City / State
              <input
                id="business-city"
                value="${escapeHtml(c.city || "")}"
                placeholder="Miami, FL"
              />
            </label>

            <label class="settings-span-2">
              Business address
              <input
                id="business-address"
                value="${escapeHtml(c.business_address || "")}"
                placeholder="Street address"
              />
            </label>
          </div>
        </section>

        <section class="settings-section-card">
          <div class="settings-section-head">
            <div class="settings-section-icon">03</div>
            <div>
              <small>OPERATIONS</small>
              <h2>Availability & customer experience</h2>
              <p>Useful context for replies, handoffs and future automations.</p>
            </div>
          </div>

          <div class="pro-settings-grid">
            <label>
              Timezone
              <select id="company-timezone">
                ${settingsOption("America/New_York", c.timezone)}
                ${settingsOption("America/Chicago", c.timezone)}
                ${settingsOption("America/Denver", c.timezone)}
                ${settingsOption("America/Los_Angeles", c.timezone)}
                ${settingsOption("Europe/Paris", c.timezone)}
                ${settingsOption("Europe/Madrid", c.timezone)}
                ${settingsOption("Africa/Casablanca", c.timezone)}
                ${settingsOption("Asia/Dubai", c.timezone)}
                ${settingsOption("Asia/Riyadh", c.timezone)}
                ${settingsOption("UTC", c.timezone)}
              </select>
            </label>

            <label>
              Widget status
              <select id="widget-status">
                ${settingsOption("Enabled", c.widget_status || "Enabled")}
                ${settingsOption("Disabled", c.widget_status || "Enabled")}
              </select>
            </label>

            <label class="settings-span-2">
              Business hours
              <textarea
                id="business-hours"
                rows="4"
                placeholder="Mon–Fri: 9:00 AM–6:00 PM&#10;Sat: 10:00 AM–2:00 PM&#10;Sun: Closed"
              >${escapeHtml(c.business_hours || "")}</textarea>
            </label>

            <label class="settings-span-2">
              Widget welcome message
              <input
                id="widget-welcome"
                value="${escapeHtml(c.widget_welcome_message || "")}"
                placeholder="Hi! How can we help you today?"
              />
            </label>
          </div>
        </section>

        <section class="settings-section-card">
          <div class="settings-section-head">
            <div class="settings-section-icon">04</div>
            <div>
              <small>LEAD NOTIFICATIONS</small>
              <h2>Who should get alerted?</h2>
              <p>Prepare the workspace for email, WhatsApp and SMS alerts when integrations are connected.</p>
            </div>
          </div>

          <div class="pro-settings-grid">
            <label>
              Notification email
              <input
                id="notification-email"
                type="email"
                value="${escapeHtml(c.notification_email || "")}"
                placeholder="sales@yourcompany.com"
              />
            </label>

            <label>
              Lead alert mode
              <select id="lead-alert-mode">
                ${settingsOption("Hot leads only", c.lead_alert_mode || "Hot leads only")}
                ${settingsOption("Warm + Hot", c.lead_alert_mode || "Hot leads only")}
                ${settingsOption("All qualified leads", c.lead_alert_mode || "Hot leads only")}
                ${settingsOption("Off", c.lead_alert_mode || "Hot leads only")}
              </select>
            </label>

            <div class="integration-ready settings-span-2">
              <div>
                <strong>WhatsApp / SMS alerts</strong>
                <span>Ready for the final integrations stage.</span>
              </div>
              <span class="coming-soon-pill">COMING LATER</span>
            </div>
          </div>
        </section>

        <section class="settings-section-card account-settings-card">
          <div class="settings-section-head">
            <div class="settings-section-icon">05</div>
            <div>
              <small>ACCOUNT</small>
              <h2>Workspace & subscription</h2>
              <p>Account identity and billing status for this workspace.</p>
            </div>
          </div>

          <div class="pro-settings-grid">
            <label>
              Account email
              <input disabled value="${escapeHtml(state.user.email)}" />
            </label>

            <label>
              Workspace ID
              <input disabled value="${escapeHtml(c.id || "")}" />
            </label>

            <div class="account-plan-box settings-span-2">
              <div>
                <small>CURRENT PLAN</small>
                <strong>Development access</strong>
              </div>
              <div>
                <small>BILLING</small>
                <strong>Not connected yet</strong>
              </div>
              <span>Paddle subscription controls will be activated during the final launch stage.</span>
            </div>
          </div>
        </section>

        <div class="settings-save-bar">
          <div>
            <small>STATUS</small>
            <strong id="settings-save-status">Ready to save</strong>
          </div>

          <button id="save-settings" class="primary">
            Save business settings →
          </button>
        </div>

      </div>
    `;
  }

  else if (state.section === "conversations") {
    body = `
      <div class="dashboard-card conversations-card">

        <div class="card-header">
          <div>
            <small>INBOX</small>
            <h1>Conversations</h1>
            <p class="conversation-subtitle">Read every website conversation in one place.</p>
          </div>

          <span class="ai-status">
            ● LIVE
          </span>
        </div>

        <div class="conversation-layout">
          <div id="conversations-list" class="conversation-list">
            <div class="conversation-loading">Loading conversations...</div>
          </div>

          <div id="conversation-detail" class="conversation-detail">
            <div class="conversation-empty-detail">
              <div class="empty-icon">◌</div>
              <h2>Select a conversation</h2>
              <p>Choose a visitor from the inbox to read the full message history.</p>
            </div>
          </div>
        </div>

      </div>
    `;
  }
  else if (state.section === "leads") {
    body = `
      <div class="dashboard-card leads-card">
        <div class="card-header">
          <div>
            <small>SALES PIPELINE</small>
            <h1>Qualified Leads</h1>
            <p>Focus on visitors showing the strongest buying intent.</p>
          </div>
          <div class="leads-header-badges">
            <span class="lead-badge hot">🔥 HOT ≥ 70</span>
            <span id="lead-count" class="lead-count">— leads</span>
          </div>
        </div>

        <div class="lead-filter-bar">
          <button class="lead-filter active" data-lead-filter="all">All qualified</button>
          <button class="lead-filter" data-lead-filter="hot">🔥 Hot</button>
          <button class="lead-filter" data-lead-filter="warm">● Warm</button>
        </div>

        <div id="leads-list" class="leads-list">
          <div class="conversation-loading">Analyzing conversations...</div>
        </div>
      </div>
    `;
  }

  else {
    body = `
      <section class="dashboard-hero">

        <div>
          <small>YOUYOU GROWTH PLATFORM</small>

          <h1>
            Your growth workspace,
            <span>ready to work.</span>
          </h1>

          <p>
            Manage conversations, qualified leads, SEO opportunities,
            Revenue Rescue signals and WhatsApp readiness from one place.
          </p>
        </div>

        <button id="launch-agent" class="primary">
          Open Website Widget →
        </button>

      </section>

      <div class="dashboard-stats">

        <div>
  <small>CONVERSATIONS</small>
  <strong id="stat-conversations">—</strong>
  <span>Customer conversations</span>
</div>

<div>
  <small>LEADS</small>
  <strong id="stat-leads">—</strong>
  <span>Qualified opportunities</span>
</div>

<div>
  <small>KNOWLEDGE</small>
  <strong id="stat-knowledge">—</strong>
          <span>Sources connected</span>
        </div>

      </div>

      <div class="dashboard-grid">

        <div class="dashboard-card">

          <h2>
            Workspace status
            <em>● READY</em>
          </h2>

          <p>
            Your workspace is configured and ready for customer conversations.
            Knowledge and widget settings are connected.
          </p>

        </div>

        <div class="dashboard-card">

          <small>WORKSPACE</small>

          <h2>
            ${escapeHtml(company)}
          </h2>

          <p>
            ${escapeHtml(state.user.email)}
          </p>

        </div>


      </div>

      <div class="overview-growth-grid overview-growth-grid-motion">
        <button class="overview-growth-card overview-growth-card-seo" data-overview-nav="seo" type="button">
          <span>↗</span><div><small>SEO GROWTH <em class="overview-feature-badge badge-pro">PRO</em></small><strong>Find growth opportunities</strong></div><b>→</b>
        </button>
        <button class="overview-growth-card overview-growth-card-rescue" data-overview-nav="rescue" type="button">
          <span>↻</span><div><small>REVENUE RESCUE <em class="overview-feature-badge badge-smart">SMART</em></small><strong>Review quiet hot leads</strong></div><b>→</b>
        </button>
        <button class="overview-growth-card overview-growth-card-whatsapp" data-overview-nav="whatsapp" type="button">
          <span>◉</span><div><small>WHATSAPP AI <em class="overview-feature-badge badge-new">NEW</em></small><strong>Prepare your channel</strong></div><b>→</b>
        </button>
      </div>
    `;
  }

  dashboardShell(body);

  document.querySelector("#launch-agent")?.addEventListener(
    "click",
    () => {
      navigateDashboard("widget");
    }
  );

  document.querySelectorAll("[data-overview-nav]").forEach((button) => {
    button.addEventListener("click", () => navigateDashboard(button.dataset.overviewNav));
  });

  document.querySelector("#whatsapp-settings")?.addEventListener("click", () => navigateDashboard("settings"));

  document.querySelector("#copy-widget")?.addEventListener(
    "click",
    async () => {
      const code = getWidgetInstallCode();

      try {
        await navigator.clipboard.writeText(code);
        alert("Install code copied.");
      } catch {
        prompt("Copy this install code:", code);
      }
    }
  );


  document.querySelector("#save-widget-config")?.addEventListener(
    "click",
    saveWidgetConfiguration
  );

  document.querySelector("#widget-config-color")?.addEventListener(
    "input",
    (event) => {
      const text = document.querySelector("#widget-config-color-text");
      if (text) text.value = event.target.value;
      previewWidgetConfiguration();
    }
  );

  document.querySelector("#widget-config-color-text")?.addEventListener(
    "input",
    previewWidgetConfiguration
  );

  document.querySelector("#widget-config-welcome")?.addEventListener(
    "input",
    previewWidgetConfiguration
  );

  document.querySelector("#widget-config-enabled")?.addEventListener(
    "change",
    previewWidgetConfiguration
  );

  document.querySelector("#add-knowledge")?.addEventListener(
    "click",
    resetKnowledgeForm
  );

  document.querySelector("#save-knowledge")?.addEventListener(
    "click",
    addKnowledge
  );

  document.querySelector("#clear-knowledge")?.addEventListener(
    "click",
    resetKnowledgeForm
  );

  document.querySelector("#knowledge-content")?.addEventListener(
    "input",
    updateKnowledgeCharacterCount
  );

  document.querySelector("#knowledge-search")?.addEventListener(
    "input",
    (event) => renderKnowledgeList(event.target.value)
  );

  document.querySelectorAll("[data-knowledge-template]").forEach((button) => {
    button.addEventListener("click", () => {
      applyKnowledgeTemplate(button.dataset.knowledgeTemplate);
    });
  });


  document.querySelector("#choose-knowledge-file")?.addEventListener(
    "click",
    () => document.querySelector("#knowledge-file-input")?.click()
  );

  document.querySelector("#knowledge-file-input")?.addEventListener(
    "change",
    (event) => {
      const file = event.target.files?.[0];
      if (file) handleKnowledgeFile(file);
    }
  );

  document.querySelector("#clear-knowledge-file")?.addEventListener(
    "click",
    resetKnowledgeFileUpload
  );

  document.querySelector("#import-knowledge-file")?.addEventListener(
    "click",
    importKnowledgeFile
  );

  const knowledgeDropzone = document.querySelector("#knowledge-dropzone");

  knowledgeDropzone?.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    document.querySelector("#knowledge-file-input")?.click();
  });

  knowledgeDropzone?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.querySelector("#knowledge-file-input")?.click();
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    knowledgeDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      knowledgeDropzone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    knowledgeDropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      knowledgeDropzone.classList.remove("is-dragging");
    });
  });

  knowledgeDropzone?.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) handleKnowledgeFile(file);
  });

  document.querySelector("#save-settings")?.addEventListener(
    "click",
    saveSettings
  );

  document.querySelector("#save-ai-config")?.addEventListener(
    "click",
    saveAiConfiguration
  );

if (state.section === "knowledge") {
  loadKnowledge();
}


if (state.section === "widget") {
  loadWidgetConfiguration();
}
  if (state.section === "conversations") {
  loadConversations();
}

if (state.section === "leads") {
  loadLeads();
}

if (state.section === "overview") {
  loadOverviewStats();
}

if (state.section === "ai") {
  loadAiConfiguration();
}

if (state.section === "studio") {
  initAiStudio();
}

if (state.section === "seo") {
  initSeoProTabs();
  initSeoWebsiteAudit();
  initSeoGrowthCenter();
}

if (state.section === "rescue") {
  loadRevenueRescue();
}

if (state.section === "billing") {
  const billingGrid = document.querySelector(".billing-plan-grid");
  const billingCards = [...document.querySelectorAll("[data-billing-card]")];

  billingCards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      billingGrid?.classList.add("has-plan-hover");
      billingCards.forEach((item) => item.classList.remove("is-focus"));
      card.classList.add("is-focus");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-focus");
      if (!billingGrid?.querySelector(".billing-plan-card:hover")) billingGrid?.classList.remove("has-plan-hover");
    });
  });

  document.querySelectorAll("[data-billing-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      const plan = button.dataset.billingPlan || "Selected plan";
      const planKey = plan.toLowerCase();
      state.pendingPlan = planKey;
      billingCards.forEach((card) => card.classList.toggle("is-selected", card.dataset.billingCard === planKey));

      const message = document.querySelector("#billing-message");
      if (message) {
        message.classList.add("is-attention");
        message.innerHTML = `<div><small>${escapeHtml(plan.toUpperCase())} SELECTED</small><strong>${escapeHtml(plan)} is ready for secure Paddle checkout.</strong><p>Paddle is not connected yet, so no payment has been taken. When Paddle is connected, this button will open the real checkout.</p></div>`;
      }
    });
  });
}
}

const DEFAULT_AI_INSTRUCTIONS = `You are YOUYOU, an AI customer service agent.

Answer customers professionally, clearly and accurately.

Use the company's knowledge base whenever possible.

Never invent information. If you do not know the answer,
clearly say so and guide the customer to contact the company.

Help visitors understand products and services, answer questions,
and identify qualified leads.`;

function setAiConfigStatus(message, type = "") {
  const status = document.querySelector("#ai-config-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

function applyAiConfiguration(config = {}) {
  const agentName = document.querySelector("#agent-name");
  const tone = document.querySelector("#agent-tone");
  const language = document.querySelector("#agent-language");
  const instructions = document.querySelector("#agent-instructions");
  const leadEnabled = document.querySelector("#lead-enabled");

  if (agentName) agentName.value = config.agent_name || "YOUYOU AI";
  if (tone) tone.value = config.tone || "Professional";
  if (language) language.value = config.language || "Auto-detect";
  if (instructions) instructions.value = config.instructions || DEFAULT_AI_INSTRUCTIONS;
  if (leadEnabled) leadEnabled.checked = config.lead_capture ?? true;

  const responseStyle = config.response_style || "Balanced";
  document.querySelectorAll('input[name="response-style"]').forEach((input) => {
    input.checked = input.value === responseStyle;
  });
}

async function loadAiConfiguration() {
  if (!supabase || !state.company) return;

  setAiConfigStatus("Loading configuration...", "loading");

  const { data, error } = await supabase
    .from("ai_settings")
    .select("agent_name, tone, language, instructions, response_style, lead_capture, updated_at")
    .eq("company_id", state.company.id)
    .maybeSingle();

  if (error) {
    console.error("AI configuration load error:", error);
    setAiConfigStatus("Database setup required", "error");
    return;
  }

  if (!data) {
    applyAiConfiguration({});
    setAiConfigStatus("Default configuration ready", "ready");
    return;
  }

  applyAiConfiguration(data);
  setAiConfigStatus("Saved configuration loaded", "success");
}

async function saveAiConfiguration() {
  if (!supabase || !state.company) return;

  const button = document.querySelector("#save-ai-config");
  const agentName = document.querySelector("#agent-name")?.value.trim() || "";
  const tone = document.querySelector("#agent-tone")?.value || "Professional";
  const language = document.querySelector("#agent-language")?.value || "Auto-detect";
  const instructions = document.querySelector("#agent-instructions")?.value.trim() || "";
  const responseStyle = document.querySelector('input[name="response-style"]:checked')?.value || "Balanced";
  const leadCapture = document.querySelector("#lead-enabled")?.checked ?? true;

  if (!agentName) {
    setAiConfigStatus("Agent name is required", "error");
    document.querySelector("#agent-name")?.focus();
    return;
  }

  if (!instructions) {
    setAiConfigStatus("Agent instructions are required", "error");
    document.querySelector("#agent-instructions")?.focus();
    return;
  }

  button?.setAttribute("disabled", "disabled");
  if (button) button.textContent = "Saving...";
  setAiConfigStatus("Saving configuration...", "loading");

  const { error } = await supabase
    .from("ai_settings")
    .upsert({
      company_id: state.company.id,
      agent_name: agentName,
      tone,
      language,
      instructions,
      response_style: responseStyle,
      lead_capture: leadCapture,
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id" });

  button?.removeAttribute("disabled");

  if (error) {
    console.error("AI configuration save error:", error);
    if (button) button.textContent = "Save configuration →";
    setAiConfigStatus(error.message || "Could not save configuration", "error");
    return;
  }

  setAiConfigStatus("Saved successfully", "success");
  if (button) button.textContent = "Saved ✓";

  window.setTimeout(() => {
    if (button?.isConnected) button.textContent = "Save configuration →";
  }, 1600);
}


const DEFAULT_WIDGET_SETTINGS = {
  enabled: true,
  welcome_message: "Hi! 👋 How can I help you today?",
  accent_color: "#22c55e",
  position: "Right"
};

function validWidgetColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
}

function setWidgetConfigStatus(message, type = "") {
  const el = document.querySelector("#widget-config-status");
  if (!el) return;
  el.textContent = message;
  el.dataset.status = type;
}

function previewWidgetConfiguration() {
  const enabled =
    document.querySelector("#widget-config-enabled")?.value !== "Disabled";

  const welcome =
    document.querySelector("#widget-config-welcome")?.value.trim() ||
    DEFAULT_WIDGET_SETTINGS.welcome_message;

  const colorText =
    document.querySelector("#widget-config-color-text")?.value.trim() || "";

  const colorPicker =
    document.querySelector("#widget-config-color")?.value || "#22c55e";

  const accent =
    validWidgetColor(colorText) ? colorText : colorPicker;

  const welcomeEl = document.querySelector("#widget-preview-welcome");
  const avatar = document.querySelector("#widget-preview-avatar");
  const dot = document.querySelector("#widget-preview-dot");
  const online = document.querySelector("#widget-preview-online");
  const user = document.querySelector("#widget-preview-user");
  const send = document.querySelector("#widget-preview-send");
  const device = document.querySelector("#widget-preview-device");

  if (welcomeEl) welcomeEl.textContent = welcome;
  if (avatar) avatar.style.background = accent;
  if (dot) dot.style.color = accent;
  if (user) {
    user.style.background = accent;
    user.style.color = "#06130a";
  }
  if (send) send.style.background = accent;

  if (online) {
    online.textContent = enabled ? "● Online" : "● Disabled";
    online.classList.toggle("is-disabled", !enabled);
  }

  if (device) {
    device.classList.toggle("widget-preview-disabled-v38", !enabled);
  }
}

async function loadWidgetConfiguration() {
  if (!supabase || !state.company) return;

  setWidgetConfigStatus("Loading...", "loading");

  const { data, error } = await supabase
    .from("widget_configs")
    .select("enabled, welcome_message, accent_color, position")
    .eq("company_id", state.company.id)
    .maybeSingle();

  if (error) {
    console.error("Widget config load error:", error);
    setWidgetConfigStatus("Setup required", "error");
    return;
  }

  const config = data || {
    ...DEFAULT_WIDGET_SETTINGS,
    enabled: (state.company.widget_status || "Enabled") !== "Disabled",
    welcome_message:
      state.company.widget_welcome_message ||
      DEFAULT_WIDGET_SETTINGS.welcome_message
  };

  const enabledSelect = document.querySelector("#widget-config-enabled");
  const positionSelect = document.querySelector("#widget-config-position");
  const colorPicker = document.querySelector("#widget-config-color");
  const colorText = document.querySelector("#widget-config-color-text");
  const welcome = document.querySelector("#widget-config-welcome");

  if (enabledSelect) enabledSelect.value = config.enabled === false ? "Disabled" : "Enabled";
  if (positionSelect) positionSelect.value = config.position || "Right";

  const accent =
    validWidgetColor(config.accent_color)
      ? config.accent_color
      : DEFAULT_WIDGET_SETTINGS.accent_color;

  if (colorPicker) colorPicker.value = accent;
  if (colorText) colorText.value = accent;
  if (welcome) {
    welcome.value =
      config.welcome_message ||
      DEFAULT_WIDGET_SETTINGS.welcome_message;
  }

  previewWidgetConfiguration();
  setWidgetConfigStatus(data ? "Settings synced" : "Default settings ready", "success");
}

async function saveWidgetConfiguration() {
  if (!supabase || !state.company) return;

  const button = document.querySelector("#save-widget-config");

  const enabled =
    document.querySelector("#widget-config-enabled")?.value !== "Disabled";

  const position =
    document.querySelector("#widget-config-position")?.value || "Right";

  const welcome =
    document.querySelector("#widget-config-welcome")?.value.trim() ||
    DEFAULT_WIDGET_SETTINGS.welcome_message;

  const colorText =
    document.querySelector("#widget-config-color-text")?.value.trim() || "";

  const accent =
    validWidgetColor(colorText)
      ? colorText
      : document.querySelector("#widget-config-color")?.value;

  if (!validWidgetColor(accent)) {
    setWidgetConfigStatus("Invalid color", "error");
    return;
  }

  button?.setAttribute("disabled", "disabled");
  if (button) button.textContent = "Saving...";
  setWidgetConfigStatus("Saving...", "loading");

  const { error } = await supabase
    .from("widget_configs")
    .upsert({
      company_id: state.company.id,
      enabled,
      welcome_message: welcome,
      accent_color: accent,
      position,
      updated_at: new Date().toISOString()
    }, { onConflict: "company_id" });

  if (error) {
    console.error("Widget config save error:", error);
    button?.removeAttribute("disabled");
    if (button) button.textContent = "Save widget settings →";
    setWidgetConfigStatus(error.message, "error");
    return;
  }

  const { error: companyError } = await supabase
    .from("companies")
    .update({
      widget_status: enabled ? "Enabled" : "Disabled",
      widget_welcome_message: welcome,
      updated_at: new Date().toISOString()
    })
    .eq("id", state.company.id);

  button?.removeAttribute("disabled");
  if (button) button.textContent = "Save widget settings →";

  if (companyError) {
    console.error("Company widget mirror error:", companyError);
    setWidgetConfigStatus(companyError.message, "error");
    return;
  }

  state.company.widget_status = enabled ? "Enabled" : "Disabled";
  state.company.widget_welcome_message = welcome;

  previewWidgetConfiguration();
  setWidgetConfigStatus("Saved successfully", "success");
}

function seoCleanText(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function seoDomainFromUrl(url = "") {
  const raw = seoCleanText(url);

  if (!raw) return "yourwebsite.com";

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0] || "yourwebsite.com";
  }
}

function seoTitleCase(value = "") {
  return seoCleanText(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function seoClip(value = "", max = 155) {
  const text = seoCleanText(value);

  if (text.length <= max) return text;

  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function seoProfileSignals(company = {}, knowledge = []) {
  const checks = [
    {
      id: "website",
      label: "Website URL added",
      done: Boolean(seoCleanText(company.website_url)),
      why: "Add your website URL so SEO recommendations can reflect the real domain.",
    },
    {
      id: "description",
      label: "Business description added",
      done: seoCleanText(company.business_description).length >= 80,
      why: "A richer business description helps define services, audience and positioning.",
    },
    {
      id: "industry",
      label: "Industry or core service defined",
      done: Boolean(seoCleanText(company.industry)),
      why: "Define the industry or primary service you want customers to find.",
    },
    {
      id: "city",
      label: "Primary city added",
      done: Boolean(seoCleanText(company.city)),
      why: "Add a city to unlock stronger local SEO page ideas.",
    },
    {
      id: "address",
      label: "Business address added",
      done: Boolean(seoCleanText(company.business_address)),
      why: "A consistent physical location strengthens local-business information.",
    },
    {
      id: "contact",
      label: "Public contact information added",
      done: Boolean(
        seoCleanText(company.business_phone) ||
        seoCleanText(company.business_email)
      ),
      why: "Add a public phone or email so customers and local listings have consistent details.",
    },
    {
      id: "hours",
      label: "Business hours added",
      done: Boolean(seoCleanText(company.business_hours)),
      why: "Opening hours are useful for visitors and local-business information.",
    },
    {
      id: "knowledge",
      label: "Knowledge Base has useful depth",
      done: knowledge.length >= 4,
      why: "Add services, FAQs, pricing and policies so YOUYOU can discover more content opportunities.",
    },
  ];

  return checks;
}


function seoSlugify(value = "") {
  return seoCleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function seoUnique(values = []) {
  return [...new Set(values.map((value) => seoCleanText(value)).filter(Boolean))];
}


function seoUsefulKnowledgeTitle(value = "") {
  const title = seoCleanText(value);
  if (!title || title.length < 4 || title.length > 80) return false;
  const lowered = title.toLowerCase();
  const blocked = [
    /^file\s*:/,
    /\bknowledge[-_\s]?test\b/,
    /\bbusiness hours?\b/,
    /\bmanual entry\b/,
    /\bupload knowledge\b/,
    /\bsaved knowledge\b/,
    /\babout youyou\b/,
    /\bworkspace\b/,
    /\.(pdf|docx?|xlsx?|csv|txt)$/i,
  ];
  return !blocked.some((pattern) => pattern.test(lowered));
}

function seoUsefulBusinessDescription(value = "") {
  const text = seoCleanText(value);
  if (text.length < 35) return "";
  const lowered = text.toLowerCase();
  if (["services", "service", "business", "company"].includes(lowered)) return "";
  return text;
}

function buildSeoKeywordEngine(company = {}, knowledge = [], focus = {}) {
  const companyName = seoCleanText(company.name) || "Your Business";
  const service = seoCleanText(focus.service) || seoCleanText(company.industry) || "professional services";
  const city = seoCleanText(focus.city) || seoCleanText(company.city);
  const serviceLower = service.toLowerCase();
  const cityLower = city.toLowerCase();

  const primary = city
    ? `${serviceLower} in ${cityLower}`
    : serviceLower;

  const secondary = seoUnique([
    city ? `best ${serviceLower} in ${cityLower}` : `best ${serviceLower}`,
    city ? `${serviceLower} ${cityLower}` : `${serviceLower} services`,
    city ? `${serviceLower} near ${cityLower}` : `${serviceLower} near me`,
    city ? `local ${serviceLower} ${cityLower}` : `local ${serviceLower}`,
    city ? `${serviceLower} services in ${cityLower}` : `${serviceLower} services`,
    city ? `${companyName.toLowerCase()} ${cityLower}` : companyName.toLowerCase(),
  ]).slice(0, 6);

  const knowledgeTopics = knowledge
    .map((item) => seoCleanText(item.title))
    .filter(seoUsefulKnowledgeTitle)
    .slice(0, 4);

  const longTail = seoUnique([
    city ? `how much does ${serviceLower} cost in ${cityLower}` : `how much does ${serviceLower} cost`,
    city ? `how to choose ${serviceLower} in ${cityLower}` : `how to choose ${serviceLower}`,
    city ? `what is included in ${serviceLower} in ${cityLower}` : `what is included in ${serviceLower}`,
    city ? `where to find ${serviceLower} in ${cityLower}` : `where to find ${serviceLower}`,
    ...knowledgeTopics.map((topic) => `${topic} ${city ? `in ${cityLower}` : ""}`.trim()),
  ]).slice(0, 8);

  const h1 = city
    ? `${seoTitleCase(service)} in ${seoTitleCase(city)}`
    : `${seoTitleCase(service)} Services`;

  const title = seoClip(
    city
      ? `${seoTitleCase(service)} in ${seoTitleCase(city)} | ${companyName}`
      : `${seoTitleCase(service)} | ${companyName}`,
    60
  );

  const slug = seoSlugify(
    city ? `${service} ${city}` : service
  );

  const description = seoClip(
    city
      ? `${companyName} offers ${serviceLower} in ${city}. Explore services, pricing, customer questions and clear ways to book or get in touch.`
      : `${companyName} offers ${serviceLower}. Explore services, pricing, customer questions and clear ways to book or get in touch.`,
    155
  );

  const localPlan = [
    {
      title: "Use one clear local service page",
      text: city
        ? `Create a useful page focused on “${serviceLower} in ${city}” with real service details, trust signals and a clear CTA.`
        : "Add a target city first, then build one useful service + city page.",
    },
    {
      title: "Keep business details consistent",
      text: "Use the same business name, address, phone, opening hours and website wherever your business is listed.",
    },
    {
      title: "Add local proof",
      text: city
        ? `Include real customer proof, service-area details and examples that are genuinely relevant to ${city}.`
        : "Add real customer proof and service-area details relevant to your market.",
    },
    {
      title: "Prepare structured business data",
      text: "Use valid LocalBusiness or Organization structured data where it accurately matches the business and page content.",
    },
  ];

  return {
    primary,
    secondary,
    longTail,
    title,
    h1,
    slug,
    description,
    localPlan,
  };
}

function buildSeoWorkspaceAnalysis(company = {}, knowledge = [], focus = {}) {
  const checks = seoProfileSignals(company, knowledge);
  const completed = checks.filter((item) => item.done).length;
  const score = Math.round((completed / checks.length) * 100);

  const companyName = seoCleanText(company.name) || "Your Business";
  const service =
    seoCleanText(focus.service) ||
    seoCleanText(company.industry) ||
    "Professional Services";

  const city =
    seoCleanText(focus.city) ||
    seoCleanText(company.city);

  const country =
    seoCleanText(company.country);

  const location = [city, country].filter(Boolean).join(", ");

  const domain = seoDomainFromUrl(company.website_url);

  const titleBase = city
    ? `${seoTitleCase(service)} in ${seoTitleCase(city)} | ${companyName}`
    : `${seoTitleCase(service)} | ${companyName}`;

  const title = seoClip(titleBase, 60);

  const businessDescription = seoUsefulBusinessDescription(company.business_description);

  const descriptionSeed = businessDescription
    ? `${businessDescription}${city ? ` Serving customers in ${city}.` : ""}`
    : `${companyName} provides ${service.toLowerCase()}${city ? ` in ${city}` : ""}. Explore what is included, pricing factors, common questions and the next step to get started.`;

  const description = seoClip(descriptionSeed, 155);

  const quickWins = checks
    .filter((item) => !item.done)
    .slice(0, 5)
    .map((item, index) => ({
      priority: index < 2 ? "HIGH" : index < 4 ? "MEDIUM" : "FOUNDATION",
      title: item.label,
      text: item.why,
    }));

  const targetTopic = city
    ? `${service.toLowerCase()} in ${city.toLowerCase()}`
    : service.toLowerCase();

  const dynamicQuickWins = [
    {
      priority: "KEYWORD",
      title: `Target "${targetTopic}" on one focused page`,
      text: `Use this topic naturally in the SEO title, H1, intro copy and one clear CTA. Avoid repeating it unnaturally.`,
    },
    {
      priority: "CONTENT",
      title: city
        ? `Create a dedicated ${service} page for ${city}`
        : `Create a dedicated ${service} service page`,
      text: city
        ? `Explain the service, who it is for in ${city}, what it includes, pricing factors, FAQs and how to book.`
        : `Explain the service, who it is for, what it includes, pricing factors, FAQs and how to book.`,
    },
    {
      priority: "FAQ",
      title: `Answer buying questions about ${service}`,
      text: `Turn real customer questions into useful FAQ content around cost, process, timing, what is included and who the service is for.`,
    },
    {
      priority: "LOCAL",
      title: city
        ? `Strengthen local signals for ${city}`
        : "Add a target city for local SEO",
      text: city
        ? `Keep your business name, phone, address, hours and service area consistent, then add genuine local proof relevant to ${city}.`
        : "Add your primary city in Business Settings to unlock stronger local page and search recommendations.",
    },
    {
      priority: "LINKS",
      title: "Connect service, FAQ and local pages",
      text: `Add descriptive internal links so customers and search engines can move between related service, FAQ and location content.`,
    },
  ];

  const existingTitles = new Set(quickWins.map((item) => item.title));

  dynamicQuickWins.forEach((item) => {
    if (!existingTitles.has(item.title)) quickWins.push(item);
  });

  quickWins.splice(6);

  const knowledgeTitles = knowledge
    .map((item) => seoCleanText(item.title))
    .filter(seoUsefulKnowledgeTitle)
    .slice(0, 5);

  const pageIdeas = [
    {
      type: "SERVICE PAGE",
      title: city
        ? `${seoTitleCase(service)} in ${seoTitleCase(city)}`
        : `${seoTitleCase(service)} Services`,
      reason: "A focused commercial page that clearly explains the offer and who it is for.",
    },
    {
      type: "LOCAL PAGE",
      title: city
        ? `${companyName} — ${seoTitleCase(city)}`
        : `${companyName} — Local Service Area`,
      reason: city
        ? `Make your ${city} service area, contact details and local proof easy to understand.`
        : "Add your primary city first, then create a useful local service page.",
    },
    {
      type: "FAQ PAGE",
      title: `Questions customers ask about ${seoTitleCase(service)}`,
      reason: "Use real pre-sale questions to create genuinely helpful search content.",
    },
    {
      type: "TRUST PAGE",
      title: `Why choose ${companyName}`,
      reason: "Explain process, differentiators, guarantees, proof and what customers should expect.",
    },
  ];

  if (knowledgeTitles.length) {
    pageIdeas.push({
      type: "KNOWLEDGE IDEA",
      title: knowledgeTitles[0],
      reason: "This topic already exists in your Knowledge Base and may be worth turning into a customer-facing page.",
    });
  }

  const brief = {
    title: city
      ? `${seoTitleCase(service)} in ${seoTitleCase(city)}`
      : `${seoTitleCase(service)} Services`,
    intent: "Help a potential customer understand the service, trust the business and take the next step.",
    sections: [
      `What ${seoTitleCase(service)} includes`,
      city ? `Who we help in ${seoTitleCase(city)}` : "Who this service is for",
      "How the process works",
      "Pricing or what affects the cost",
      "Frequently asked questions",
      "Clear next step / contact CTA",
    ],
  };

  const keywordEngine = buildSeoKeywordEngine(company, knowledge, focus);

  let scoreLabel = "Needs foundation";
  if (score >= 85) scoreLabel = "Strong foundation";
  else if (score >= 65) scoreLabel = "Good foundation";
  else if (score >= 45) scoreLabel = "Building momentum";

  return {
    score,
    scoreLabel,
    checks,
    completed,
    companyName,
    service,
    city,
    location,
    domain,
    title,
    description,
    quickWins,
    pageIdeas,
    brief,
    keywordEngine,
    knowledgeCount: knowledge.length,
  };
}

function renderSeoAnalysis(analysis) {
  const scoreEl = document.querySelector("#seo-score");
  const ring = document.querySelector("#seo-score-ring");
  const label = document.querySelector("#seo-score-label");
  const subtext = document.querySelector("#seo-score-subtext");

  if (scoreEl) scoreEl.textContent = analysis.score;
  if (label) label.textContent = analysis.scoreLabel;
  if (subtext) {
    subtext.textContent =
      `${analysis.completed}/${analysis.checks.length} foundation signals are ready.`;
  }

  if (ring) {
    ring.style.setProperty("--seo-score", `${analysis.score * 3.6}deg`);
  }


  const seoSummaryReadiness = document.querySelector("#seo-summary-readiness");
  const seoSummaryKeywords = document.querySelector("#seo-summary-keywords");
  const seoSummaryPages = document.querySelector("#seo-summary-pages");
  const seoSummaryWins = document.querySelector("#seo-summary-wins");
  const seoSummaryGaps = document.querySelector("#seo-summary-gaps");

  const keywordIdeaCount =
    analysis.keywordEngine.secondary.length +
    analysis.keywordEngine.longTail.length +
    1;

  const setupGapCount = analysis.checks.filter((item) => !item.done).length;

  if (seoSummaryReadiness) seoSummaryReadiness.textContent = `${analysis.score}/100 readiness`;
  if (seoSummaryKeywords) seoSummaryKeywords.textContent = keywordIdeaCount;
  if (seoSummaryPages) seoSummaryPages.textContent = analysis.pageIdeas.length;
  if (seoSummaryWins) seoSummaryWins.textContent = analysis.quickWins.length;
  if (seoSummaryGaps) seoSummaryGaps.textContent = setupGapCount;

  const profileDone = analysis.checks
    .filter((item) => item.id !== "knowledge")
    .filter((item) => item.done).length;

  const profileTotal = analysis.checks.filter((item) => item.id !== "knowledge").length;

  const profileScore = document.querySelector("#seo-profile-score");
  const profileNote = document.querySelector("#seo-profile-note");

  if (profileScore) profileScore.textContent = `${profileDone}/${profileTotal}`;
  if (profileNote) {
    profileNote.textContent =
      profileDone === profileTotal
        ? "Core business details are complete."
        : `${profileTotal - profileDone} profile signal${profileTotal - profileDone === 1 ? "" : "s"} still missing.`;
  }

  const knowledgeCount = document.querySelector("#seo-knowledge-count");
  const knowledgeNote = document.querySelector("#seo-knowledge-note");

  if (knowledgeCount) knowledgeCount.textContent = analysis.knowledgeCount;
  if (knowledgeNote) {
    knowledgeNote.textContent =
      analysis.knowledgeCount >= 4
        ? "Enough material for richer content ideas."
        : "Add more services, FAQs, pricing or policies.";
  }

  const cityReady = analysis.checks.find((item) => item.id === "city")?.done;
  const addressReady = analysis.checks.find((item) => item.id === "address")?.done;

  const localStatus = document.querySelector("#seo-local-status");
  const localNote = document.querySelector("#seo-local-note");

  if (localStatus) {
    localStatus.textContent =
      cityReady && addressReady ? "READY" : cityReady ? "PARTIAL" : "SETUP";
  }

  if (localNote) {
    localNote.textContent =
      cityReady && addressReady
        ? "City and address signals are available."
        : cityReady
          ? "Add a business address for a stronger local foundation."
          : "Add your primary city to unlock local ideas.";
  }

  const quickWinCount = document.querySelector("#seo-quickwin-count");
  if (quickWinCount) quickWinCount.textContent = analysis.quickWins.length;


  const keywordEngine = analysis.keywordEngine;

  const primaryKeyword = document.querySelector("#seo-primary-keyword");
  const primaryIntent = document.querySelector("#seo-primary-intent");
  const secondaryKeywords = document.querySelector("#seo-secondary-keywords");
  const longtailKeywords = document.querySelector("#seo-longtail-keywords");

  if (primaryKeyword) primaryKeyword.textContent = keywordEngine.primary;
  if (primaryIntent) primaryIntent.textContent = "Commercial / local intent";

  const strategyPage = document.querySelector("#seo-strategy-page");
  const strategyTitle = document.querySelector("#seo-strategy-title");
  const strategyH1 = document.querySelector("#seo-strategy-h1");
  const strategySlug = document.querySelector("#seo-strategy-slug");
  const strategyAngle = document.querySelector("#seo-strategy-angle");
  const strategyCta = document.querySelector("#seo-strategy-cta");
  const relatedThemes = document.querySelector("#seo-related-themes-list");

  if (strategyPage) strategyPage.textContent = analysis.brief.title || "Focused service page";
  if (strategyTitle) strategyTitle.textContent = keywordEngine.title || "—";
  if (strategyH1) strategyH1.textContent = keywordEngine.h1 || "—";
  if (strategySlug) strategySlug.textContent = `/${keywordEngine.slug || ""}`;
  if (strategyAngle) {
    strategyAngle.textContent = `Explain ${analysis.service} clearly${analysis.city ? ` for customers in ${analysis.city}` : ""}, including benefits, trust signals and buying questions.`;
  }
  if (strategyCta) {
    strategyCta.textContent = `Talk to us about ${analysis.service}${analysis.city ? ` in ${analysis.city}` : ""}`;
  }

  if (relatedThemes) {
    const themes = [
      `${analysis.service} pricing`,
      `${analysis.service} benefits`,
      `how ${analysis.service} works`,
      `${analysis.service} FAQ`,
      `${analysis.service} for businesses`,
      analysis.city ? `${analysis.service} near ${analysis.city}` : "",
    ].filter(Boolean);

    relatedThemes.innerHTML = [...new Set(themes)]
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
  }

  if (secondaryKeywords) {
    secondaryKeywords.innerHTML = keywordEngine.secondary
      .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
      .join("");
  }

  if (longtailKeywords) {
    longtailKeywords.innerHTML = keywordEngine.longTail
      .map(
        (keyword, index) => `
          <div class="seo-keyword-row">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(keyword)}</strong>
          </div>
        `
      )
      .join("");
  }

  const packTitle = document.querySelector("#seo-pack-title");
  const packH1 = document.querySelector("#seo-pack-h1");
  const packSlug = document.querySelector("#seo-pack-slug");
  const packDescription = document.querySelector("#seo-pack-description");

  if (packTitle) packTitle.textContent = keywordEngine.title;
  if (packH1) packH1.textContent = keywordEngine.h1;
  if (packSlug) packSlug.textContent = `/${keywordEngine.slug}`;
  if (packDescription) packDescription.textContent = keywordEngine.description;

  const localPlan = document.querySelector("#seo-local-plan");
  if (localPlan) {
    localPlan.innerHTML = keywordEngine.localPlan
      .map(
        (item, index) => `
          <div class="seo-local-plan-item">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.text)}</p>
            </div>
          </div>
        `
      )
      .join("");
  }

  const quickWins = document.querySelector("#seo-quickwins");
  if (quickWins) {
    quickWins.innerHTML = analysis.quickWins
      .map(
        (item, index) => `
          <div class="seo-quickwin-item seo-action-plan-item">
            <div class="seo-quickwin-number">${String(index + 1).padStart(2, "0")}</div>
            <div class="seo-quickwin-copy">
              <div class="seo-quickwin-title-row">
                <strong>${escapeHtml(item.title)}</strong>
                <span class="seo-priority seo-priority-${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span>
              </div>
              <div class="seo-action-grid">
                <div><small>PROBLEM</small><p>${escapeHtml(item.title)}</p></div>
                <div><small>WHERE</small><p>${escapeHtml(
                  item.priority === "LOCAL" ? "Location / local business signals" :
                  item.priority === "FAQ" ? "FAQ / customer questions" :
                  item.priority === "LINKS" ? "Internal links between related pages" :
                  item.priority === "KEYWORD" ? "Target service page" :
                  item.priority === "CONTENT" ? "Service / landing page" :
                  "Business profile or website foundation"
                )}</p></div>
                <div class="seo-action-wide"><small>FIX / SUGGESTED ACTION</small><p>${escapeHtml(item.text)}</p></div>
                <div class="seo-action-wide seo-action-why"><small>WHY IT MATTERS</small><p>${escapeHtml(
                  item.priority === "LOCAL" ? "Clear local signals help customers and search engines understand where the business operates." :
                  item.priority === "LINKS" ? "Useful internal links make related pages easier to discover and understand." :
                  item.priority === "FAQ" ? "Helpful answers can match real pre-sale questions and reduce customer uncertainty." :
                  "A clearer page topic makes the page easier for visitors and search engines to understand."
                )}</p></div>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  }

  const previewDomain = document.querySelector("#seo-preview-domain");
  const previewTitle = document.querySelector("#seo-preview-title");
  const previewDescription = document.querySelector("#seo-preview-description");
  const titleLength = document.querySelector("#seo-title-length");
  const descriptionLength = document.querySelector("#seo-description-length");

  if (previewDomain) previewDomain.textContent = analysis.domain;
  if (previewTitle) previewTitle.textContent = analysis.title;
  if (previewDescription) previewDescription.textContent = analysis.description;
  if (titleLength) titleLength.textContent = `${analysis.title.length}/60`;
  if (descriptionLength) descriptionLength.textContent = `${analysis.description.length}/155`;

  const pageIdeas = document.querySelector("#seo-page-ideas");
  if (pageIdeas) {
    pageIdeas.innerHTML = analysis.pageIdeas
      .slice(0, 5)
      .map(
        (idea) => `
          <div class="seo-page-idea">
            <div>
              <span>${escapeHtml(idea.type)}</span>
              <strong>${escapeHtml(idea.title)}</strong>
              <p>${escapeHtml(idea.reason)}</p>
            </div>
            <div class="seo-page-arrow" aria-hidden="true">IDEA</div>
          </div>
        `
      )
      .join("");
  }

  const brief = document.querySelector("#seo-content-brief");
  if (brief) {
    brief.innerHTML = `
      <div class="seo-brief-title">
        <span>SUGGESTED PAGE</span>
        <strong>${escapeHtml(analysis.brief.title)}</strong>
      </div>

      <div class="seo-brief-intent">
        <small>SEARCH / CUSTOMER INTENT</small>
        <p>${escapeHtml(analysis.brief.intent)}</p>
      </div>

      <div class="seo-brief-sections">
        ${analysis.brief.sections
          .map(
            (section, index) => `
              <div>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p>${escapeHtml(section)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  const checklist = document.querySelector("#seo-checklist");
  const checklistProgress = document.querySelector("#seo-checklist-progress");

  if (checklistProgress) {
    checklistProgress.textContent = `${analysis.completed}/${analysis.checks.length}`;
  }

  if (checklist) {
    checklist.innerHTML = analysis.checks
      .map(
        (item) => `
          <div class="seo-check-row ${item.done ? "is-done" : ""}">
            <span class="seo-check-icon">${item.done ? "✓" : "○"}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.done ? "Ready in your workspace." : item.why)}</small>
            </div>
          </div>
        `
      )
      .join("");
  }

  const status = document.querySelector("#seo-analysis-status");
  if (status) {
    const totalKeywordIdeas =
      analysis.keywordEngine.secondary.length +
      analysis.keywordEngine.longTail.length +
      1;

    const missingFoundation = analysis.checks.filter((item) => !item.done).length;

    status.textContent =
      `${totalKeywordIdeas} keyword ideas · ` +
      `${analysis.pageIdeas.length} page ideas · ` +
      `${analysis.quickWins.length} quick wins · ` +
      `${analysis.knowledgeCount} knowledge entr${analysis.knowledgeCount === 1 ? "y" : "ies"} · ` +
      `${missingFoundation} setup gap${missingFoundation === 1 ? "" : "s"}`;
    status.classList.add("is-ready");
  }
}

async function analyzeSeoWorkspace() {
  if (!state.company || !supabase) return;

  const status = document.querySelector("#seo-analysis-status");
  const refresh = document.querySelector("#seo-refresh");

  if (status) {
    status.textContent = "Analyzing workspace...";
    status.classList.remove("is-ready");
  }

  if (refresh) {
    refresh.disabled = true;
    refresh.textContent = "Analyzing...";
  }

  const { data, error } = await supabase
    .from("knowledge")
    .select("id,title,content,created_at")
    .eq("company_id", state.company.id)
    .order("created_at", { ascending: false });

  if (refresh) {
    refresh.disabled = false;
    refresh.textContent = "Analyze workspace →";
  }

  if (error) {
    console.error("SEO knowledge load error:", error);
    if (status) status.textContent = "Could not load Knowledge Base";
    return;
  }

  const focus = {
    service: document.querySelector("#seo-target-service")?.value || "",
    city: document.querySelector("#seo-target-city")?.value || "",
  };

  const analysis = buildSeoWorkspaceAnalysis(
    state.company,
    data || [],
    focus
  );

  window.__youyouSeoAnalysis = analysis;
  renderSeoAnalysis(analysis);
}

function seoCopyText(text, successMessage) {
  if (!text) return;

  navigator.clipboard
    ?.writeText(text)
    .then(() => {
      const status = document.querySelector("#seo-analysis-status");
      if (status) {
        status.textContent = successMessage;
        status.classList.add("is-ready");
      }
    })
    .catch(() => {});
}


function seoAuditSeverityMeta(severity = "medium") {
  const key = String(severity || "medium").toLowerCase();
  if (key === "high") return { label: "HIGH", cls: "is-high" };
  if (key === "low") return { label: "LOW", cls: "is-low" };
  return { label: "MEDIUM", cls: "is-medium" };
}

function seoAuditSetText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value ?? "—";
}

function seoAuditRender(result) {
  const empty = document.querySelector("#seo-audit-empty");
  const results = document.querySelector("#seo-audit-results");

  if (empty) empty.hidden = true;
  if (results) results.hidden = false;

  seoAuditSetText("#seo-audit-score", result.score);
  seoAuditSetText("#seo-audit-label", result.scoreLabel);
  seoAuditSetText("#seo-audit-url-result", result.finalUrl || result.url || "—");

  const ring = document.querySelector("#seo-audit-score-ring");
  if (ring) ring.style.setProperty("--audit-score", `${Math.max(0, Math.min(100, result.score || 0)) * 3.6}deg`);

  const page = result.page || {};
  const tech = result.technical || {};
  const links = result.links || {};
  const target = result.target || {};

  seoAuditSetText("#seo-audit-title-kpi", page.title ? `${page.titleLength}/60` : "MISSING");
  seoAuditSetText("#seo-audit-title-note", page.title || "No <title> found");

  seoAuditSetText("#seo-audit-meta-kpi", page.metaDescription ? `${page.metaDescriptionLength}/155` : "MISSING");
  seoAuditSetText("#seo-audit-meta-note", page.metaDescription || "No meta description found");

  seoAuditSetText("#seo-audit-h1-kpi", `${page.h1Count ?? 0}`);
  seoAuditSetText("#seo-audit-h1-note", page.h1 || "No H1 found");

  const missingAlt = page.imagesMissingAlt ?? 0;
  seoAuditSetText("#seo-audit-images-kpi", `${missingAlt}/${page.imagesCount ?? 0}`);
  seoAuditSetText("#seo-audit-images-note", missingAlt ? "images missing alt text" : "missing alt text");

  seoAuditSetText("#seo-audit-indexing", tech.noindex ? "NOINDEX" : "INDEXABLE");
  seoAuditSetText("#seo-audit-indexing-note", tech.metaRobots || "No noindex directive detected");

  seoAuditSetText("#seo-audit-canonical", tech.canonical ? "FOUND" : "MISSING");
  seoAuditSetText("#seo-audit-canonical-note", tech.canonical || "Add a canonical URL where appropriate");

  seoAuditSetText("#seo-audit-robots", tech.robotsFound ? "FOUND" : "NOT FOUND");
  seoAuditSetText("#seo-audit-robots-note", tech.robotsStatus ? `HTTP ${tech.robotsStatus}` : "Could not confirm robots.txt");

  seoAuditSetText("#seo-audit-sitemap", tech.sitemapFound ? "FOUND" : "NOT FOUND");
  seoAuditSetText("#seo-audit-sitemap-note", tech.sitemapStatus ? `HTTP ${tech.sitemapStatus}` : "Could not confirm /sitemap.xml");

  seoAuditSetText("#seo-audit-words", page.wordCount ?? 0);
  seoAuditSetText("#seo-audit-links", `${links.internal ?? 0} / ${links.external ?? 0}`);
  seoAuditSetText("#seo-audit-links-note", "internal / external");

  const targetSignals = document.querySelector("#seo-audit-target-signals");
  if (targetSignals) {
    const rows = [
      ["Service in title", target.serviceInTitle],
      ["Service in H1", target.serviceInH1],
      ["City in title", target.city ? target.cityInTitle : null],
      ["City in H1", target.city ? target.cityInH1 : null],
      ["Service in page text", target.serviceInBody],
      ["City in page text", target.city ? target.cityInBody : null],
    ].filter(([, value]) => value !== null && value !== undefined);

    targetSignals.innerHTML = rows.map(([label, ok]) => `
      <div class="${ok ? "is-good" : "is-missing"}">
        <span>${ok ? "✓" : "!"}</span>
        <strong>${escapeHtml(label)}</strong>
        <small>${ok ? "Detected" : "Needs attention"}</small>
      </div>
    `).join("");
  }

  const findings = document.querySelector("#seo-audit-findings");
  const list = Array.isArray(result.findings) ? result.findings : [];

  seoAuditSetText(
    "#seo-audit-issue-count",
    `${list.length} action${list.length === 1 ? "" : "s"}`
  );

  if (findings) {
    findings.innerHTML = list.length
      ? list.map((item, index) => {
          const meta = seoAuditSeverityMeta(item.severity);
          return `
            <article class="seo-audit-finding ${meta.cls}">
              <div class="seo-audit-finding-number">${String(index + 1).padStart(2, "0")}</div>
              <div class="seo-audit-finding-body">
                <div class="seo-audit-finding-title">
                  <div>
                    <small>${escapeHtml(item.category || "SEO")}</small>
                    <h4>${escapeHtml(item.problem || "SEO improvement")}</h4>
                  </div>
                  <span>${meta.label}</span>
                </div>

                <div class="seo-audit-finding-grid">
                  <div><small>WHERE</small><p>${escapeHtml(item.where || "Live page")}</p></div>
                  <div><small>FIX</small><p>${escapeHtml(item.fix || "Review this item.")}</p></div>
                  ${item.suggested ? `<div class="is-wide"><small>SUGGESTED TEXT / ACTION</small><p>${escapeHtml(item.suggested)}</p></div>` : ""}
                  <div class="is-wide seo-audit-why"><small>WHY IT MATTERS</small><p>${escapeHtml(item.why || "Helps make the page clearer for visitors and search engines.")}</p></div>
                </div>
              </div>
            </article>
          `;
        }).join("")
      : `<div class="seo-audit-clean">No major issues were detected by this lightweight live-page audit.</div>`;
  }

  window.__youyouWebsiteAudit = result;
}

async function runSeoWebsiteAudit() {
  const input = document.querySelector("#seo-audit-url");
  const button = document.querySelector("#seo-run-website-audit");
  const status = document.querySelector("#seo-audit-status");

  const rawUrl = input?.value.trim() || state.company?.website_url || "";
  if (!rawUrl) {
    if (status) {
      status.textContent = "Add a website URL first";
      status.className = "seo-audit-status is-error";
    }
    input?.focus();
    return;
  }

  const service = document.querySelector("#seo-target-service")?.value.trim() || state.company?.industry || "";
  const city = document.querySelector("#seo-target-city")?.value.trim() || state.company?.city || "";

  if (button) {
    button.disabled = true;
    button.textContent = "Auditing live page...";
  }
  if (status) {
    status.textContent = "Fetching the live website securely...";
    status.className = "seo-audit-status is-loading";
  }

  try {
    const response = await fetch("/api/seo-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: rawUrl,
        service,
        city,
        companyName: state.company?.name || "",
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Website audit failed.");
    }

    seoAuditRender(payload);

    if (status) {
      status.textContent = `Live audit complete · ${payload.findings?.length || 0} actions found`;
      status.className = "seo-audit-status is-success";
    }
  } catch (error) {
    console.error("SEO website audit error:", error);
    if (status) {
      status.textContent = error?.message || "Could not audit this website.";
      status.className = "seo-audit-status is-error";
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Run real website audit →";
    }
  }
}

function initSeoWebsiteAudit() {
  const runButton = document.querySelector("#seo-run-website-audit");
  const focusUrl = document.querySelector("#seo-focus-url");
  const auditUrl = document.querySelector("#seo-audit-url");
  const focusAuditButton = document.querySelector("#seo-run-focus-audit");

  const syncFocusToAudit = () => {
    if (focusUrl && auditUrl && focusUrl.value.trim()) {
      auditUrl.value = focusUrl.value.trim();
    }
  };

  focusUrl?.addEventListener("input", syncFocusToAudit);

  focusAuditButton?.addEventListener("click", () => {
    syncFocusToAudit();

    const auditTab = document.querySelector('[data-seo-tab="audit"]');
    auditTab?.click();

    window.requestAnimationFrame(() => {
      document.querySelector(".seo-website-audit")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      runSeoWebsiteAudit();
    });
  });

  runButton?.addEventListener("click", runSeoWebsiteAudit);

  auditUrl?.addEventListener("input", () => {
    if (focusUrl && auditUrl.value.trim()) focusUrl.value = auditUrl.value.trim();
  });

  document.querySelector("#seo-audit-url")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSeoWebsiteAudit();
    }
  });

  document.querySelector("#seo-copy-audit-plan")?.addEventListener("click", () => {
    const result = window.__youyouWebsiteAudit;
    if (!result) return;

    const lines = [
      `YOUYOU Website Audit — ${result.finalUrl || result.url || ""}`,
      `Score: ${result.score}/100 — ${result.scoreLabel}`,
      "",
      ...(result.findings || []).flatMap((item, index) => [
        `${index + 1}. ${item.problem}`,
        `Where: ${item.where}`,
        `Fix: ${item.fix}`,
        item.suggested ? `Suggested: ${item.suggested}` : "",
        `Why: ${item.why}`,
        "",
      ]).filter(Boolean),
    ];

    seoCopyText(lines.join("\n"), "Website audit action plan copied");
  });
}

function initSeoGrowthCenter() {
  document.querySelector("#seo-refresh")?.addEventListener(
    "click",
    analyzeSeoWorkspace
  );

  document.querySelector("#seo-update-focus")?.addEventListener(
    "click",
    analyzeSeoWorkspace
  );

  document.querySelector("#seo-copy-snippet")?.addEventListener("click", () => {
    const analysis = window.__youyouSeoAnalysis;
    if (!analysis) return;

    seoCopyText(
      `${analysis.title}\n${analysis.description}`,
      "Search snippet copied"
    );
  });

  document.querySelector("#seo-copy-brief")?.addEventListener("click", () => {
    const analysis = window.__youyouSeoAnalysis;
    if (!analysis) return;

    const briefText = [
      `Suggested page: ${analysis.brief.title}`,
      "",
      `Intent: ${analysis.brief.intent}`,
      "",
      "Recommended sections:",
      ...analysis.brief.sections.map(
        (section, index) => `${index + 1}. ${section}`
      ),
    ].join("\n");

    seoCopyText(briefText, "Content brief copied");
  });


  document.querySelector("#seo-copy-secondary")?.addEventListener("click", () => {
    const analysis = window.__youyouSeoAnalysis;
    if (!analysis) return;

    seoCopyText(
      analysis.keywordEngine.secondary.join("\n"),
      "Secondary keywords copied"
    );
  });

  document.querySelector("#seo-copy-longtail")?.addEventListener("click", () => {
    const analysis = window.__youyouSeoAnalysis;
    if (!analysis) return;

    seoCopyText(
      analysis.keywordEngine.longTail.join("\n"),
      "Long-tail keyword ideas copied"
    );
  });

  document.querySelector("#seo-copy-onpage")?.addEventListener("click", () => {
    const analysis = window.__youyouSeoAnalysis;
    if (!analysis) return;

    const pack = analysis.keywordEngine;

    seoCopyText(
      [
        `Primary keyword: ${pack.primary}`,
        `SEO title: ${pack.title}`,
        `H1: ${pack.h1}`,
        `Slug: /${pack.slug}`,
        `Meta description: ${pack.description}`,
      ].join("\n"),
      "Complete SEO pack copied"
    );
  });

  document.querySelector("#seo-toggle-checklist")?.addEventListener("click", (event) => {
    const checklist = document.querySelector("#seo-checklist");
    if (!checklist) return;

    const isCompact = checklist.classList.toggle("is-compact");
    event.currentTarget.textContent = isCompact ? "View all" : "Show less";
  });

  analyzeSeoWorkspace();
}


async function loadOverviewStats() {
  if (!state.company) return;

  const companyId = state.company.id;

  const conversationsResult = await supabase
    .from("conversations")
    .select("id, messages(content)")
    .eq("company_id", companyId);

  const knowledgeResult = await supabase
    .from("knowledge")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  const conversationsEl =
    document.querySelector("#stat-conversations");

  const leadsEl =
    document.querySelector("#stat-leads");

  const knowledgeEl =
    document.querySelector("#stat-knowledge");

  if (conversationsResult.error) {
    if (conversationsEl) conversationsEl.textContent = "!";
    if (leadsEl) leadsEl.textContent = "!";
    console.error(conversationsResult.error);
  } else {
    const conversations = conversationsResult.data || [];
    const qualifiedCount = conversations.filter((conversation) =>
      scoreLeadFromMessages(conversation.messages || []) >= 40
    ).length;

    if (conversationsEl) {
      conversationsEl.textContent = String(conversations.length);
    }

    if (leadsEl) {
      leadsEl.textContent = String(qualifiedCount);
    }
  }

  if (knowledgeResult.error) {
    if (knowledgeEl) knowledgeEl.textContent = "!";
    console.error(knowledgeResult.error);
  } else if (knowledgeEl) {
    knowledgeEl.textContent =
      knowledgeResult.count ?? 0;
  }
}

function formatDashboardDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatDashboardDate(value) {
  if (!value) return "Saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function scoreLeadFromMessages(messages = []) {
  const text = messages.map((m) => m.content || "").join(" ").toLowerCase();
  let score = 10;
  const strong = ["buy", "purchase", "book", "booking", "demo", "quote", "price", "pricing", "cost", "call me", "contact me", "ready", "today", "this week"];
  const medium = ["interested", "need", "want", "available", "availability", "service", "help"];
  strong.forEach((word) => { if (text.includes(word)) score += 12; });
  medium.forEach((word) => { if (text.includes(word)) score += 5; });
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)) score += 20;
  if (/\+?\d[\d\s().-]{7,}\d/.test(text)) score += 20;
  if (messages.length >= 3) score += 8;
  return Math.min(100, score);
}

function leadMeta(score) {
  if (score >= 70) return { label: "HOT", icon: "🔥", cls: "hot" };
  if (score >= 40) return { label: "WARM", icon: "●", cls: "warm" };
  return { label: "COLD", icon: "○", cls: "cold" };
}

function summarizeLead(messages = []) {
  if (!messages.length) return "No visitor message captured yet.";
  const last = messages[messages.length - 1]?.content || "";
  const text = messages.map((m) => m.content || "").join(" ").toLowerCase();
  const intents = [];
  if (/(price|pricing|cost|quote)/.test(text)) intents.push("pricing");
  if (/(book|booking|appointment|demo)/.test(text)) intents.push("booking/demo");
  if (/(buy|purchase|ready)/.test(text)) intents.push("buying");
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) || /\+?\d[\d\s().-]{7,}\d/.test(text)) intents.push("contact shared");
  return intents.length
    ? `Interest signals: ${intents.join(", ")}. Latest: "${last.slice(0, 90)}${last.length > 90 ? "…" : ""}"`
    : `Latest: "${last.slice(0, 110)}${last.length > 110 ? "…" : ""}"`;
}

function extractLeadContact(conversation, messages = []) {
  const joined = messages.map((m) => m.content || "").join(" ");
  const emailMatch = joined.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  const phoneMatch = joined.match(/(?:\+?\d[\d\s().-]{7,}\d)/);

  const email = conversation?.visitor_email || emailMatch?.[0] || "";
  const phone = phoneMatch?.[0]?.trim() || "";

  return { email, phone };
}


function hoursSince(value) {
  if (!value) return 0;
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 0;
  return diff / 36e5;
}

async function loadRevenueRescue() {
  const list = document.querySelector("#rescue-list");
  if (!list || !state.company || !supabase) return;

  const { data, error } = await supabase
    .from("conversations")
    .select("id, visitor_name, visitor_email, status, created_at, updated_at, messages(id, sender, content, created_at)")
    .eq("company_id", state.company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    list.innerHTML = `<div class="conversation-error">${escapeHtml(error.message)}</div>`;
    return;
  }

  const rows = (data || []).map((conversation) => {
    const messages = [...(conversation.messages || [])].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const score = scoreLeadFromMessages(messages);
    const meta = leadMeta(score);
    const contact = extractLeadContact(conversation, messages);
    const ageHours = hoursSince(conversation.updated_at || conversation.created_at);
    const qualified = score >= 40;
    const stalled = qualified && ageHours >= 24;
    const contactable = Boolean(contact.email || contact.phone);
    return { conversation, messages, score, meta, contact, ageHours, qualified, stalled, contactable };
  }).filter((row) => row.qualified);

  rows.sort((a,b) => {
    if (a.stalled !== b.stalled) return a.stalled ? -1 : 1;
    if (a.score !== b.score) return b.score - a.score;
    return b.ageHours - a.ageHours;
  });

  const atRisk = rows.filter((row) => row.stalled).length;
  const hot = rows.filter((row) => row.score >= 70).length;
  const contactable = rows.filter((row) => row.contactable).length;

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = String(value);
  };
  setText("#rescue-at-risk", atRisk);
  setText("#rescue-hot", hot);
  setText("#rescue-contactable", contactable);

  if (!rows.length) {
    list.innerHTML = `<div class="rescue-empty dashboard-card"><strong>No qualified recovery signals yet.</strong><p>As visitors ask about pricing, demos, booking or buying, YOUYOU will surface the strongest opportunities here.</p></div>`;
    return;
  }

  list.innerHTML = rows.slice(0, 20).map((row) => {
    const name = row.conversation.visitor_name || "Website visitor";
    const summary = summarizeLead(row.messages);
    const inactivity = row.ageHours >= 48
      ? `${Math.floor(row.ageHours / 24)} days quiet`
      : row.ageHours >= 24
        ? `${Math.floor(row.ageHours)} hours quiet`
        : "Active recently";
    const nextAction = row.contactable
      ? "Follow up directly while intent is still warm."
      : "Re-open the conversation and ask for a contact method.";
    return `
      <article class="rescue-row dashboard-card ${row.stalled ? "is-stalled" : ""}">
        <div class="rescue-row-main">
          <div class="rescue-row-title"><strong>${escapeHtml(name)}</strong><span class="lead-badge ${row.meta.cls}">${row.meta.icon} ${row.meta.label} ${row.score}</span></div>
          <p>${escapeHtml(summary)}</p>
          <div class="rescue-row-meta"><span>${escapeHtml(inactivity)}</span><span>${row.contactable ? "Contact captured" : "No contact yet"}</span></div>
        </div>
        <div class="rescue-row-action">
          <div class="rescue-row-status">Needs follow-up</div>
          <small>NEXT ACTION</small>
          <strong>${escapeHtml(nextAction)}</strong>
          <div class="rescue-action-chips">
            ${row.contact.email ? `<a href="mailto:${escapeHtml(row.contact.email)}">Email lead ↗</a>` : ""}
            ${row.contact.phone ? `<a href="tel:${escapeHtml(row.contact.phone.replace(/\s+/g, ""))}">Call lead ↗</a>` : ""}
          </div>
        </div>
      </article>`;
  }).join("");
}


async function loadConversations() {
  const list = document.querySelector("#conversations-list");
  if (!list || !state.company) return;

  const { data, error } = await supabase
    .from("conversations")
    .select("id, visitor_name, visitor_email, status, created_at, updated_at, messages(id, sender, content, created_at)")
    .eq("company_id", state.company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    list.innerHTML = `<div class="conversation-error">${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data?.length) {
    list.innerHTML = `<div class="knowledge-empty">No conversations yet. Open the website widget and send a test message.</div>`;
    return;
  }

  data.forEach((c) => c.messages?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)));

  list.innerHTML = data.map((conversation, index) => {
    const name = conversation.visitor_name || "Website visitor";
    const timeValue = conversation.updated_at || conversation.created_at;
    const time = formatDashboardDateTime(timeValue);
    const status = conversation.status || "open";
    const score = scoreLeadFromMessages(conversation.messages || []);
    const meta = leadMeta(score);
    const last = conversation.messages?.at(-1)?.content || "No message preview";

    return `
      <button class="conversation-row ${index === 0 ? "selected" : ""}" data-conversation-id="${escapeHtml(conversation.id)}">
        <div class="conversation-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
        <div class="conversation-row-copy">
          <div class="conversation-row-top">
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(time)}</span>
          </div>
          <p>${escapeHtml(last.slice(0, 72))}</p>
          <div class="lead-row">
            <small class="lead-badge ${meta.cls}">${meta.icon} ${meta.label} · ${score}/100</small>
            <small class="conversation-status ${escapeHtml(status.toLowerCase())}">${escapeHtml(status)}</small>
          </div>
        </div>
      </button>`;
  }).join("");

  document.querySelectorAll("[data-conversation-id]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-conversation-id]").forEach((row) => row.classList.remove("selected"));
      button.classList.add("selected");
      const conversation = data.find((item) => item.id === button.dataset.conversationId);
      if (conversation) renderConversationDetail(conversation);
    });
  });

  renderConversationDetail(data[0]);
}

function renderConversationDetail(conversation) {
  const detail = document.querySelector("#conversation-detail");
  if (!detail || !conversation) return;
  const data = conversation.messages || [];
  const score = scoreLeadFromMessages(data);
  const meta = leadMeta(score);
  const summary = summarizeLead(data);
  const contact = extractLeadContact(conversation, data);

  detail.innerHTML = `
    <div class="conversation-detail-head">
      <div>
        <small>VISITOR</small>
        <h2>${escapeHtml(conversation.visitor_name || "Website visitor")}</h2>
        <p>${escapeHtml(contact.email || "No email captured")}</p>
      </div>
      <span class="lead-badge large ${meta.cls}">${meta.icon} ${meta.label} · ${score}/100</span>
    </div>
    <div class="lead-summary">
      <div><small>SMART SUMMARY</small><strong>${escapeHtml(summary)}</strong></div>
      <span>Intent scoring preview</span>
    </div>
    <div class="conversation-messages">
      ${!data.length ? `<div class="conversation-empty-messages">No messages in this conversation yet.</div>` :
        data.map((message) => {
          const sender = String(message.sender || "visitor").toLowerCase();
          const isVisitor = sender === "visitor" || sender === "user" || sender === "customer";
          const time = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
          return `<div class="conversation-message ${isVisitor ? "visitor" : "agent"}">
            <div class="conversation-bubble">${escapeHtml(message.content || "")}</div>
            <small>${isVisitor ? "Visitor" : "YOUYOU"}${time ? ` · ${escapeHtml(time)}` : ""}</small>
          </div>`;
        }).join("")}
    </div>`;
}


async function loadLeads() {
  const list = document.querySelector("#leads-list");
  const count = document.querySelector("#lead-count");
  if (!list || !state.company) return;

  const { data, error } = await supabase
    .from("conversations")
    .select("id, visitor_name, visitor_email, status, created_at, updated_at, messages(id, sender, content, created_at)")
    .eq("company_id", state.company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    list.innerHTML = `<div class="conversation-error">${escapeHtml(error.message)}</div>`;
    return;
  }

  const analyzed = (data || []).map((conversation) => {
    const messages = (conversation.messages || [])
      .slice()
      .sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const score = scoreLeadFromMessages(messages);
    const meta = leadMeta(score);
    return {
      ...conversation,
      messages,
      score,
      meta,
      summary: summarizeLead(messages),
      contact: extractLeadContact(conversation, messages),
      lastMessage: messages.at(-1)?.content || "No message captured"
    };
  }).filter((lead) => lead.score >= 40);

  let activeFilter = "all";

  function paint() {
    const visible = analyzed.filter((lead) => {
      if (activeFilter === "hot") return lead.score >= 70;
      if (activeFilter === "warm") return lead.score >= 40 && lead.score < 70;
      return true;
    });

    if (count) count.textContent = `${analyzed.length} lead${analyzed.length === 1 ? "" : "s"}`;

    if (!visible.length) {
      list.innerHTML = `
        <div class="leads-empty">
          <div class="empty-icon">✦</div>
          <h2>No qualified leads in this view</h2>
          <p>YOUYOU will surface visitors here when their buying-intent score reaches 40/100.</p>
        </div>`;
      return;
    }

    list.innerHTML = visible.map((lead) => {
      const name = lead.visitor_name || "Website visitor";
      const when = lead.updated_at || lead.created_at;
      const time = formatDashboardDateTime(when);
      const signals = [];
      const text = lead.messages.map(m => m.content || "").join(" ").toLowerCase();
      if (/(price|pricing|cost|quote)/.test(text)) signals.push("Pricing");
      if (/(book|booking|appointment|demo)/.test(text)) signals.push("Booking / demo");
      if (/(buy|purchase|ready)/.test(text)) signals.push("Buying intent");
      if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) || /\+?\d[\d\s().-]{7,}\d/.test(text)) signals.push("Contact shared");

      return `
        <article class="lead-card">
          <div class="lead-card-main">
            <div class="lead-card-top">
              <div class="lead-identity">
                <div class="conversation-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
                <div>
                  <small>QUALIFIED VISITOR</small>
                  <h2>${escapeHtml(name)}</h2>
                  <p>${escapeHtml(lead.contact.email || lead.contact.phone || "No contact captured yet")}</p>
                </div>
              </div>
              <span class="lead-badge large ${lead.meta.cls}">${lead.meta.icon} ${lead.meta.label} · ${lead.score}/100</span>
            </div>

            <div class="lead-signal-list">
              ${(signals.length ? signals : ["Engaged visitor"]).map(s => `<span>${escapeHtml(s)}</span>`).join("")}
            </div>

            <div class="lead-card-summary">
              <small>SMART SUMMARY</small>
              <strong>${escapeHtml(lead.summary)}</strong>
            </div>
          </div>

          <div class="lead-card-side">
            <small>LAST ACTIVITY</small>
            <strong>${escapeHtml(time)}</strong>
            <p>${escapeHtml(lead.lastMessage.slice(0, 120))}</p>
            <div class="lead-actions lead-actions-pro">
              ${lead.contact.email ? `<a class="secondary lead-action-link" href="mailto:${escapeHtml(lead.contact.email)}">Email</a><button class="secondary lead-action-link lead-copy-action" type="button" data-copy-contact="${escapeHtml(lead.contact.email)}" data-copy-label="Email">Copy email</button>` : ""}
              ${lead.contact.phone ? `<a class="secondary lead-action-link" href="tel:${escapeHtml(lead.contact.phone)}">Call</a><button class="secondary lead-action-link lead-copy-action" type="button" data-copy-contact="${escapeHtml(lead.contact.phone)}" data-copy-label="Phone">Copy phone</button>` : ""}
              <button class="secondary open-lead-conversation" data-open-conversation="${escapeHtml(lead.id)}">Open conversation →</button>
            </div>
            ${!lead.contact.email && !lead.contact.phone ? `<div class="contact-needed">Contact not captured yet <span>YOUYOU will ask for it when lead capture is activated.</span></div>` : ""}
            ${lead.score >= 70 ? `<div class="whatsapp-ready">WhatsApp AI ready after connection <span>Official API integration pending</span></div>` : ""}
          </div>
        </article>`;
    }).join("");

    document.querySelectorAll("[data-open-conversation]").forEach((button) => {
      button.onclick = () => {
        navigateDashboard("conversations");
        setTimeout(() => {
          document.querySelector(`[data-conversation-id="${CSS.escape(button.dataset.openConversation)}"]`)?.click();
        }, 250);
      };
    });

    document.querySelectorAll("[data-copy-contact]").forEach((button) => {
      button.onclick = async () => {
        const value = button.dataset.copyContact || "";
        const label = button.dataset.copyLabel || "Contact";
        if (!value) return;
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(value);
          button.textContent = `${label} copied ✓`;
        } catch {
          window.prompt(`Copy ${label.toLowerCase()}:`, value);
          button.textContent = "Ready to copy";
        }
        window.setTimeout(() => {
          if (button?.isConnected) button.textContent = original;
        }, 1500);
      };
    });
  }

  document.querySelectorAll("[data-lead-filter]").forEach((button) => {
    button.onclick = () => {
      activeFilter = button.dataset.leadFilter;
      document.querySelectorAll("[data-lead-filter]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      paint();
    };
  });

  paint();
}


let pendingKnowledgeFile = null;

function setKnowledgeFileStatus(message = "", type = "") {
  const el = document.querySelector("#knowledge-file-status");
  if (!el) return;
  el.textContent = message;
  el.className = `knowledge-form-status ${type}`.trim();
}

function readableFileSize(bytes = 0) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeExtractedKnowledge(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = content.items
      .map((item) => String(item.str || "").trim())
      .filter(Boolean)
      .join(" ");

    if (lines) pages.push(`Page ${pageNumber}\n${lines}`);
  }

  return pages.join("\n\n");
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value || "";
}

async function extractSpreadsheetText(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sections = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      sections.push(`Sheet: ${sheetName}\n${csv.trim()}`);
    }
  });

  return sections.join("\n\n");
}

async function extractKnowledgeFileText(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (extension === "txt" || extension === "csv") {
    return await file.text();
  }

  if (extension === "pdf") {
    return await extractPdfText(file);
  }

  if (extension === "docx") {
    return await extractDocxText(file);
  }

  if (extension === "xlsx" || extension === "xls") {
    return await extractSpreadsheetText(file);
  }

  throw new Error("Unsupported file type. Use PDF, DOCX, TXT, CSV, XLSX or XLS.");
}

function resetKnowledgeFileUpload() {
  pendingKnowledgeFile = null;

  const input = document.querySelector("#knowledge-file-input");
  const result = document.querySelector("#knowledge-file-result");
  const preview = document.querySelector("#knowledge-file-preview");

  if (input) input.value = "";
  if (preview) preview.value = "";
  if (result) result.hidden = true;

  setKnowledgeFileStatus();
}

async function handleKnowledgeFile(file) {
  if (!file) return;

  const maxBytes = 10 * 1024 * 1024;

  if (file.size > maxBytes) {
    setKnowledgeFileStatus("File is too large. Maximum size is 10 MB.", "error");
    return;
  }

  const allowed = ["pdf", "docx", "txt", "csv", "xlsx", "xls"];
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (!allowed.includes(extension)) {
    setKnowledgeFileStatus("Unsupported file type.", "error");
    return;
  }

  const result = document.querySelector("#knowledge-file-result");
  const name = document.querySelector("#knowledge-file-name");
  const info = document.querySelector("#knowledge-file-info");
  const preview = document.querySelector("#knowledge-file-preview");
  const importButton = document.querySelector("#import-knowledge-file");

  if (result) result.hidden = false;
  if (name) name.textContent = file.name;
  if (info) info.textContent = `${extension.toUpperCase()} · ${readableFileSize(file.size)}`;
  if (preview) preview.value = "";

  importButton?.setAttribute("disabled", "disabled");
  setKnowledgeFileStatus("Reading file...", "info");

  try {
    const rawText = await extractKnowledgeFileText(file);
    const text = normalizeExtractedKnowledge(rawText);

    if (!text) {
      throw new Error("No readable text was found in this file.");
    }

    pendingKnowledgeFile = {
      file,
      text
    };

    if (preview) preview.value = text.slice(0, 30000);

    setKnowledgeFileStatus(
      `${text.length.toLocaleString()} characters extracted. Review the text, then import it.`,
      "success"
    );
  } catch (error) {
    console.error("Knowledge file extraction error:", error);
    pendingKnowledgeFile = null;
    setKnowledgeFileStatus(error.message || "Could not read this file.", "error");
  } finally {
    importButton?.removeAttribute("disabled");
  }
}

function chunkKnowledgeText(text, maxLength = 5500) {
  const normalized = normalizeExtractedKnowledge(text);
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/).filter(Boolean);
  const chunks = [];
  let current = "";

  const pushCurrent = () => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = "";
  };

  paragraphs.forEach((paragraph) => {
    const clean = paragraph.trim();
    if (!clean) return;

    if (clean.length > maxLength) {
      pushCurrent();

      for (let i = 0; i < clean.length; i += maxLength) {
        chunks.push(clean.slice(i, i + maxLength).trim());
      }
      return;
    }

    const candidate = current ? `${current}\n\n${clean}` : clean;

    if (candidate.length > maxLength) {
      pushCurrent();
      current = clean;
    } else {
      current = candidate;
    }
  });

  pushCurrent();
  return chunks;
}

async function importKnowledgeFile() {
  if (!state.company) return;

  const preview = document.querySelector("#knowledge-file-preview");
  const button = document.querySelector("#import-knowledge-file");

  const text = normalizeExtractedKnowledge(
    preview?.value || pendingKnowledgeFile?.text || ""
  );

  if (!pendingKnowledgeFile?.file || !text) {
    setKnowledgeFileStatus("Choose and read a file first.", "error");
    return;
  }

  const chunks = chunkKnowledgeText(text);

  if (!chunks.length) {
    setKnowledgeFileStatus("No knowledge content to import.", "error");
    return;
  }

  button?.setAttribute("disabled", "disabled");
  if (button) button.textContent = "Importing...";
  setKnowledgeFileStatus(`Saving ${chunks.length} knowledge entr${chunks.length === 1 ? "y" : "ies"}...`, "info");

  const baseTitle = pendingKnowledgeFile.file.name.replace(/\.[^.]+$/, "");
  const rows = chunks.map((content, index) => ({
    company_id: state.company.id,
    title: chunks.length === 1
      ? `File: ${baseTitle}`
      : `File: ${baseTitle} — Part ${index + 1}`,
    content
  }));

  const { error } = await supabase
    .from("knowledge")
    .insert(rows);

  button?.removeAttribute("disabled");
  if (button) button.textContent = "Import to Knowledge Base →";

  if (error) {
    console.error("Knowledge file import error:", error);
    setKnowledgeFileStatus(error.message, "error");
    return;
  }

  setKnowledgeFileStatus(
    `${rows.length} knowledge entr${rows.length === 1 ? "y" : "ies"} imported successfully.`,
    "success"
  );

  await loadKnowledge();
}

let knowledgeCache = [];

const knowledgeTemplates = {
  services: {
    title: "Services & pricing",
    content: "Services we offer:\n- Service 1: description and price\n- Service 2: description and price\n\nImportant pricing notes:\n- Add-ons or extra fees:\n- Discounts or packages:\n- How customers can request a quote:"
  },
  hours: {
    title: "Business hours & contact",
    content: "Business hours:\n- Monday to Friday:\n- Saturday:\n- Sunday:\n\nContact information:\n- Phone:\n- Email:\n- Service area / location:\n\nAfter-hours instructions:"
  },
  faq: {
    title: "Common customer questions",
    content: "Q: What do customers ask most often?\nA: \n\nQ: How quickly do we respond?\nA: \n\nQ: How does booking or ordering work?\nA: \n\nQ: What should a customer prepare before contacting us?\nA:"
  },
  policies: {
    title: "Business policies",
    content: "Cancellation policy:\n\nRefund policy:\n\nPayment terms:\n\nRescheduling policy:\n\nOther important customer rules:"
  }
};

function updateKnowledgeCharacterCount() {
  const content = document.querySelector("#knowledge-content");
  const counter = document.querySelector("#knowledge-char-count");
  if (!content || !counter) return;
  counter.textContent = `${content.value.length} / 6000`;
}

function setKnowledgeFormStatus(message = "", type = "") {
  const status = document.querySelector("#knowledge-form-status");
  if (!status) return;
  status.textContent = message;
  status.className = `knowledge-form-status ${type}`.trim();
}

function resetKnowledgeForm() {
  const title = document.querySelector("#knowledge-title");
  const content = document.querySelector("#knowledge-content");
  if (title) title.value = "";
  if (content) content.value = "";
  updateKnowledgeCharacterCount();
  setKnowledgeFormStatus();
  title?.focus();
}

function applyKnowledgeTemplate(templateKey) {
  const template = knowledgeTemplates[templateKey];
  if (!template) return;

  const title = document.querySelector("#knowledge-title");
  const content = document.querySelector("#knowledge-content");
  if (!title || !content) return;

  title.value = template.title;
  content.value = template.content;
  updateKnowledgeCharacterCount();
  setKnowledgeFormStatus("Template loaded. Replace the examples with your real business information.", "info");
  content.focus();
}

function updateKnowledgeStats() {
  const count = document.querySelector("#knowledge-count");
  const total = document.querySelector("#knowledge-char-total");
  if (count) count.textContent = String(knowledgeCache.length);

  const characters = knowledgeCache.reduce(
    (sum, item) => sum + String(item.title || "").length + String(item.content || "").length,
    0
  );
  if (total) total.textContent = characters.toLocaleString();
}

function renderKnowledgeList(query = "") {
  const list = document.querySelector("#knowledge-list");
  if (!list) return;

  const normalized = String(query || "").trim().toLowerCase();
  const items = normalized
    ? knowledgeCache.filter((item) =>
        `${item.title || ""} ${item.content || ""}`.toLowerCase().includes(normalized)
      )
    : knowledgeCache;

  if (!items.length) {
    list.innerHTML = `
      <div class="knowledge-empty knowledge-empty-pro">
        <div class="knowledge-empty-icon">✦</div>
        <strong>${normalized ? "No matching knowledge" : "Your business brain is empty"}</strong>
        <p>${normalized
          ? "Try a different search term."
          : "Add services, pricing, policies, FAQs or business hours to start building your knowledge base."}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const content = String(item.content || "");
      const preview = content.length > 360 ? `${content.slice(0, 360)}…` : content;
      const created = formatDashboardDate(item.created_at);

      return `
        <article class="knowledge-item knowledge-item-pro">
          <div class="knowledge-item-top">
            <div>
              <span class="knowledge-source">MANUAL</span>
              <strong>${escapeHtml(item.title || "Untitled knowledge")}</strong>
            </div>
            <span class="knowledge-ai-ready">● READY FOR AI</span>
          </div>
          <p>${escapeHtml(preview)}</p>
          <div class="knowledge-item-footer">
            <span>${escapeHtml(created)}</span>
            <span>${content.length.toLocaleString()} characters</span>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadKnowledge() {
  const list = document.querySelector("#knowledge-list");

  if (!list || !state.company) return;

  const { data, error } = await supabase
    .from("knowledge")
    .select("*")
    .eq("company_id", state.company.id)
    .order("created_at", { ascending: false });

  if (error) {
    list.innerHTML = `<div class="knowledge-empty">${escapeHtml(error.message)}</div>`;
    return;
  }

  knowledgeCache = data || [];
  updateKnowledgeStats();
  renderKnowledgeList(document.querySelector("#knowledge-search")?.value || "");
  updateKnowledgeCharacterCount();
}

async function addKnowledge() {
  if (!state.company) return;

  const titleInput = document.querySelector("#knowledge-title");
  const contentInput = document.querySelector("#knowledge-content");
  const saveButton = document.querySelector("#save-knowledge");

  const title = titleInput?.value.trim() || "";
  const content = contentInput?.value.trim() || "";

  if (!title) {
    setKnowledgeFormStatus("Add a clear title first.", "error");
    titleInput?.focus();
    return;
  }

  if (!content) {
    setKnowledgeFormStatus("Add the business information you want YOUYOU to know.", "error");
    contentInput?.focus();
    return;
  }

  saveButton?.setAttribute("disabled", "disabled");
  if (saveButton) saveButton.textContent = "Saving...";
  setKnowledgeFormStatus("Saving to your workspace...", "info");

  const { error } = await supabase
    .from("knowledge")
    .insert({
      company_id: state.company.id,
      title,
      content,
    });

  saveButton?.removeAttribute("disabled");
  if (saveButton) saveButton.textContent = "Save to Knowledge Base";

  if (error) {
    setKnowledgeFormStatus(error.message, "error");
    return;
  }

  if (titleInput) titleInput.value = "";
  if (contentInput) contentInput.value = "";
  updateKnowledgeCharacterCount();
  setKnowledgeFormStatus("Saved successfully. YOUYOU can use this when AI knowledge replies are activated.", "success");
  await loadKnowledge();
}


function setSettingsSaveStatus(message, type = "") {
  const status = document.querySelector("#settings-save-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

async function saveSettings() {
  if (!state.company || !supabase) return;

  const button = document.querySelector("#save-settings");

  const values = {
    name: document.querySelector("#company-name")?.value.trim() || "",
    industry: document.querySelector("#company-industry")?.value.trim() || "",
    website_url: document.querySelector("#company-website")?.value.trim() || "",
    country: document.querySelector("#company-country")?.value || "",
    business_description: document.querySelector("#company-description")?.value.trim() || "",
    business_email: document.querySelector("#business-email")?.value.trim() || "",
    business_phone: document.querySelector("#business-phone")?.value.trim() || "",
    whatsapp_number: document.querySelector("#whatsapp-number")?.value.trim() || "",
    city: document.querySelector("#business-city")?.value.trim() || "",
    business_address: document.querySelector("#business-address")?.value.trim() || "",
    timezone: document.querySelector("#company-timezone")?.value || "",
    widget_status: document.querySelector("#widget-status")?.value || "Enabled",
    business_hours: document.querySelector("#business-hours")?.value.trim() || "",
    widget_welcome_message: document.querySelector("#widget-welcome")?.value.trim() || "",
    notification_email: document.querySelector("#notification-email")?.value.trim() || "",
    lead_alert_mode: document.querySelector("#lead-alert-mode")?.value || "Hot leads only",
  };

  if (!values.name) {
    setSettingsSaveStatus("Company name is required", "error");
    document.querySelector("#company-name")?.focus();
    return;
  }

  if (values.website_url && !/^https?:\/\//i.test(values.website_url)) {
    setSettingsSaveStatus("Website must start with http:// or https://", "error");
    document.querySelector("#company-website")?.focus();
    return;
  }

  button?.setAttribute("disabled", "disabled");
  if (button) button.textContent = "Saving...";
  setSettingsSaveStatus("Saving business settings...", "loading");

  const { error } = await supabase
    .from("companies")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", state.company.id);

  button?.removeAttribute("disabled");
  if (button) button.textContent = "Save business settings →";

  if (error) {
    console.error("Business settings save error:", error);
    setSettingsSaveStatus(error.message, "error");
    return;
  }

  state.company = { ...state.company, ...values };
  setSettingsSaveStatus("Saved successfully", "success");
}


/* =========================
   APP
========================= */

function render() {
  if (state.page === "landing") {
    renderLanding();
  } else if (state.page === "faq") {
    renderFaqPage();
  } else if (state.page === "auth") {
    renderAuth();
  } else {
    renderDashboard();
  }
}


async function boot() {
  if (!supabase) {
    state.page = "auth";
    state.authMode = "login";
    state.message =
      "Supabase configuration is missing in Vercel.";
    renderAuth();
    return;
  }

  const { data } =
    await supabase.auth.getSession();

  if (data.session && window.location.pathname.startsWith("/dashboard/")) {
    await loadUser(data.session.user);
  } else if (data.session && window.location.pathname === "/faq") {
    await loadUser(data.session.user, { publicPage: "faq" });
  } else if (data.session) {
    await loadUser(data.session.user, { publicPage: "landing" });
  } else if (window.location.pathname === "/faq") {
    state.page = "faq";
    renderFaqPage();
  } else {
    state.page = "landing";
    renderLanding();
  }

  supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === "SIGNED_OUT") {
        state.user = null;
        state.profile = null;
        state.company = null;
        state.page = "landing";
        state.section = "overview";
        window.history.replaceState({}, "", "/");
        render();
      }
    }
  );
}


window.addEventListener("popstate", () => {
  if (state.user && window.location.pathname === "/") {
    state.page = "landing";
    renderLanding();
    return;
  }

  if (state.user && window.location.pathname.startsWith("/dashboard/")) {
    state.page = "dashboard";
    state.section = sectionFromPath();
    renderDashboard();
    return;
  }

  if (window.location.pathname === "/faq") {
    state.page = "faq";
    renderFaqPage();
    return;
  }

  if (state.page === "faq" && window.location.pathname === "/") {
    state.page = "landing";
    renderLanding();
    return;
  }

  if (state.page !== "dashboard" || !state.user) return;

  const nextSection = sectionFromPath();
  state.section = nextSection;
  renderDashboard();
});

boot();
