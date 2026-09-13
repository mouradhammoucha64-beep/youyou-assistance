(function () {
  "use strict";

  const FALLBACK = "I’m sorry, I can’t answer that right now. Your message has been saved for the team, so please try again shortly.";

  function localFallback(page, question) {
    const lower = String(question || "").toLowerCase();
    const price = page.querySelector(".lp-live-price strong")?.textContent?.trim();
    const benefits = [...page.querySelectorAll(".lp-live-benefit-grid strong,.beauty-benefits h3")]
      .map((item) => item.textContent.trim())
      .filter(Boolean);
    const cta = page.querySelector(".lp-live-primary")?.textContent?.trim();
    if (/price|cost|how much|prix|combien|ch7al/.test(lower) && price) {
      return `The current price shown on this page is ${price}.`;
    }
    if (/benefit|why|feature|advantage/.test(lower) && benefits.length) {
      return `Main benefits: ${benefits.join(" · ")}.`;
    }
    if (/start|book|buy|order|contact|reserve|appointment/.test(lower) && cta) {
      return `The next step is “${cta}”. Use the main button to continue.`;
    }
    return FALLBACK;
  }

  function addBubble(messages, type, text) {
    const bubble = document.createElement("div");
    bubble.className = `lp-ai-msg ${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  window.youyouLandingAsk = async function youyouLandingAsk(source, forcedQuestion) {
    const widget = source?.closest?.("[data-lp-widget]");
    const page = source?.closest?.(".lp-live-page") || document.querySelector(".lp-live-page");
    if (!widget || !page || widget.dataset.aiSending === "true") return;
    widget.classList.add("is-open");

    const input = widget.querySelector(".lp-ai-form input");
    const submit = widget.querySelector('.lp-ai-form button[type="submit"]');
    const question = String(forcedQuestion || input?.value || "").trim().slice(0, 1_200);
    if (!question) return;
    const messages = widget.querySelector("[data-lp-widget-messages]");
    if (!messages) return;

    addBubble(messages, "user", question);
    if (input) input.value = "";
    const waiting = addBubble(messages, "bot", "Thinking…");
    widget.dataset.aiSending = "true";
    if (input) input.disabled = true;
    if (submit) submit.disabled = true;

    try {
      const persist = typeof window.yyPersist === "function" ? window.yyPersist : null;
      const stored = persist ? await persist(page, question) : { ok: false };
      if (!stored?.conversationId) throw new Error("Conversation could not be saved.");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: page.dataset.companyId || "",
          conversationId: stored.conversationId,
          slug: page.dataset.pageSlug || "",
          message: question,
          source: "published_landing_page",
        }),
      });
      const result = await response.json().catch(() => ({}));
      waiting.textContent = result.reply || localFallback(page, question);
    } catch (_) {
      waiting.textContent = localFallback(page, question);
    } finally {
      widget.dataset.aiSending = "false";
      if (input) input.disabled = false;
      if (submit) submit.disabled = false;
      input?.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  };
})();
