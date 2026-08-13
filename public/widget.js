(function () {
  "use strict";

  const script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"]');

  const companyId =
    script?.getAttribute("data-company") || "";

  const button = document.createElement("button");

  button.innerHTML = "Y";

  Object.assign(button.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "none",
    background: "#22c55e",
    color: "#06130a",
    fontSize: "22px",
    fontWeight: "800",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow: "0 10px 30px rgba(0,0,0,.30)"
  });

  const panel = document.createElement("div");

  Object.assign(panel.style, {
    position: "fixed",
    right: "24px",
    bottom: "94px",
    width: "360px",
    maxWidth: "calc(100vw - 32px)",
    height: "520px",
    maxHeight: "calc(100vh - 120px)",
    background: "#0b1220",
    border: "1px solid #263244",
    borderRadius: "20px",
    overflow: "hidden",
    zIndex: "999998",
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    display: "none",
    fontFamily: "Arial, sans-serif"
  });

  panel.innerHTML = `
    <div style="
      height:64px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:0 18px;
      background:#111827;
      border-bottom:1px solid #263244;
      color:#fff;
    ">
      <div>
        <strong style="display:block;font-size:15px;">
          YOUYOU AI
        </strong>

        <span style="
          font-size:12px;
          color:#22c55e;
        ">
          ● Online now
        </span>
      </div>

      <button
        id="youyou-close"
        style="
          border:none;
          background:transparent;
          color:#94a3b8;
          font-size:22px;
          cursor:pointer;
        "
      >
        ×
      </button>
    </div>

    <div
      id="youyou-messages"
      style="
        height:calc(100% - 124px);
        padding:18px;
        overflow-y:auto;
        box-sizing:border-box;
        color:#fff;
      "
    >
      <div style="
        background:#111827;
        border:1px solid #263244;
        border-radius:14px;
        padding:12px 14px;
        margin-bottom:12px;
        line-height:1.5;
        font-size:14px;
      ">
        Hi! 👋 I'm your YOUYOU AI agent.
        How can I help you today?
      </div>
    </div>

    <form
      id="youyou-form"
      style="
        height:60px;
        display:flex;
        gap:8px;
        padding:10px;
        box-sizing:border-box;
        border-top:1px solid #263244;
        background:#111827;
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
          border:1px solid #263244;
          border-radius:12px;
          background:#0b1220;
          color:#fff;
          padding:0 12px;
          outline:none;
        "
      />

      <button
        type="submit"
        style="
          width:42px;
          border:none;
          border-radius:12px;
          background:#22c55e;
          color:#06130a;
          font-size:18px;
          font-weight:800;
          cursor:pointer;
        "
      >
        ↑
      </button>
    </form>
  `;

  document.body.appendChild(button);
  document.body.appendChild(panel);

  button.addEventListener("click", function () {
    panel.style.display =
      panel.style.display === "none" ? "block" : "none";
  });

  panel
    .querySelector("#youyou-close")
    .addEventListener("click", function () {
      panel.style.display = "none";
    });

  panel
    .querySelector("#youyou-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const input =
        panel.querySelector("#youyou-input");

      const messages =
        panel.querySelector("#youyou-messages");

      const text = input.value.trim();

      if (!text) return;

      const customerMessage =
        document.createElement("div");

      Object.assign(customerMessage.style, {
        background: "#22c55e",
        color: "#06130a",
        borderRadius: "14px",
        padding: "10px 14px",
        marginBottom: "12px",
        marginLeft: "35px",
        fontSize: "14px",
        lineHeight: "1.5"
      });

      customerMessage.textContent = text;

      messages.appendChild(customerMessage);

      input.value = "";

      const reply =
        document.createElement("div");

      Object.assign(reply.style, {
        background: "#111827",
        border: "1px solid #263244",
        color: "#fff",
        borderRadius: "14px",
        padding: "10px 14px",
        marginBottom: "12px",
        marginRight: "35px",
        fontSize: "14px",
        lineHeight: "1.5"
      });

      reply.textContent =
        "Thanks for your message. Our AI agent will be connected here.";

      messages.appendChild(reply);

      messages.scrollTop = messages.scrollHeight;
    });

  console.log(
    "YOUYOU widget loaded",
    companyId
  );
})();

