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
      <div class="dashboard-card">

        <div class="card-header">
          <div>
            <small>TRAINING</small>
            <h1>Knowledge Base</h1>
          </div>

          <button id="add-knowledge" class="primary">
            + Add knowledge
          </button>
        </div>

        <p>
          Give YOUYOU the information it needs to answer
          your customers accurately.
        </p>

        <div id="knowledge-list">
          Loading...
        </div>

      </div>
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
            <option>English</option>
            <option>French</option>
            <option>Arabic</option>
          </select>
        </label>

        <label>
          Lead capture
          <select id="lead-capture">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
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
          <strong>Configuration ready</strong>
        </div>

        <button id="save-ai-config" class="primary">
          Save configuration →
        </button>

      </div>

    </div>
  `;
}

else if (state.section === "settings") {


    body = `
      <div class="dashboard-card">

        <small>WORKSPACE</small>

        <h1>Settings</h1>

        <div class="settings-grid">

          <label>
            Company name
            <input
              id="company-name"
              value="${escapeHtml(company)}"
            />
          </label>

          <label>
            Email
            <input
              disabled
              value="${escapeHtml(state.user.email)}"
            />
          </label>

        </div>

        <button id="save-settings" class="primary">
          Save changes
        </button>

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
    addKnowledge
  );

  document.querySelector("#save-settings")?.addEventListener(
    "click",
    saveSettings
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

async function loadKnowledge() {
  const list =
    document.querySelector("#knowledge-list");

  if (!list || !state.company) return;

  const { data, error } =
    await supabase
      .from("knowledge")
      .select("*")
      .eq("company_id", state.company.id)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    list.textContent = error.message;
    return;
  }

  if (!data?.length) {
    list.innerHTML = `
      <div class="knowledge-empty">
        No knowledge added yet.
      </div>
    `;
    return;
  }

  list.innerHTML = data
    .map(
      (item) => `
        <article class="knowledge-item">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.content)}</p>
        </article>
      `
    )
    .join("");
}


async function addKnowledge() {
  if (!state.company) return;

  const title =
    prompt("Knowledge title:");

  if (!title) return;

  const content =
    prompt("Business information:");

  if (!content) return;

  const { error } =
    await supabase
      .from("knowledge")
      .insert({
        company_id: state.company.id,
        title,
        content,
      });

  if (error) {
    alert(error.message);
    return;
  }

  loadKnowledge();
}


async function saveSettings() {
  const input =
    document.querySelector("#company-name");

  if (!input || !state.company) return;

  const name = input.value.trim();

  if (!name) return;

  const { error } =
    await supabase
      .from("companies")
      .update({ name })
      .eq("id", state.company.id);

  if (error) {
    alert(error.message);
    return;
  }

  state.company.name = name;

  alert("Settings saved successfully.");

  renderDashboard();
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
