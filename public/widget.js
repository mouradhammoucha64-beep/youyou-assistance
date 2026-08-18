(function () {
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
        color:#22c55e;
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
        background:#22c55e;
        border:2px solid #06130a;
      "></span>
    </span>
  `;

  Object.assign(button.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    border: "1px solid rgba(34,197,94,.45)",
    background:
      "linear-gradient(145deg,#22c55e,#16a34a)",
    color: "#03130a",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow:
      "0 12px 35px rgba(34,197,94,.28), 0 8px 25px rgba(0,0,0,.35)",
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
      "0 16px 42px rgba(34,197,94,.38), 0 10px 30px rgba(0,0,0,.4)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform =
      "translateY(0) scale(1)";

    button.style.boxShadow =
      "0 12px 35px rgba(34,197,94,.28), 0 8px 25px rgba(0,0,0,.35)";
  });

  /* =========================
     CHAT PANEL
  ========================= */

  const panel = document.createElement("div");

  Object.assign(panel.style, {
    position: "fixed",
    right: "24px",
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
            linear-gradient(145deg,#22c55e,#16a34a);
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
              background:#22c55e;
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
          background:#22c55e;
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
          Hi! 👋 I'm your YOUYOU AI agent.
          <br><br>
          How can I help you today?
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
          background:#22c55e;
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
            background:#22c55e;
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
           TEMPORARY AI REPLY
        ========================= */

        const reply =
          document.createElement("div");

        Object.assign(
          reply.style,
          {
            display: "flex",
            gap: "9px",
            alignItems: "flex-start",
            marginBottom: "16px"
          }
        );

        reply.innerHTML = `
          <div style="
            width:30px;
            height:30px;
            border-radius:10px;
            background:#22c55e;
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
            padding:11px 14px;
            background:#111827;
            border:1px solid rgba(148,163,184,.12);
            border-radius:5px 15px 15px 15px;
            color:#cbd5e1;
            font-size:13px;
            line-height:1.5;
          ">
            Thanks for your message.
            Our AI agent will be connected here.
          </div>
        `;

        messages.appendChild(reply);

        messages.scrollTop =
          messages.scrollHeight;

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
