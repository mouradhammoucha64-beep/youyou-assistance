(async function () {
  "use strict";

  const script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]');

  const companyId =
    script?.getAttribute("data-company") ||
    localStorage.getItem("youyou_company_id") ||
    "";

  const SUPABASE_URL =
    "https://zprvmydgjxsifuhjplll.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_emmyZ-bcTdUcaVWi_tWONw_1zDbGSSK";

  const SESSION_KEY = companyId
    ? `youyou_conversation_${companyId}`
    : "youyou_conversation";

  let conversationId = sessionStorage.getItem(SESSION_KEY) || "";

  const restHeaders = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY
  };


  const DEFAULT_PUBLIC_CONFIG = {
    enabled: true,
    welcome_message: "Hi! 👋 How can I help you today?",
    accent_color: "#22c55e",
    position: "Right"
  };

  function validHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function hexToRgba(hex, alpha) {
    const safe = validHexColor(hex) ? hex.slice(1) : "22c55e";
    const number = parseInt(safe, 16);
    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  async function loadPublicWidgetConfig() {
    if (!companyId) return { ...DEFAULT_PUBLIC_CONFIG };

    try {
      const url =
        `${SUPABASE_URL}/rest/v1/widget_configs` +
        `?company_id=eq.${encodeURIComponent(companyId)}` +
        `&select=enabled,welcome_message,accent_color,position&limit=1`;

      const response = await fetch(url, {
        method: "GET",
        headers: { apikey: SUPABASE_ANON_KEY }
      });

      if (!response.ok) {
        console.warn("YOUYOU widget config unavailable:", await response.text());
        return { ...DEFAULT_PUBLIC_CONFIG };
      }

      const rows = await response.json();
      const config = rows?.[0];

      return config
        ? { ...DEFAULT_PUBLIC_CONFIG, ...config, enabled: config.enabled !== false }
        : { ...DEFAULT_PUBLIC_CONFIG };
    } catch (error) {
      console.warn("YOUYOU widget config load failed:", error);
      return { ...DEFAULT_PUBLIC_CONFIG };
    }
  }

  const publicConfig = await loadPublicWidgetConfig();

  if (publicConfig.enabled === false) {
    console.info("YOUYOU widget is disabled for this workspace.");
    return;
  }

  const accentColor =
    validHexColor(publicConfig.accent_color)
      ? publicConfig.accent_color
      : DEFAULT_PUBLIC_CONFIG.accent_color;

  const accentShadow = hexToRgba(accentColor, .30);
  const accentShadowStrong = hexToRgba(accentColor, .42);

  const welcomeMessage =
    String(publicConfig.welcome_message || DEFAULT_PUBLIC_CONFIG.welcome_message);

  const widgetPosition =
    publicConfig.position === "Left" ? "Left" : "Right";

  async function ensureConversation() {
    if (conversationId) return conversationId;
    if (!companyId) return "";

    const newConversationId = crypto.randomUUID();

    const response = await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
      method: "POST",
      headers: { ...restHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        id: newConversationId,
        company_id: companyId,
        visitor_name: "Website visitor",
        status: "open"
      })
    });

    if (!response.ok) {
      throw new Error(`Conversation creation failed: ${await response.text()}`);
    }

    conversationId = newConversationId;
    sessionStorage.setItem(SESSION_KEY, conversationId);
    return conversationId;
  }

  async function saveVisitorMessage(content) {
    const id = await ensureConversation();
    if (!id) return;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: { ...restHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({
        conversation_id: id,
        sender: "visitor",
        content
      })
    });

    if (!response.ok) {
      throw new Error(`Message save failed: ${await response.text()}`);
    }
  }

  /* =========================
     FLOATING BUTTON
  ========================= */

  const button = document.createElement("button");
  button.id = "youyou-public-widget-launcher";

  button.setAttribute(
    "aria-label",
    "Open YOUYOU AI"
  );

  button.innerHTML = `
    <span style="
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      width:34px;
      height:29px;
      background:#06130a;
      border-radius:10px;
    ">
      <span style="
        color:${accentColor};
        font-size:15px;
        font-weight:900;
        font-family:Arial,sans-serif;
      ">Y</span>

      <span style="
        position:absolute;
        left:4px;
        bottom:-5px;
        width:9px;
        height:9px;
        background:#06130a;
        clip-path:polygon(0 0,100% 0,0 100%);
      "></span>

      <span style="
        position:absolute;
        right:-5px;
        top:-5px;
        width:10px;
        height:10px;
        border-radius:50%;
        background:${accentColor};
        border:2px solid #06130a;
      "></span>
    </span>
  `;

  Object.assign(button.style, {
    position: "fixed",
    right: widgetPosition === "Right" ? "24px" : "auto",
    left: widgetPosition === "Left" ? "24px" : "auto",
    bottom: "24px",
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    border: "1px solid rgba(34,197,94,.45)",
    background: accentColor,
    color: "#03130a",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow:
      `0 12px 35px ${accentShadow}, 0 8px 25px rgba(0,0,0,.35)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "transform .2s ease, box-shadow .2s ease",
    padding: "0"
  });

  button.addEventListener("mouseenter", () => {
    button.style.transform =
      "translateY(-3px) scale(1.03)";

    button.style.boxShadow =
      `0 16px 42px ${accentShadowStrong}, 0 10px 30px rgba(0,0,0,.4)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform =
      "translateY(0) scale(1)";

    button.style.boxShadow =
      `0 12px 35px ${accentShadow}, 0 8px 25px rgba(0,0,0,.35)`;
  });

  /* =========================
     CHAT PANEL
  ========================= */

  const panel = document.createElement("div");
  panel.id = "youyou-public-widget-panel";

  Object.assign(panel.style, {
    position: "fixed",
    right: widgetPosition === "Right" ? "24px" : "auto",
    left: widgetPosition === "Left" ? "24px" : "auto",
    bottom: "98px",
    width: "390px",
    maxWidth: "calc(100vw - 32px)",
    height: "590px",
    maxHeight: "calc(100vh - 120px)",
    background: "#080d16",
    border:
      "1px solid rgba(148,163,184,.16)",
    borderRadius: "24px",
    overflow: "hidden",
    zIndex: "999998",
    boxShadow:
      "0 30px 80px rgba(0,0,0,.55)",
    display: "none",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#fff"
  });

  panel.innerHTML = `
    <div style="
      height:74px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:0 18px;
      background:
        linear-gradient(180deg,#101827,#0b111c);
      border-bottom:1px solid rgba(148,163,184,.12);
      box-sizing:border-box;
    ">

      <div style="
        display:flex;
        align-items:center;
        gap:11px;
      ">

        <div style="
          width:40px;
          height:40px;
          border-radius:13px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:
            ${accentColor};
          color:#03130a;
          font-size:18px;
          font-weight:900;
        ">
          Y
        </div>

        <div>
          <div style="
            font-size:14px;
            font-weight:800;
          ">
            YOUYOU AI
          </div>

          <div style="
            display:flex;
            align-items:center;
            gap:5px;
            margin-top:3px;
            font-size:11px;
            color:#94a3b8;
          ">
            <span style="
              width:6px;
              height:6px;
              border-radius:50%;
              background:${accentColor};
            "></span>
            Online now
          </div>
        </div>

      </div>

      <button
        id="youyou-close"
        aria-label="Close chat"
        style="
          width:34px;
          height:34px;
          border:1px solid rgba(148,163,184,.12);
          border-radius:10px;
          background:rgba(255,255,255,.03);
          color:#94a3b8;
          font-size:20px;
          cursor:pointer;
        "
      >
        ×
      </button>

    </div>

    <div
      id="youyou-messages"
      style="
        height:calc(100% - 142px);
        padding:20px;
        overflow-y:auto;
        box-sizing:border-box;
      "
    >

      <div style="
        text-align:center;
        margin:4px 0 20px;
        font-size:11px;
        color:#64748b;
        text-transform:uppercase;
        letter-spacing:1px;
        font-weight:700;
      ">
        AI CUSTOMER AGENT
      </div>

      <div style="
        display:flex;
        gap:9px;
        align-items:flex-start;
        margin-bottom:16px;
      ">

        <div style="
          width:30px;
          height:30px;
          border-radius:10px;
          background:${accentColor};
          color:#03130a;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:13px;
          font-weight:900;
        ">
          Y
        </div>

        <div style="
          max-width:82%;
          padding:12px 14px;
          background:#111827;
          border:1px solid rgba(148,163,184,.12);
          border-radius:5px 15px 15px 15px;
          color:#e5e7eb;
          font-size:13px;
          line-height:1.55;
        ">
          ${escapeHtml(welcomeMessage)}
        </div>

      </div>

    </div>

    <form
      id="youyou-form"
      style="
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        height:68px;
        display:flex;
        align-items:center;
        gap:8px;
        padding:10px 12px;
        box-sizing:border-box;
        border-top:1px solid rgba(148,163,184,.12);
        background:#0c131f;
      "
    >

      <input
        id="youyou-input"
        type="text"
        placeholder="Ask YOUYOU anything..."
        autocomplete="off"
        style="
          flex:1;
          min-width:0;
          height:44px;
          border:1px solid rgba(148,163,184,.16);
          border-radius:13px;
          background:#080d16;
          color:#fff;
          padding:0 13px;
          outline:none;
          font-size:13px;
          box-sizing:border-box;
        "
      />

      <button
        type="submit"
        aria-label="Send message"
        style="
          width:44px;
          height:44px;
          border:none;
          border-radius:13px;
          background:${accentColor};
          color:#03130a;
          font-size:18px;
          font-weight:900;
          cursor:pointer;
        "
      >
        ↑
      </button>

    </form>
  `;

  document.body.appendChild(button);
  document.body.appendChild(panel);


  function syncWidgetAdminVisibility() {
    const adminDashboard = document.querySelector(".dashboard");

    if (adminDashboard) {
      button.style.display = "none";
      panel.style.display = "none";
      return;
    }

    button.style.display = "flex";
  }

  const dashboardObserver = new MutationObserver(syncWidgetAdminVisibility);
  dashboardObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  syncWidgetAdminVisibility();

  /* =========================
     OPEN / CLOSE
  ========================= */

  function openPanel() {
    panel.style.display = "block";
  }

  function closePanel() {
    panel.style.display = "none";
  }

  button.addEventListener("click", () => {
    if (panel.style.display === "none") {
      openPanel();
    } else {
      closePanel();
    }
  });

  panel
    .querySelector("#youyou-close")
    .addEventListener(
      "click",
      closePanel
    );

  /* =========================
     LOCAL LEAD + CONTACT CAPTURE
     No paid AI/API required
  ========================= */

  let localLeadScore = 10;
  let contactPromptShown = false;
  let capturedContact = false;

  function scoreLocalIntent(value) {
    const text = String(value || "").toLowerCase();
    let points = 0;

    const strong = [
      "buy", "purchase", "book", "booking", "demo",
      "quote", "price", "pricing", "cost",
      "call me", "contact me", "ready", "this week", "today"
    ];

    const medium = [
      "interested", "need", "want", "available",
      "availability", "service", "help"
    ];

    strong.forEach((word) => {
      if (text.includes(word)) points += 12;
    });

    medium.forEach((word) => {
      if (text.includes(word)) points += 5;
    });

    if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)) {
      points += 20;
      capturedContact = true;
    }

    if (/\+?\d[\d\s().-]{7,}\d/.test(text)) {
      points += 20;
      capturedContact = true;
    }

    localLeadScore = Math.min(100, localLeadScore + points);
    return localLeadScore;
  }

  function appendAgentBubble(html) {
    const reply = document.createElement("div");

    Object.assign(reply.style, {
      display: "flex",
      gap: "9px",
      alignItems: "flex-start",
      marginBottom: "16px"
    });

    reply.innerHTML = `
      <div style="
        width:30px;
        height:30px;
        border-radius:10px;
        background:${accentColor};
        color:#03130a;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:13px;
        font-weight:900;
        flex:0 0 auto;
      ">Y</div>

      <div style="
        max-width:82%;
        padding:11px 14px;
        background:#111827;
        border:1px solid rgba(148,163,184,.12);
        border-radius:5px 15px 15px 15px;
        color:#cbd5e1;
        font-size:13px;
        line-height:1.5;
      ">${html}</div>
    `;

    messages.appendChild(reply);
    messages.scrollTop = messages.scrollHeight;
  }

  /* =========================
     MESSAGE FORM
  ========================= */

  const input =
    panel.querySelector("#youyou-input");

  const messages =
    panel.querySelector("#youyou-messages");

  panel
    .querySelector("#youyou-form")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const text =
          input.value.trim();

        if (!text) return;

        /* Show customer message */

        const customerMessage =
          document.createElement("div");

        Object.assign(
          customerMessage.style,
          {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px"
          }
        );

        customerMessage.innerHTML = `
          <div style="
            max-width:78%;
            padding:11px 14px;
            background:${accentColor};
            color:#03130a;
            border-radius:15px 5px 15px 15px;
            font-size:13px;
            line-height:1.5;
          ">
            ${escapeHtml(text)}
          </div>
        `;

        messages.appendChild(
          customerMessage
        );

        input.value = "";

        messages.scrollTop =
          messages.scrollHeight;

        /* =========================
           SUPABASE
        ========================= */

        if (!companyId) {
          console.warn(
            "YOUYOU: company ID missing. Message displayed locally only."
          );
        } else {
          try {
            await saveVisitorMessage(text);
          } catch (error) {
            console.error("YOUYOU Supabase error:", error);
          }
        }

        /* =========================
           LOCAL SMART REPLY
           AI integration intentionally deferred
        ========================= */

        const score = scoreLocalIntent(text);

        if (capturedContact) {
          appendAgentBubble(
            "Thank you — I’ve captured your contact details. A member of the team can follow up with you."
          );
        } else if (score >= 70 && !contactPromptShown) {
          contactPromptShown = true;

          appendAgentBubble(
            "It looks like you’re seriously interested. Would you like the team to contact you? Please share your <strong>email address or phone number</strong>."
          );
        } else {
          appendAgentBubble(
            "Thanks for your message. I’m currently collecting your request for the team. Full AI responses will be activated soon."
          );
        }

      }
    );

  /* =========================
     ESCAPE HTML
  ========================= */

  function escapeHtml(value) {

    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );
  }

  console.log(
    "YOUYOU widget loaded",
    {
      companyId:
        companyId || "missing"
    }
  );

})();
