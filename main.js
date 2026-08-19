import { createClient } from "@supabase/supabase-js";
import "./style.css";

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
        <a class="logo" href="#">
          <span class="logo-mark">Y</span>
          <span>YOUYOU</span>
        </a>

        <nav class="landing-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
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


        <section id="pricing" class="pricing-section">

          <div class="section-heading">
            <div class="eyebrow">PRICING</div>

            <h2>
              Start simple.
              <span>Grow when you're ready.</span>
            </h2>

            <p>
              Everything you need to start building an AI-powered
              customer experience.
            </p>
          </div>

          <div class="pricing-card">

            <div>
              <div class="pricing-label">YOUYOU PRO</div>

              <h3>
                $19
                <span>/ month</span>
              </h3>

              <p>
                Everything you need to launch your AI customer agent.
              </p>
            </div>

            <ul>
              <li>✓ AI customer conversations</li>
              <li>✓ Knowledge base</li>
              <li>✓ Lead capture</li>
              <li>✓ Website widget</li>
              <li>✓ AI control center</li>
              <li>✓ 24/7 availability</li>
            </ul>

            <button id="pricing-start" class="primary">
              Start free
              <span>→</span>
            </button>

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
          <a class="logo" href="#">
            <span class="logo-mark">Y</span>
            <span>YOUYOU</span>
          </a>

          <p>
            AI Customer Agent for modern businesses.
          </p>
        </div>

        <div class="footer-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
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
  document.querySelector("#pricing-start").onclick = showSignup;
  document.querySelector("#final-start").onclick = showSignup;
  document.querySelector("#footer-login").onclick = showLogin;
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
          <span class="logo-mark">Y</span>
          <strong>YOUYOU</strong>
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
            <span class="logo-mark">Y</span>
            <strong>YOUYOU</strong>
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

      state.section = nextSection;
      renderDashboard();
    });
  }

  document.querySelector("#logout").onclick =
    async () => {
      await supabase.auth.signOut();

      state.user = null;
      state.profile = null;
      state.company = null;
      state.page = "landing";

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
    body = `
      <div class="dashboard-grid">

        <div class="dashboard-card">
          <small>DEPLOYMENT</small>
          <h1>Website Widget</h1>

          <p>
            Add YOUYOU to your website with one simple script.
          </p>

          <pre id="widget-code">${escapeHtml(getWidgetInstallCode())}</pre>

          <button id="copy-widget" class="primary">
            Copy install code
          </button>
        </div>

        <div class="dashboard-card widget-preview-card">

          <div class="widget-preview-top">
            <div>
              <small>PREVIEW</small>
              <h1>Live assistant</h1>
            </div>
            <span class="widget-online">● Online</span>
          </div>

          <div class="widget-device">
            <div class="widget-device-head">
              <div class="widget-agent-avatar">Y</div>
              <div>
                <strong>YOUYOU AI</strong>
                <span>AI Customer Agent</span>
              </div>
              <span class="widget-device-status">●</span>
            </div>

            <div class="preview-chat premium-preview-chat">
              <div class="preview-message">
                Hi! 👋 I'm your YOUYOU AI agent. How can I help you today?
              </div>

              <div class="preview-message user">
                I need pricing and a demo.
              </div>

              <div class="preview-message">
                Absolutely. I can help with that and connect you with the team.
              </div>
            </div>

            <div class="widget-device-input">
              <span>Ask YOUYOU anything...</span>
              <button type="button">↑</button>
            </div>
          </div>

        </div>

      </div>
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
          <span>●</span> AI READY
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
          Launch agent →
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
  <span>AI-qualified opportunities</span>
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
            Agent status
            <em>● LIVE</em>
          </h2>

          <p>
            Your workspace is connected to Supabase.
            Add knowledge and install the widget to start.
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
      state.section = "widget";
      renderDashboard();
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

async function loadOverviewStats() {
  if (!state.company) return;

  const companyId = state.company.id;

  const conversationsResult = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  const leadsResult = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
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
    conversationsEl.textContent = "!";
    console.error(conversationsResult.error);
  } else {
    conversationsEl.textContent =
      conversationsResult.count ?? 0;
  }

  if (leadsResult.error) {
    leadsEl.textContent = "!";
    console.error(leadsResult.error);
  } else {
    leadsEl.textContent =
      leadsResult.count ?? 0;
  }

  if (knowledgeResult.error) {
    knowledgeEl.textContent = "!";
    console.error(knowledgeResult.error);
  } else {
    knowledgeEl.textContent =
      knowledgeResult.count ?? 0;
  }
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
    const time = timeValue ? new Date(timeValue).toLocaleString() : "";
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

  detail.innerHTML = `
    <div class="conversation-detail-head">
      <div>
        <small>VISITOR</small>
        <h2>${escapeHtml(conversation.visitor_name || "Website visitor")}</h2>
        <p>${escapeHtml(conversation.visitor_email || "No email captured")}</p>
      </div>
      <span class="lead-badge large ${meta.cls}">${meta.icon} ${meta.label} · ${score}/100</span>
    </div>
    <div class="lead-summary">
      <div><small>SMART SUMMARY</small><strong>${escapeHtml(summary)}</strong></div>
      <span>Local scoring preview</span>
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
      const time = when ? new Date(when).toLocaleString() : "";
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
        state.section = "conversations";
        renderDashboard();
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
      const created = item.created_at
        ? new Date(item.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        : "Saved";

      return `
        <article class="knowledge-item knowledge-item-pro">
          <div class="knowledge-item-top">
            <div>
              <span class="knowledge-source">MANUAL</span>
              <strong>${escapeHtml(item.title || "Untitled knowledge")}</strong>
            </div>
            <span class="knowledge-ai-ready">● AI READY</span>
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

  if (data.session) {
    await loadUser(data.session.user);
  } else {
    renderLanding();
  }

  supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === "SIGNED_OUT") {
        state.user = null;
        state.profile = null;
        state.company = null;
        state.page = "landing";
        render();
      }
    }
  );
}


boot();
