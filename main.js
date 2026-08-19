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
};


const DASHBOARD_ROUTES = {
  overview: "/dashboard/overview",
  conversations: "/dashboard/conversations",
  leads: "/dashboard/leads",
  knowledge: "/dashboard/knowledge",
  widget: "/dashboard/widget",
  ai: "/dashboard/ai-control",
  settings: "/dashboard/settings",
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
          <button id="nav-login" class="nav-login">Log in</button>
          <button id="nav-start" class="primary small">Start free</button>
        </div>
      </header>

      <main>

        <section class="hero-section">

          <div class="hero-copy">

            <div class="eyebrow">
              <span class="pulse"></span>
              AI CUSTOMER AGENT
            </div>

            <h1>
              Your website should
              <span>never stop selling.</span>
            </h1>

            <p class="hero-text">
              YOUYOU is your AI customer agent that talks to visitors,
              answers questions, captures leads and helps turn conversations
              into customers — 24/7.
            </p>

            <div class="hero-buttons">
              <button id="hero-start" class="primary hero-btn">
                Start for free
                <span>→</span>
              </button>

              <button id="hero-login" class="secondary hero-btn">
                Log in
              </button>
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
                  <strong>$19/month</strong>.
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
            <strong>∞</strong>
            <span>Conversations</span>
          </div>
          <div>
            <strong>1 min</strong>
            <span>Simple setup</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>Powered support</span>
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

          <div class="feature-grid">

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
            Let AI handle your
            <span>next conversation.</span>
          </h2>

          <p>
            Build your YOUYOU agent today and give every visitor
            an instant answer.
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
            AI Customer Agent for modern businesses.
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

  document.querySelector("#nav-login").onclick = showLogin;
  document.querySelector("#nav-start").onclick = showSignup;
  document.querySelector("#hero-start").onclick = showSignup;
  document.querySelector("#hero-login").onclick = showLogin;
  document.querySelector("#knowledge-start")?.addEventListener("click", showSignup);
  ["#pricing-starter", "#pricing-growth", "#pricing-pro"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("click", showSignup);
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

async function loadUser(user) {
  state.user = user;

  const { data } =
    await supabase
      .from("profiles")
      .select("*, companies(*)")
      .eq("id", user.id)
      .maybeSingle();

  state.profile = data || null;
  state.company = data?.companies || null;
  state.page = "dashboard";

  const requestedSection = sectionFromPath();
  const isDashboardPath = window.location.pathname.startsWith("/dashboard/");

  state.section = requestedSection;

  if (!isDashboardPath) {
    window.history.replaceState(
      { section: state.section },
      "",
      dashboardPath(state.section)
    );
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
            AI CUSTOMER AGENT
          </div>

          <nav class="dashboard-nav">
            ${navItem("overview", "⌂", "Overview")}
            ${navItem("conversations", "◌", "Conversations")}
            ${navItem("leads", "✦", "Leads")}
            ${navItem("knowledge", "▤", "Knowledge")}
            ${navItem("widget", "◇", "Website Widget")}
            ${navItem("ai", "✧", "AI Control Center")}
            ${navItem("settings", "⚙", "Settings")}
          </nav>
        </div>

        <div class="side-bottom">
          <div class="pro-badge">PRO</div>

          <button id="logout" class="logout">
            Log out
          </button>
        </div>

      </aside>

      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>
            <small>WORKSPACE</small>
            <h2>${escapeHtml(company)}</h2>
          </div>

          <div class="user-name">
            ${escapeHtml(name)}
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
              <small>UPLOAD KNOWLEDGE</small>
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

        <div class="dashboard-grid">
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

        <div class="ai-status">
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
              <span>Stripe subscription controls will be activated during the final launch stage.</span>
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
          <small>YOUYOU AI</small>

          <h1>
            Your AI agent,
            <span>ready to work.</span>
          </h1>

          <p>
            Turn website visitors into conversations,
            leads and customers.
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
    `;
  }

  dashboardShell(body);

  document.querySelector("#launch-agent")?.addEventListener(
    "click",
    () => {
      navigateDashboard("widget");
    }
  );

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
  setWidgetConfigStatus(data ? "Saved settings loaded" : "Default settings ready", "success");
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
            <div class="lead-actions">
              ${lead.contact.email ? `<a class="secondary lead-action-link" href="mailto:${escapeHtml(lead.contact.email)}">Email</a>` : ""}
              ${lead.contact.phone ? `<a class="secondary lead-action-link" href="tel:${escapeHtml(lead.contact.phone)}">Call</a>` : ""}
              <button class="secondary open-lead-conversation" data-open-conversation="${escapeHtml(lead.id)}">
                Open conversation →
              </button>
            </div>
            ${!lead.contact.email && !lead.contact.phone ? `<div class="contact-needed">Contact not captured yet <span>YOUYOU will ask for it when lead capture is activated.</span></div>` : ""}
            ${lead.score >= 70 ? `<div class="whatsapp-ready">WhatsApp alert ready <span>Integration pending</span></div>` : ""}
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

  if (window.location.pathname === "/faq") {
    state.page = "faq";
    renderFaqPage();
  } else if (data.session) {
    await loadUser(data.session.user);
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
