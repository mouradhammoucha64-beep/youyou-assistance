(function () {
  "use strict";

  const script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]');

  const companyId =
    script?.getAttribute("data-company") || "";

  /* =========================
     FLOATING BUTTON
  ========================= */

 const button = document.createElement("button");

button.setAttribute("aria-label", "Open YOUYOU AI chat");

button.innerHTML = `
  <span style="
    position:relative;
    width:34px;
    height:28px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#06130a;
    border-radius:10px;
    box-shadow:0 4px 12px rgba(0,0,0,.25);
  ">
    <span style="
      color:#22c55e;
      font-family:Arial,sans-serif;
      font-size:15px;
      font-weight:900;
      line-height:1;
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
  borderRadius: "50%",
  border: "1px solid rgba(34,197,94,.45)",
  background: "linear-gradient(145deg,#22c55e,#16a34a)",
  color: "#03130a",
  cursor: "pointer",
  zIndex: "999999",
  boxShadow:
    "0 12px 35px rgba(34,197,94,.28), 0 8px 25px rgba(0,0,0,.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0",
  transition: "transform .2s ease, box-shadow .2s ease"
});

button.addEventListener("mouseenter", () => {
  button.style.transform = "translateY(-3px) scale(1.05)";
  button.style.boxShadow =
    "0 16px 42px rgba(34,197,94,.42), 0 10px 30px rgba(0,0,0,.4)";
});

button.addEventListener("mouseleave", () => {
  button.style.transform = "translateY(0) scale(1)";
  button.style.boxShadow =
    "0 12px 35px rgba(34,197,94,.28), 0 8px 25px rgba(0,0,0,.35)";
});

const animationStyle = document.createElement("style");

animationStyle.textContent = `
  @keyframes youyouPulse {
    0%, 100% {
      box-shadow:
        0 12px 35px rgba(34,197,94,.28),
        0 8px 25px rgba(0,0,0,.35);
    }

    50% {
      box-shadow:
        0 12px 40px rgba(34,197,94,.48),
        0 0 0 7px rgba(34,197,94,.07),
        0 8px 25px rgba(0,0,0,.35);
    }
  }
`;

document.head.appendChild(animationStyle);

button.style.animation =
  "youyouPulse 2.8s ease-in-out infinite";
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
      "0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(34,197,94,.04)",
    display: "none",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#fff",
    opacity: "0",
    transform:
      "translateY(12px) scale(.97)",
    transition:
      "opacity .2s ease, transform .2s ease"
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
          box-shadow:
            0 7px 20px rgba(34,197,94,.20);
        ">
          Y
        </div>

        <div>
          <div style="
            font-size:14px;
            font-weight:800;
            letter-spacing:-.2px;
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
              box-shadow:0 0 8px rgba(34,197,94,.7);
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
          display:flex;
          align-items:center;
          justify-content:center;
          transition:.2s;
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
        background:
          radial-gradient(
            circle at 50% 0%,
            rgba(34,197,94,.035),
            transparent 45%
          );
      "
    >

      <div style="
        text-align:center;
        margin:4px 0 20px;
      ">
        <div style="
          font-size:11px;
          color:#64748b;
          text-transform:uppercase;
          letter-spacing:1px;
          font-weight:700;
        ">
          AI CUSTOMER AGENT
        </div>
      </div>

      <div style="
        display:flex;
        gap:9px;
        align-items:flex-start;
        margin-bottom:16px;
      ">

        <div style="
          flex-shrink:0;
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
          box-shadow:0 6px 18px rgba(0,0,0,.12);
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
          transition:border .2s, box-shadow .2s;
        "
      />

      <button
        type="submit"
        aria-label="Send message"
        style="
          width:44px;
          height:44px;
          flex-shrink:0;
          border:none;
          border-radius:13px;
          background:#22c55e;
          color:#03130a;
          font-size:18px;
          font-weight:900;
          cursor:pointer;
          box-shadow:
            0 7px 18px rgba(34,197,94,.18);
          transition:.2s;
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

    requestAnimationFrame(() => {
      panel.style.opacity = "1";
      panel.style.transform =
        "translateY(0) scale(1)";
    });
  }

  function closePanel() {
    panel.style.opacity = "0";
    panel.style.transform =
      "translateY(12px) scale(.97)";

    setTimeout(() => {
      panel.style.display = "none";
    }, 200);
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
    .addEventListener("click", closePanel);

  /* =========================
     INPUT EFFECTS
  ========================= */

  const input =
    panel.querySelector("#youyou-input");

  input.addEventListener("focus", () => {
    input.style.borderColor =
      "rgba(34,197,94,.55)";

    input.style.boxShadow =
      "0 0 0 3px rgba(34,197,94,.08)";
  });

  input.addEventListener("blur", () => {
    input.style.borderColor =
      "rgba(148,163,184,.16)";

    input.style.boxShadow = "none";
  });

  /* =========================
     MESSAGES
  ========================= */

  panel
    .querySelector("#youyou-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const messages =
        panel.querySelector("#youyou-messages");

      const text = input.value.trim();

      if (!text) return;

      const customerMessage =
        document.createElement("div");

      Object.assign(customerMessage.style, {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px"
      });

      customerMessage.innerHTML = `
        <div style="
          max-width:78%;
          padding:11px 14px;
          background:#22c55e;
          color:#03130a;
          border-radius:15px 5px 15px 15px;
          font-size:13px;
          line-height:1.5;
          font-weight:500;
          box-shadow:
            0 6px 18px rgba(34,197,94,.12);
        ">
          ${escapeHtml(text)}
        </div>
      `;

      messages.appendChild(customerMessage);

      input.value = "";

      const reply =
        document.createElement("div");

      Object.assign(reply.style, {
        display: "flex",
        gap: "9px",
        alignItems: "flex-start",
        marginBottom: "16px"
      });

      reply.innerHTML = `
        <div style="
          flex-shrink:0;
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
    });

  /* =========================
     ESCAPE HTML
  ========================= */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================
     MOBILE
  ========================= */

  const mobileStyle =
    document.createElement("style");

  mobileStyle.textContent = `
    @media (max-width: 600px) {
      .youyou-mobile-panel {
        right: 10px !important;
        left: 10px !important;
        bottom: 82px !important;
        width: auto !important;
        height: calc(100vh - 105px) !important;
        max-height: none !important;
        border-radius: 20px !important;
      }
    }
  `;

  document.head.appendChild(mobileStyle);

  panel.classList.add(
    "youyou-mobile-panel"
  );

  console.log(
    "YOUYOU widget loaded",
    companyId
  );
})();
