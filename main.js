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
            </h1

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

            <div class="floating-card leads-card">
              <div class="floating-icon">✦</div>
              <div>
                <small>NEW LEAD</small>
                <strong>Sarah Johnson</strong>
              </div>
              <span class="check">✓</span>
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

  document
    .querySelectorAll("[data-nav]")
    .forEach((button) => {
      button.onclick = () => {
        state.section = button.dataset.nav;
        renderDashboard();
      };
    });

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

          <pre>
&lt;script src="https://YOUR-DOMAIN/widget.js"&gt;&lt;/script&gt;
          </pre>

          <button id="copy-widget" class="primary">
            Copy install code
          </button>
        </div>

        <div class="dashboard-card">

          <small>PREVIEW</small>
          <h1>Live assistant</h1>

          <div class="preview-chat">
            <div class="preview-message">
              Hi! I'm your YOUYOU AI agent. 👋
            </div>

            <div class="preview-message user">
              How can you help me?
            </div>

            <div class="preview-message">
              I can answer questions, capture leads
              and help your customers 24/7.
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
      <div class="dashboard-card empty-state">

        <div class="empty-icon">◌</div>

        <h1>Conversations</h1>

        <p>
          Your customer conversations will appear here
          when YOUYOU starts receiving messages.
        </p>

      </div>
    `;
  }

  else if (state.section === "leads") {
    body = `
      <div class="dashboard-card empty-state">

        <div class="empty-icon">✦</div>

        <h1>Lead Inbox</h1>

        <p>
          Qualified leads captured by YOUYOU
          will appear here.
        </p>

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
      const code =
        '<script src="https://YOUR-DOMAIN/widget.js"></script>';

      await navigator.clipboard?.writeText(code);

      alert("Install code copied.");
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
    if (state.section === "overview") {
  loadOverviewStats();
}
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
