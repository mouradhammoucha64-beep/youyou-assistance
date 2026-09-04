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
  studio: "/dashboard/ai-studio",
  pages: "/dashboard/landing-pages",
  seo: "/dashboard/seo-growth",
  rescue: "/dashboard/revenue-rescue",
  whatsapp: "/dashboard/whatsapp-ai",
  settings: "/dashboard/settings",
  billing: "/dashboard/billing",
};

function sectionFromPath(pathname = window.location.pathname) {
  if (
    pathname === "/dashboard/landing-pages/new" ||
    /^\/dashboard\/landing-pages\/edit\/[^/]+$/.test(pathname)
  ) {
    return "pages-builder";
  }

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
   PUBLIC SITE LANGUAGE
   EN / FR / AR
========================= */

const PUBLIC_SITE_LANGUAGES = ["en", "fr", "ar"];

function getPublicSiteLanguage() {
  const saved = localStorage.getItem("youyou-public-language");
  return PUBLIC_SITE_LANGUAGES.includes(saved) ? saved : "en";
}

function setPublicSiteLanguage(language) {
  const next = PUBLIC_SITE_LANGUAGES.includes(language) ? language : "en";
  localStorage.setItem("youyou-public-language", next);
  applyPublicSiteLanguage(next);
}

const PUBLIC_SITE_COPY = {
  en: {
    features:"Features", how:"How it works", pricing:"Pricing", faq:"FAQ", login:"Log in", start:"Start free",
    dashboard:"Open dashboard", billing:"Plans & billing", plans:"View plans",
    heroEyebrow:"AI GROWTH PLATFORM",
    heroTitle:'Turn more visitors into <span>customers and growth.</span>',
    heroText:"YOUYOU brings AI conversations, SEO growth, Revenue Rescue, WhatsApp AI, AI Studio and campaign landing pages into one focused workspace for modern businesses.",
    trust1:"✓ No credit card required", trust2:"✓ Setup in minutes", trust3:"✓ Available 24/7",
    always:"AI conversations", engines:"Connected growth tools", workspace:"Landing templates", conversion:"Unified workspace",
    platformEyebrow:"YOUYOU PLATFORM",
    platformTitle:'Growth tools that <span>work together.</span>',
    platformText:"Get discovered, create campaigns, convert visitors, keep valuable leads moving and continue conversations on WhatsApp — from one connected workspace.",
    why:"WHY YOUYOU", whyTitle:'One platform. <span>More ways to grow.</span>',
    whyText:"Bring customer conversations, content creation, landing pages and growth workflows into one place.",
    howEyebrow:"HOW IT WORKS", howTitle:'From idea to <span>campaign, lead and follow-up.</span>',
    lpEyebrow:"SMART LANDING PAGES", lpTitle:'Send every ad click to <span>a page built to convert.</span>',
    lpText:"Choose a professional template, add your product or service, connect WhatsApp or lead capture, then publish a focused campaign page.",
    lpCta:"Explore landing pages →", lpBadge1:"30 templates", lpBadge2:"Live editor", lpBadge3:"WhatsApp ready",
    pricingEyebrow:"SIMPLE MONTHLY PRICING", pricingTitle:'Start with AI. <span>Upgrade when growth matters.</span>',
    pricingText:"Three clear plans. No annual commitment. Start free and choose the level that fits your business when you're ready.",
    ready:"READY TO GROW?", finalTitle:'One platform to <span>create, convert and grow.</span>',
    finalText:"Start with your website AI, then unlock SEO growth, AI Studio, landing pages, Revenue Rescue and WhatsApp AI as your business grows.",
    create:"Create your free account →", footer:"AI Growth Platform for modern businesses.", copyright:"© 2026 YOUYOU. All rights reserved."
  },
  fr: {
    features:"Fonctionnalités", how:"Comment ça marche", pricing:"Tarifs", faq:"FAQ", login:"Connexion", start:"Commencer gratuitement",
    dashboard:"Ouvrir le tableau de bord", billing:"Offres et facturation", plans:"Voir les offres",
    heroEyebrow:"PLATEFORME DE CROISSANCE IA",
    heroTitle:'Transformez plus de visiteurs en <span>clients et en croissance.</span>',
    heroText:"YOUYOU réunit conversations IA, croissance SEO, Revenue Rescue, WhatsApp AI, AI Studio et pages de campagne dans un seul espace de travail.",
    trust1:"✓ Sans carte bancaire", trust2:"✓ Configuration en quelques minutes", trust3:"✓ Disponible 24/7",
    always:"Conversations IA", engines:"Outils de croissance connectés", workspace:"Modèles de landing page", conversion:"Espace unifié",
    platformEyebrow:"PLATEFORME YOUYOU", platformTitle:'Des outils de croissance qui <span>travaillent ensemble.</span>',
    platformText:"Soyez trouvé, créez vos campagnes, convertissez les visiteurs, relancez les prospects et poursuivez la conversation sur WhatsApp depuis un seul espace.",
    why:"POURQUOI YOUYOU", whyTitle:'Une plateforme. <span>Plus de façons de grandir.</span>',
    whyText:"Centralisez conversations clients, création de contenu, landing pages et workflows de croissance.",
    howEyebrow:"COMMENT ÇA MARCHE", howTitle:'De l’idée à <span>la campagne, au prospect et au suivi.</span>',
    lpEyebrow:"LANDING PAGES INTELLIGENTES", lpTitle:'Envoyez chaque clic publicitaire vers <span>une page conçue pour convertir.</span>',
    lpText:"Choisissez un modèle professionnel, ajoutez votre produit ou service, connectez WhatsApp ou un formulaire, puis préparez une page de campagne ciblée.",
    lpCta:"Découvrir les landing pages →", lpBadge1:"30 modèles", lpBadge2:"Éditeur en direct", lpBadge3:"WhatsApp prêt",
    pricingEyebrow:"TARIFICATION MENSUELLE SIMPLE", pricingTitle:'Commencez avec l’IA. <span>Passez au niveau supérieur quand la croissance compte.</span>',
    pricingText:"Trois offres claires, sans engagement annuel. Commencez gratuitement puis choisissez l’offre adaptée à votre entreprise.",
    ready:"PRÊT À GRANDIR ?", finalTitle:'Une plateforme pour <span>créer, convertir et grandir.</span>',
    finalText:"Commencez avec l’IA de votre site, puis activez le SEO, AI Studio, les landing pages, Revenue Rescue et WhatsApp AI selon votre croissance.",
    create:"Créer mon compte gratuit →", footer:"Plateforme de croissance IA pour les entreprises modernes.", copyright:"© 2026 YOUYOU. Tous droits réservés."
  },
  ar: {
    features:"المزايا", how:"كيف يعمل", pricing:"الأسعار", faq:"الأسئلة الشائعة", login:"تسجيل الدخول", start:"ابدأ مجاناً",
    dashboard:"فتح لوحة التحكم", billing:"الباقات والفوترة", plans:"عرض الباقات",
    heroEyebrow:"منصة نمو بالذكاء الاصطناعي",
    heroTitle:'حوّل المزيد من الزوار إلى <span>عملاء ونمو حقيقي.</span>',
    heroText:"تجمع YOUYOU محادثات الذكاء الاصطناعي، ونمو SEO، واسترجاع العملاء، وواتساب، وAI Studio، وصفحات الحملات في مساحة عمل واحدة.",
    trust1:"✓ بدون بطاقة بنكية", trust2:"✓ إعداد خلال دقائق", trust3:"✓ متاح 24/7",
    always:"محادثات ذكية", engines:"أدوات نمو مترابطة", workspace:"قوالب صفحات هبوط", conversion:"مساحة عمل موحدة",
    platformEyebrow:"منصة YOUYOU", platformTitle:'أدوات نمو <span>تعمل معاً.</span>',
    platformText:"ساعد نشاطك على الظهور، وأنشئ الحملات، وحوّل الزوار إلى عملاء، وتابع الفرص المهمة، وواصل المحادثة عبر واتساب من مكان واحد.",
    why:"لماذا YOUYOU", whyTitle:'منصة واحدة. <span>طرق أكثر للنمو.</span>',
    whyText:"اجمع محادثات العملاء وصناعة المحتوى وصفحات الهبوط وعمليات النمو في مكان واحد.",
    howEyebrow:"كيف يعمل", howTitle:'من الفكرة إلى <span>الحملة والعميل والمتابعة.</span>',
    lpEyebrow:"صفحات هبوط ذكية", lpTitle:'وجّه كل نقرة إعلانية إلى <span>صفحة مصممة للتحويل.</span>',
    lpText:"اختر قالباً احترافياً، أضف منتجك أو خدمتك، اربط واتساب أو نموذج العملاء، ثم جهّز صفحة حملة مركزة.",
    lpCta:"استكشف صفحات الهبوط ←", lpBadge1:"30 قالباً", lpBadge2:"محرر مباشر", lpBadge3:"جاهز لواتساب",
    pricingEyebrow:"أسعار شهرية واضحة", pricingTitle:'ابدأ بالذكاء الاصطناعي. <span>وطوّر باقتك عندما يحتاج نموك.</span>',
    pricingText:"ثلاث باقات واضحة دون التزام سنوي. ابدأ مجاناً واختر المستوى المناسب لنشاطك عندما تكون جاهزاً.",
    ready:"جاهز للنمو؟", finalTitle:'منصة واحدة من أجل <span>الإنشاء والتحويل والنمو.</span>',
    finalText:"ابدأ بذكاء موقعك، ثم فعّل SEO وAI Studio وصفحات الهبوط وRevenue Rescue وWhatsApp AI مع نمو نشاطك.",
    create:"أنشئ حسابك المجاني ←", footer:"منصة نمو بالذكاء الاصطناعي للأعمال الحديثة.", copyright:"© 2026 YOUYOU. جميع الحقوق محفوظة."
  }
};

function applyPublicSiteLanguage(language = getPublicSiteLanguage()) {
  const copy = PUBLIC_SITE_COPY[language] || PUBLIC_SITE_COPY.en;
  const landing = document.querySelector(".landing:not(.faq-page)");
  if (!landing) return;

  landing.dataset.siteLanguage = language;
  landing.dir = language === "ar" ? "rtl" : "ltr";
  landing.lang = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  const setText = (selector, value) => { const el = landing.querySelector(selector); if (el) el.textContent = value; };
  const setHtml = (selector, value) => { const el = landing.querySelector(selector); if (el) el.innerHTML = value; };

  const navLinks = landing.querySelectorAll(".landing-links a");
  if (navLinks[0]) navLinks[0].textContent = copy.features;
  if (navLinks[1]) navLinks[1].textContent = copy.how;
  if (navLinks[2]) navLinks[2].textContent = copy.pricing;
  if (navLinks[3]) navLinks[3].textContent = copy.faq;

  setText("#nav-login", copy.login); setText("#nav-start", copy.start);
  setText("#nav-dashboard", copy.dashboard); setText("#nav-billing", copy.billing);
  setText("#hero-login", copy.login); setText("#hero-pricing", copy.plans);
  const heroStart = landing.querySelector("#hero-start"); if (heroStart) heroStart.innerHTML = `${copy.start} <span>→</span>`;
  const heroDashboard = landing.querySelector("#hero-dashboard"); if (heroDashboard) heroDashboard.innerHTML = `${copy.dashboard} <span>→</span>`;

  setText(".hero-copy .eyebrow", copy.heroEyebrow); setHtml(".hero-copy h1", copy.heroTitle); setText(".hero-text", copy.heroText);
  const trust = landing.querySelectorAll(".trust span"); [copy.trust1,copy.trust2,copy.trust3].forEach((v,i)=>{ if(trust[i]) trust[i].textContent=v; });
  const stats = landing.querySelectorAll(".stats-section span"); [copy.always,copy.engines,copy.workspace,copy.conversion].forEach((v,i)=>{if(stats[i])stats[i].textContent=v;});

  setText(".growth-platform-copy .eyebrow", copy.platformEyebrow); setHtml(".growth-platform-copy h2", copy.platformTitle); setText(".growth-platform-copy > p", copy.platformText);
  setText("#features .section-heading .eyebrow", copy.why); setHtml("#features .section-heading h2", copy.whyTitle); setText("#features .section-heading > p", copy.whyText);
  setText("#how .section-heading .eyebrow", copy.howEyebrow); setHtml("#how .section-heading h2", copy.howTitle);

  setText(".landing-pages-showcase .eyebrow", copy.lpEyebrow); setHtml(".landing-pages-showcase h2", copy.lpTitle); setText(".landing-pages-showcase .landing-pages-showcase-copy > p", copy.lpText);
  setText("#landing-pages-showcase-cta", copy.lpCta);
  const lpBadges = landing.querySelectorAll(".landing-pages-showcase-badges span"); [copy.lpBadge1,copy.lpBadge2,copy.lpBadge3].forEach((v,i)=>{if(lpBadges[i])lpBadges[i].textContent=v;});

  setText(".pricing-heading .eyebrow", copy.pricingEyebrow); setHtml(".pricing-heading h2", copy.pricingTitle); setText(".pricing-heading > p", copy.pricingText);
  setText(".final-cta .eyebrow", copy.ready); setHtml(".final-cta h2", copy.finalTitle); setText(".final-cta > p", copy.finalText); setText("#final-start", copy.create);
  setText(".footer-brand p", copy.footer); setText(".copyright", copy.copyright);
  setText("#footer-login", copy.login);
  const footerLinks = landing.querySelectorAll(".footer-links a"); if(footerLinks[0])footerLinks[0].textContent=copy.features; if(footerLinks[1])footerLinks[1].textContent=copy.how; if(footerLinks[2])footerLinks[2].textContent=copy.pricing;

  landing.querySelectorAll("[data-public-language]").forEach((button)=>button.classList.toggle("is-active", button.dataset.publicLanguage===language));
}

/* =========================
   LANDING PAGE
========================= */

function renderLanding() {
  app.innerHTML = `
    <div class="landing">

      <header class="landing-nav">
        <a class="logo brand-home-link" href="/" aria-label="YOUYOU home">
          <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
</span>
        </a>

        <nav class="landing-links">
          <a href="/" data-scroll-section="features">Features</a>
          <a href="/" data-scroll-section="how">How it works</a>
          <a href="/" data-scroll-section="pricing">Pricing</a>
          <a href="/faq">FAQ</a>
        </nav>

        <div class="nav-actions">
          <div class="public-language-switch" aria-label="Website language">
            <button type="button" data-public-language="en">EN</button>
            <button type="button" data-public-language="fr">FR</button>
            <button type="button" data-public-language="ar">AR</button>
          </div>
          ${state.user
            ? `<button id="nav-dashboard" class="nav-login">Open dashboard</button>
               <button id="nav-billing" class="primary small">Plans & billing</button>`
            : `<button id="nav-login" class="nav-login">Log in</button>
               <button id="nav-start" class="primary small">Start free</button>`}
        </div>
      </header>

      <main>

        <section class="hero-v500">
          <div class="hero-v500-bg" aria-hidden="true"></div>

          <div class="hero-v500-copy">
            <div class="hero-v500-badge"><span>✦</span> ALL-IN-ONE AI GROWTH WORKSPACE</div>
            <h1>Turn one idea into a <span>campaign, landing page and qualified lead.</span></h1>
            <p>YOUYOU connects AI Studio, Smart Landing Pages, SEO Growth, Conversations, Revenue Rescue and WhatsApp AI in one clear workflow — from attention to follow-up.</p>

            <div class="hero-v500-actions">
              ${state.user
                ? `<button id="hero-dashboard" class="hero-v500-primary">Open dashboard <span>→</span></button>
                   <button id="hero-pricing" class="hero-v500-secondary">View plans</button>`
                : `<button id="hero-start" class="hero-v500-primary">Start free <span>→</span></button>
                   <button id="hero-login" class="hero-v500-secondary">See how it works <span class="play-dot">▶</span></button>`}
            </div>

            <div class="hero-v500-trust">
              <span>✓ No credit card required</span>
              <span>✓ No confusing credit packs</span>
              <span>✓ One connected workspace</span>
            </div>
          </div>

          <div class="hero-v500-product" aria-label="YOUYOU product workflow preview">
            <div class="product-frame-v500">
              <div class="product-top-v500">
                <div class="product-logo-v500">
                  <span class="product-logo-mark-v500"><i></i><b></b></span>
                  <strong>YOUYOU</strong>
                </div>
                <div class="product-welcome-v500">
                  <strong>Welcome back 👋</strong>
                  <small>Here’s what’s happening with your growth today.</small>
                </div>
                <div class="product-status-v500"><i></i> LIVE</div>
              </div>

              <div class="product-body-v500">
                <aside class="product-side-v500">
                  <span class="active"><i>⌂</i> Home</span>
                  <span><i>✦</i> AI Studio</span>
                  <span><i>▣</i> Landing Pages</span>
                  <span><i>◌</i> Conversations</span>
                  <span><i>◎</i> Leads</span>
                  <span><i>↗</i> SEO Growth</span>
                  <span><i>↻</i> Revenue Rescue</span>
                </aside>

                <div class="product-main-v500">
                  <div class="product-kpis-v500">
                    <article><small>Visitors</small><strong>24,358</strong><em>↗ 12.5%</em></article>
                    <article><small>Leads</small><strong>1,842</strong><em>↗ 18.7%</em></article>
                    <article><small>Conversion</small><strong>7.56%</strong><em>↗ 2.3%</em></article>
                    <article><small>Revenue</small><strong>$18,642</strong><em>↗ 21.4%</em></article>
                  </div>

                  <section class="product-studio-v500">
                    <div class="product-section-title-v500">
                      <div><small>AI STUDIO</small><strong>Create for the platforms your customers use.</strong></div>
                      <span>Campaign ready</span>
                    </div>
                    <div class="platform-row-v500">
                      <div class="p-meta"><span>∞</span><small>Meta</small></div>
                      <div class="p-facebook"><span>f</span><small>Facebook</small></div>
                      <div class="p-instagram"><span class="ig-glyph-v500"></span><small>Instagram</small></div>
                      <div class="p-tiktok"><span>♪</span><small>TikTok</small></div>
                      <div class="p-youtube"><span>▶</span><small>YouTube</small></div>
                      <div class="p-linkedin"><span>in</span><small>LinkedIn</small></div>
                      <div class="p-x"><span>𝕏</span><small>X</small></div>
                    </div>
                  </section>

                  <section class="product-flow-v500">
                    <div class="flow-line-v500" aria-hidden="true"><i></i></div>
                    <article class="flow-step-v500 step-1"><b>1</b><small>IDEA</small><strong>Your business goal</strong></article>
                    <article class="flow-step-v500 step-2"><b>2</b><small>CAMPAIGN</small><strong>AI creates the ad</strong></article>
                    <article class="flow-step-v500 step-3"><b>3</b><small>LANDING PAGE</small><strong>Focused conversion page</strong></article>
                    <article class="flow-step-v500 step-4"><b>4</b><small>LEAD</small><strong>Intent captured</strong></article>
                    <article class="flow-step-v500 step-5"><b>5</b><small>FOLLOW-UP</small><strong>WhatsApp / Rescue</strong></article>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-v500-platforms" aria-label="Supported campaign destinations">
            <span class="platform-label-v500">CREATE FOR</span>
            <span class="logo-meta-v500"><b>∞</b> Meta</span>
            <span class="logo-facebook-v500"><b>f</b> Facebook</span>
            <span class="logo-instagram-v500"><b class="ig-mini-v500"></b> Instagram</span>
            <span class="logo-tiktok-v500"><b>♪</b> TikTok</span>
            <span class="logo-youtube-v500"><b>▶</b> YouTube</span>
            <span class="logo-linkedin-v500"><b>in</b> LinkedIn</span>
            <span class="logo-x-v500"><b>𝕏</b></span>
          </div>
        </section>

        <section class="stats-section stats-live-strip stats-compact-v426 proof-strip-v427" aria-label="What YOUYOU helps you do">
          <div class="stat-live-item"><strong>CREATE</strong><span>campaigns and content with AI Studio</span></div>
          <div class="stat-live-item"><strong>LAUNCH</strong><span>focused landing pages for each offer</span></div>
          <div class="stat-live-item"><strong>CAPTURE</strong><span>visitor intent and qualified leads</span></div>
          <div class="stat-live-item"><strong>FOLLOW UP</strong><span>keep valuable opportunities moving</span></div>
        </section>



        <section id="how" class="section how-section how-growth-flow how-v426">
          <div class="section-heading">
            <div class="eyebrow">ONE CONNECTED FLOW</div>
            <h2>Build the campaign. Launch the page. <span>Capture the lead. Follow up.</span></h2>
            <p>YOUYOU connects the steps after the click, so attention has somewhere useful to go.</p>
          </div>

          <div class="journey-track-v426">
            <div class="journey-progress-v426" aria-hidden="true"><i></i></div>

            <article class="journey-step-v426">
              <span>01</span><b>✦</b>
              <small>CREATE</small>
              <h3>Shape the campaign</h3>
              <p>Use AI Studio for the hook, ad, social content, email and campaign message.</p>
            </article>

            <article class="journey-step-v426">
              <span>02</span><b>▦</b>
              <small>LAUNCH</small>
              <h3>Build the conversion page</h3>
              <p>Send the click to a focused landing page with Buy, Book, Lead or WhatsApp actions.</p>
            </article>

            <article class="journey-step-v426">
              <span>03</span><b>◌</b>
              <small>CONVERT</small>
              <h3>Capture real intent</h3>
              <p>Website AI answers questions, identifies intent and turns interest into a qualified lead.</p>
            </article>

            <article class="journey-step-v426">
              <span>04</span><b>↻</b>
              <small>KEEP MOVING</small>
              <h3>Follow up before intent fades</h3>
              <p>Revenue Rescue and WhatsApp keep the opportunity visible and ready for the next action.</p>
            </article>
          </div>
        </section>

        <section class="industry-marquee-v426" aria-label="Example businesses that can use YOUYOU">
          <div class="industry-marquee-label">
            <small>BUILT FOR REAL BUSINESS WORKFLOWS</small>
            <strong>One platform. Different ways to grow.</strong>
          </div>
          <div class="industry-marquee-window">
            <div class="industry-marquee-track">
              <span><i>✦</i><b>Beauty & Wellness</b><small>Campaign → Booking</small></span>
              <span><i>⌂</i><b>Real Estate</b><small>Ad → Qualified enquiry</small></span>
              <span><i>◈</i><b>Agencies</b><small>Offer → Lead → Follow-up</small></span>
              <span><i>+</i><b>Health Services</b><small>Search → Landing page</small></span>
              <span><i>▣</i><b>Hospitality</b><small>Promotion → WhatsApp</small></span>
              <span><i>◆</i><b>Local Services</b><small>SEO → Customer intent</small></span>
              <span aria-hidden="true"><i>✦</i><b>Beauty & Wellness</b><small>Campaign → Booking</small></span>
              <span aria-hidden="true"><i>⌂</i><b>Real Estate</b><small>Ad → Qualified enquiry</small></span>
              <span aria-hidden="true"><i>◈</i><b>Agencies</b><small>Offer → Lead → Follow-up</small></span>
              <span aria-hidden="true"><i>+</i><b>Health Services</b><small>Search → Landing page</small></span>
              <span aria-hidden="true"><i>▣</i><b>Hospitality</b><small>Promotion → WhatsApp</small></span>
              <span aria-hidden="true"><i>◆</i><b>Local Services</b><small>SEO → Customer intent</small></span>
            </div>
          </div>
        </section>

        <section class="growth-platform-section" id="features">
          <div class="growth-platform-shell">
            <div class="growth-platform-copy">
              <div class="eyebrow"><span class="pulse"></span> YOUYOU PLATFORM</div>
              <h2>Six focused tools.<br><span>One operating system for growth.</span></h2>
              <p>
                Use only what you need today, while every tool stays connected to the same business context,
                leads and next actions.
              </p>
              <div class="growth-flow-line" aria-label="YOUYOU growth flow">
                <span>CREATE</span><i>→</i><span>ATTRACT</span><i>→</i><span>CONVERT</span><i>→</i><span>FOLLOW UP</span>
              </div>
            </div>

            <div class="growth-engine-grid growth-engine-grid-six">
              <article class="growth-engine-card engine-conversations">
                <div class="growth-engine-icon">◌</div><small>01 · WEBSITE AI</small>
                <h3>AI Conversations</h3>
                <p>Answer visitors 24/7, capture buying intent and turn questions into qualified opportunities.</p>
                <span class="engine-status">CONVERT</span>
              </article>
              <article class="growth-engine-card engine-seo">
                <div class="growth-engine-icon">↗</div><small>02 · SEARCH GROWTH</small>
                <h3>SEO Growth</h3>
                <p>Audit real pages and turn SEO problems into clear actions, page ideas and practical fixes.</p>
                <span class="engine-status">GET FOUND</span>
              </article>
              <article class="growth-engine-card engine-studio">
                <div class="growth-engine-icon">✦</div><small>03 · CONTENT ENGINE</small>
                <h3>AI Studio</h3>
                <p>Create campaign ideas, ad copy, social posts, emails, scripts and landing-page messaging from your business context.</p>
                <span class="engine-status">CREATE</span>
              </article>
              <article class="growth-engine-card engine-pages">
                <div class="growth-engine-icon">▦</div><small>04 · CAMPAIGN PAGES</small>
                <h3>Smart Landing Pages</h3>
                <p>Build focused product, service and campaign pages with templates, lead capture and WhatsApp actions.</p>
                <span class="engine-status">30 TEMPLATES</span>
              </article>
              <article class="growth-engine-card engine-rescue">
                <div class="growth-engine-icon">↻</div><small>05 · LEAD RECOVERY</small>
                <h3>Revenue Rescue</h3>
                <p>Spot high-intent leads that went quiet and surface the next action before the opportunity disappears.</p>
                <span class="engine-status">RECOVER</span>
              </article>
              <article class="growth-engine-card engine-whatsapp">
                <div class="growth-engine-icon">◉</div><small>06 · CONTINUITY</small>
                <h3>WhatsApp AI</h3>
                <p>Continue conversations on WhatsApp with shared business context, lead handoff and human takeover readiness.</p>
                <span class="engine-status">CONTINUE</span>
              </article>
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
            <div class="eyebrow">RECOVER OPPORTUNITY</div>
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

        <section class="landing-pages-showcase" id="landing-pages-showcase">
          <div class="landing-pages-showcase-copy">
            <div class="eyebrow">SMART LANDING PAGES</div>
            <h2>Send every ad click to <span>a page built to convert.</span></h2>
            <p>Choose a professional template, add your product or service, connect WhatsApp or lead capture, then publish a focused campaign page.</p>
            <div class="landing-pages-showcase-badges"><span>30 templates</span><span>Live editor</span><span>WhatsApp ready</span></div>
            <button id="landing-pages-showcase-cta" class="primary" type="button">Explore landing pages →</button>
          </div>
          <div class="landing-pages-showcase-visuals landing-examples-v426" aria-label="Landing page examples">
            <article class="landing-mini landing-mini-clean">
              <small>PRODUCT</small><h4>New collection</h4><p>One clear offer. One next step.</p><button type="button" tabindex="-1">Buy now</button>
            </article>
            <article class="landing-mini landing-mini-luxury">
              <small>PREMIUM SERVICE</small><h4>Private consultation</h4><p>Build confidence before the call.</p><button type="button" tabindex="-1">Book now</button>
            </article>
            <article class="landing-mini landing-mini-wellness">
              <small>WHATSAPP</small><h4>Ask before you book</h4><p>Move interested visitors into conversation.</p><button type="button" tabindex="-1">WhatsApp</button>
            </article>
            <article class="landing-mini landing-mini-bold">
              <small>LEAD CAMPAIGN</small><h4>Get your quote</h4><p>Capture the contact and the intent.</p><button type="button" tabindex="-1">Get quote</button>
            </article>
          </div>
        </section>

        <section id="pricing" class="pricing-section pricing-v45 pricing-v424">
          <div class="section-heading pricing-heading">
            <div class="eyebrow">SIMPLE MONTHLY PRICING</div>
            <h2>Pick the plan. <span>Know what you get.</span></h2>
            <p>Clear team limits, WhatsApp capacity and support levels — with no confusing credit packs to buy every time you use the product.</p>
          </div>

          <div class="pricing-grid">
            <article class="pricing-plan pricing-starter">
              <div class="pricing-plan-top">
                <div class="pricing-plan-name">STARTER</div>
                <p class="pricing-plan-tagline">For a small team launching its first connected AI growth workflow.</p>
                <div class="pricing-price"><span class="pricing-currency">$</span><strong>29</strong><span class="pricing-period">/month</span></div>
              </div>

              <div class="pricing-essentials" aria-label="Starter plan limits">
                <div><small>TEAM</small><strong>2 users</strong></div>
                <div><small>WHATSAPP</small><strong>2 numbers</strong></div>
                <div><small>SUPPORT</small><strong>Standard</strong></div>
                <div><small>API</small><strong>No access</strong></div>
              </div>

              <div class="pricing-divider"></div>
              <ul class="pricing-feature-list">
                <li><span>✓</span> AI Conversations + Website Widget</li>
                <li><span>✓</span> Knowledge Base + business file import</li>
                <li><span>✓</span> Conversations inbox + basic lead capture</li>
                <li><span>✓</span> AI Control Center</li>
                <li><span>✓</span> Smart Landing Pages · starter usage</li>
                <li><span>✓</span> AI Studio · core text creation</li>
                <li><span>✓</span> No credit packs · plan fair-use applies</li>
              </ul>
              <button id="pricing-starter" class="pricing-plan-btn pricing-plan-btn-ghost" type="button">Start free →</button>
              <small class="pricing-plan-note">Best for solo operators and small teams</small>
            </article>

            <article class="pricing-plan pricing-growth">
              <div class="pricing-popular-badge">MOST POPULAR</div>
              <div class="pricing-plan-top">
                <div class="pricing-plan-name">GROWTH</div>
                <p class="pricing-plan-tagline">For teams creating campaigns, qualifying leads and recovering more revenue.</p>
                <div class="pricing-price"><span class="pricing-currency">$</span><strong>59</strong><span class="pricing-period">/month</span></div>
              </div>

              <div class="pricing-essentials" aria-label="Growth plan limits">
                <div><small>TEAM</small><strong>5 users</strong></div>
                <div><small>WHATSAPP</small><strong>5 numbers</strong></div>
                <div><small>SUPPORT</small><strong>Priority</strong></div>
                <div><small>API</small><strong>Basic*</strong></div>
              </div>

              <div class="pricing-divider"></div>
              <ul class="pricing-feature-list">
                <li><span>✓</span> Everything in Starter</li>
                <li><span>✓</span> Lead qualification + intent scoring</li>
                <li><span>✓</span> Revenue Rescue + follow-up workflows</li>
                <li><span>✓</span> Website SEO audit + growth actions</li>
                <li><span>✓</span> More Smart Landing Pages</li>
                <li><span>✓</span> AI Studio · ads, social, email & campaigns</li>
                <li><span>✓</span> Growth analytics + WhatsApp handoff readiness</li>
                <li><span>✓</span> No credit packs · plan fair-use applies</li>
              </ul>
              <button id="pricing-growth" class="pricing-plan-btn pricing-plan-btn-primary" type="button">Start free →</button>
              <small class="pricing-plan-note">Best for businesses actively acquiring leads</small>
            </article>

            <article class="pricing-plan pricing-pro">
              <div class="pricing-plan-top">
                <div class="pricing-plan-name">PRO</div>
                <p class="pricing-plan-tagline">For growing companies that want the full YOUYOU platform and higher operating limits.</p>
                <div class="pricing-price"><span class="pricing-currency">$</span><strong>99</strong><span class="pricing-period">/month</span></div>
              </div>

              <div class="pricing-essentials" aria-label="Pro plan limits">
                <div><small>TEAM</small><strong>15 users</strong></div>
                <div><small>WHATSAPP</small><strong>10 numbers</strong></div>
                <div><small>SUPPORT</small><strong>Dedicated</strong></div>
                <div><small>API</small><strong>Advanced*</strong></div>
              </div>

              <div class="pricing-divider"></div>
              <ul class="pricing-feature-list">
                <li><span>✓</span> Everything in Growth</li>
                <li><span>✓</span> Full SEO Growth Center + advanced insights</li>
                <li><span>✓</span> WhatsApp AI integration</li>
                <li><span>✓</span> AI Studio · full workflow + video-ready creation</li>
                <li><span>✓</span> Smart Landing Pages · unlimited normal business use</li>
                <li><span>✓</span> Advanced AI controls + priority workflows</li>
                <li><span>✓</span> Unlimited normal business use · Fair Use</li>
              </ul>
              <button id="pricing-pro" class="pricing-plan-btn pricing-plan-btn-ghost" type="button">Start free →</button>
              <small class="pricing-plan-note">Full platform · Fair Use safeguard</small>
            </article>
          </div>

          <div class="pricing-bottom-note">
            <span>✓ Start free</span>
            <span>✓ No credit card required</span>
            <span>✓ No credit packs</span>
            <span>✓ Cancel anytime</span>
          </div>

          <p class="pricing-api-disclaimer">
            * API access is shown as the planned plan tier and must only be activated once production API keys, permissions, rate limits and plan enforcement are live.
          </p>
        </section>

        <section class="youyou-value-section" aria-labelledby="youyou-value-title">
          <div class="youyou-value-head">
            <div>
              <div class="eyebrow">WHY YOUYOU</div>
              <h2 id="youyou-value-title">More growth tools. <span>Less subscription chaos.</span></h2>
            </div>
            <p>Instead of stitching together separate tools and worrying about usage credits, YOUYOU brings the core growth workflow into one connected workspace.</p>
          </div>

          <div class="youyou-value-grid">
            <div class="youyou-value-table" role="table" aria-label="YOUYOU value comparison">
              <div class="youyou-value-row youyou-value-header" role="row">
                <span role="columnheader">WHAT YOU NEED</span>
                <strong role="columnheader">YOUYOU</strong>
                <em role="columnheader">Typical credit-based stack</em>
              </div>
              <div class="youyou-value-row" role="row"><span>Monthly pricing</span><strong>Predictable plan</strong><em>Can vary with usage</em></div>
              <div class="youyou-value-row" role="row"><span>AI Conversations</span><strong>Included</strong><em>Often metered</em></div>
              <div class="youyou-value-row" role="row"><span>SEO Growth</span><strong>Included by plan</strong><em>Often another tool</em></div>
              <div class="youyou-value-row" role="row"><span>AI Studio</span><strong>Included by plan</strong><em>Often another subscription</em></div>
              <div class="youyou-value-row" role="row"><span>Smart Landing Pages</span><strong>Included by plan</strong><em>Often another builder</em></div>
              <div class="youyou-value-row" role="row"><span>Revenue Rescue</span><strong>Connected workflow</strong><em>Often an add-on</em></div>
              <div class="youyou-value-row" role="row"><span>WhatsApp AI</span><strong>Plan-based capacity</strong><em>Often separate setup/add-on</em></div>
              <div class="youyou-value-row" role="row"><span>Credit packs</span><strong>No confusing packs</strong><em>Common in usage-based tools</em></div>
            </div>

            <aside class="youyou-value-card">
              <div class="youyou-value-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
              <small>ONE CONNECTED PLATFORM</small>
              <h3>Create → Convert → Follow up → Grow</h3>
              <p>AI Studio creates the campaign. Smart Landing Pages capture demand. AI Conversations qualify visitors. Revenue Rescue and WhatsApp keep valuable leads moving.</p>
              <div class="youyou-value-pills">
                <span>AI Studio</span><span>Landing Pages</span><span>SEO</span><span>Revenue Rescue</span><span>WhatsApp AI</span>
              </div>
            </aside>
          </div>

          <p class="youyou-value-fineprint">
            Fair-use limits protect service quality and infrastructure costs. Comparison language describes common market patterns, not every competing product.
          </p>
        </section>

        <section class="final-cta">

          <div class="cta-glow"></div>

          <div class="eyebrow">READY TO START?</div>

          <h2>
            One idea. One connected workflow.
            <span>More chances to convert.</span>
          </h2>

          <p>
            Create the campaign, launch the landing page, capture the lead and follow up —
            without stitching together five different tools.
          </p>

          <button id="final-start" class="primary hero-btn">
            Create your free account →
          </button>

        </section>

      </main>

      <footer>

        <div class="footer-brand">
          <a class="logo brand-home-link" href="/" aria-label="YOUYOU home">
            <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
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
  applyPublicSiteLanguage();
  document.querySelectorAll("[data-public-language]").forEach((button) => {
    button.addEventListener("click", () => setPublicSiteLanguage(button.dataset.publicLanguage));
  });
  document.querySelector("#landing-pages-showcase-cta")?.addEventListener("click", () => {
    state.user ? navigateDashboard("pages") : showSignup();
  });

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
          <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
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
                <p>YOUYOU is an AI Growth Platform that connects campaign creation, landing pages, SEO actions, website conversations, lead capture and follow-up workflows in one business workspace.</p>
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
            <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
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
          <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
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
            <span class="brand-wordmark brand-v504" aria-label="YOUYOU">
  <span class="brand-name-v504">YOUYOU</span>
  <span class="brand-tag-v504">AI GROWTH</span>
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
            ${navItem("pages", "▣", "Landing Pages")}
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
        <div class="overview-flow-v503" aria-label="YOUYOU workflow">
          <div><strong>CREATE</strong><span>Build campaign ideas and content</span></div>
          <div><strong>LAUNCH</strong><span>Publish focused landing experiences</span></div>
          <div><strong>CAPTURE</strong><span>Collect intent and qualified leads</span></div>
          <div><strong>MANAGE</strong><span>Keep opportunities organized</span></div>
        </div>


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


/* =========================
   SMART LANDING PAGES
   V4.17 PRO WORKSHOP
========================= */

const LANDING_PAGE_TEMPLATES = [
  { id:"product-launch", name:"Product Launch", category:"Product", layout:"product", accent:"#6d54e8", bg:"#f7f5ff", surface:"#ffffff", headline:"Meet the product built to make everyday work simpler.", sub:"A focused launch page with product visuals, benefits and one clear action.", cta:"Get yours today", badge:"NEW" },
  { id:"product-offer", name:"Flash Product Offer", category:"Product", layout:"offer", accent:"#ff7a59", bg:"#0b0b0d", surface:"#171216", headline:"A limited-time offer worth acting on.", sub:"Put the product, price and urgency at the center of the page.", cta:"Claim the offer", badge:"LIMITED" },
  { id:"premium-product", name:"Premium Product", category:"Product", layout:"luxury", accent:"#d7b46a", bg:"#0a0a0a", surface:"#151310", headline:"Crafted for customers who expect more.", sub:"A refined product page for premium positioning and higher-value offers.", cta:"Discover the product", badge:"PREMIUM" },
  { id:"beauty-product", name:"Beauty Product", category:"Product", layout:"beauty", accent:"#d96a98", bg:"#fff5f8", surface:"#ffffff", headline:"Your next beauty essential starts here.", sub:"Show the product, benefits, social proof and a direct purchase action.", cta:"Shop the offer", badge:"BEAUTY" },
  { id:"tech-product", name:"Tech Product", category:"Product", layout:"tech", accent:"#4db8ff", bg:"#071019", surface:"#0d1924", headline:"Smarter technology. Clearer results.", sub:"Built for tech products, gadgets, devices and software-enabled offers.", cta:"See it in action", badge:"TECH" },

  { id:"local-service", name:"Local Service", category:"Service", layout:"service", accent:"#328e68", bg:"#f3fbf7", surface:"#ffffff", headline:"A trusted local service, ready when you need it.", sub:"Turn local ad traffic into calls, quotes and WhatsApp conversations.", cta:"Get a quote", badge:"LOCAL" },
  { id:"emergency-service", name:"Emergency Service", category:"Service", layout:"urgent", accent:"#ff675f", bg:"#130a09", surface:"#1c1110", headline:"Need help now? We are ready.", sub:"A direct-response layout for urgent services and high-intent customers.", cta:"Call now", badge:"FAST RESPONSE" },
  { id:"consulting", name:"Consulting Service", category:"Service", layout:"consult", accent:"#8b7cff", bg:"#0b0b13", surface:"#151421", headline:"Turn expertise into a clear next step.", sub:"Explain the problem you solve, your approach and how customers can start.", cta:"Book a consultation", badge:"EXPERT" },
  { id:"cleaning", name:"Cleaning Service", category:"Service", layout:"clean", accent:"#319ab5", bg:"#f2fbfd", surface:"#ffffff", headline:"A cleaner space without the hassle.", sub:"Perfect for residential, office and specialized cleaning campaigns.", cta:"Request a quote", badge:"SERVICE" },
  { id:"repair", name:"Repair Service", category:"Service", layout:"repair", accent:"#f0a44b", bg:"#120e08", surface:"#1c160d", headline:"Fast repairs. Clear communication. No guesswork.", sub:"Show the issue you solve, service area, trust signals and direct contact.", cta:"Get help now", badge:"REPAIR" },

  { id:"spa", name:"Spa & Wellness", category:"Beauty & Wellness", layout:"spa", accent:"#9e72c9", bg:"#fbf6ff", surface:"#ffffff", headline:"Make time for the reset you deserve.", sub:"A calm premium layout for spa, massage, wellness and beauty offers.", cta:"Book your session", badge:"WELLNESS" },
  { id:"salon", name:"Salon Promotion", category:"Beauty & Wellness", layout:"salon", accent:"#ff9ec7", bg:"#140c12", surface:"#21131b", headline:"Your next look starts with one booking.", sub:"Promote a treatment, stylist, package or first-visit offer.", cta:"Book now", badge:"SALON" },
  { id:"fitness", name:"Fitness Offer", category:"Beauty & Wellness", layout:"fitness", accent:"#a8f05a", bg:"#0a0f07", surface:"#141b0f", headline:"Start stronger. Stay consistent.", sub:"A high-energy layout for gyms, coaches, classes and transformation offers.", cta:"Start today", badge:"FITNESS" },
  { id:"dental", name:"Dental Service", category:"Health", layout:"dental", accent:"#2f9fcc", bg:"#f1fbff", surface:"#ffffff", headline:"A confident smile starts with the right care.", sub:"Explain the treatment, answer common concerns and drive appointment requests.", cta:"Book an appointment", badge:"DENTAL" },
  { id:"clinic", name:"Clinic Appointment", category:"Health", layout:"clinic", accent:"#31956c", bg:"#f4fcf8", surface:"#ffffff", headline:"Professional care with a simpler booking experience.", sub:"A clean appointment-focused page for clinics and healthcare services.", cta:"Request appointment", badge:"CARE" },

  { id:"restaurant", name:"Restaurant Offer", category:"Hospitality", layout:"restaurant", accent:"#ffb457", bg:"#120c07", surface:"#1d150d", headline:"One offer designed to fill more tables.", sub:"Highlight a signature dish, menu offer, event or reservation campaign.", cta:"Reserve a table", badge:"FOOD" },
  { id:"hotel", name:"Hotel Stay", category:"Hospitality", layout:"hotel", accent:"#a67c32", bg:"#fbf7ee", surface:"#ffffff", headline:"Turn the next trip into a better stay.", sub:"Show rooms, experience, location and the strongest booking reason.", cta:"Check availability", badge:"STAY" },
  { id:"travel", name:"Travel Package", category:"Hospitality", layout:"travel", accent:"#3f8fc2", bg:"#f2f9fd", surface:"#ffffff", headline:"Your next escape is closer than it feels.", sub:"Built for travel packages, tours, excursions and destination offers.", cta:"Explore the package", badge:"TRAVEL" },

  { id:"real-estate", name:"Property Lead", category:"Real Estate", layout:"property", accent:"#9d7a3d", bg:"#faf7f0", surface:"#ffffff", headline:"A property worth seeing in person.", sub:"Show the property, key facts and capture qualified buyer or renter leads.", cta:"Schedule a viewing", badge:"PROPERTY" },
  { id:"real-estate-agent", name:"Real Estate Agent", category:"Real Estate", layout:"agent", accent:"#7aa9ff", bg:"#080c13", surface:"#101824", headline:"Find the right property with a clearer process.", sub:"Position the agent, local expertise and a direct consultation path.", cta:"Talk to an agent", badge:"REAL ESTATE" },

  { id:"saas", name:"SaaS Conversion", category:"Digital", layout:"saas", accent:"#7c5cff", bg:"#080a12", surface:"#111523", headline:"One product. One clear reason to start.", sub:"A focused SaaS landing page for demos, trials and lead generation.", cta:"Start now", badge:"SAAS" },
  { id:"agency", name:"Agency Lead Gen", category:"Digital", layout:"agency", accent:"#ff6f91", bg:"#11090e", surface:"#1d1118", headline:"Turn your next campaign into measurable growth.", sub:"Show the service, proof, process and one strong lead-generation CTA.", cta:"Get a proposal", badge:"AGENCY" },
  { id:"app-launch", name:"App Launch", category:"Digital", layout:"app", accent:"#397fc4", bg:"#f4f8fd", surface:"#ffffff", headline:"A better way to get the job done — now in your pocket.", sub:"Launch an app with benefits, screenshots, proof and store actions.", cta:"Get the app", badge:"APP" },
  { id:"webinar", name:"Webinar Registration", category:"Digital", layout:"webinar", accent:"#b184ff", bg:"#0e0914", surface:"#181022", headline:"One session. Practical answers you can use immediately.", sub:"Drive registrations with a clear topic, agenda, host and registration form.", cta:"Save my seat", badge:"LIVE" },
  { id:"course", name:"Course Enrollment", category:"Digital", layout:"course", accent:"#f0b45e", bg:"#110d07", surface:"#1d160c", headline:"Learn the skill. Apply it with confidence.", sub:"Sell a focused course with outcomes, modules, instructor proof and enrollment CTA.", cta:"Enroll now", badge:"COURSE" },

  { id:"event", name:"Event Registration", category:"Campaign", layout:"event", accent:"#ff6a78", bg:"#12090b", surface:"#1d1115", headline:"Make this the event people do not want to miss.", sub:"Promote a date, location, experience and registration action.", cta:"Register now", badge:"EVENT" },
  { id:"lead-magnet", name:"Lead Magnet", category:"Campaign", layout:"lead", accent:"#3a9a83", bg:"#f2fbf8", surface:"#ffffff", headline:"Get the guide that makes the next step easier.", sub:"Capture leads with a downloadable guide, checklist, audit or resource.", cta:"Get the free guide", badge:"FREE" },
  { id:"quote-request", name:"Quote Request", category:"Campaign", layout:"quote", accent:"#477fce", bg:"#f5f8fe", surface:"#ffffff", headline:"Tell us what you need. Get a clear next step.", sub:"A simple conversion page for custom pricing and service requests.", cta:"Request my quote", badge:"QUOTE" },
  { id:"whatsapp-offer", name:"WhatsApp Offer", category:"Campaign", layout:"whatsapp", accent:"#45d483", bg:"#07110c", surface:"#0e1b14", headline:"Interested? Continue directly on WhatsApp.", sub:"A fast mobile-first offer page designed around WhatsApp conversations.", cta:"Chat on WhatsApp", badge:"WHATSAPP" },
  { id:"booking", name:"Booking Campaign", category:"Campaign", layout:"booking", accent:"#9e8cff", bg:"#0b0912", surface:"#161221", headline:"Make booking the easiest part of the customer journey.", sub:"A focused service page for appointments, demos, consultations and reservations.", cta:"Book now", badge:"BOOKING" },
];

const YOUYOU_LANDING_RENDERER_VERSION = "8.2.0";

const LANDING_CURRENCIES = [
  ["USD","$","US Dollar"],["EUR","€","Euro"],["MAD","DH","Moroccan Dirham"],
  ["SAR","ر.س","Saudi Riyal"],["AED","د.إ","UAE Dirham"],["QAR","ر.ق","Qatari Riyal"],
  ["KWD","د.ك","Kuwaiti Dinar"],["BHD","د.ب","Bahraini Dinar"],["OMR","ر.ع.","Omani Rial"],
  ["EGP","ج.م","Egyptian Pound"],["DZD","د.ج","Algerian Dinar"],["TND","د.ت","Tunisian Dinar"]
];

function landingTemplateById(id) {
  return LANDING_PAGE_TEMPLATES.find((item) => item.id === id) || LANDING_PAGE_TEMPLATES[0];
}

function landingBuilderRoute({ templateId = "product-launch", pageId = "" } = {}) {
  if (pageId) return `/dashboard/landing-pages/edit/${encodeURIComponent(pageId)}`;
  return `/dashboard/landing-pages/new?template=${encodeURIComponent(templateId)}`;
}

function openLandingBuilder({ templateId = "product-launch", pageId = "" } = {}) {
  const nextPath = landingBuilderRoute({ templateId, pageId });
  state.section = "pages-builder";
  window.history.pushState({ section: "pages-builder", pageId, templateId }, "", nextPath);
  renderDashboard();
}

function landingBuilderRequest() {
  const pathname = window.location.pathname;
  const editMatch = pathname.match(/^\/dashboard\/landing-pages\/edit\/([^/]+)$/);
  const params = new URLSearchParams(window.location.search);

  return {
    mode: editMatch ? "edit" : "new",
    pageId: editMatch ? decodeURIComponent(editMatch[1]) : "",
    templateId: params.get("template") || "product-launch",
  };
}

function landingDraftKey() {
  return `youyou-landing-pages:${state.company?.id || state.user?.id || "workspace"}`;
}

function loadLandingDrafts() {
  try {
    return JSON.parse(localStorage.getItem(landingDraftKey()) || "[]");
  } catch {
    return [];
  }
}

function saveLandingDrafts(items) {
  localStorage.setItem(landingDraftKey(), JSON.stringify(items.slice(0, 50)));
}

function mergeLandingDraftLists(localItems = [], remoteItems = []) {
  const map = new Map();
  [...localItems, ...remoteItems].forEach((item) => {
    if (!item?.id) return;
    const existing = map.get(item.id);
    const existingTime = Date.parse(existing?.updatedAt || existing?.createdAt || 0) || 0;
    const nextTime = Date.parse(item?.updatedAt || item?.createdAt || 0) || 0;
    if (!existing || nextTime >= existingTime) map.set(item.id, { ...existing, ...item });
  });
  return [...map.values()]
    .sort((a,b) => (Date.parse(b.updatedAt || b.createdAt || 0) || 0) - (Date.parse(a.updatedAt || a.createdAt || 0) || 0))
    .slice(0, 50);
}

function landingDraftRemoteSlug(draftId = '') {
  const clean = String(draftId || `lp_${Date.now()}`).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(-42);
  const company = String(state.company?.id || 'workspace').replace(/[^a-z0-9]/gi,'').slice(0,8).toLowerCase();
  return `draft-${company || 'ws'}-${clean || landingShortToken()}`.slice(0,78);
}

function landingDraftFromRemoteRow(row = {}) {
  const content = row?.content && typeof row.content === 'object' ? row.content : {};
  const templateId = String(content.templateId || row.template_id || 'product-launch');
  const published = row.status === 'published';
  return {
    ...defaultLandingPageData(templateId),
    ...content,
    id:String(row.draft_id || content.id || `lp_${Date.now()}`),
    remotePageId:String(row.id || content.remotePageId || ''),
    templateId,
    name:String(content.name || row.name || 'Landing page'),
    publishedSlug:published ? String(row.slug || content.publishedSlug || '') : String(content.publishedSlug || ''),
    publishedUrl:published ? landingPublicUrl(row.slug || content.publishedSlug || '') : String(content.publishedUrl || ''),
    publishedAt:row.published_at || content.publishedAt || '',
    updatedAt:row.updated_at || content.updatedAt || '',
    status:published ? 'Published' : 'Draft',
    rendererVersion:String(content.rendererVersion || YOUYOU_LANDING_RENDERER_VERSION),
    publishedRendererVersion:String(content.publishedRendererVersion || content.rendererVersion || ''),
    hasUnpublishedChanges:Boolean(content.hasUnpublishedChanges),
  };
}

async function loadRemoteLandingDrafts() {
  if (!supabase || !state.user || !state.company?.id) return [];
  const { data, error } = await supabase
    .from('landing_pages')
    .select('id,draft_id,slug,name,template_id,content,status,published_at,created_at,updated_at')
    .eq('company_id', state.company.id)
    .order('updated_at', { ascending:false })
    .limit(50);
  if (error) {
    console.warn('YOUYOU remote drafts:', error);
    return [];
  }
  return (data || []).map(landingDraftFromRemoteRow);
}

async function syncRemoteLandingDraftsToLocal() {
  const remote = await loadRemoteLandingDrafts();
  if (!remote.length) return loadLandingDrafts();
  const merged = mergeLandingDraftLists(loadLandingDrafts(), remote);
  try { saveLandingDrafts(merged); } catch (error) { console.warn('YOUYOU draft cache:', error); }
  return merged;
}

function landingCurrencySymbol(code) {
  return LANDING_CURRENCIES.find(([value]) => value === code)?.[1] || code;
}

function landingTextForBackground(hex) {
  const value = String(hex || "#090b12").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return "#f7f8fb";
  const r = parseInt(value.slice(0,2),16), g = parseInt(value.slice(2,4),16), b = parseInt(value.slice(4,6),16);
  const luminance = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
  return luminance > .66 ? "#18202a" : "#f7f8fb";
}

function landingFontStack(value = 'system') {
  const stacks = {
    system:'ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
    modern:'Inter,ui-sans-serif,system-ui,sans-serif',
    elegant:'Georgia,Times New Roman,serif',
    friendly:'Trebuchet MS,Arial,sans-serif',
    mono:'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
  };
  return stacks[value] || stacks.system;
}

function landingRootStyle(data = {}) {
  const radius = Math.min(36, Math.max(6, Number(data.cornerRadius) || 18));
  const align = ['left','center','right'].includes(data.contentAlign) ? data.contentAlign : 'left';
  const justify = align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start');
  const density = ['compact','balanced','airy'].includes(data.sectionDensity) ? data.sectionDensity : 'balanced';
  const sectionSpace = density === 'compact' ? '52px' : (density === 'airy' ? '94px' : '72px');
  return `--lp-accent:${escapeHtml(data.accent || '#7c5cff')};--lp-bg:${escapeHtml(data.background || '#ffffff')};--lp-surface:${escapeHtml(data.surface || '#ffffff')};--lp-text:${escapeHtml(data.textColor || '#172033')};--lp-radius:${radius}px;--lp-align:${align};--lp-justify:${justify};--lp-font:${escapeHtml(landingFontStack(data.fontFamily || 'system'))};--lp-section-space:${sectionSpace}`;
}

function landingTemplateDemoVisual(templateId = "product-launch") {
  const template = landingTemplateById(templateId);
  const label = String(template?.name || "YOUYOU Landing Page").replace(/[&<>"']/g, "");
  const accent = template?.accent || "#7c5cff";
  const bg = template?.surface || "#111522";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${accent}" stop-opacity=".34"/></linearGradient></defs>
    <rect width="1200" height="820" rx="42" fill="url(#g)"/>
    <circle cx="930" cy="160" r="170" fill="${accent}" fill-opacity=".20"/>
    <circle cx="220" cy="680" r="230" fill="${accent}" fill-opacity=".12"/>
    <rect x="105" y="120" width="990" height="580" rx="34" fill="white" fill-opacity=".07" stroke="white" stroke-opacity=".15"/>
    <rect x="165" y="190" width="390" height="34" rx="17" fill="${accent}" fill-opacity=".85"/>
    <rect x="165" y="260" width="650" height="28" rx="14" fill="white" fill-opacity=".84"/>
    <rect x="165" y="310" width="530" height="18" rx="9" fill="white" fill-opacity=".36"/>
    <rect x="165" y="350" width="430" height="18" rx="9" fill="white" fill-opacity=".24"/>
    <rect x="165" y="430" width="220" height="66" rx="18" fill="${accent}"/>
    <rect x="660" y="390" width="340" height="220" rx="28" fill="white" fill-opacity=".10" stroke="white" stroke-opacity=".16"/>
    <circle cx="830" cy="500" r="52" fill="${accent}" fill-opacity=".9"/>
    <path d="M812 470l48 30-48 30z" fill="white"/>
    <text x="165" y="620" fill="white" fill-opacity=".88" font-family="Arial,sans-serif" font-size="34" font-weight="700">${label}</text>
    <text x="165" y="662" fill="white" fill-opacity=".48" font-family="Arial,sans-serif" font-size="20">Sample visual · replace with your image or video</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function landingVideoSource(url = "") {
  const raw = String(url || "").trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw, window.location.origin);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    let youtubeId = "";
    if (host === "youtu.be") youtubeId = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (host.includes("youtube.com")) {
      youtubeId = parsed.searchParams.get("v") || "";
      if (!youtubeId && parsed.pathname.includes("/shorts/")) youtubeId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      if (!youtubeId && parsed.pathname.includes("/embed/")) youtubeId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
    }
    if (youtubeId) return { type:"iframe", src:`https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}` };
    if (host.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      if (id) return { type:"iframe", src:`https://player.vimeo.com/video/${id}` };
    }
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(raw)) return { type:"video", src:raw };
  } catch (_) {}
  return null;
}

function landingHeroVideoMarkup(data, className = "") {
  if (data.videoEnabled === "off" || (data.videoPosition || "after-hero") !== "hero") return "";
  const raw = String(data.videoUrl || "").trim();
  const source = landingVideoSource(raw);
  let media = "";
  if (source?.type === "iframe") {
    media = `<iframe src="${escapeHtml(source.src)}" title="${escapeHtml(data.videoTitle || "Hero video")}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (source?.type === "video") {
    media = `<video src="${escapeHtml(source.src)}" controls playsinline preload="metadata"></video>`;
  } else if (raw.startsWith("blob:") || raw.startsWith("data:video/")) {
    media = `<video src="${escapeHtml(raw)}" controls playsinline preload="metadata"></video>`;
  } else {
    return "";
  }
  return `<div class="lp-hero-video ${className}">${media}</div>`;
}

function landingMediaItemMarkup(url, label = "Landing page media") {
  const raw = String(url || "").trim();
  if (!raw) return "";
  const video = landingVideoSource(raw);
  if (video?.type === "iframe") {
    return `<div class="lp-live-media-slide"><iframe src="${escapeHtml(video.src)}" title="${escapeHtml(label)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  if (video?.type === "video") {
    return `<div class="lp-live-media-slide"><video src="${escapeHtml(video.src)}" controls playsinline preload="metadata"></video></div>`;
  }
  return `<div class="lp-live-media-slide"><img src="${escapeHtml(raw)}" alt="${escapeHtml(label)}" loading="lazy" /></div>`;
}

function landingImageSliderMarkup(data) {
  const mode = String(data.sliderEnabled || "off");
  if (mode === "off") return "";

  const urls = [
    String(data.imageUrl || "").trim(),
    ...String(data.mediaGallery || "").split("\n").map((item) => item.trim())
  ].filter(Boolean).filter((url, index, arr) => arr.indexOf(url) === index).slice(0, 20);
  const images = urls.filter((url) => !landingVideoSource(url));
  if (!images.length) return "";

  const title = String(data.sliderTitle || "").trim();
  const head = title
    ? `<div class="lp-block-head"><div><small>GALLERY</small><h2>${escapeHtml(title)}</h2></div></div>`
    : "";

  if (mode === "grid") {
    return `<section id="details" class="lp-live-section lp-product-gallery lp-static-gallery" data-block="image-gallery">
      ${head}
      <div class="lp-static-image-grid">${images.map((url,index)=>`<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(data.name || "Product image")} ${index+1}" loading="lazy" /></figure>`).join("")}</div>
    </section>`;
  }

  const ratio = ["square","portrait","landscape"].includes(String(data.sliderRatio || "square"))
    ? String(data.sliderRatio || "square")
    : "square";
  const slides = images.map((url, index) => `<figure class="lp-image-slide" aria-label="${escapeHtml(data.name || "Product image")} ${index + 1}"><img src="${escapeHtml(url)}" alt="${escapeHtml(data.name || "Product image")} ${index + 1}" loading="lazy" /></figure>`);
  const interactive = slides.length > 1;
  const arrows = interactive && data.sliderArrows !== "off"
    ? `<button type="button" class="lp-image-arrow prev" aria-label="Previous images">‹</button><button type="button" class="lp-image-arrow next" aria-label="Next images">›</button>`
    : "";
  const indicators = interactive && data.sliderDots !== "off"
    ? `<div class="lp-image-dots" data-carousel-dots aria-label="Carousel pages"></div><div class="lp-image-counter" data-carousel-counter hidden></div>`
    : "";
  const autoplay = interactive && data.sliderAutoplay !== "off"
    ? `data-autoplay="true" data-speed="${Math.max(2000, Math.min(9000, Number(data.sliderSpeed) || 4000))}"`
    : "";

  return `<section id="details" class="lp-live-section lp-product-gallery" data-block="image-slider">
    ${head}
    <div class="lp-image-slider lp-carousel-ratio-${ratio}" data-carousel-count="${slides.length}" ${autoplay}><div class="lp-image-track">${slides.join("")}</div>${arrows}${indicators}</div>
  </section>`;
}
function landingVideoBlockMarkup(data) {
  if (data.videoEnabled === "off" || (data.videoPosition || "after-hero") === "hero") return "";
  const raw = String(data.videoUrl || "").trim();
  if (!raw) return "";
  const source = landingVideoSource(raw);
  let media = "";
  if (source?.type === "iframe") {
    media = `<iframe src="${escapeHtml(source.src)}" title="${escapeHtml(data.videoTitle || "Product video")}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (source?.type === "video") {
    media = `<video src="${escapeHtml(source.src)}" controls playsinline preload="metadata"></video>`;
  } else if (raw.startsWith("blob:") || raw.startsWith("data:video/")) {
    media = `<video src="${escapeHtml(raw)}" controls playsinline preload="metadata"></video>`;
  } else {
    return "";
  }
  return `<section class="lp-live-section lp-product-video" data-block="video">
    <div class="lp-block-head"><div><small>VIDEO</small><h2>${escapeHtml(data.videoTitle || "See it in action.")}</h2></div></div>
    <div class="lp-video-frame">${media}</div>
  </section>`;
}
function landingMediaMarkup(data) {
  return landingImageSliderMarkup(data);
}

function landingCallingCodeForCountry(country = "") {
  const key = String(country || "").trim().toLowerCase();
  const map = {
    ma:"212", morocco:"212", maroc:"212",
    us:"1", usa:"1", "united states":"1", "united states of america":"1",
    ca:"1", canada:"1",
    fr:"33", france:"33",
    es:"34", spain:"34", españa:"34",
    gb:"44", uk:"44", "united kingdom":"44",
    de:"49", germany:"49", deutschland:"49",
    it:"39", italy:"39", italia:"39",
    pt:"351", portugal:"351",
    ae:"971", uae:"971", "united arab emirates":"971",
    sa:"966", "saudi arabia":"966",
    qa:"974", qatar:"974",
    eg:"20", egypt:"20",
    tn:"216", tunisia:"216",
    dz:"213", algeria:"213",
    tr:"90", turkey:"90",
    in:"91", india:"91"
  };
  return map[key] || "";
}

function normalizeWhatsAppNumber(value = "", countryCode = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // WhatsApp wa.me expects an international number without +, spaces or 00.
  if (digits.startsWith("00")) digits = digits.slice(2);
  const cc = String(countryCode || "").replace(/\D/g, "").replace(/^00+/, "").replace(/^0+/, "");

  // Explicit international formats (+212 / 00212) are already authoritative.
  if (raw.startsWith("+") || /^00/.test(raw.replace(/\s+/g, ""))) return digits;
  if (cc && digits.startsWith(cc)) return digits;

  // Local numbers such as 06... become 2126... when a country code is supplied.
  if (cc) {
    digits = digits.replace(/^0+/, "");
    return `${cc}${digits}`;
  }
  return digits.replace(/^0+/, "");
}

function landingWhatsAppHref(data = {}) {
  const number = normalizeWhatsAppNumber(data.whatsapp, data.whatsappCountryCode);
  return number ? `https://wa.me/${number}` : "#contact";
}

function defaultLandingPageData(templateId = "product-launch") {
  const template = landingTemplateById(templateId);
  const c = state.company || {};
  const isBeautyProduct = template.id === "beauty-product";

  return {
    id: `lp_${Date.now()}`,
    templateId: template.id,
    name: template.name,
    pageType: template.category,
    headline: template.headline,
    subheadline: template.sub,
    description: c.business_description || (isBeautyProduct ? "A beauty ritual designed to feel premium from the first look to the final touch." : "Add a short, persuasive description that explains why this offer matters and what the customer should do next."),
    badge: template.badge,
    price: "",
    oldPrice: "",
    currency: "USD",
    priceMode: "show",
    commerceEnabled: "off",
    commerceMode: template.category === "Product" ? "product" : "service",
    quantityEnabled: "on",
    quantityMin: "1",
    quantityMax: "20",
    quantityDefault: "1",
    productColors: "",
    variantsText: "",
    bundleEnabled: "off",
    bundleOptions: "Single|1\nPack of 2|2\nPack of 3|3",
    businessName: c.name || "",
    businessAddress: c.address || c.business_address || "",
    ctaText: template.cta,
    ctaAction: template.layout === "whatsapp" ? "whatsapp" : "form",
    leadFormEnabled: "on",
    formButtonText: "Send request",
    whatsapp: c.whatsapp_number || "",
    whatsappCountryCode: landingCallingCodeForCountry(c.country || ""),
    phone: c.business_phone || "",
    email: c.business_email || "",
    heroMediaEnabled: "on",
    heroImageUrl: "",
    imageUrl: "",
    videoUrl: "",
    mediaGallery: "",
    videoEnabled: "off",
    videoTitle: "",
    videoPosition: "after-hero",
    sliderEnabled: isBeautyProduct ? "grid" : "off",
    sliderTitle: "See it from every angle.",
    sliderPosition: "after-video",
    sliderAutoplay: "on",
    sliderSpeed: "4000",
    sliderArrows: "on",
    sliderDots: "on",
    sliderRatio: "square",
    mediaPosition: "right",
    mediaWidth: "46",
    mediaHeight: "380",
    extraTitle: "",
    extraText: "",
    extraTextPosition: "after-benefits",
    customSections: [],
    accent: template.accent,
    background: template.bg,
    surface: template.surface,
    textColor: landingTextForBackground(template.bg),
    direction: "ltr",
    benefits: isBeautyProduct ? "Visible glow without the heavy feel\nSkin-loving formula for everyday rituals\nFast, simple checkout and support" : "Clear value proposition\nFast customer response\nSimple next step",
    testimonial: "",
    faqQuestion: isBeautyProduct ? "Is it easy to add to a daily beauty routine?" : "What should customers know before getting started?",
    faqAnswer: isBeautyProduct ? "Yes. The routine is designed to stay simple: use a small amount, follow your normal care steps and adjust frequency to your preference." : "Add a concise answer that removes hesitation and makes the next step easier.",
    widgetEnabled: "on",
    widgetGreeting: "Hi! Ask me anything about this page.",
    widgetPosition: "right",
    widgetName: "YOUYOU Assistant",
    fontFamily: "system",
    contentAlign: "left",
    cornerRadius: "18",
    sectionDensity: "balanced",
    showBenefits: "on",
    showFaq: "on",
    showTestimonial: "on",
    showContact: "on",
    publishedSlug: "",
    publishedUrl: "",
    remotePageId: "",
    publishedAt: "",
    rendererVersion: YOUYOU_LANDING_RENDERER_VERSION,
    publishedRendererVersion: "",
    hasUnpublishedChanges: false,
    createdAt: new Date().toISOString(),
    status: "Draft",
  };
}

function landingPriceMarkup(data) {
  if (data.priceMode === "hide") return "";
  if (data.priceMode === "quote") return `<div class="lp-live-price quote">Contact for price</div>`;
  const value = String(data.price || "").trim();
  if (!value) return "";
  const symbol = landingCurrencySymbol(data.currency);
  const current = `${symbol} ${escapeHtml(value)}`;
  const old = data.oldPrice?.trim() ? `<del>${symbol} ${escapeHtml(data.oldPrice.trim())}</del>` : "";
  return `<div class="lp-live-price">${old}<strong>${current}</strong><small>${escapeHtml(data.currency)}</small></div>`;
}

function landingCommerceMode(data = {}) {
  const forced = String(data.commerceMode || "auto").toLowerCase();
  if (forced === "product" || forced === "service") return forced;
  const template = landingTemplateById(data.templateId);
  const category = String(template?.category || data.pageType || "").toLowerCase();
  return category === "product" ? "product" : "service";
}
function landingParseVariants(value = "") {
  return String(value || "").split("\n").map(line=>line.trim()).filter(Boolean).slice(0,6).map(line=>{const parts=line.split(":");const name=String(parts.shift()||"Option").trim();const options=parts.join(":").split(",").map(x=>x.trim()).filter(Boolean).slice(0,12);return{name,options}}).filter(item=>item.name&&item.options.length);
}
function landingParseBundles(value = "") {
  return String(value || "").split("\n").map(line=>line.trim()).filter(Boolean).slice(0,8).map(line=>{const [labelRaw,qtyRaw]=line.split("|");const qty=Math.max(1,Math.min(99,Number(qtyRaw)||1));return{label:String(labelRaw||`${qty} items`).trim(),qty}}).filter(item=>item.label);
}
function landingParseColors(value = "") {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 16)
    .map((line) => {
      const [nameRaw, hexRaw] = line.split("|");
      const name = String(nameRaw || "").trim();
      const rawHex = String(hexRaw || "").trim();
      const hex = /^#[0-9a-f]{6}$/i.test(rawHex) ? rawHex : "#CBD5E1";
      return { name, hex };
    })
    .filter((item) => item.name);
}

function landingCommerceMarkup(data = {}) {
  if (String(data.commerceEnabled || "off") !== "on") return "";
  if (landingCommerceMode(data) !== "product") return "";

  const min = Math.max(1, Number(data.quantityMin) || 1);
  const max = Math.max(min, Math.min(99, Number(data.quantityMax) || 20));
  const initial = Math.max(min, Math.min(max, Number(data.quantityDefault) || min));
  const unit = Math.max(0, Number(String(data.price || "").replace(",", ".")) || 0);
  const symbol = landingCurrencySymbol(data.currency);
  const variants = landingParseVariants(data.variantsText);
  const bundles = data.bundleEnabled === "on" ? landingParseBundles(data.bundleOptions) : [];
  const colors = landingParseColors(data.productColors);

  const colorsMarkup = colors.length ? `<div class="lp-order-colors"><small>COLOR</small><div class="lp-color-swatches">${colors.map((color,index)=>`<button type="button" class="lp-color-swatch ${index===0?"is-active":""}" data-order-color="${escapeHtml(color.name)}" title="${escapeHtml(color.name)}" onclick="window.youyouLandingChooseColor(this)"><i style="background:${escapeHtml(color.hex)}"></i><span>${escapeHtml(color.name)}</span></button>`).join("")}</div></div>` : "";
  const qtyMarkup = data.quantityEnabled === "off" ? "" : `<div class="lp-order-row lp-quantity-row"><div><small>QUANTITY</small><strong>Select quantity</strong></div><div class="lp-qty-stepper" data-order-stepper><button type="button" aria-label="Decrease quantity" onclick="window.youyouLandingChangeQty(this,-1)">−</button><output data-order-qty>${initial}</output><button type="button" aria-label="Increase quantity" onclick="window.youyouLandingChangeQty(this,1)">+</button></div></div>`;
  const variantsMarkup = variants.length ? `<div class="lp-order-variants">${variants.map(v=>`<label><span>${escapeHtml(v.name)}</span><select data-order-variant="${escapeHtml(v.name)}" onchange="window.youyouLandingUpdateOrder(this)">${v.options.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}</select></label>`).join("")}</div>` : "";
  const bundlesMarkup = bundles.length ? `<div class="lp-order-bundles"><small>BUNDLE</small><div>${bundles.map(b=>`<button type="button" class="${b.qty===initial?"is-active":""}" data-bundle-qty="${b.qty}" onclick="window.youyouLandingChooseBundle(this,${b.qty})">${escapeHtml(b.label)}</button>`).join("")}</div></div>` : "";
  const summary = unit > 0 ? `<div class="lp-order-summary"><div><span>Unit price</span><strong>${escapeHtml(symbol)} ${unit.toFixed(2)}</strong></div><div><span>Quantity</span><strong data-order-summary-qty>${initial}</strong></div><div class="lp-order-total"><span>Total</span><strong><b data-order-currency>${escapeHtml(symbol)}</b> <em data-order-total>${(unit*initial).toFixed(2)}</em></strong></div></div>` : `<div class="lp-order-summary is-quote"><div><span>Selected quantity</span><strong data-order-summary-qty>${initial}</strong></div><div class="lp-order-total"><span>Price</span><strong>Contact for price</strong></div></div>`;

  return `<div class="lp-commerce-box" data-commerce-box data-commerce-mode="product" data-unit-price="${unit}" data-currency="${escapeHtml(symbol)}" data-min="${min}" data-max="${max}"><div class="lp-commerce-head"><small>ORDER DETAILS</small><span>PRODUCT</span></div>${colorsMarkup}${bundlesMarkup}${qtyMarkup}${variantsMarkup}${summary}</div>`;
}

function landingCtaHref(data) {
  if (data.ctaAction === "whatsapp") {
    return landingWhatsAppHref(data);
  }
  if (data.ctaAction === "call") {
    const phone = String(data.phone || "").replace(/[^\d+]/g, "");
    return phone ? `tel:${phone}` : "#contact";
  }
  if (data.ctaAction === "email") {
    return data.email ? `mailto:${data.email}` : "#contact";
  }
  return "#contact";
}


function landingTemplateExperience(data) {
  const template = landingTemplateById(data.templateId);
  const category = String(template?.category || data.pageType || "Offer");
  const map = {
    "Hospitality": ["Experience overview", "Booking action", "Direct contact"],
    "Beauty & Wellness": ["Offer details", "Mobile-ready", "Clear next step"],
    "Health": ["Service information", "Appointment action", "Contact details"],
    "Real Estate": ["Property details", "Viewing action", "Direct enquiry"],
    "Digital": ["Product overview", "Demo or signup", "Lead capture"],
    "Campaign": ["Focused campaign", "Mobile-ready", "Direct response"],
    "Service": ["Service overview", "Quote or call", "Direct contact"],
    "Product": ["Product details", "Gallery ready", "Clear action"]
  };
  return map[category] || ["Offer details", "Mobile-ready", "Clear next step"];
}

function landingHeroMediaMarkup(data) {
  if (data.heroMediaEnabled === "off") return "";
  const heroVideo = landingHeroVideoMarkup(data, "lp-hero-video-generic");
  const media = String(data.heroImageUrl || data.imageUrl || "").trim() || landingTemplateDemoVisual(data.templateId);
  const exp = landingTemplateExperience(data);
  return `<div class="lp-live-media lp-hero-media-card${heroVideo ? " has-hero-video" : ""}">
    <div class="lp-hero-glow"></div>
    ${heroVideo || `<img src="${escapeHtml(media)}" alt="${escapeHtml(data.name || "Offer visual")}" loading="lazy" />`}
    <div class="lp-hero-float lp-hero-float-top"><span>OFFER</span><strong>${escapeHtml(data.badge || "FEATURED")}</strong></div>
    <div class="lp-hero-float lp-hero-float-bottom"><strong>${escapeHtml(exp[0])}</strong><small>${escapeHtml(exp[1])} · ${escapeHtml(exp[2])}</small></div>
  </div>`;
}
function landingWidgetMarkup(data) {
  if (data.widgetEnabled === "off") return "";
  const pos = data.widgetPosition === "left" ? "left" : "right";
  return `<div class="lp-ai-widget is-${pos}" data-lp-widget>
    <button class="lp-ai-launcher" type="button" aria-label="Open chat" onclick="const w=this.closest('[data-lp-widget]');w.classList.toggle('is-open')"><span>✦</span><b>AI</b></button>
    <div class="lp-ai-panel" role="dialog" aria-label="${escapeHtml(data.widgetName || "Assistant")}">
      <div class="lp-ai-head"><div><span>✦</span><p><strong>${escapeHtml(data.widgetName || "YOUYOU Assistant")}</strong><small>Ask about this offer</small></p></div><button type="button" aria-label="Close chat" onclick="this.closest('[data-lp-widget]').classList.remove('is-open')">×</button></div>
      <div class="lp-ai-messages" data-lp-widget-messages aria-live="polite">
        <div class="lp-ai-msg bot">${escapeHtml(data.widgetGreeting || "Hi! Ask me anything about this page.")}</div>
        <div class="lp-ai-suggestions">
          <button type="button" onclick="window.youyouLandingAsk(this,'What is the price?')">Price?</button>
          <button type="button" onclick="window.youyouLandingAsk(this,'What are the benefits?')">Benefits?</button>
          <button type="button" onclick="window.youyouLandingAsk(this,'How can I get started?')">Get started</button>
        </div>
      </div>
      <form class="lp-ai-form" onsubmit="window.youyouLandingAsk(this.querySelector('button'),this.querySelector('input').value);this.querySelector('input').value='';return false">
        <label class="sr-only" for="lp-ai-input-${escapeHtml(data.id || 'page')}">Ask about this offer</label>
        <input id="lp-ai-input-${escapeHtml(data.id || 'page')}" aria-label="Ask about this offer" placeholder="Ask about this offer..." />
        <button type="submit" aria-label="Send message">➜</button>
      </form>
    </div>
  </div>`;
}


function landingLeadFormMarkup(data, className = "") {
  const followHref = data.ctaAction && data.ctaAction !== "form" ? landingCtaHref(data) : "";
  const followLabel = data.ctaAction === "whatsapp" ? "Continue on WhatsApp" : data.ctaAction === "call" ? "Call now" : data.ctaAction === "email" ? "Send an email" : "";
  const safeFollow = followHref && followHref !== "#contact" ? `<a class="lp-lead-followup" data-lp-lead-followup href="${escapeHtml(followHref)}" ${data.ctaAction === "whatsapp" ? 'target="_blank" rel="noopener"' : ''} hidden>${escapeHtml(followLabel)} ↗</a>` : "";
  return `<form class="lp-lead-form lp-checkout-form ${className}" data-lp-lead-form onsubmit="return window.youyouLandingSubmit(this)">
    ${landingCommerceMarkup(data)}
    <div class="lp-lead-grid">
      <label class="lp-lead-span-2"><span>Name</span><input name="name" autocomplete="name" placeholder="Your name" required /></label>
      <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+212..." required /></label>
      <label><span>Email <em>Optional</em></span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" /></label>
      <label><span>City</span><input name="city" autocomplete="address-level2" placeholder="Your city" required /></label>
      <label><span>Address</span><input name="address" autocomplete="street-address" placeholder="Street / area / delivery address" required /></label>
      <label class="lp-lead-span-2"><span>Message <em>Optional</em></span><textarea name="message" rows="3" placeholder="Anything else we should know?"></textarea></label>
    </div>
    <button type="submit">${escapeHtml(data.formButtonText || "Send request")}</button>
    <div class="lp-lead-feedback" aria-live="polite">
      <p class="lp-lead-status" data-lp-lead-status role="status"></p>
      ${safeFollow}
    </div>
  </form>`;
}

async function youyouLandingPersistVisitor(page, content, visitor = {}) {
  const companyId = page?.dataset?.companyId || state.company?.id || "";
  if (!companyId || !SUPABASE_URL || !SUPABASE_KEY) return { ok:false, reason:"preview" };
  const pageId = page?.dataset?.pageId || "page";
  const sessionKey = `youyou_lp_conversation_${companyId}_${pageId}`;
  let conversationId = sessionStorage.getItem(sessionKey) || "";
  const headers = { "Content-Type":"application/json", apikey:SUPABASE_KEY };
  if (!conversationId) {
    conversationId = crypto.randomUUID();
    const create = await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
      method:"POST", headers:{...headers, Prefer:"return=minimal"},
      body:JSON.stringify({
        id:conversationId,
        company_id:companyId,
        visitor_name:String(visitor.name || "Landing page visitor").slice(0,120),
        visitor_email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(visitor.email || "")) ? String(visitor.email).slice(0,180) : null,
        status:"open"
      })
    });
    if (!create.ok) throw new Error(await create.text());
    sessionStorage.setItem(sessionKey, conversationId);
  }
  const save = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method:"POST", headers:{...headers, Prefer:"return=minimal"},
    body:JSON.stringify({ conversation_id:conversationId, sender:"visitor", content:String(content || "").slice(0,4000) })
  });
  if (!save.ok) throw new Error(await save.text());
  return { ok:true, conversationId };
}

window.youyouLandingSubmit = function(form) {
  if (!form) return false;
  const page = form.closest('.lp-live-page');
  const status = form.querySelector('[data-lp-lead-status]');
  const button = form.querySelector('button[type="submit"]');
  const name = String(form.elements?.name?.value || '').trim();
  const phone = String(form.elements?.phone?.value || '').trim();
  const email = String(form.elements?.email?.value || '').trim();
  const city = String(form.elements?.city?.value || '').trim();
  const address = String(form.elements?.address?.value || '').trim();
  const message = String(form.elements?.message?.value || '').trim();
  if (!name || !phone || !city || !address) {
    if (status) { status.textContent = 'Please add your name, phone, city and address.'; status.className = 'lp-lead-status is-error'; }
    return false;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (status) { status.textContent = 'Please check the email address or leave it empty.'; status.className = 'lp-lead-status is-error'; }
    return false;
  }
  const pageTitle = page?.dataset?.pageTitle || 'this offer';
  const commerce = page?.querySelector('[data-commerce-box]');
  const quantity = String(commerce?.querySelector('[data-order-qty]')?.textContent || commerce?.querySelector('[data-order-summary-qty]')?.textContent || '').trim();
  const total = String(commerce?.querySelector('[data-order-total]')?.textContent || '').trim();
  const currency = String(commerce?.dataset?.currency || '').trim();
  const bundle = String(commerce?.querySelector('[data-bundle-qty].is-active')?.textContent || '').trim();
  const color = String(commerce?.querySelector('[data-order-color].is-active')?.dataset?.orderColor || '').trim();
  const variants = [...(commerce?.querySelectorAll('[data-order-variant]') || [])].map((el) => `${el.dataset.orderVariant}: ${el.value}`).filter(Boolean);
  const details = [`Phone: ${phone}`,`City: ${city}`,`Address: ${address}`,email ? `Email: ${email}` : '',quantity ? `Quantity: ${quantity}` : '',color ? `Color: ${color}` : '',bundle ? `Bundle: ${bundle}` : '',variants.length ? `Options: ${variants.join(', ')}` : '',total ? `Order total: ${currency} ${total}` : '',message ? `Message: ${message}` : ''].filter(Boolean).join(' | ');
  const content = `Lead form submission for ${pageTitle}. ${details}`;
  if (button) button.disabled = true;
  if (status) { status.textContent = 'Sending…'; status.className = 'lp-lead-status is-sending'; }
  (async()=>{
    try {
      const result = await youyouLandingPersistVisitor(page, content, { name, email });
      if (result.ok) {
        if (status) { status.textContent = '✓ Request sent successfully. We received your details.'; status.className = 'lp-lead-status is-success'; }
        const followup = form.querySelector('[data-lp-lead-followup]');
        if (followup) followup.hidden = false;
        form.dataset.submitted = 'true';
      } else if (status) { status.textContent = 'Preview only — publish the page to receive real requests.'; status.className = 'lp-lead-status is-preview'; }
    } catch (error) {
      console.error('YOUYOU landing lead form:', error);
      if (status) { status.textContent = 'Could not send right now. Please try again or use another contact option.'; status.className = 'lp-lead-status is-error'; }
    } finally { if (button) button.disabled = false; }
  })();
  return false;
};


window.youyouLandingUpdateOrder = function(source) {
  const page=source?.closest?.('.lp-live-page')||document.querySelector('.lp-live-page'), box=source?.closest?.('[data-commerce-box]')||page?.querySelector('[data-commerce-box]'); if(!box)return;
  const min=Math.max(1,Number(box.dataset.min)||1),max=Math.max(min,Number(box.dataset.max)||20),qtyEl=box.querySelector('[data-order-qty]'); let qty=Math.max(min,Math.min(max,Number(qtyEl?.textContent)||min));
  if(qtyEl)qtyEl.textContent=String(qty); box.querySelectorAll('[data-order-summary-qty]').forEach(el=>el.textContent=String(qty)); const unit=Math.max(0,Number(box.dataset.unitPrice)||0),total=unit*qty; box.querySelectorAll('[data-order-total]').forEach(el=>el.textContent=total.toFixed(2)); box.querySelectorAll('[data-bundle-qty]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.bundleQty)===qty));
  const variants=[...box.querySelectorAll('[data-order-variant]')].map(el=>`${el.dataset.orderVariant}: ${el.value}`).filter(Boolean),color=String(box.querySelector('[data-order-color].is-active')?.dataset?.orderColor||'').trim(),title=page?.dataset?.pageTitle||'this product',currency=box.dataset.currency||'',summary=[`Hi! I am interested in ${title}.`,`Quantity: ${qty}`]; if(color)summary.push(`Color: ${color}`); if(variants.length)summary.push(`Options: ${variants.join(', ')}`); if(unit>0)summary.push(`Total: ${currency} ${total.toFixed(2)}`);
  page?.querySelectorAll('a[href*="wa.me/"]').forEach(link=>{try{const base=String(link.href).split('?')[0];link.href=`${base}?text=${encodeURIComponent(summary.join('\\n'))}`}catch(_){}});
};
window.youyouLandingChangeQty=function(button,delta){const box=button?.closest?.('[data-commerce-box]'),qty=box?.querySelector('[data-order-qty]');if(!box||!qty)return;const min=Math.max(1,Number(box.dataset.min)||1),max=Math.max(min,Number(box.dataset.max)||20);qty.textContent=String(Math.max(min,Math.min(max,(Number(qty.textContent)||min)+Number(delta||0))));window.youyouLandingUpdateOrder(button)};
window.youyouLandingChooseColor=function(button){const box=button?.closest?.('[data-commerce-box]');if(!box)return;box.querySelectorAll('[data-order-color]').forEach(el=>el.classList.toggle('is-active',el===button));window.youyouLandingUpdateOrder(button)};
window.youyouLandingChooseColor=function(button){const box=button?.closest?.('[data-commerce-box]');if(!box)return;box.querySelectorAll('[data-order-color]').forEach(el=>el.classList.toggle('is-active',el===button));window.youyouLandingUpdateOrder(button)};
window.youyouLandingChooseBundle=function(button,quantity){const box=button?.closest?.('[data-commerce-box]'),qty=box?.querySelector('[data-order-qty]');if(!box)return;if(qty)qty.textContent=String(quantity||1);box.querySelectorAll('[data-bundle-qty]').forEach(el=>el.classList.toggle('is-active',el===button));window.youyouLandingUpdateOrder(button)};
function yyInitCommerce(root=document){root.querySelectorAll?.('[data-commerce-box]').forEach(box=>window.youyouLandingUpdateOrder(box))}

function initLandingCarousels(root = document) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll?.('.lp-image-slider').forEach((slider) => {
    if (slider.dataset.yyCarouselReady === '1') return;
    slider.dataset.yyCarouselReady = '1';

    const track = slider.querySelector('.lp-image-track');
    const slides = [...(track?.querySelectorAll('.lp-image-slide') || [])];
    const dotsHost = slider.querySelector('[data-carousel-dots]');
    const counter = slider.querySelector('[data-carousel-counter]');
    const prev = slider.querySelector('.lp-image-arrow.prev');
    const next = slider.querySelector('.lp-image-arrow.next');
    if (!track || slides.length < 2) return;

    let positions = [];
    let active = 0;
    let raf = 0;
    let timer = null;

    const measure = () => {
      const trackRect = track.getBoundingClientRect();
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const raw = slides.map((slide) => {
        const rect = slide.getBoundingClientRect();
        return Math.max(0, Math.min(maxScroll, rect.left - trackRect.left + track.scrollLeft));
      });
      positions = raw.filter((value, index, arr) => index === 0 || Math.abs(value - arr[index - 1]) > 3);
      if (!positions.length) positions = [0];
      active = Math.max(0, Math.min(active, positions.length - 1));

      if (dotsHost) {
        if (positions.length <= 10) {
          dotsHost.hidden = false;
          dotsHost.innerHTML = positions.map((_, index) => `<button type="button" data-carousel-page="${index}" aria-label="Show carousel page ${index + 1}"></button>`).join('');
          if (counter) counter.hidden = true;
        } else {
          dotsHost.hidden = true;
          if (counter) counter.hidden = false;
        }
      }
      updateIndicators();
    };

    const nearestIndex = () => {
      let best = 0;
      let distance = Infinity;
      positions.forEach((pos, index) => {
        const d = Math.abs(pos - track.scrollLeft);
        if (d < distance) { distance = d; best = index; }
      });
      return best;
    };

    const updateIndicators = () => {
      active = nearestIndex();
      dotsHost?.querySelectorAll('button').forEach((dot, index) => dot.classList.toggle('is-active', index === active));
      if (counter && !counter.hidden) counter.textContent = `${active + 1} / ${positions.length}`;
    };

    const go = (index, behavior = 'smooth') => {
      if (!positions.length) measure();
      const safe = ((index % positions.length) + positions.length) % positions.length;
      track.scrollTo({ left: positions[safe] || 0, behavior });
      active = safe;
      updateIndicators();
    };

    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateIndicators);
    }, { passive:true });
    dotsHost?.addEventListener('click', (event) => {
      const dot = event.target.closest?.('[data-carousel-page]');
      if (dot) go(Number(dot.dataset.carouselPage || 0));
    });
    prev?.addEventListener('click', () => go(active - 1));
    next?.addEventListener('click', () => go(active + 1));

    const pause = () => { if (timer) clearInterval(timer); timer = null; };
    const play = () => {
      pause();
      if (slider.dataset.autoplay !== 'true' || reduced || positions.length < 2 || document.hidden) return;
      const speed = Math.max(2000, Number(slider.dataset.speed) || 4000);
      timer = setInterval(() => go(active + 1), speed);
    };
    slider.addEventListener('mouseenter', pause);
    slider.addEventListener('mouseleave', play);
    slider.addEventListener('focusin', pause);
    slider.addEventListener('focusout', play);
    slider.addEventListener('pointerdown', pause, { passive:true });
    slider.addEventListener('pointerup', play, { passive:true });
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { measure(); go(active, 'auto'); }, 80);
    };
    window.addEventListener('resize', onResize, { passive:true });

    measure();
    go(0, 'auto');
    play();
  });
}

function landingCustomSectionsMarkup(data = {}) {
  const items = Array.isArray(data.customSections) ? data.customSections : [];
  return items.slice(0, 8).map((item, index) => {
    const title = String(item?.title || "").trim();
    const text = String(item?.text || "").trim();
    if (!title && !text) return "";
    return `<section class="lp-live-section lp-custom-section" data-custom-section="${index}">${title ? `<small>${escapeHtml(item.eyebrow || "MORE")}</small><h2>${escapeHtml(title)}</h2>` : ""}${text ? `<div class="lp-custom-section-copy">${escapeHtml(text).replace(/\n/g,"<br>")}</div>` : ""}</section>`;
  }).join("");
}

function landingBeautyPreviewMarkup(data, compact = false) {
  const direction = data.direction === "rtl" ? "rtl" : "ltr";
  const rawBenefits = String(data.benefits || "").trim();
  const benefits = rawBenefits.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,6);
  const desc = String(data.description || "").trim();
  const testimonial = String(data.testimonial || "").trim();
  const faqQ = String(data.faqQuestion || "").trim();
  const faqA = String(data.faqAnswer || "").trim();
  const heroImage = String(data.heroImageUrl || data.imageUrl || "").trim();
  const heroVideo = data.heroMediaEnabled === "off" ? "" : landingHeroVideoMarkup(data, "beauty-hero-video");
  const productVisual = data.heroMediaEnabled === "off" ? "" : (heroVideo || (heroImage
    ? `<img src="${escapeHtml(heroImage)}" alt="${escapeHtml(data.name || 'Beauty product')}" loading="lazy"/>`
    : `<div class="beauty-product-art" aria-label="Sample product visual"><span class="beauty-orb orb-a"></span><span class="beauty-orb orb-b"></span><div class="beauty-bottle"><i></i><b>${escapeHtml((data.badge || 'BEAUTY').slice(0,12))}</b><small>product</small></div><div class="beauty-petal petal-a"></div><div class="beauty-petal petal-b"></div><div class="beauty-petal petal-c"></div></div>`));
  const price = landingPriceMarkup(data);
  const galleryMode = String(data.sliderEnabled || "off");
  const galleryUrls = [String(data.imageUrl || "").trim(), ...String(data.mediaGallery || "").split("\n").map(x=>x.trim())]
    .filter(Boolean).filter((url,index,arr)=>arr.indexOf(url)===index).filter(url=>!landingVideoSource(url)).slice(0,20);
  let gallerySection = "";
  if (galleryMode === "on" && galleryUrls.length) {
    gallerySection = landingImageSliderMarkup(data);
  } else if (galleryMode === "grid" && galleryUrls.length) {
    const title = String(data.sliderTitle || "").trim();
    gallerySection = `<section class="beauty-gallery-section" id="details" data-block="image-gallery">${title ? `<div class="beauty-section-heading"><small>DETAILS</small><h2>${escapeHtml(title)}</h2></div>` : ''}<div class="beauty-gallery">${galleryUrls.map((u,i)=>`<figure><img src="${escapeHtml(u)}" alt="${escapeHtml(data.name || 'Beauty product')} detail ${i+1}" loading="lazy"/></figure>`).join('')}</div></section>`;
  }
  const video = data.videoEnabled !== "off" ? landingVideoBlockMarkup(data) : "";
  const mediaPos = ["right","left","top","bottom"].includes(data.mediaPosition) ? data.mediaPosition : "right";
  const pageAttrs = `data-company-id="${escapeHtml(state.company?.id || '')}" data-page-id="${escapeHtml(data.id || '')}" data-page-title="${escapeHtml(data.name || 'Beauty product')}"`;

  const nav = `<nav class="beauty-nav"><strong>${escapeHtml(state.company?.name || 'YOUR BRAND')}</strong><div><a href="#story">Benefits</a>${gallerySection ? '<a href="#details">Gallery</a>' : ''}${data.showFaq !== 'off' && faqQ && faqA ? '<a href="#faq">FAQ</a>' : ''}</div><a href="${landingCtaHref(data)}">${escapeHtml(data.ctaText || 'Explore')}</a></nav>`;
  const hero = `<section class="beauty-hero${productVisual ? '' : ' no-hero-media'}"><div class="beauty-copy"><span class="beauty-eyebrow">${escapeHtml(data.badge || 'BEAUTY')}</span><h1>${escapeHtml(data.headline || 'Your next beauty essential starts here.')}</h1>${data.subheadline ? `<p>${escapeHtml(data.subheadline)}</p>` : ''}${price}<div class="beauty-actions"><a class="lp-live-primary" href="${landingCtaHref(data)}">${escapeHtml(data.ctaText || 'Explore the offer')}</a>${data.whatsapp ? `<a class="beauty-text-link" href="${landingWhatsAppHref(data)}">WhatsApp ↗</a>`:''}</div></div>${productVisual ? `<div class="beauty-visual-wrap${heroVideo ? ' has-video' : ''}">${productVisual}</div>` : ''}</section>`;
  const marquee = `<section class="beauty-marquee" aria-hidden="true"><span>DISCOVER</span><i></i><span>DETAILS</span><i></i><span>ROUTINE</span><i></i><span>ACTION</span></section>`;
  const story = data.showBenefits !== "off" && (benefits.length || desc) ? `<section id="story" class="beauty-story"><div class="beauty-story-head"><span>WHY IT STANDS OUT</span><h2>Made to be easy to understand — and easy to choose.</h2>${desc ? `<p>${escapeHtml(desc)}</p>` : ''}</div>${benefits.length ? `<div class="beauty-benefits">${benefits.map((b,i)=>`<article><div class="beauty-icon">${['✦','◌','♡','＋','◇','☼'][i]||'✦'}</div><h3>${escapeHtml(b)}</h3></article>`).join('')}</div>` : ''}</section>` : '';
  const editorial = String(data.extraText || '').trim() ? `<section class="beauty-editorial"><div class="beauty-editorial-card"><small>${escapeHtml(data.extraTitle || 'PRODUCT STORY')}</small><h2>${escapeHtml(data.extraTitle || 'More about this product')}</h2><p>${escapeHtml(data.extraText).replace(/\n/g,'<br>')}</p></div></section>` : '';
  const review = data.showTestimonial !== "off" && testimonial ? `<section class="beauty-review-section"><div class="beauty-quote-mark">“</div><blockquote>${escapeHtml(testimonial)}</blockquote><div class="beauty-review-meta"><span class="beauty-avatar">C</span><div><strong>Customer feedback</strong><small>Shared by the business</small></div></div></section>` : "";
  const faq = data.showFaq !== "off" && faqQ && faqA ? `<section id="faq" class="beauty-faq"><div><small>GOOD TO KNOW</small><h2>${escapeHtml(faqQ)}</h2></div><p>${escapeHtml(faqA)}</p></section>` : '';
  const directCta = data.ctaAction !== 'form' ? `<a class="lp-live-primary lp-direct-contact" href="${landingCtaHref(data)}" ${data.ctaAction === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}>${escapeHtml(data.ctaText || 'Continue')} <span>↗</span></a>` : '';
  const showLeadForm = data.leadFormEnabled !== 'off';
  const finalCta = data.showContact === "off" ? "" : `<section id="contact" class="beauty-final-cta ${showLeadForm ? 'has-form' : ''}"><div><small>READY WHEN YOU ARE</small><h2>${escapeHtml(data.ctaText || 'Continue')}</h2><p>${showLeadForm ? 'Share your details and the business can follow up with you.' : 'Choose the action below to continue.'}</p>${directCta ? `<div class="lp-contact-direct-action">${directCta}</div>` : ''}</div>${showLeadForm ? landingLeadFormMarkup(data, 'beauty-lead-form') : ''}</section>`;

  const parts = [nav, hero, marquee];
  let videoAdded = false, galleryAdded = false;
  const addAt = (position) => {
    if (!videoAdded && video && (data.videoPosition || 'after-hero') === position) {
      parts.push(video); videoAdded = true;
      if (!galleryAdded && gallerySection && (data.sliderPosition || 'after-video') === 'after-video') { parts.push(gallerySection); galleryAdded = true; }
    }
    if (!galleryAdded && gallerySection && (data.sliderPosition || 'after-video') === position) { parts.push(gallerySection); galleryAdded = true; }
  };
  addAt('after-hero');
  if (story) parts.push(story);
  addAt('after-benefits');
  if (editorial) parts.push(editorial);
  if (review) parts.push(review);
  if (faq) parts.push(faq);
  addAt('before-contact');
  if (!videoAdded && video) { parts.push(video); videoAdded = true; }
  if (!galleryAdded && gallerySection) { parts.push(gallerySection); galleryAdded = true; }
  const customSections = landingCustomSectionsMarkup(data);
  if (customSections) parts.push(customSections);
  if (finalCta) parts.push(finalCta);
  parts.push(`<footer class="beauty-footer"><strong>${escapeHtml(data.businessName || state.company?.name || 'YOUR BRAND')}</strong><span>Powered by YOUYOU</span></footer>`, landingWidgetMarkup(data));

  return `<article class="lp-live-page beauty-wow ${compact ? 'is-compact' : ''} media-${mediaPos} density-${escapeHtml(data.sectionDensity || 'balanced')}" dir="${direction}" ${pageAttrs} style="${landingRootStyle(data)}">${parts.join('')}</article>`;
}

function landingPreviewMarkup(data, compact = false) {
  if (data.templateId === "beauty-product") return landingBeautyPreviewMarkup(data, compact);
  const benefits = String(data.benefits || "").split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 6);
  const direction = data.direction === "rtl" ? "rtl" : "ltr";
  const mediaPosition = ["right","left","top","bottom"].includes(data.mediaPosition) ? data.mediaPosition : "right";
  const mediaWidth = Math.min(65, Math.max(35, Number(data.mediaWidth) || 46));
  const mediaHeight = Math.min(620, Math.max(240, Number(data.mediaHeight) || 380));
  const videoBlock = landingVideoBlockMarkup(data);
  const sliderBlock = landingImageSliderMarkup(data);
  const extraSection = String(data.extraText || "").trim() ? `<section class="lp-live-section lp-live-extra"><small>${escapeHtml(data.extraTitle || "MORE ABOUT THIS OFFER")}</small><div class="lp-live-extra-copy">${escapeHtml(data.extraText).replace(/\n/g,"<br>")}</div></section>` : "";
  const heroMedia = landingHeroMediaMarkup(data);
  const template = landingTemplateById(data.templateId);
  const hero = `<section class="lp-live-hero${heroMedia ? '' : ' no-hero-media'}"><div class="lp-live-copy"><span class="lp-live-badge">${escapeHtml(data.badge || "FEATURED")}</span><h1>${escapeHtml(data.headline || "Your headline goes here")}</h1><p class="lp-live-sub">${escapeHtml(data.subheadline || "")}</p>${landingPriceMarkup(data)}<div class="lp-live-actions"><a href="${landingCtaHref(data)}" class="lp-live-primary">${escapeHtml(data.ctaText || "Get started")}</a>${data.whatsapp ? `<a href="${landingWhatsAppHref(data)}" class="lp-live-secondary">WhatsApp ↗</a>` : ""}</div><div class="lp-live-trust">${landingTemplateExperience(data).map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></div>${heroMedia}</section>`;
  const benefitsSection = data.showBenefits === "off" ? "" : `<section class="lp-live-section lp-live-benefits"><small>WHY THIS OFFER</small><h2>${escapeHtml(data.description || "Explain the value clearly.")}</h2><div class="lp-live-benefit-grid">${benefits.map((item, index) => `<div><span>0${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}</div></section>`;
  const testimonial = String(data.testimonial || "").trim();
  const proofSection = data.showTestimonial !== "off" && testimonial ? `<section class="lp-live-section lp-live-proof"><small>CUSTOMER FEEDBACK</small><blockquote>“${escapeHtml(testimonial)}”</blockquote></section>` : "";
  const faqSection = data.showFaq === "off" ? "" : `<section class="lp-live-section lp-live-faq"><small>FAQ</small><h3>${escapeHtml(data.faqQuestion || "Common customer question")}</h3><p>${escapeHtml(data.faqAnswer || "Add the answer here.")}</p></section>`;
  const directCta = data.ctaAction !== 'form' ? `<a href="${landingCtaHref(data)}" class="lp-live-primary lp-direct-contact" ${data.ctaAction === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}>${escapeHtml(data.ctaText || 'Continue')} ↗</a>` : '';
  const showLeadForm = data.leadFormEnabled !== 'off';
  const contactSection = data.showContact === "off" ? "" : `<section id="contact" class="lp-live-section lp-live-contact"><div><small>CONTACT</small><h2>${escapeHtml(data.ctaText || "Get started")}</h2><p>${showLeadForm ? 'Leave your details and the business can follow up.' : 'Continue using the selected contact option.'}</p>${directCta ? `<div class="lp-contact-direct-action">${directCta}</div>` : ''}</div>${showLeadForm ? landingLeadFormMarkup(data) : ''}</section>`;
  const bodySections = [hero];
  const pushExtraIf = (position) => { if (data.extraTextPosition === position && extraSection) bodySections.push(extraSection); };
  const pushVideoIf = (position) => { if ((data.videoPosition || "after-hero") === position && videoBlock) bodySections.push(videoBlock); };
  const pushSliderIf = (position) => { if ((data.sliderPosition || "after-video") === position && sliderBlock) bodySections.push(sliderBlock); };
  pushVideoIf("after-hero"); if ((data.sliderPosition||'after-video')==='after-video' && (data.videoPosition||'after-hero')==='after-hero' && videoBlock && sliderBlock) bodySections.push(sliderBlock); else pushSliderIf("after-hero"); pushExtraIf("after-hero");
  if (benefitsSection) bodySections.push(benefitsSection);
  pushVideoIf("after-benefits"); if ((data.sliderPosition||'after-video')==='after-video' && (data.videoPosition||'after-hero')==='after-benefits' && videoBlock && sliderBlock) bodySections.push(sliderBlock); else pushSliderIf("after-benefits"); if ((data.extraTextPosition || "after-benefits") === "after-benefits" && extraSection) bodySections.push(extraSection);
  if (proofSection) bodySections.push(proofSection); if (faqSection) bodySections.push(faqSection);
  pushVideoIf("before-contact"); if ((data.sliderPosition||'after-video')==='after-video' && (data.videoPosition||'after-hero')==='before-contact' && videoBlock && sliderBlock) bodySections.push(sliderBlock); else pushSliderIf("before-contact"); pushExtraIf("before-contact");
  if (sliderBlock && !bodySections.includes(sliderBlock)) bodySections.splice(Math.max(1, bodySections.length-1),0,sliderBlock);
  const customSections = landingCustomSectionsMarkup(data);
  if (customSections) bodySections.push(customSections);
  if (contactSection) bodySections.push(contactSection);
  const slugClass = `layout-${String(template?.layout || 'standard').replace(/[^a-z0-9-]/gi,'-').toLowerCase()}`;
  return `<article class="lp-live-page ${compact ? "is-compact" : ""} media-${mediaPosition} density-${escapeHtml(data.sectionDensity || "balanced")} ${slugClass}" dir="${direction}" data-company-id="${escapeHtml(state.company?.id || '')}" data-page-id="${escapeHtml(data.id || '')}" data-page-title="${escapeHtml(data.name || 'Landing page')}" style="${landingRootStyle(data)};--lp-media-width:${mediaWidth}%;--lp-media-height:${mediaHeight}px"><nav class="lp-live-nav"><strong>${escapeHtml(data.businessName || state.company?.name || "YOUR BRAND")}</strong><span>${escapeHtml(data.pageType || "Landing Page")}</span></nav>${bodySections.join("")}<footer class="lp-live-footer"><strong>${escapeHtml(data.businessName || state.company?.name || "YOUR BRAND")}</strong><span>Built with YOUYOU</span></footer>${landingWidgetMarkup(data)}</article>`;
}

function landingSlugify(value = "") {
  return String(value || "landing-page")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "landing-page";
}

function landingShortToken() {
  const source = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  return String(source).replace(/[^a-z0-9]/gi, "").toLowerCase().slice(-5) || Math.random().toString(36).slice(2, 7);
}

function landingPublicUrl(slug = "") {
  const safe = landingSlugify(slug);
  return `${window.location.origin}/p/${encodeURIComponent(safe)}`;
}

function landingNeedsRendererUpdate(data = {}) {
  if (!data?.publishedUrl && !data?.publishedSlug) return false;
  const liveVersion = String(data.publishedRendererVersion || data.rendererVersion || '').trim();
  return liveVersion !== YOUYOU_LANDING_RENDERER_VERSION;
}

function landingHasTemporaryMedia(data = {}) {
  const urls = [
    data.heroImageUrl, data.imageUrl, data.videoUrl,
    ...String(data.mediaGallery || "").split("\n")
  ].map((value) => String(value || "").trim()).filter(Boolean);
  return urls.some((url) => url.startsWith("blob:") || url.startsWith("data:"));
}

function landingExportHtml(data, options = {}) {
  const body = landingPreviewMarkup(data, false);
  return `<!doctype html>
<html lang="${data.direction === "rtl" ? "ar" : "en"}" dir="${data.direction === "rtl" ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<meta name="theme-color" content="${escapeHtml(data.background || '#ffffff')}"/>
<meta name="description" content="${escapeHtml(String(data.subheadline || data.description || '').slice(0,180))}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${escapeHtml(data.name || data.headline || 'Landing Page')}"/>
<meta property="og:description" content="${escapeHtml(String(data.subheadline || data.description || '').slice(0,180))}"/>
${/^https?:\/\//i.test(String(data.publicUrl || '')) ? `<meta property="og:url" content="${escapeHtml(String(data.publicUrl))}"/><link rel="canonical" href="${escapeHtml(String(data.publicUrl))}"/>` : ''}
${/^https?:\/\//i.test(String(data.heroImageUrl || data.imageUrl || '')) ? `<meta property="og:image" content="${escapeHtml(String(data.heroImageUrl || data.imageUrl || ''))}"/>` : ''}
<meta name="twitter:card" content="summary_large_image"/>
<title>${escapeHtml(data.name || "Landing Page")}</title>
<style>
*{box-sizing:border-box}:root{color-scheme:light dark!important;--yy-page-bg:${data.background};--yy-page-surface:${data.surface};--yy-page-text:${data.textColor};--yy-page-accent:${data.accent}}html{color-scheme:light dark!important;background-color:${data.background}!important;background-image:linear-gradient(${data.background},${data.background})!important}body{margin:0;color-scheme:light dark!important;background-color:${data.background}!important;background-image:linear-gradient(${data.background},${data.background})!important;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:${data.textColor}!important;-webkit-text-size-adjust:100%;text-size-adjust:100%}
.lp-live-page{--lp-accent:${data.accent};--lp-bg:${data.background};--lp-surface:${data.surface};--lp-text:${data.textColor};max-width:1180px;margin:auto;background:var(--lp-bg);color:var(--lp-text);min-height:100vh}
.lp-live-nav,.lp-live-footer{display:flex;justify-content:space-between;padding:22px 5%;border-bottom:1px solid #ffffff14}
.lp-live-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,var(--lp-media-width));gap:36px;padding:70px 5%;align-items:center}.media-left .lp-live-copy{order:2}.media-left .lp-live-media{order:1}.media-top .lp-live-hero,.media-bottom .lp-live-hero{grid-template-columns:1fr}.media-top .lp-live-media{order:-1}.media-bottom .lp-live-media{order:2}.lp-live-copy h1{font-size:56px;line-height:1.02;margin:18px 0}.lp-live-sub{font-size:18px;line-height:1.6;color:#b8bdc9}.lp-live-badge{padding:7px 10px;border-radius:999px;background:color-mix(in srgb,var(--lp-accent) 16%,transparent);color:var(--lp-accent);font-weight:700;font-size:12px}.lp-live-price{display:flex;gap:12px;align-items:baseline;margin:24px 0}.lp-live-price strong{font-size:34px}.lp-live-price del{opacity:.45}.lp-live-actions{display:flex;gap:10px;flex-wrap:wrap}.lp-live-actions a{padding:14px 18px;border-radius:10px;text-decoration:none;font-weight:700}.lp-live-primary{background:var(--lp-accent);color:#080808}.lp-live-secondary{border:1px solid #ffffff25;color:var(--lp-text)}.lp-live-media{min-height:var(--lp-media-height);border-radius:24px;background:var(--lp-surface);overflow:hidden;position:relative}.lp-live-media-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;height:var(--lp-media-height);scrollbar-width:thin}.lp-live-media-slide{min-width:100%;height:100%;scroll-snap-align:start}.lp-live-media img,.lp-live-media video,.lp-live-media iframe{width:100%;height:100%;object-fit:cover;border:0;display:block}.lp-live-media-hint,.lp-live-demo-note{position:absolute;left:14px;bottom:14px;padding:7px 10px;border-radius:999px;background:#0009;color:#fff;font-size:11px}.lp-live-section{padding:55px 5%;border-top:1px solid #ffffff10}.lp-live-section>small{color:var(--lp-accent);font-weight:800}.lp-live-section h2{font-size:34px;max-width:780px}.lp-live-extra-copy{max-width:850px;font-size:18px;line-height:1.75}.lp-live-benefit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.lp-live-benefit-grid div{padding:20px;background:var(--lp-surface);border-radius:14px}.lp-live-benefit-grid span{display:block;color:var(--lp-accent);font-size:12px;margin-bottom:10px}.lp-live-proof blockquote{font-size:28px;max-width:780px;margin:20px 0}.lp-live-contact{display:grid;grid-template-columns:1fr 1fr;gap:30px}.lp-live-contact form{display:grid;gap:10px}.lp-live-contact input,.lp-live-contact textarea{width:100%;padding:13px;border:1px solid #ffffff18;border-radius:9px;background:var(--lp-surface);color:var(--lp-text)}.lp-live-contact button{padding:14px;border:0;border-radius:9px;background:var(--lp-accent);font-weight:800}
.lp-live-trust{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;font-size:12px;opacity:.65}.lp-live-footer{border-top:1px solid #ffffff14;border-bottom:0}.lp-live-media{position:relative}.lp-live-media-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none}.lp-live-media-track::-webkit-scrollbar{display:none}.lp-live-media-slide{position:relative;flex:0 0 100%;min-width:100%;height:100%;scroll-snap-align:start}.lp-live-empty-slide{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:28px;text-align:center}.lp-empty-icon{font-size:28px}.lp-live-slider-arrow{position:absolute;z-index:8;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:1px solid #ffffff4a;background:#080c16aa;color:#fff;font-size:27px;cursor:pointer}.lp-live-slider-arrow.prev{left:14px}.lp-live-slider-arrow.next{right:14px}.lp-live-slider-dots{position:absolute;z-index:9;left:50%;bottom:17px;transform:translateX(-50%);display:flex;gap:7px;padding:7px 10px;border-radius:999px;background:#080c1690}.lp-live-slider-dots button{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:#ffffff7a}.lp-live-slider-dots button.is-active{width:22px;background:var(--lp-accent)}.lp-live-media-hint{position:absolute;z-index:7;left:16px;top:16px;bottom:auto;background:#080c16a3;color:#fff;padding:8px 10px;border-radius:10px;display:flex;flex-direction:column}.lp-live-media-hint span{font-size:8px;font-weight:800}.lp-live-media-hint small{font-size:7px;opacity:.7}
@media(max-width:760px){.lp-live-hero,.lp-live-contact{grid-template-columns:1fr}.media-left .lp-live-copy,.media-left .lp-live-media{order:initial}.lp-live-copy h1{font-size:38px}.lp-live-benefit-grid{grid-template-columns:1fr}.lp-live-media-track{height:min(var(--lp-media-height),360px)}}
/* YOUYOU V7.11 — Samsung Internet authored palette lock.
   Samsung Internet's default Force Dark pipeline only defers to author colors when the page
   explicitly advertises BOTH schemes and supplies a prefers-color-scheme rule. We therefore
   advertise light+dark, but intentionally render the SAME creator palette in both schemes. */
:root,html,body,.lp-live-page,.beauty-wow{color-scheme:light dark!important}
.lp-live-page,.beauty-wow,.lp-live-page *,.beauty-wow *{forced-color-adjust:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
html,body{background-color:var(--yy-page-bg)!important;background-image:linear-gradient(var(--yy-page-bg),var(--yy-page-bg))!important;color:var(--yy-page-text)!important}
.lp-live-page,.beauty-wow{background-color:var(--lp-bg)!important;background-image:linear-gradient(var(--lp-bg),var(--lp-bg))!important;color:var(--lp-text)!important;-webkit-text-fill-color:var(--lp-text)!important}
.lp-live-nav,.lp-live-footer,.lp-live-section,.beauty-nav,.beauty-hero,.beauty-story,.beauty-faq,.beauty-footer{color:var(--lp-text)!important}
.lp-live-page :is(h1,h2,h3,h4,h5,h6,p,li,label,blockquote,strong,span,small),.beauty-wow :is(h1,h2,h3,h4,h5,h6,p,li,label,blockquote,strong,span,small){-webkit-text-fill-color:currentColor}
.lp-live-benefit-grid>div,.beauty-benefits article,.beauty-stat-grid>div,.lp-lead-form input,.lp-lead-form textarea,.lp-lead-form select{background-color:var(--lp-surface)!important;background-image:linear-gradient(var(--lp-surface),var(--lp-surface))!important;color:var(--lp-text)!important;color-scheme:light dark!important}
.beauty-marquee,.beauty-editorial-card,.beauty-final-cta{background-color:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)),color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)))!important;color:var(--lp-text)!important}
.beauty-gallery-section,.beauty-wow .lp-product-video{background-color:color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)),color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)))!important}
.beauty-review-section{background-color:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)),color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)))!important;color:var(--lp-text)!important}
.lp-live-badge,.lp-live-section>small,.beauty-eyebrow{color:var(--lp-accent)!important;-webkit-text-fill-color:var(--lp-accent)!important}
.lp-live-primary,.beauty-nav>a,.lp-lead-form button,.lp-lead-followup{background-color:var(--lp-accent)!important;background-image:linear-gradient(var(--lp-accent),var(--lp-accent))!important}
.lp-live-primary,.beauty-nav>a,.lp-lead-form button,.lp-lead-followup{color:#fff!important;-webkit-text-fill-color:#fff!important}
.lp-live-contact input,.lp-live-contact textarea,.lp-live-contact select,.lp-live-contact button,.lp-ai-form input,.lp-ai-form button{color-scheme:light dark!important}
@media (prefers-color-scheme: dark){
  :root,html,body,.lp-live-page,.beauty-wow{color-scheme:light dark!important}
  html,body{background-color:var(--yy-page-bg)!important;background-image:linear-gradient(var(--yy-page-bg),var(--yy-page-bg))!important;color:var(--yy-page-text)!important}
  .lp-live-page,.beauty-wow{background-color:var(--lp-bg)!important;background-image:linear-gradient(var(--lp-bg),var(--lp-bg))!important;color:var(--lp-text)!important;-webkit-text-fill-color:var(--lp-text)!important}
  .lp-live-nav,.lp-live-footer,.lp-live-section,.beauty-nav,.beauty-hero,.beauty-story,.beauty-faq,.beauty-footer{color:var(--lp-text)!important}
  .lp-live-benefit-grid>div,.beauty-benefits article,.beauty-stat-grid>div,.lp-lead-form input,.lp-lead-form textarea,.lp-lead-form select{background-color:var(--lp-surface)!important;background-image:linear-gradient(var(--lp-surface),var(--lp-surface))!important;color:var(--lp-text)!important}
  .beauty-marquee,.beauty-editorial-card,.beauty-final-cta{background-color:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)),color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)))!important;color:var(--lp-text)!important}
  .beauty-gallery-section,.beauty-wow .lp-product-video{background-color:color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)),color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)))!important}
  .beauty-review-section{background-color:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)),color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)))!important;color:var(--lp-text)!important}
  .lp-live-badge,.lp-live-section>small,.beauty-eyebrow{color:var(--lp-accent)!important;-webkit-text-fill-color:var(--lp-accent)!important}
  .lp-live-primary,.beauty-nav>a,.lp-lead-form button,.lp-lead-followup{background-color:var(--lp-accent)!important;background-image:linear-gradient(var(--lp-accent),var(--lp-accent))!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
}



/* YOUYOU V6.4 — BEAUTY PRODUCT WOW TEMPLATE */
.beauty-wow{font-family:var(--lp-font,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);background:var(--lp-bg)!important;color:var(--lp-text)!important;max-width:1240px!important;box-shadow:none!important}
.beauty-wow:before{width:620px!important;height:620px!important;right:-220px!important;top:40px!important;background:radial-gradient(circle,color-mix(in srgb,var(--lp-accent) 22%,#fff0),transparent 68%)!important}
.beauty-nav{height:82px;padding:0 5%;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1b1b2410;position:relative;z-index:3}.beauty-nav strong{font-size:18px;letter-spacing:-.03em}.beauty-nav>div{display:flex;gap:30px;font-size:13px}.beauty-nav>a{background:#171820;color:#fff;padding:11px 16px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800}
.beauty-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px, .9fr);gap:54px;align-items:center;padding:72px 5% 86px;min-height:680px;position:relative}.beauty-eyebrow{display:inline-flex;padding:8px 12px;border-radius:999px;background:color-mix(in srgb,var(--lp-accent) 13%,#fff);color:var(--lp-accent);font-size:11px;font-weight:900;letter-spacing:.09em}.beauty-rating{display:flex;gap:10px;align-items:center;margin:20px 0 8px;font-size:12px}.beauty-rating b{color:#e7a23a;letter-spacing:2px}.beauty-rating span{opacity:.58}.beauty-copy h1{max-width:650px;margin:12px 0 20px;font-size:clamp(48px,5.7vw,82px);line-height:.94;letter-spacing:-.055em}.beauty-copy>p{max-width:570px;font-size:18px;line-height:1.7;color:#6c6e78}.beauty-wow .lp-live-price{margin:26px 0 20px}.beauty-wow .lp-live-price strong{font-size:38px}.beauty-actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap}.beauty-wow .lp-live-primary{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 24px;border-radius:14px;background:var(--lp-accent);color:#fff;text-decoration:none;font-weight:900;box-shadow:0 16px 36px color-mix(in srgb,var(--lp-accent) 28%,transparent)}.beauty-text-link{color:#171820;text-decoration:none;font-weight:800;font-size:13px}.beauty-mini-proof{display:flex;gap:17px;flex-wrap:wrap;margin-top:22px;font-size:11px;color:#666b75}
.beauty-visual-wrap{position:relative;min-height:560px;border-radius:34px;background:linear-gradient(145deg,#fff 5%,color-mix(in srgb,var(--lp-accent) 16%,#fff) 100%);overflow:hidden;box-shadow:0 36px 90px #9f4c6e22}.beauty-visual-wrap>img{width:100%;height:560px;object-fit:cover;display:block}.beauty-product-art{height:560px;position:relative;overflow:hidden;background:radial-gradient(circle at 35% 22%,#fff 0 9%,transparent 28%),linear-gradient(150deg,#fff5f9 0%,#f4bfD3 55%,#d978a0 100%)}.beauty-orb{position:absolute;border-radius:50%;filter:blur(.2px)}.orb-a{width:340px;height:340px;right:-80px;top:-70px;background:#ffffff64}.orb-b{width:330px;height:330px;left:-120px;bottom:-110px;background:#fff0f4aa}.beauty-bottle{position:absolute;left:50%;top:50%;transform:translate(-50%,-47%);width:190px;height:330px;border-radius:80px 80px 42px 42px;background:linear-gradient(100deg,#fff9,#ffffff 42%,#f9dce8 75%,#fff8);box-shadow:0 35px 70px #7a294b35,inset -12px 0 28px #d8659126;display:flex;flex-direction:column;align-items:center;justify-content:center;text-transform:uppercase}.beauty-bottle:before{content:"";position:absolute;width:94px;height:72px;border-radius:18px 18px 9px 9px;background:#161923;top:-48px;box-shadow:0 10px 20px #0003}.beauty-bottle i{width:42px;height:2px;background:var(--lp-accent);margin-bottom:16px}.beauty-bottle b{font-size:17px;letter-spacing:.16em}.beauty-bottle small{font-size:9px;letter-spacing:.22em;margin-top:8px;color:#8c6877}.beauty-petal{position:absolute;width:90px;height:42px;border-radius:90% 10% 90% 10%;background:#fff7;transform:rotate(-28deg)}.petal-a{left:70px;top:100px}.petal-b{right:80px;bottom:110px;transform:rotate(34deg)}.petal-c{left:90px;bottom:70px;transform:rotate(70deg);width:60px}.beauty-float-card{position:absolute;left:24px;right:24px;bottom:22px;padding:16px 18px;border-radius:18px;background:#151720e8;color:#fff;backdrop-filter:blur(10px);display:grid;grid-template-columns:auto 1fr;gap:4px 18px}.beauty-float-card small{grid-row:1/3;font-size:9px;letter-spacing:.12em;color:#f2a8c5}.beauty-float-card strong{font-size:15px}.beauty-float-card span{font-size:11px;color:#ffffffa7}
.beauty-marquee{min-height:68px;padding:0 5%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#171820;color:#fff;font-size:11px;font-weight:900;letter-spacing:.16em;overflow:hidden}.beauty-marquee i{width:5px;height:5px;border-radius:50%;background:var(--lp-accent)}
.beauty-story{padding:92px 5%}.beauty-story-head{display:grid;grid-template-columns:.7fr 1.5fr;gap:40px;align-items:start}.beauty-story-head>span,.beauty-gallery-section>div>small,.beauty-faq small,.beauty-final-cta small{font-size:10px;font-weight:900;letter-spacing:.13em;color:var(--lp-accent)}.beauty-story-head h2{font-size:clamp(34px,4vw,58px);line-height:1.08;letter-spacing:-.045em;margin:0;max-width:850px}.beauty-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:54px}.beauty-benefits article{padding:28px;min-height:260px;border-radius:22px;background:#fff;border:1px solid #1619230c;box-shadow:0 18px 44px #5321390b;position:relative}.beauty-benefits article>span{position:absolute;right:22px;top:22px;font-size:10px;color:#a9a5aa}.beauty-icon{width:48px;height:48px;border-radius:16px;background:color-mix(in srgb,var(--lp-accent) 14%,#fff);display:grid;place-items:center;color:var(--lp-accent);font-size:20px}.beauty-benefits h3{font-size:20px;line-height:1.25;margin:28px 0 10px}.beauty-benefits p{margin:0;color:#777982;font-size:13px;line-height:1.65}
.beauty-editorial{display:grid;grid-template-columns:1.3fr .7fr;gap:18px;padding:0 5% 92px}.beauty-editorial-card{padding:44px;border-radius:28px;background:linear-gradient(140deg,#171820,#2a2228);color:#fff}.beauty-editorial-card small{color:#f2a8c5;font-weight:900;letter-spacing:.14em}.beauty-editorial-card h2{font-size:38px;line-height:1.12;letter-spacing:-.04em;max-width:680px}.beauty-editorial-card p{color:#ffffffad;line-height:1.7;max-width:700px}.beauty-stat-grid{display:grid;gap:12px}.beauty-stat-grid>div{padding:24px;border-radius:22px;background:color-mix(in srgb,var(--lp-accent) 11%,#fff);display:flex;align-items:end;justify-content:space-between}.beauty-stat-grid strong{font-size:34px}.beauty-stat-grid span{font-size:11px;color:#78747a}
.beauty-gallery-section{padding:92px 5%;background:#fff}.beauty-gallery-section>div:first-child{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:32px}.beauty-gallery-section h2{font-size:38px;letter-spacing:-.04em;margin:10px 0 0}.beauty-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.beauty-gallery figure{margin:0;height:360px;border-radius:24px;overflow:hidden;background:linear-gradient(145deg,#fff1f6,#f1c6d6);position:relative}.beauty-gallery img{width:100%;height:100%;object-fit:cover}.beauty-gallery-demo figure{padding:28px;display:flex;flex-direction:column;justify-content:flex-end}.beauty-gallery-demo figure:nth-child(2){background:linear-gradient(145deg,#1d1b20,#49323d);color:#fff}.beauty-gallery-demo figure:nth-child(3){background:linear-gradient(145deg,#f4e4db,#e8b9aa)}.beauty-gallery-demo span{position:absolute;top:24px;right:24px;font-size:10px;opacity:.55}.beauty-gallery-demo strong{font-size:28px}.beauty-gallery-demo small{margin-top:7px;opacity:.65}
.beauty-wow .lp-product-video{padding:76px 5%!important;background:#fff!important;border-top:0!important}.beauty-wow .lp-video-frame{border-radius:28px!important;box-shadow:0 20px 50px #0001}.beauty-review-section{padding:92px 12%;background:color-mix(in srgb,var(--lp-accent) 8%,#fff);text-align:center}.beauty-quote-mark{font-family:Georgia,serif;font-size:86px;line-height:.5;color:var(--lp-accent)}.beauty-review-section blockquote{font-size:clamp(28px,3.2vw,48px);line-height:1.22;letter-spacing:-.035em;max-width:930px;margin:22px auto 32px}.beauty-review-meta{display:flex;align-items:center;justify-content:center;gap:12px}.beauty-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#171820;color:#fff}.beauty-review-meta div{text-align:left}.beauty-review-meta div strong,.beauty-review-meta div small{display:block}.beauty-review-meta div small{font-size:10px;opacity:.55;margin-top:2px}.beauty-review-meta>b{margin-left:12px;color:#e7a23a;letter-spacing:2px;font-size:11px}
.beauty-faq{padding:82px 5%;display:grid;grid-template-columns:1fr 1fr;gap:50px;border-bottom:1px solid #16192310}.beauty-faq h2{font-size:34px;line-height:1.2;letter-spacing:-.035em}.beauty-faq p{font-size:17px;line-height:1.75;color:#70727b;max-width:620px}.beauty-final-cta{margin:76px 5%;padding:48px;border-radius:30px;background:linear-gradient(135deg,#171820 0%,#38252f 100%);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:30px}.beauty-final-cta h2{font-size:42px;margin:10px 0}.beauty-final-cta p{color:#ffffff9b}.beauty-final-cta .lp-live-primary{flex:none}.beauty-footer{display:flex;justify-content:space-between;gap:20px;padding:28px 5%;font-size:11px;color:#777982}
.beauty-wow .lp-ai-launcher{background:linear-gradient(145deg,var(--lp-accent),#b73d70);box-shadow:0 18px 46px color-mix(in srgb,var(--lp-accent) 35%,transparent)}
@media(max-width:800px){.beauty-nav>div{display:none}.beauty-hero{grid-template-columns:1fr;padding-top:44px}.beauty-copy h1{font-size:52px}.beauty-visual-wrap,.beauty-product-art,.beauty-visual-wrap>img{min-height:480px;height:480px}.beauty-story-head,.beauty-editorial,.beauty-faq{grid-template-columns:1fr}.beauty-benefits,.beauty-gallery{grid-template-columns:1fr}.beauty-gallery figure{height:300px}.beauty-marquee span:nth-of-type(n+4),.beauty-marquee i:nth-of-type(n+4){display:none}.beauty-final-cta{align-items:flex-start;flex-direction:column}.beauty-footer{flex-direction:column}.beauty-review-section{padding-left:7%;padding-right:7%}}

html,body{max-width:100%;overflow-x:hidden}.lp-live-page{width:100%;overflow:hidden}.lp-product-video,.lp-product-gallery{padding:48px 5%}.lp-product-video .lp-block-head,.lp-product-gallery .lp-block-head,.lp-product-video .lp-video-frame,.lp-product-gallery .lp-image-slider{max-width:980px;margin-left:auto;margin-right:auto}.lp-video-frame{width:100%;aspect-ratio:16/9;min-height:0;max-height:520px;border-radius:22px;overflow:hidden;background:var(--lp-surface)}.lp-video-frame iframe,.lp-video-frame video{width:100%;height:100%;aspect-ratio:16/9;display:block;object-fit:cover}.lp-video-empty{min-height:220px}.lp-image-slider{width:100%;max-width:980px;overflow:hidden;border-radius:22px}.lp-image-track{width:100%;overflow-x:auto}.lp-image-slide{flex:0 0 100%;width:100%;min-width:100%;height:clamp(230px,36vw,430px);min-height:0}.lp-image-slide img{width:100%;height:100%;min-height:0;object-fit:cover}.lp-gallery-demo-note{position:absolute;left:16px;bottom:16px;padding:7px 10px;border-radius:999px;background:#080c16bf;color:#fff;font-size:9px;font-weight:800;letter-spacing:.06em}.is-empty-video .lp-block-head>span{opacity:.6}@media(max-width:760px){.lp-video-frame{aspect-ratio:16/9}.lp-video-empty{min-height:210px}.lp-image-slide{height:300px}.lp-block-head{align-items:flex-start;flex-direction:column;gap:10px}}
.lp-hero-media-card{position:relative;min-height:var(--lp-media-height);border-radius:24px;overflow:hidden;box-shadow:0 30px 70px #0003}.lp-hero-media-card>img{width:100%;height:var(--lp-media-height);object-fit:cover}.lp-hero-float{position:absolute;padding:10px 12px;border-radius:14px;background:#090b12d9;color:#fff;border:1px solid #ffffff22;display:flex;flex-direction:column}.lp-hero-float-top{right:16px;top:16px}.lp-hero-float-bottom{left:16px;bottom:16px}.lp-ai-widget{position:fixed;z-index:50;bottom:24px}.lp-ai-widget.is-right{right:24px}.lp-ai-widget.is-left{left:24px}.lp-ai-launcher{width:58px;height:58px;border:0;border-radius:50%;background:var(--lp-accent);color:#fff;box-shadow:0 18px 44px #0005;font-weight:900}.lp-ai-panel{position:absolute;bottom:70px;width:330px;background:#0b0d14f5;color:#fff;border:1px solid #ffffff20;border-radius:20px;overflow:hidden;opacity:0;pointer-events:none;transform:translateY(10px);transition:.2s}.is-right .lp-ai-panel{right:0}.is-left .lp-ai-panel{left:0}.lp-ai-widget.is-open .lp-ai-panel{opacity:1;pointer-events:auto;transform:none}.lp-ai-head{display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid #ffffff12}.lp-ai-head>div{display:flex;gap:8px}.lp-ai-head p{margin:0}.lp-ai-head small{display:block;opacity:.6}.lp-ai-context,.lp-ai-powered{padding:8px 14px;font-size:10px;opacity:.7}.lp-ai-messages{padding:14px;display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:auto}.lp-ai-msg{padding:9px 11px;border-radius:13px;max-width:85%;font-size:12px}.lp-ai-msg.bot{background:#ffffff10}.lp-ai-msg.user{align-self:flex-end;background:var(--lp-accent)}.lp-ai-suggestions{display:flex;gap:6px;flex-wrap:wrap}.lp-ai-suggestions button{border:1px solid #ffffff18;background:#ffffff08;color:#fff;border-radius:999px;padding:6px 8px}.lp-ai-form{display:flex;gap:7px;padding:12px;border-top:1px solid #ffffff12}.lp-ai-form input{flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid #ffffff18;background:#ffffff09;color:#fff}.lp-ai-form button{width:38px;border:0;border-radius:10px;background:var(--lp-accent);color:#fff}

/* YOUYOU V6.5 — MOBILE-FIRST MEDIA */
.lp-hero-video{width:100%;height:100%;min-height:0;overflow:hidden;background:#111;position:relative}.lp-hero-video iframe,.lp-hero-video video{width:100%;height:100%;border:0;display:block;object-fit:cover}.lp-hero-video-empty{height:100%;min-height:300px;display:grid;place-items:center;align-content:center;gap:8px;text-align:center;background:linear-gradient(145deg,#171820,#3d2933);color:#fff}.lp-hero-video-empty span{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--lp-accent);font-size:20px}.lp-hero-video-empty small{opacity:.58;max-width:260px}.beauty-visual-wrap>.lp-hero-video{height:560px}.beauty-visual-wrap>.lp-hero-video iframe,.beauty-visual-wrap>.lp-hero-video video{height:100%}.beauty-wow .lp-product-gallery{max-width:1100px;margin:auto}.beauty-wow .lp-image-slide{height:clamp(230px,34vw,400px)}
@media(max-width:760px){body{width:100%;overflow-x:hidden}.lp-live-page{max-width:100%!important}.lp-live-hero{grid-template-columns:1fr!important;gap:24px!important;padding:32px 20px 44px!important}.lp-live-copy h1{font-size:clamp(36px,11vw,48px)!important}.lp-hero-media-card{min-height:0!important;height:auto!important;aspect-ratio:4/3}.lp-hero-media-card>img,.lp-hero-media-card>.lp-hero-video{height:100%!important;min-height:0!important}.lp-product-video,.lp-product-gallery{padding:38px 20px!important}.lp-video-frame{max-height:none!important;border-radius:16px!important}.lp-video-empty{min-height:180px!important}.lp-image-slide{height:220px!important}.lp-image-arrow{width:38px!important;height:38px!important}.lp-ai-launcher{width:52px!important;height:52px!important}.lp-ai-widget{bottom:14px!important}.lp-ai-widget.is-right{right:12px!important}.lp-ai-widget.is-left{left:12px!important}.lp-ai-panel{width:calc(100vw - 24px)!important;max-width:360px!important;max-height:72vh}.beauty-nav{height:64px;padding:0 20px}.beauty-nav>a{padding:9px 12px}.beauty-hero{grid-template-columns:1fr!important;gap:24px!important;padding:34px 20px 40px!important;min-height:0!important}.beauty-copy h1{font-size:clamp(40px,12vw,52px)!important;line-height:.98!important}.beauty-copy>p{font-size:15px!important;line-height:1.6!important}.beauty-rating{margin-top:14px}.beauty-actions{gap:12px}.beauty-wow .lp-live-primary{width:100%;min-height:50px}.beauty-text-link{width:100%;text-align:center}.beauty-mini-proof{gap:9px 14px;margin-top:17px}.beauty-visual-wrap,.beauty-product-art,.beauty-visual-wrap>img,.beauty-visual-wrap>.lp-hero-video{width:100%!important;min-height:0!important;height:auto!important;aspect-ratio:4/3!important;border-radius:24px!important}.beauty-visual-wrap>.lp-hero-video iframe,.beauty-visual-wrap>.lp-hero-video video{height:100%!important}.beauty-bottle{width:135px;height:230px}.beauty-bottle:before{width:68px;height:54px;top:-36px}.beauty-float-card{left:12px;right:12px;bottom:12px;padding:11px 12px;border-radius:14px}.beauty-marquee{min-height:54px;padding:0 20px}.beauty-story,.beauty-gallery-section,.beauty-faq{padding:48px 20px!important}.beauty-story-head{grid-template-columns:1fr!important;gap:14px}.beauty-story-head h2,.beauty-gallery-section h2{font-size:clamp(30px,9vw,40px)!important}.beauty-benefits{display:grid!important;grid-auto-flow:column;grid-auto-columns:84%;grid-template-columns:none!important;gap:12px;overflow-x:auto;padding:2px 2px 12px;scroll-snap-type:x mandatory;scrollbar-width:none}.beauty-benefits article{scroll-snap-align:start;min-height:220px;padding:22px}.beauty-editorial{grid-template-columns:1fr!important;padding:0 20px 48px!important}.beauty-editorial-card{padding:28px 22px}.beauty-editorial-card h2{font-size:30px}.beauty-stat-grid{grid-template-columns:repeat(3,1fr)}.beauty-stat-grid>div{padding:14px 10px;display:block}.beauty-stat-grid strong{font-size:24px;display:block}.beauty-gallery-section>div:first-child{display:block;margin-bottom:20px}.beauty-gallery{display:grid!important;grid-auto-flow:column;grid-auto-columns:78%;grid-template-columns:none!important;gap:12px;overflow-x:auto;padding-bottom:12px;scroll-snap-type:x mandatory;scrollbar-width:none}.beauty-gallery figure{height:220px!important;scroll-snap-align:start}.beauty-review-section{padding:58px 20px!important}.beauty-review-section blockquote{font-size:28px!important}.beauty-faq{grid-template-columns:1fr!important;gap:10px}.beauty-faq h2{font-size:28px}.beauty-faq p{font-size:15px}.beauty-final-cta{margin:44px 20px!important;padding:28px 22px!important;flex-direction:column!important;align-items:flex-start!important}.beauty-final-cta h2{font-size:32px}.beauty-footer{padding:22px 20px!important;flex-direction:column!important}.beauty-wow .lp-product-video{padding:42px 20px!important}.beauty-wow .lp-video-frame{border-radius:18px!important}}

/* YOUYOU V6.6 — CLEAN PUBLIC MEDIA + REAL MOBILE FIRST */
.lp-live-hero.no-hero-media,.beauty-hero.no-hero-media{grid-template-columns:1fr!important}.lp-live-hero.no-hero-media .lp-live-copy,.beauty-hero.no-hero-media .beauty-copy{max-width:860px}.beauty-visual-wrap.has-video{min-height:0!important;height:auto!important;aspect-ratio:16/9!important;background:#111}.beauty-visual-wrap.has-video>.lp-hero-video{width:100%!important;height:100%!important;min-height:0!important;aspect-ratio:auto!important}.beauty-visual-wrap.has-video iframe,.beauty-visual-wrap.has-video video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;border:0!important}.lp-hero-media-card.has-hero-video{min-height:0!important;height:auto!important;aspect-ratio:16/9!important;background:#111}.lp-hero-media-card.has-hero-video>.lp-hero-video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}.lp-hero-media-card.has-hero-video iframe,.lp-hero-media-card.has-hero-video video{width:100%!important;height:100%!important;border:0!important;display:block!important}.lp-static-image-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.lp-static-image-grid figure{margin:0;aspect-ratio:4/3;border-radius:20px;overflow:hidden;background:var(--lp-surface)}.lp-static-image-grid img{width:100%;height:100%;display:block;object-fit:cover}.lp-product-gallery .lp-block-head>span{display:none!important}.lp-product-video .lp-block-head>span{display:none!important}
@media(max-width:760px){.beauty-hero.no-hero-media,.lp-live-hero.no-hero-media{display:block!important}.beauty-visual-wrap.has-video{width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:16/9!important;border-radius:18px!important}.beauty-visual-wrap.has-video>.lp-hero-video{aspect-ratio:auto!important;height:100%!important}.lp-hero-media-card.has-hero-video{aspect-ratio:16/9!important;height:auto!important;min-height:0!important;border-radius:18px!important}.lp-static-image-grid{grid-template-columns:1fr 1fr!important;gap:10px}.lp-static-image-grid figure{border-radius:14px}.lp-product-gallery{padding:32px 16px!important}.lp-product-gallery .lp-block-head{margin-bottom:14px}.lp-image-slider{border-radius:16px!important}.lp-image-slide{height:auto!important;aspect-ratio:4/3!important}.lp-image-slide img{height:100%!important}.beauty-wow .lp-product-gallery{padding:36px 16px!important}.beauty-final-cta{padding:24px 20px!important}.beauty-final-cta h2{margin-bottom:0!important}}


/* YOUYOU V6.7 — COMPACT PREMIUM IMAGE CAROUSEL */
.lp-product-gallery{padding-top:34px!important;padding-bottom:34px!important}
.lp-product-gallery .lp-block-head{max-width:1120px!important;margin:0 auto 16px!important}
.lp-product-gallery .lp-block-head h2{margin:4px 0 0!important}
.lp-image-slider{position:relative!important;width:100%!important;max-width:1120px!important;margin:0 auto!important;overflow:hidden!important;border-radius:20px!important;background:transparent!important}
.lp-image-track{display:flex!important;gap:12px!important;width:100%!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;scroll-behavior:smooth!important;scrollbar-width:none!important;padding:0 2px 4px!important}
.lp-image-track::-webkit-scrollbar{display:none!important}
.lp-image-slide{position:relative!important;flex:0 0 calc((100% - 24px)/3)!important;width:auto!important;min-width:0!important;height:250px!important;aspect-ratio:auto!important;scroll-snap-align:start!important;border-radius:18px!important;overflow:hidden!important;background:var(--lp-surface)!important}
.lp-image-slide img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
.lp-image-arrow{top:50%!important;transform:translateY(-50%)!important;width:40px!important;height:40px!important;border-radius:50%!important;background:#0b0d14d9!important;color:#fff!important;border:1px solid #ffffff2b!important;box-shadow:0 8px 22px #0003!important}
.lp-image-arrow.prev{left:10px!important}.lp-image-arrow.next{right:10px!important}
.lp-image-dots{position:static!important;transform:none!important;justify-content:center!important;margin:12px auto 0!important;padding:0!important;background:transparent!important}
.lp-image-dots button{background:#8d8d9560!important}.lp-image-dots button.is-active{background:var(--lp-accent)!important}
.beauty-wow .lp-product-gallery{max-width:none!important;padding-left:5%!important;padding-right:5%!important}
.beauty-wow .lp-image-slide{height:250px!important}
@media(max-width:900px) and (min-width:761px){.lp-image-slide{flex-basis:calc((100% - 12px)/2)!important;height:230px!important}}
@media(max-width:760px){
  .lp-product-gallery,.beauty-wow .lp-product-gallery{padding:28px 16px!important}
  .lp-product-gallery .lp-block-head{margin-bottom:12px!important}
  .lp-image-slider{border-radius:0!important;overflow:visible!important}
  .lp-image-track{gap:10px!important;padding:0 24px 6px 0!important}
  .lp-image-slide,.beauty-wow .lp-image-slide{flex:0 0 82%!important;width:82%!important;min-width:82%!important;height:176px!important;aspect-ratio:auto!important;border-radius:15px!important}
  .lp-image-arrow{display:none!important}
  .lp-image-dots{margin-top:10px!important}
}
@media(max-width:390px){.lp-image-slide,.beauty-wow .lp-image-slide{flex-basis:86%!important;width:86%!important;min-width:86%!important;height:auto!important}}

/* YOUYOU V6.8 — THREE CARD PRODUCT CAROUSEL */
.lp-image-slider{overflow:hidden!important;border-radius:0!important}
.lp-image-track{align-items:stretch!important;gap:16px!important;padding:4px 3px 8px!important}
.lp-image-slide,.beauty-wow .lp-image-slide{display:flex!important;flex-direction:column!important;flex:0 0 calc((100% - 32px)/3)!important;width:calc((100% - 32px)/3)!important;min-width:0!important;height:auto!important;aspect-ratio:auto!important;border-radius:18px!important;background:var(--lp-surface)!important;border:1px solid color-mix(in srgb,var(--lp-text) 8%, transparent)!important;box-shadow:0 12px 30px rgba(10,12,20,.08)!important;overflow:hidden!important}
.lp-product-slide-media{width:100%;aspect-ratio:4/3;overflow:hidden;background:var(--lp-surface)}
.lp-product-slide-media img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
.lp-product-slide-meta{position:relative;display:grid;gap:4px;padding:13px 14px 14px;min-height:78px}
.lp-product-slide-meta small{font-size:9px;font-weight:900;letter-spacing:.08em;color:var(--lp-accent)}
.lp-product-slide-meta strong{font-size:14px;line-height:1.2;color:var(--lp-text)}
.lp-product-slide-meta>span{position:absolute;right:13px;top:13px;font-size:10px;font-weight:900;opacity:.28}
@media(max-width:900px) and (min-width:761px){.lp-image-slide,.beauty-wow .lp-image-slide{flex-basis:calc((100% - 16px)/2)!important;width:calc((100% - 16px)/2)!important}}
@media(max-width:760px){
  .lp-image-track{gap:12px!important;padding:2px 22px 6px 0!important}
  .lp-image-slide,.beauty-wow .lp-image-slide{flex:0 0 78%!important;width:78%!important;min-width:78%!important;height:auto!important;border-radius:16px!important}
  .lp-product-slide-media{aspect-ratio:4/3!important}
  .lp-product-slide-meta{padding:11px 12px 12px;min-height:68px}
  .lp-product-slide-meta strong{font-size:13px}
}
@media(max-width:390px){.lp-image-slide,.beauty-wow .lp-image-slide{flex-basis:82%!important;width:82%!important;min-width:82%!important}}


/* YOUYOU V6.9 — QUALITY LOCK */
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.lp-lead-form{display:grid;gap:12px}.lp-lead-form label{display:grid;gap:6px}.lp-lead-form label>span{font-size:11px;font-weight:800;opacity:.68}.lp-lead-form input,.lp-lead-form textarea{width:100%;padding:13px;border:1px solid color-mix(in srgb,var(--lp-text) 14%,transparent);border-radius:10px;background:var(--lp-surface);color:var(--lp-text);font:inherit}.lp-lead-form button{padding:14px 18px;border:0;border-radius:10px;background:var(--lp-accent);color:#fff;font-weight:900;cursor:pointer}.lp-lead-form button:disabled{opacity:.55;cursor:wait}.lp-lead-status{min-height:18px;margin:0;font-size:11px;opacity:.72}.lp-direct-contact-wrap{display:flex;align-items:center}.lp-direct-contact{display:inline-flex;padding:14px 18px;border-radius:10px;text-decoration:none;font-weight:900}.lp-live-contact>div>p{opacity:.68;line-height:1.6}.lp-live-trust span{padding:7px 10px;border:1px solid color-mix(in srgb,var(--lp-text) 10%,transparent);border-radius:999px}.beauty-nav>div a{color:inherit;text-decoration:none}.beauty-proofline{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 6px}.beauty-proofline span{padding:6px 9px;border:1px solid #16192312;border-radius:999px;font-size:10px;font-weight:800;color:#777}.beauty-final-cta.has-form{align-items:flex-start}.beauty-final-cta.has-form>div{max-width:430px}.beauty-lead-form{width:min(480px,100%)}.beauty-lead-form input,.beauty-lead-form textarea{background:#ffffff12;border-color:#ffffff20;color:#fff}.beauty-lead-form input::placeholder,.beauty-lead-form textarea::placeholder{color:#ffffff72}.beauty-review-meta>b{display:none!important}.lp-ai-context,.lp-ai-powered{display:none!important}
.lp-image-slider{overflow:hidden!important;border-radius:0!important}.lp-image-track{display:flex!important;align-items:stretch!important;gap:16px!important;width:100%!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;scroll-behavior:smooth!important;scrollbar-width:none!important;padding:4px 3px 8px!important}.lp-image-track::-webkit-scrollbar{display:none!important}.lp-image-slide,.beauty-wow .lp-image-slide{display:flex!important;flex-direction:column!important;flex:0 0 calc((100% - 32px)/3)!important;width:calc((100% - 32px)/3)!important;min-width:0!important;height:auto!important;aspect-ratio:auto!important;scroll-snap-align:start!important;border-radius:18px!important;background:var(--lp-surface)!important;border:1px solid color-mix(in srgb,var(--lp-text) 8%,transparent)!important;box-shadow:0 12px 30px rgba(10,12,20,.08)!important;overflow:hidden!important}.lp-product-slide-media{width:100%;aspect-ratio:4/3;overflow:hidden;background:var(--lp-surface)}.lp-product-slide-media img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.lp-product-slide-meta{position:relative;display:grid;gap:4px;padding:13px 14px 14px;min-height:78px}.lp-product-slide-meta small{font-size:9px;font-weight:900;letter-spacing:.08em;color:var(--lp-accent)}.lp-product-slide-meta strong{font-size:14px;line-height:1.2;color:var(--lp-text)}.lp-product-slide-meta>span{position:absolute;right:13px;top:13px;font-size:10px;font-weight:900;opacity:.28}.lp-image-dots{position:static!important;transform:none!important;display:flex!important;justify-content:center!important;gap:7px!important;margin:10px auto 0!important;background:transparent!important}.lp-image-dots button{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:#8d8d9560}.lp-image-dots button.is-active{width:22px;background:var(--lp-accent)}
.layout-whatsapp .lp-live-primary{background:#25d366;color:#06130a}.layout-urgent .lp-live-primary{background:#ff675f;color:#fff}.layout-luxury .lp-live-hero,.layout-hotel .lp-live-hero,.layout-property .lp-live-hero{padding-top:84px;padding-bottom:84px}.layout-saas .lp-live-media,.layout-tech .lp-live-media,.layout-app .lp-live-media{box-shadow:0 24px 70px #0005}.layout-spa .lp-live-section,.layout-salon .lp-live-section,.layout-clinic .lp-live-section,.layout-dental .lp-live-section{border-color:color-mix(in srgb,var(--lp-text) 7%,transparent)}
@media(max-width:900px) and (min-width:761px){.lp-image-slide,.beauty-wow .lp-image-slide{flex-basis:calc((100% - 16px)/2)!important;width:calc((100% - 16px)/2)!important}}
@media(max-width:760px){.lp-live-page{width:100%;overflow-x:hidden}.lp-live-nav,.lp-live-footer{padding-left:18px;padding-right:18px}.lp-live-hero,.lp-live-contact{grid-template-columns:1fr!important;padding-left:18px!important;padding-right:18px!important}.lp-live-section{padding-left:18px!important;padding-right:18px!important}.lp-image-track{gap:12px!important;padding:2px 22px 6px 0!important}.lp-image-slide,.beauty-wow .lp-image-slide{flex:0 0 78%!important;width:78%!important;min-width:78%!important;height:auto!important;border-radius:16px!important}.lp-image-arrow{display:none!important}.lp-product-slide-meta{padding:11px 12px 12px;min-height:68px}.beauty-proofline{margin-top:14px}.beauty-final-cta.has-form{display:grid!important;grid-template-columns:1fr!important}.beauty-lead-form{width:100%}.beauty-review-section{padding-left:20px!important;padding-right:20px!important}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}


/* YOUYOU V7.0 — FINAL PREMIUM LANDING / MOBILE QUALITY LOCK */
.lp-hero-video,.lp-video-frame{position:relative!important;display:block!important;width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:16/9!important;overflow:hidden!important;background:#0b0d12!important}
.lp-hero-video iframe,.lp-hero-video video,.lp-video-frame iframe,.lp-video-frame video{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;object-fit:cover!important;border:0!important;display:block!important}
.beauty-visual-wrap.has-video,.lp-hero-media-card.has-hero-video{display:block!important;height:auto!important;min-height:0!important;aspect-ratio:auto!important;padding:0!important;background:transparent!important}
.beauty-visual-wrap.has-video>.lp-hero-video,.lp-hero-media-card.has-hero-video>.lp-hero-video{position:relative!important;inset:auto!important;width:100%!important;height:auto!important;aspect-ratio:16/9!important;border-radius:inherit!important}
.beauty-proofline,.beauty-float-card,.lp-product-slide-meta{display:none!important}
.beauty-story-head{align-items:start!important}.beauty-story-head>p{margin:14px 0 0;max-width:680px;color:#747680;font-size:16px;line-height:1.7}
.beauty-benefits{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:initial!important;gap:16px!important;overflow:visible!important;padding:0!important}
.beauty-benefits article{min-height:0!important;padding:24px!important;display:grid!important;align-content:start!important;gap:20px!important}.beauty-benefits article>span{display:none!important}.beauty-benefits h3{margin:0!important;font-size:20px!important;line-height:1.25!important}.beauty-benefits .beauty-icon{margin:0!important}
.beauty-editorial{grid-template-columns:1fr!important}.beauty-editorial-card{max-width:860px}.beauty-editorial-card h2{margin-bottom:12px}
.lp-product-gallery{overflow:hidden!important}.lp-image-slider{position:relative!important;overflow:hidden!important}.lp-image-track{display:flex!important;align-items:stretch!important;gap:16px!important;width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;scroll-behavior:smooth!important;scrollbar-width:none!important;padding:2px 2px 8px!important}.lp-image-track::-webkit-scrollbar{display:none!important}.lp-image-slide,.beauty-wow .lp-image-slide{margin:0!important;position:relative!important;flex:0 0 calc((100% - 32px)/3)!important;width:calc((100% - 32px)/3)!important;min-width:0!important;height:auto!important;aspect-ratio:4/3!important;border-radius:18px!important;overflow:hidden!important;scroll-snap-align:start!important;background:#f4f4f6!important;border:0!important;box-shadow:0 12px 32px rgba(16,24,40,.10)!important}.lp-image-slide>img,.beauty-wow .lp-image-slide>img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.lp-image-arrow{top:50%!important;transform:translateY(-50%)!important}.lp-image-dots{position:static!important;transform:none!important;margin:12px auto 0!important;padding:0!important;background:transparent!important}.lp-image-dots button{background:#9ca3af55!important}.lp-image-dots button.is-active{background:var(--lp-accent)!important}
.lp-static-image-grid,.beauty-gallery{overflow:visible!important}.beauty-gallery{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-auto-flow:initial!important;gap:14px!important}.beauty-gallery figure{margin:0!important;height:auto!important;aspect-ratio:4/3!important;border-radius:18px!important;overflow:hidden!important}.beauty-gallery figure img{width:100%!important;height:100%!important;object-fit:cover!important}
.lp-lead-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.lp-lead-span-2{grid-column:1/-1}.lp-lead-form label>span{display:flex;align-items:center;justify-content:space-between}.lp-lead-form label>span em{font-style:normal;font-size:10px;font-weight:700;opacity:.5}.lp-lead-form input,.lp-lead-form textarea{min-height:50px!important;padding:13px 14px!important;border-radius:12px!important}.lp-lead-form textarea{min-height:94px!important}.lp-lead-form>button{min-height:52px;border-radius:12px!important}
@media(max-width:760px){
  .beauty-visual-wrap.has-video,.lp-hero-media-card.has-hero-video{height:auto!important;min-height:0!important;aspect-ratio:auto!important}
  .beauty-visual-wrap.has-video>.lp-hero-video,.lp-hero-media-card.has-hero-video>.lp-hero-video{height:auto!important;min-height:0!important;aspect-ratio:16/9!important;border-radius:18px!important}
  .beauty-story,.beauty-gallery-section,.beauty-faq{padding-left:18px!important;padding-right:18px!important}
  .beauty-story-head h2{font-size:34px!important;line-height:1.02!important}.beauty-story-head>p{font-size:15px!important}
  .beauty-benefits{grid-template-columns:1fr!important;grid-auto-columns:auto!important;grid-auto-flow:row!important;overflow:visible!important;scroll-snap-type:none!important;gap:12px!important;padding:0!important}
  .beauty-benefits article{min-height:0!important;padding:20px!important;border-radius:18px!important;scroll-snap-align:none!important;gap:16px!important}.beauty-benefits h3{font-size:18px!important}
  .beauty-gallery{grid-template-columns:1fr 1fr!important;grid-auto-flow:row!important;grid-auto-columns:auto!important;overflow:visible!important;gap:10px!important;padding:0!important}.beauty-gallery figure{height:auto!important;aspect-ratio:1/1!important;border-radius:14px!important}
  .lp-image-track{gap:10px!important;padding:2px 36px 8px 0!important}.lp-image-slide,.beauty-wow .lp-image-slide{flex:0 0 84%!important;width:84%!important;min-width:84%!important;aspect-ratio:4/3!important;height:auto!important;border-radius:16px!important}.lp-image-arrow{display:none!important}.lp-image-dots{margin-top:9px!important}
  .lp-lead-grid{grid-template-columns:1fr!important}.lp-lead-span-2{grid-column:auto}.beauty-final-cta.has-form{gap:22px!important}.beauty-final-cta.has-form>div{max-width:none!important}.beauty-lead-form{width:100%!important}
}

/* YOUYOU V7.1 — UNIVERSAL MEDIA ENGINE / FINAL CAROUSEL */
.lp-product-gallery{overflow:hidden!important}
.lp-image-slider{
  --yy-carousel-gap:14px;
  --yy-carousel-ratio:1/1;
  position:relative!important;
  width:100%!important;
  max-width:1120px!important;
  margin-left:auto!important;
  margin-right:auto!important;
  overflow:visible!important;
  border-radius:0!important;
}
.lp-image-slider.lp-carousel-ratio-square{--yy-carousel-ratio:1/1}
.lp-image-slider.lp-carousel-ratio-portrait{--yy-carousel-ratio:4/5}
.lp-image-slider.lp-carousel-ratio-landscape{--yy-carousel-ratio:4/3}
.lp-image-track{
  display:flex!important;
  align-items:stretch!important;
  gap:var(--yy-carousel-gap)!important;
  width:100%!important;
  max-width:100%!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  padding:5px 2px 12px!important;
  scroll-snap-type:x mandatory!important;
  scroll-behavior:smooth!important;
  scrollbar-width:none!important;
  overscroll-behavior-inline:contain!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-x pan-y!important;
}
.lp-image-track::-webkit-scrollbar{display:none!important}
.lp-image-slide,.beauty-wow .lp-image-slide{
  position:relative!important;
  flex:0 0 calc((100% - (var(--yy-carousel-gap) * 2))/3)!important;
  width:calc((100% - (var(--yy-carousel-gap) * 2))/3)!important;
  min-width:0!important;
  height:auto!important;
  aspect-ratio:var(--yy-carousel-ratio)!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  scroll-snap-align:start!important;
  scroll-snap-stop:always!important;
  border:0!important;
  border-radius:18px!important;
  background:#f3f4f6!important;
  box-shadow:0 12px 34px rgba(16,24,40,.10)!important;
}
.lp-image-slide>img,.beauty-wow .lp-image-slide>img{
  position:absolute!important;
  inset:0!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  object-fit:cover!important;
  object-position:center!important;
}
.lp-image-arrow{
  position:absolute!important;
  z-index:8!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  width:42px!important;
  height:42px!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  border:1px solid rgba(17,24,39,.10)!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.94)!important;
  color:#111827!important;
  box-shadow:0 10px 28px rgba(16,24,40,.16)!important;
  cursor:pointer!important;
  font-size:26px!important;
  line-height:1!important;
  backdrop-filter:blur(10px)!important;
}
.lp-image-arrow.prev{left:-12px!important}.lp-image-arrow.next{right:-12px!important}
.lp-image-dots{
  position:static!important;
  transform:none!important;
  display:flex!important;
  justify-content:center!important;
  align-items:center!important;
  flex-wrap:nowrap!important;
  gap:7px!important;
  min-height:20px!important;
  margin:8px auto 0!important;
  padding:0!important;
  background:transparent!important;
}
.lp-image-dots[hidden]{display:none!important}
.lp-image-dots button{
  width:7px!important;
  height:7px!important;
  flex:0 0 auto!important;
  padding:0!important;
  border:0!important;
  border-radius:999px!important;
  background:#9ca3af55!important;
  transition:width .2s ease,background .2s ease!important;
  cursor:pointer!important;
}
.lp-image-dots button.is-active{width:22px!important;background:var(--lp-accent)!important}
.lp-image-counter{
  width:max-content!important;
  margin:8px auto 0!important;
  padding:5px 9px!important;
  border-radius:999px!important;
  background:color-mix(in srgb,var(--lp-text) 7%,transparent)!important;
  color:var(--lp-text)!important;
  font-size:10px!important;
  font-weight:800!important;
  letter-spacing:.04em!important;
}
.lp-image-counter[hidden]{display:none!important}
@media(max-width:980px) and (min-width:761px){
  .lp-image-slide,.beauty-wow .lp-image-slide{
    flex-basis:calc((100% - var(--yy-carousel-gap))/2)!important;
    width:calc((100% - var(--yy-carousel-gap))/2)!important;
  }
}
@media(max-width:760px){
  .lp-image-slider{--yy-carousel-gap:10px!important;overflow:hidden!important}
  .lp-image-track{gap:10px!important;padding:3px 20% 10px 0!important;scroll-padding-left:0!important}
  .lp-image-slide,.beauty-wow .lp-image-slide{
    flex:0 0 82%!important;
    width:82%!important;
    min-width:82%!important;
    height:auto!important;
    aspect-ratio:var(--yy-carousel-ratio)!important;
    border-radius:15px!important;
    box-shadow:0 9px 24px rgba(16,24,40,.09)!important;
  }
  .lp-image-arrow{display:none!important}
  .lp-image-dots{margin-top:6px!important}
  .lp-image-counter{margin-top:6px!important}
}
/* Builder mobile simulator must match a real phone even on a desktop browser. */
.lpw-preview-stage.is-mobile .lp-image-slider{--yy-carousel-gap:10px!important;overflow:hidden!important}
.lpw-preview-stage.is-mobile .lp-image-track{gap:10px!important;padding:3px 20% 10px 0!important}
.lpw-preview-stage.is-mobile .lp-image-slide,
.lpw-preview-stage.is-mobile .beauty-wow .lp-image-slide{
  flex:0 0 82%!important;
  width:82%!important;
  min-width:82%!important;
  height:auto!important;
  aspect-ratio:var(--yy-carousel-ratio)!important;
  border-radius:15px!important;
}
.lpw-preview-stage.is-mobile .lp-image-arrow{display:none!important}
/* YOUYOU V7.4 — AUTHORITATIVE THEME SYNC + CLIENT FREEDOM */
.lp-live-page,.beauty-wow{background:var(--lp-bg)!important;color:var(--lp-text)!important;font-family:var(--lp-font,ui-sans-serif,system-ui,sans-serif)!important}
.lp-live-page *{box-sizing:border-box}
.lp-live-copy,.beauty-copy{text-align:var(--lp-align,left)!important}
.lp-live-actions,.beauty-actions{justify-content:var(--lp-justify,flex-start)!important}
.lp-live-primary,.lp-live-secondary,.lp-direct-contact,.lp-lead-form button,.beauty-nav>a{border-radius:var(--lp-radius,18px)!important}
.lp-live-media,.lp-hero-media-card,.beauty-visual-wrap,.lp-image-slide,.beauty-wow .lp-image-slide,.lp-static-image-grid figure,.beauty-gallery figure,.beauty-benefits article,.beauty-editorial-card,.beauty-final-cta,.lp-live-benefit-grid>div{border-radius:var(--lp-radius,18px)!important}
.lp-live-sub,.lp-live-contact>div>p,.beauty-copy>p,.beauty-story-head>p,.beauty-benefits p,.beauty-faq p,.beauty-footer{color:color-mix(in srgb,var(--lp-text) 68%,transparent)!important}
.lp-live-nav,.lp-live-footer,.beauty-nav,.beauty-story,.beauty-gallery-section,.beauty-faq,.beauty-wow .lp-product-video{background:transparent!important;color:var(--lp-text)!important;border-color:color-mix(in srgb,var(--lp-text) 10%,transparent)!important}
.beauty-nav>a{background:var(--lp-accent)!important;color:#fff!important}.beauty-text-link{color:var(--lp-text)!important}
.beauty-marquee,.beauty-editorial-card,.beauty-final-cta{background:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface))!important;color:var(--lp-text)!important}
.beauty-editorial-card p,.beauty-final-cta p{color:color-mix(in srgb,var(--lp-text) 70%,transparent)!important}
.beauty-benefits article,.beauty-stat-grid>div,.lp-live-benefit-grid>div,.lp-lead-form input,.lp-lead-form textarea{background:var(--lp-surface)!important;color:var(--lp-text)!important;border-color:color-mix(in srgb,var(--lp-text) 10%,transparent)!important}
.beauty-gallery-section,.beauty-wow .lp-product-video{background:color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg))!important}
.beauty-review-section{background:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))!important;color:var(--lp-text)!important}
.beauty-avatar{background:var(--lp-accent)!important;color:#fff!important}
.lp-lead-feedback{display:grid;gap:10px;margin-top:2px}.lp-lead-status{min-height:0;margin:0;padding:0;border-radius:12px;font-size:13px;font-weight:750;line-height:1.45;opacity:1}.lp-lead-status:not(:empty){padding:11px 13px}.lp-lead-status.is-success{background:#eaf8ef;color:#176b38;border:1px solid #bce8cb}.lp-lead-status.is-error{background:#fff0f0;color:#9f2f2f;border:1px solid #f4c4c4}.lp-lead-status.is-sending,.lp-lead-status.is-preview{background:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface));color:var(--lp-text);border:1px solid color-mix(in srgb,var(--lp-accent) 24%,transparent)}.lp-lead-followup{display:inline-flex;justify-content:center;align-items:center;min-height:48px;padding:0 16px;border-radius:12px;background:#22c55e;color:#fff;text-decoration:none;font-weight:900}.lp-lead-followup[hidden]{display:none!important}.lp-contact-direct-action{margin-top:16px}.lp-contact-direct-action .lp-direct-contact{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px}
@media(max-width:760px){.lp-image-slide,.beauty-wow .lp-image-slide{aspect-ratio:var(--yy-carousel-ratio)!important}}


.lp-commerce-box{width:min(100%,560px);margin:18px 0 4px;padding:16px;border:1px solid color-mix(in srgb,var(--lp-accent) 18%,transparent);border-radius:16px;background:color-mix(in srgb,var(--lp-surface) 94%,var(--lp-accent) 6%)}.lp-commerce-head,.lp-order-row{display:flex;align-items:center;justify-content:space-between;gap:14px}.lp-commerce-head{align-items:flex-start;margin-bottom:12px}.lp-commerce-head small,.lp-order-bundles>small{color:var(--lp-accent);font-size:9px;font-weight:900}.lp-order-row,.lp-order-variants,.lp-order-bundles,.lp-order-summary{padding-top:12px;border-top:1px solid color-mix(in srgb,var(--lp-text) 8%,transparent)}.lp-qty-stepper{display:grid;grid-template-columns:38px 46px 38px;border:1px solid color-mix(in srgb,var(--lp-text) 12%,transparent);border-radius:12px;overflow:hidden}.lp-qty-stepper button{height:38px;border:0;background:transparent;color:var(--lp-text);font-size:20px}.lp-qty-stepper output{display:grid;place-items:center;border-left:1px solid #8883;border-right:1px solid #8883}.lp-order-variants{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.lp-order-variants label{display:grid;gap:6px}.lp-order-variants select{min-height:40px;border:1px solid #8883;border-radius:11px;background:var(--lp-surface);color:var(--lp-text)}.lp-order-bundles>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.lp-order-bundles button{padding:9px 11px;border:1px solid #8883;border-radius:11px;background:var(--lp-surface);color:var(--lp-text)}.lp-order-bundles button.is-active{border-color:var(--lp-accent);color:var(--lp-accent)}.lp-order-summary{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px}.lp-order-summary>div{padding:10px;border-radius:11px;background:color-mix(in srgb,var(--lp-bg) 62%,var(--lp-surface))}.lp-order-summary span{display:block;font-size:8px;opacity:.6}.lp-order-summary strong{display:block;margin-top:4px}.lp-order-total strong{color:var(--lp-accent)}.lp-order-total b,.lp-order-total em{font-style:normal}@media(max-width:760px){.lp-order-variants{grid-template-columns:1fr}.lp-order-summary{grid-template-columns:1fr 1fr}.lp-order-summary .lp-order-total{grid-column:1/-1}}

.lp-checkout-form{display:grid!important;gap:14px!important;padding:18px!important;border:1px solid color-mix(in srgb,var(--lp-accent) 16%,transparent)!important;border-radius:22px!important;background:color-mix(in srgb,var(--lp-surface) 96%,var(--lp-accent) 4%)!important;box-shadow:0 18px 50px rgba(0,0,0,.08)!important}.lp-checkout-form .lp-commerce-box{width:100%!important;margin:0 0 4px!important;padding:0 0 14px!important;border:0!important;border-bottom:1px solid color-mix(in srgb,var(--lp-text) 9%,transparent)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.lp-commerce-head{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 8px!important}.lp-order-colors{padding:11px 0;border-top:1px solid color-mix(in srgb,var(--lp-text) 8%,transparent)}.lp-order-colors>small{display:block;margin-bottom:8px;font-size:8px;font-weight:900;letter-spacing:.1em}.lp-color-swatches{display:flex;flex-wrap:wrap;gap:8px}.lp-color-swatch{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:6px 10px 6px 6px;border:1px solid color-mix(in srgb,var(--lp-text) 12%,transparent);border-radius:999px;background:var(--lp-surface);color:var(--lp-text);font-size:9px;font-weight:800}.lp-color-swatch i{width:22px;height:22px;border-radius:50%;border:1px solid #7f7f7f4d}.lp-color-swatch.is-active{border-color:var(--lp-accent);color:var(--lp-accent)}@media(max-width:760px){.lp-checkout-form{padding:14px!important}}
</style>
</head>
<body>${body}<script>
const YY_SUPABASE_URL=${JSON.stringify(SUPABASE_URL || "")};
const YY_SUPABASE_KEY=${JSON.stringify(SUPABASE_KEY || "")};
const YY_PREVIEW=${JSON.stringify(Boolean(options.preview))};
async function yyPersist(page,content,visitor={}){if(YY_PREVIEW)return{ok:false,preview:true};const companyId=page?.dataset?.companyId||'';if(!companyId||!YY_SUPABASE_URL||!YY_SUPABASE_KEY)return{ok:false};const pageId=page?.dataset?.pageId||'page',key='youyou_lp_conversation_'+companyId+'_'+pageId;let id=sessionStorage.getItem(key)||'';const headers={'Content-Type':'application/json',apikey:YY_SUPABASE_KEY};if(!id){id=crypto.randomUUID();const r=await fetch(YY_SUPABASE_URL+'/rest/v1/conversations',{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({id,company_id:companyId,visitor_name:String(visitor.name||'Landing page visitor').slice(0,120),visitor_email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(visitor.email||''))?String(visitor.email).slice(0,180):null,status:'open'})});if(!r.ok)throw new Error(await r.text());sessionStorage.setItem(key,id)}const m=await fetch(YY_SUPABASE_URL+'/rest/v1/messages',{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({conversation_id:id,sender:'visitor',content:String(content||'').slice(0,4000)})});if(!m.ok)throw new Error(await m.text());return{ok:true}}
window.youyouLandingSubmit=function(form){const page=form?.closest('.lp-live-page'),status=form?.querySelector('[data-lp-lead-status]'),button=form?.querySelector('button[type="submit"]'),followup=form?.querySelector('[data-lp-lead-followup]'),name=String(form?.elements?.name?.value||'').trim(),phone=String(form?.elements?.phone?.value||'').trim(),email=String(form?.elements?.email?.value||'').trim(),city=String(form?.elements?.city?.value||'').trim(),address=String(form?.elements?.address?.value||'').trim(),message=String(form?.elements?.message?.value||'').trim();const setStatus=(text,type)=>{if(!status)return;status.textContent=text;status.className='lp-lead-status '+(type||'')};if(!name||!phone||!city||!address){setStatus('Please add your name, phone, city and address.','is-error');return false}if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setStatus('Please check the email address or leave it empty.','is-error');return false}const commerce=page?.querySelector('[data-commerce-box]'),quantity=String(commerce?.querySelector('[data-order-qty]')?.textContent||commerce?.querySelector('[data-order-summary-qty]')?.textContent||'').trim(),total=String(commerce?.querySelector('[data-order-total]')?.textContent||'').trim(),currency=String(commerce?.dataset?.currency||'').trim(),bundle=String(commerce?.querySelector('[data-bundle-qty].is-active')?.textContent||'').trim(),color=String(commerce?.querySelector('[data-order-color].is-active')?.dataset?.orderColor||'').trim(),variants=[...(commerce?.querySelectorAll('[data-order-variant]')||[])].map(el=>el.dataset.orderVariant+': '+el.value).filter(Boolean),title=page?.dataset?.pageTitle||'this offer',details=['Phone: '+phone,'City: '+city,'Address: '+address,email?'Email: '+email:'',quantity?'Quantity: '+quantity:'',color?'Color: '+color:'',bundle?'Bundle: '+bundle:'',variants.length?'Options: '+variants.join(', '):'',total?'Order total: '+currency+' '+total:'',message?'Message: '+message:''].filter(Boolean).join(' | '),content='Lead form submission for '+title+'. '+details;if(button)button.disabled=true;setStatus('Sending…','is-sending');yyPersist(page,content,{name,email}).then(r=>{if(r.ok){setStatus('✓ Request sent successfully. We received your details.','is-success');if(followup)followup.hidden=false;form.dataset.submitted='true'}else setStatus(YY_PREVIEW?'Preview only — publish the page to receive real requests.':'Lead capture is not connected yet.','is-preview')}).catch(()=>setStatus('Could not send right now. Please try again or use another contact option.','is-error')).finally(()=>{if(button)button.disabled=false});return false};
window.youyouLandingAsk=function(source,forcedQuestion){const w=source&&source.closest('[data-lp-widget]'),p=source&&source.closest('.lp-live-page');if(!w||!p)return;w.classList.add('is-open');const q=String(forcedQuestion||(w.querySelector('input')||{}).value||'').trim();if(!q)return;const m=w.querySelector('[data-lp-widget-messages]');const add=(c,t)=>{const d=document.createElement('div');d.className='lp-ai-msg '+c;d.textContent=t;m.appendChild(d);m.scrollTop=m.scrollHeight};add('user',q);yyPersist(p,q).catch(()=>{});const l=q.toLowerCase(),price=p.querySelector('.lp-live-price strong')?.textContent?.trim(),quote=p.querySelector('.lp-live-price.quote')?.textContent?.trim(),benefits=[...p.querySelectorAll('.lp-live-benefit-grid strong,.beauty-benefits h3')].map(x=>x.textContent.trim()),cta=p.querySelector('.lp-live-primary')?.textContent?.trim(),sub=(p.querySelector('.lp-live-sub')||p.querySelector('.beauty-copy>p'))?.textContent?.trim(),faq=(p.querySelector('.lp-live-faq p')||p.querySelector('.beauty-faq p'))?.textContent?.trim();let a='';if(/price|cost|how much|prix|combien|ثمن|السعر|ch7al|شحال/.test(l))a=price?'The current price shown on this page is '+price+'.':(quote||'Contact the business for pricing.');else if(/benefit|why|feature|advantage|مزايا|علاش|شنو/.test(l))a=benefits.length?'Main benefits: '+benefits.join(' · ')+'.':(sub||'The main value is explained on this page.');else if(/start|book|buy|order|contact|reserve|appointment|حجز|نطلب/.test(l))a=cta?'The next step is “'+cta+'”. Use the main button to continue.':'Use the main call-to-action to continue.';else if(/faq|question/.test(l)&&faq)a=faq;else a='Based on this page: '+(sub||p.innerText.slice(0,180));setTimeout(()=>add('bot',a),150)};
window.youyouLandingUpdateOrder=function(source){const page=source?.closest?.('.lp-live-page')||document.querySelector('.lp-live-page'),box=source?.closest?.('[data-commerce-box]')||page?.querySelector('[data-commerce-box]');if(!box)return;const min=Math.max(1,Number(box.dataset.min)||1),max=Math.max(min,Number(box.dataset.max)||20),qtyEl=box.querySelector('[data-order-qty]');let qty=Math.max(min,Math.min(max,Number(qtyEl?.textContent)||min));if(qtyEl)qtyEl.textContent=String(qty);box.querySelectorAll('[data-order-summary-qty]').forEach(el=>el.textContent=String(qty));const unit=Math.max(0,Number(box.dataset.unitPrice)||0),total=unit*qty;box.querySelectorAll('[data-order-total]').forEach(el=>el.textContent=total.toFixed(2));box.querySelectorAll('[data-bundle-qty]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.bundleQty)===qty));const variants=[...box.querySelectorAll('[data-order-variant]')].map(el=>el.dataset.orderVariant+': '+el.value).filter(Boolean),color=String(box.querySelector('[data-order-color].is-active')?.dataset?.orderColor||'').trim(),title=page?.dataset?.pageTitle||'this product',currency=box.dataset.currency||'',summary=['Hi! I am interested in '+title+'.','Quantity: '+qty];if(color)summary.push('Color: '+color);if(variants.length)summary.push('Options: '+variants.join(', '));if(unit>0)summary.push('Total: '+currency+' '+total.toFixed(2));page?.querySelectorAll('a[href*="wa.me/"]').forEach(link=>{try{const base=String(link.href).split('?')[0];link.href=base+'?text='+encodeURIComponent(summary.join('\\n'))}catch(_){}})};
window.youyouLandingChangeQty=function(button,delta){const box=button?.closest?.('[data-commerce-box]'),qty=box?.querySelector('[data-order-qty]');if(!box||!qty)return;const min=Math.max(1,Number(box.dataset.min)||1),max=Math.max(min,Number(box.dataset.max)||20);qty.textContent=String(Math.max(min,Math.min(max,(Number(qty.textContent)||min)+Number(delta||0))));window.youyouLandingUpdateOrder(button)};
window.youyouLandingChooseBundle=function(button,quantity){const box=button?.closest?.('[data-commerce-box]'),qty=box?.querySelector('[data-order-qty]');if(!box)return;if(qty)qty.textContent=String(quantity||1);box.querySelectorAll('[data-bundle-qty]').forEach(el=>el.classList.toggle('is-active',el===button));window.youyouLandingUpdateOrder(button)};
function yyInitCommerce(){document.querySelectorAll('[data-commerce-box]').forEach(box=>window.youyouLandingUpdateOrder(box))}
function yyInitCarousels(){const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.lp-image-slider').forEach(slider=>{if(slider.dataset.yyCarouselReady==='1')return;slider.dataset.yyCarouselReady='1';const track=slider.querySelector('.lp-image-track'),slides=[...(track?.querySelectorAll('.lp-image-slide')||[])],dotsHost=slider.querySelector('[data-carousel-dots]'),counter=slider.querySelector('[data-carousel-counter]'),prev=slider.querySelector('.lp-image-arrow.prev'),next=slider.querySelector('.lp-image-arrow.next');if(!track||slides.length<2)return;let positions=[],active=0,raf=0,timer=null,resizeTimer=null;const nearest=()=>{let b=0,d=Infinity;positions.forEach((p,i)=>{const x=Math.abs(p-track.scrollLeft);if(x<d){d=x;b=i}});return b},indicators=()=>{active=nearest();dotsHost?.querySelectorAll('button').forEach((dot,i)=>dot.classList.toggle('is-active',i===active));if(counter&&!counter.hidden)counter.textContent=(active+1)+' / '+positions.length},measure=()=>{const tr=track.getBoundingClientRect(),max=Math.max(0,track.scrollWidth-track.clientWidth),raw=slides.map(slide=>{const r=slide.getBoundingClientRect();return Math.max(0,Math.min(max,r.left-tr.left+track.scrollLeft))});positions=raw.filter((v,i,a)=>i===0||Math.abs(v-a[i-1])>3);if(!positions.length)positions=[0];active=Math.max(0,Math.min(active,positions.length-1));if(dotsHost){if(positions.length<=10){dotsHost.hidden=false;dotsHost.innerHTML=positions.map((_,i)=>'<button type="button" data-carousel-page="'+i+'" aria-label="Show carousel page '+(i+1)+'"></button>').join('');if(counter)counter.hidden=true}else{dotsHost.hidden=true;if(counter)counter.hidden=false}}indicators()},go=(i,b='smooth')=>{if(!positions.length)measure();const safe=((i%positions.length)+positions.length)%positions.length;track.scrollTo({left:positions[safe]||0,behavior:b});active=safe;indicators()},pause=()=>{if(timer)clearInterval(timer);timer=null},play=()=>{pause();if(slider.dataset.autoplay!=='true'||reduced||positions.length<2||document.hidden)return;timer=setInterval(()=>go(active+1),Math.max(2000,Number(slider.dataset.speed)||4000))};track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(indicators)},{passive:true});dotsHost?.addEventListener('click',e=>{const dot=e.target.closest?.('[data-carousel-page]');if(dot)go(Number(dot.dataset.carouselPage||0))});prev&&prev.addEventListener('click',()=>go(active-1));next&&next.addEventListener('click',()=>go(active+1));slider.addEventListener('mouseenter',pause);slider.addEventListener('mouseleave',play);slider.addEventListener('focusin',pause);slider.addEventListener('focusout',play);slider.addEventListener('pointerdown',pause,{passive:true});slider.addEventListener('pointerup',play,{passive:true});document.addEventListener('visibilitychange',()=>document.hidden?pause():play());window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{measure();go(active,'auto')},80)},{passive:true});measure();go(0,'auto');play()})}
document.addEventListener('DOMContentLoaded',()=>{yyInitCarousels();yyInitCommerce()});yyInitCarousels();yyInitCommerce();

</script></body>
</html>`;
}

function renderLandingPagesSection() {
  const drafts = loadLandingDrafts();
  const published = drafts.filter((item) => item.status === "Published").length;

  return `
    <section class="landing-builder-page">
      <div class="lpb-hero dashboard-card">
        <div>
          <div class="lpb-kicker-row">
            <span class="lpb-kicker">SMART LANDING PAGES</span>
            <span class="lpb-pro-pill">PRO BUILDER</span>
          </div>
          <h1>Build a page for one offer. Send every click somewhere focused.</h1>
          <p>
            Choose a professional template, add your product or service, customize the colors,
            connect WhatsApp or lead capture, preview it and save the campaign as a reusable page.
          </p>
          <div class="lpb-hero-actions">
            <button type="button" class="primary" data-lpb-open-builder="product-launch">Create landing page →</button>
            <button type="button" class="lpb-secondary" data-lpb-view="templates">Browse 30 templates</button>
          </div>
        </div>

        <div class="lpb-flow-card">
          <small>CONVERSION FLOW</small>
          <div><span>01</span><strong>Ad</strong><small>Meta · Google · TikTok</small></div>
          <b>→</b>
          <div><span>02</span><strong>Landing Page</strong><small>One product or service</small></div>
          <b>→</b>
          <div><span>03</span><strong>Lead / WhatsApp</strong><small>One clear next step</small></div>
        </div>
      </div>

      <div class="lpb-metrics">
        <div class="dashboard-card"><small>TEMPLATES</small><strong>30</strong><span>Product · Service · Campaign</span></div>
        <div class="dashboard-card"><small>DRAFTS & PAGES</small><strong id="lpb-pages-count">${drafts.length}</strong><span>Auto-saved workspace pages</span></div>
        <div class="dashboard-card"><small>PUBLISHED</small><strong id="lpb-published-count">${published}</strong><span>Live public pages</span></div>
        <div class="dashboard-card"><small>CONVERSION ACTIONS</small><strong>4</strong><span>Form · WhatsApp · Call · Email</span></div>
      </div>

      <div class="lpb-tabs dashboard-card">
        <button class="is-active" type="button" data-lpb-view="templates">Template Gallery</button>
        <button type="button" data-lpb-view="saved">My Drafts & Pages <span id="lpb-tab-pages-count">${drafts.length}</span></button>
        <span class="lpb-workspace-note">Builder opens in a dedicated workspace ↗</span>
      </div>

      <div class="lpb-panel" data-lpb-panel="templates">
        <div class="lpb-gallery-head">
          <div>
            <small>START FAST</small>
            <h2>Choose a conversion-ready starting point.</h2>
            <p>30 presets built from reusable professional layouts. Pick one, then replace the content with your own.</p>
          </div>
          <label class="lpb-template-filter">
            Category
            <select id="lpb-template-category">
              <option value="all">All templates</option>
              ${[...new Set(LANDING_PAGE_TEMPLATES.map((item) => item.category))]
                .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
                .join("")}
            </select>
          </label>
        </div>

        <div class="lpb-slider-shell-v509">
          <button type="button" class="lpb-slider-arrow-v509 prev" data-lpb-slider="-1" aria-label="Previous templates">←</button>

          <div id="lpb-template-grid" class="lpb-template-slider-v509">
            ${LANDING_PAGE_TEMPLATES.map((item, index) => `
              <article class="lpb-template-card lpb-template-card-v509 layout-${escapeHtml(item.layout)}"
                       data-template-category="${escapeHtml(item.category)}"
                       data-template-index="${index}"
                       data-template-id="${escapeHtml(item.id)}">
                <div class="lpb-template-preview lpb-template-preview-v509"
                     style="--preview-bg:${item.bg};--preview-surface:${item.surface};--preview-accent:${item.accent}">
                  <div class="lpb-template-mini-nav"><i></i><span></span><em></em></div>

                  <div class="lpb-template-mini-body-v509">
                    <div class="lpb-template-copy-v509">
                      <small>${escapeHtml(item.badge)}</small>
                      <strong>${escapeHtml(item.headline)}</strong>
                      <p>${escapeHtml(item.sub)}</p>
                      <button>${escapeHtml(item.cta)}</button>
                    </div>

                    <aside class="lpb-template-image-v509">
                      <span>▧</span>
                      <b>IMAGE AREA</b>
                      <small>Your photo / product visual</small>
                    </aside>
                  </div>

                  <div class="lpb-template-mini-row-v509">
                    <span>Benefit</span><span>Proof</span><span>CTA</span>
                  </div>
                </div>

                <div class="lpb-template-info">
                  <div><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.name)}</strong></div>
                  <button type="button" data-lpb-open-builder="${item.id}">Use template →</button>
                </div>
              </article>
            `).join("")}
          </div>

          <button type="button" class="lpb-slider-arrow-v509 next" data-lpb-slider="1" aria-label="Next templates">→</button>
        </div>

        <div class="lpb-slider-dots-v509" aria-hidden="true">
          <i class="is-active"></i><i></i><i></i><i></i><i></i>
        </div>

        <div class="lpb-dashboard-tools-v509">
          <section class="dashboard-card lpb-tool-card-v509">
            <div class="lpb-tool-head-v509">
              <div>
                <small>HERO VIDEO</small>
                <h3>Add video only when the page needs it.</h3>
              </div>
              <span>OPTIONAL</span>
            </div>

            <div class="lpb-video-demo-v509">
              <span>▶</span>
              <b>OPTIONAL VIDEO</b>
              <small>YouTube · Vimeo · Hosted URL</small>
            </div>

            <label class="lpb-tool-field-v509">
              <span>Video URL</span>
              <input id="lpb-dashboard-video-url" type="url" placeholder="https://www.youtube.com/watch?v=..." />
            </label>

            <button type="button" class="lpb-secondary" data-lpb-open-builder="product-launch">Open builder & add video</button>
          </section>

          <section class="dashboard-card lpb-tool-card-v509">
            <div class="lpb-tool-head-v509">
              <div>
                <small>PUBLIC PAGE LINK</small>
                <h3>Know exactly where your page will live.</h3>
              </div>
              <span>PUBLISH</span>
            </div>

            <label class="lpb-tool-field-v509">
              <span>Page URL</span>
              <div class="lpb-link-row-v509">
                <input id="lpb-public-page-link" readonly value="${location.origin}/p/your-page" />
                <button type="button" id="lpb-copy-preview-link">Copy</button>
              </div>
            </label>

            <div class="lpb-link-actions-v509">
              <button type="button" class="lpb-secondary" data-lpb-open-builder="product-launch">Preview / Edit</button>
              <button type="button" class="primary" data-lpb-open-builder="product-launch">Prepare page →</button>
            </div>

            <p class="lpb-note-v509">
              Publish from the builder to get a permanent YOUYOU link you can open on any phone or share online.
              Preview and HTML export remain available now.
            </p>
          </section>

          <section class="dashboard-card lpb-tool-card-v509">
            <div class="lpb-tool-head-v509">
              <div>
                <small>PAGE CONTENT</small>
                <h3>Everything the client needs to edit.</h3>
              </div>
              <span>CONTROL</span>
            </div>

            <div class="lpb-control-grid-v509">
              <div><b>Text</b><small>Headline, description, benefits</small></div>
              <div><b>Images</b><small>Image URL or local upload</small></div>
              <div><b>Video</b><small>YouTube / Vimeo / hosted</small></div>
              <div><b>CTA</b><small>Form, WhatsApp, call, email</small></div>
              <div><b>Colors</b><small>Accent, background, surface, text</small></div>
              <div><b>Preview</b><small>Desktop and mobile</small></div>
            </div>

            <button type="button" class="primary lpb-open-builder-v509" data-lpb-open-builder="product-launch">Open visual builder →</button>
          </section>
        </div>
      </div>

      <div class="lpb-panel" data-lpb-panel="builder" hidden>
        <div class="lpb-builder-shell">
          <aside class="lpb-editor dashboard-card">
            <div class="lpb-editor-head">
              <div><small>VISUAL BUILDER</small><h2>Build the offer page.</h2></div>
              <span id="lpb-save-state">Draft</span>
            </div>

            <div class="lpb-editor-section">
              <small>PAGE</small>
              <label>Page name<input id="lpb-name" placeholder="Summer Spa Offer" /></label>
              <div class="lpb-two">
                <label>Type
                  <select id="lpb-page-type"><option>Product</option><option>Service</option><option>Offer</option><option>Lead Generation</option><option>Booking</option><option>Event</option></select>
                </label>
                <label>Direction
                  <select id="lpb-direction"><option value="ltr">LTR</option><option value="rtl">RTL · Arabic</option></select>
                </label>
              </div>
            </div>

            <div class="lpb-editor-section">
              <small>MAIN CONTENT</small>
              <label>Badge<input id="lpb-badge" placeholder="LIMITED OFFER" /></label>
              <label>Headline<textarea id="lpb-headline" rows="3"></textarea></label>
              <label>Subheadline<textarea id="lpb-subheadline" rows="3"></textarea></label>
              <label>Description<textarea id="lpb-description" rows="4"></textarea></label>
              <label>Benefits <span>One per line</span><textarea id="lpb-benefits" rows="4"></textarea></label>
            </div>

            <div class="lpb-editor-section">
              <small>PRICE & OFFER</small>
              <div class="lpb-two">
                <label>Price<input id="lpb-price" inputmode="decimal" placeholder="79" /></label>
                <label>Old price<input id="lpb-old-price" inputmode="decimal" placeholder="99" /></label>
              </div>
              <div class="lpb-two">
                <label>Currency
                  <select id="lpb-currency">
                    ${LANDING_CURRENCIES.map(([code,symbol,name]) => `<option value="${code}">${code} · ${symbol} · ${name}</option>`).join("")}
                  </select>
                </label>
                <label>Price display
                  <select id="lpb-price-mode"><option value="show">Show price</option><option value="quote">Contact for price</option><option value="hide">Hide price</option></select>
                </label>
              </div>
            </div>



          <div class="lpb-editor-section lpb-commerce-engine">
            <small>PRODUCT / SERVICE ENGINE</small>
            <div class="lpb-media-toggle-row"><div><strong>Page mode</strong><span>Auto detects product templates. Force Product when you sell items, or Service when quantity is not needed.</span></div><select id="lpb-commerce-mode"><option value="auto">Auto</option><option value="product">Product</option><option value="service">Service</option></select></div>
            <div class="lpb-commerce-product-settings" data-product-settings>
              <div class="lpb-two"><label>Quantity selector<select id="lpb-quantity-enabled"><option value="on">Enabled</option><option value="off">Hidden</option></select></label><label>Default quantity<input id="lpb-quantity-default" type="number" min="1" max="99" step="1" /></label></div>
              <div class="lpb-three"><label>Minimum<input id="lpb-quantity-min" type="number" min="1" max="99" step="1" /></label><label>Maximum<input id="lpb-quantity-max" type="number" min="1" max="99" step="1" /></label><label>Bundles<select id="lpb-bundle-enabled"><option value="off">Off</option><option value="on">On</option></select></label></div>
              <label>Variants <span>Optional · Name: option 1, option 2</span><textarea id="lpb-variants-text" rows="4" placeholder="Size: Small, Medium, Large&#10;Color: Black, White, Rose"></textarea></label>
              <label>Bundle options <span>Optional · Label|Quantity, one per line</span><textarea id="lpb-bundle-options" rows="4" placeholder="Single|1&#10;Pack of 2|2&#10;Pack of 3|3"></textarea></label>
              <p class="lpb-media-help lpb-media-help-strong">Product mode adds quantity, variants, bundle selection and a live order summary. Service mode removes product-order controls.</p>
            </div>
          </div>
            <div class="lpb-editor-section">
              <small>CONVERSION</small>
              <div class="lpb-two">
                <label>CTA text<input id="lpb-cta-text" placeholder="Get a quote" /></label>
                <label>CTA action
                  <select id="lpb-cta-action"><option value="form">Lead form</option><option value="whatsapp">WhatsApp</option><option value="call">Call</option><option value="email">Email</option></select>
                </label>
              </div>
              <label>WhatsApp number<input id="lpb-whatsapp" placeholder="+212..." /></label>
              <div class="lpb-two">
                <label>Phone<input id="lpb-phone" placeholder="+1..." /></label>
                <label>Email<input id="lpb-email" type="email" placeholder="sales@company.com" /></label>
              </div>
            </div>

            <div class="lpb-editor-section lpb-media-pro-section">
              <small>HERO VISUAL · OPTIONAL</small>
              <div class="lpb-media-toggle-row">
                <div><strong>Hero image / video area</strong><span>Show it, replace it, or remove it completely.</span></div>
                <select id="lpb-hero-media-enabled"><option value="on">Show</option><option value="off">Hidden</option></select>
              </div>
              <label>Hero image URL<input id="lpb-hero-image-url" type="url" placeholder="https://...hero-image.jpg" /></label>
              <label class="lpb-upload-label">Upload hero image
                <input id="lpb-hero-image-file" type="file" accept="image/*" />
              </label>
              <p class="lpb-media-help">For a hero video, enable Video below and choose “Inside hero”.</p>
            </div>

            <div class="lpb-editor-section">
              <small>COLORS</small>
              <div class="lpb-color-grid">
                <label>Accent<input id="lpb-accent" type="color" /></label>
                <label>Background<input id="lpb-background" type="color" /></label>
                <label>Surface<input id="lpb-surface" type="color" /></label>
                <label>Text<input id="lpb-text-color" type="color" /></label>
              </div>
              <div class="lpb-palette-row">
                <button type="button" data-lpb-palette="#7c5cff|#090b12|#111522|#f7f8fb">Violet</button>
                <button type="button" data-lpb-palette="#d7b46a|#0a0a0a|#151310|#f8f4ea">Luxury</button>
                <button type="button" data-lpb-palette="#45d483|#07110c|#0e1b14|#f5fff9">Green</button>
                <button type="button" data-lpb-palette="#59b7ff|#071019|#0d1924|#f2f8ff">Blue</button>
                <button type="button" data-lpb-palette="#de7aa5|#fff5f8|#ffffff|#2a1821">Rose</button>
              </div>
            </div>

            <div class="lpb-editor-section">
              <small>TRUST & FAQ</small>
              <label>Testimonial<textarea id="lpb-testimonial" rows="3"></textarea></label>
              <label>FAQ question<input id="lpb-faq-q" /></label>
              <label>FAQ answer<textarea id="lpb-faq-a" rows="3"></textarea></label>
            </div>

            <div class="lpb-editor-actions">
              <button id="lpb-save-draft" class="primary" type="button">Save draft</button>
              <button id="lpb-export-html" type="button">Export HTML</button>
              <button id="lpb-publish" type="button">Publish</button>
            </div>
            <p class="lpb-publish-note">Save drafts locally, or Publish to create a real YOUYOU URL. Export HTML remains available as an optional backup.</p>
          </aside>

          <div class="lpb-preview-column">
            <div class="lpb-preview-toolbar dashboard-card">
              <div>
                <small>LIVE PREVIEW</small>
                <strong id="lpb-preview-name">Landing page</strong>
              </div>
              <div class="lpb-device-toggle">
                <button class="is-active" type="button" data-lpb-device="desktop">Desktop</button>
                <button type="button" data-lpb-device="mobile">Mobile</button>
              </div>
            </div>
            <div id="lpb-preview-frame" class="lpb-preview-frame dashboard-card">
              <div id="lpb-live-preview"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="lpb-panel" data-lpb-panel="saved" hidden>
        <div class="lpb-saved-head">
          <div><small>MY DRAFTS & PAGES</small><h2>Continue exactly where you stopped.</h2><p>Drafts auto-save as you work. Published pages keep the same live URL when you update them.</p></div>
          <button class="primary" type="button" data-lpb-open-builder="product-launch">Create new →</button>
        </div>
        <div class="lpb-saved-toolbar dashboard-card">
          <label class="lpb-pages-search"><span>Search pages</span><input id="lpb-pages-search" type="search" placeholder="Search by page name or headline…" autocomplete="off" /></label>
          <div class="lpb-pages-filters" role="group" aria-label="Filter landing pages">
            <button class="is-active" type="button" data-lpb-pages-filter="all">All</button>
            <button type="button" data-lpb-pages-filter="draft">Drafts</button>
            <button type="button" data-lpb-pages-filter="published">Published</button>
            <button type="button" data-lpb-pages-filter="changes">Changes not live</button>
          </div>
        </div>
        <div id="lpb-saved-grid" class="lpb-saved-grid"></div>
      </div>
    </section>
  `;
}


function renderLandingPageWorkspace() {
  const request = landingBuilderRequest();
  const drafts = loadLandingDrafts();
  const saved = request.mode === "edit"
    ? drafts.find((item) => item.id === request.pageId)
    : null;

  const current = saved
    ? { ...saved }
    : defaultLandingPageData(request.templateId);

  window.__youyouLandingWorkspaceDraft = current;

  app.innerHTML = `
    <div class="lpw-shell">
      <header class="lpw-topbar">
        <div class="lpw-brand-area">
          <button id="lpw-back" type="button" class="lpw-back">← Landing Pages</button>
          <span class="lpw-divider"></span>
          <span class="brand-wordmark lpw-wordmark" aria-label="YOUYOU">
            <span class="brand-symbol" aria-hidden="true"><i></i><b>Y</b></span>
            <span class="brand-text"><span class="brand-you brand-you-first">YOU</span><span class="brand-you brand-you-second">YOU</span></span>
          </span>
          <div class="lpw-document">
            <small>LANDING PAGE WORKSPACE</small>
            <strong id="lpw-document-name">${escapeHtml(current.name || "Untitled page")}</strong>
          </div>
        </div>

        <div class="lpw-top-actions">
          <span id="lpw-save-state" class="lpw-status">${current.publishedUrl ? (landingNeedsRendererUpdate(current) ? "Live design update required" : (current.hasUnpublishedChanges ? "Changes not published" : "Published")) : (request.mode === "edit" ? "Saved draft" : "New draft")}</span>
          <button id="lpw-export-top" type="button">Export HTML</button>
          <button id="lpw-publish-top" class="lpw-publish-button" type="button">${current.publishedUrl ? (landingNeedsRendererUpdate(current) ? "Update live design" : "Update live page") : "Publish"}</button>
          <button id="lpw-save-top" class="primary" type="button">Save</button>
        </div>
      </header>

      <div id="lpw-publish-result" class="lpw-publish-result" ${current.publishedUrl ? "" : "hidden"}>
        <div>
          <small>LIVE PAGE</small>
          <strong>${current.publishedUrl ? "Your landing page is live" : "Published successfully"}</strong>
        </div>
        <div class="lpw-publish-link-row">
          <input id="lpw-publish-url" readonly value="${escapeHtml(current.publishedUrl || "")}" aria-label="Published landing page URL" />
          <button id="lpw-copy-publish-url" type="button">Copy link</button>
          <a id="lpw-open-publish-url" href="${escapeHtml(current.publishedUrl || "#")}" target="_blank" rel="noopener">Open ↗</a>
        </div>
      </div>

      <main class="lpw-main">
        <aside class="lpw-editor">
          <div class="lpw-editor-intro">
            <div>
              <small>VISUAL BUILDER</small>
              <h1>Build the page your ad deserves.</h1>
              <p>Change the content, offer, colors and conversion action. Your preview updates as you work.</p>
            </div>
          </div>

          <div class="lpb-editor-section">
            <small>PAGE</small>
            <label>Page name<input id="lpb-name" placeholder="Summer Spa Offer" /></label>
            <div class="lpb-two">
              <label>Type
                <select id="lpb-page-type"><option>Product</option><option>Service</option><option>Offer</option><option>Lead Generation</option><option>Booking</option><option>Event</option></select>
              </label>
              <label>Direction
                <select id="lpb-direction"><option value="ltr">LTR</option><option value="rtl">RTL · Arabic</option></select>
              </label>
            </div>
          </div>

          <div class="lpb-editor-section lpb-business-first">
            <small>BUSINESS & CONTACT · START HERE</small>
            <p class="lpb-section-intro">Add the contact details visitors should see and use.</p>
            <label>Business / brand name<input id="lpb-business-name" placeholder="Your business name" /></label>
            <div class="lpb-two">
              <label>Phone<input id="lpb-phone" inputmode="tel" placeholder="+212..." /></label>
              <label>Email<input id="lpb-email" type="email" placeholder="sales@company.com" /></label>
            </div>
            <label>Address<input id="lpb-business-address" placeholder="Street, city, country" /></label>
            <div class="lpb-two lpb-whatsapp-fields">
              <label>WhatsApp country code<input id="lpb-whatsapp-country-code" inputmode="numeric" placeholder="212" /></label>
              <label>WhatsApp number<input id="lpb-whatsapp" inputmode="tel" placeholder="06... / +212..." /></label>
            </div>
          </div>

          <div class="lpb-editor-section">
            <small>MAIN CONTENT</small>
            <label>Badge<input id="lpb-badge" placeholder="LIMITED OFFER" /></label>
            <label>Headline<textarea id="lpb-headline" rows="3"></textarea></label>
            <label>Subheadline<textarea id="lpb-subheadline" rows="3"></textarea></label>
            <label>Description<textarea id="lpb-description" rows="4"></textarea></label>
            <label>Benefits <span>One per line</span><textarea id="lpb-benefits" rows="4"></textarea></label>
          </div>

          <div class="lpb-editor-section lpb-price-premium-section">
            <small>PRICE & OFFER</small>
            <div class="lpb-price-mode-cards" role="group" aria-label="Price display mode">
              <button type="button" data-price-mode-value="show"><span>01</span><strong>Show price</strong><small>Display a clear selling price</small></button>
              <button type="button" data-price-mode-value="quote"><span>02</span><strong>Ask for quote</strong><small>Hide the amount, keep the CTA</small></button>
              <button type="button" data-price-mode-value="hide"><span>03</span><strong>No price</strong><small>Remove pricing completely</small></button>
            </div>
            <select id="lpb-price-mode" class="lpb-price-mode-hidden" aria-hidden="true" tabindex="-1"><option value="show">Show price</option><option value="quote">Contact for price</option><option value="hide">Hide price</option></select>
            <div class="lpb-price-premium-card" data-price-editor>
              <div class="lpb-price-main-row">
                <label class="lpb-price-currency">Currency
                  <select id="lpb-currency">${LANDING_CURRENCIES.map(([code,symbol,name]) => `<option value="${code}">${code} · ${symbol} · ${name}</option>`).join("")}</select>
                </label>
                <label class="lpb-price-big">Selling price<input id="lpb-price" inputmode="decimal" placeholder="100" /></label>
              </div>
              <label class="lpb-old-price-premium">Compare-at / old price <span>Optional</span><input id="lpb-old-price" inputmode="decimal" placeholder="300" /></label>
              <div class="lpb-price-hint"><span>✦</span><p><strong>Premium pricing block</strong><small>Large, visible pricing controls so the client always knows where to set the offer.</small></p></div>
            </div>
          </div>

          <div class="lpb-editor-section lpb-commerce-engine lpb-commerce-pro-section">
            <small>PRODUCT OPTIONS · OPTIONAL</small>
            <div class="lpb-commerce-master">
              <div><strong>Activate product options</strong><span>OFF by default. Quantity, colors, variants and bundles stay hidden until you activate this option.</span></div>
              <select id="lpb-commerce-enabled"><option value="off">OFF</option><option value="on">ON</option></select>
            </div>
            <div data-commerce-settings>
              <div class="lpb-media-toggle-row"><div><strong>Mode</strong><span>Product shows order options. Service keeps the landing page clean.</span></div><select id="lpb-commerce-mode"><option value="product">Product</option><option value="service">Service</option></select></div>
              <div class="lpb-commerce-product-settings" data-product-settings>
                <div class="lpb-two"><label>Quantity selector<select id="lpb-quantity-enabled"><option value="on">Enabled</option><option value="off">Hidden</option></select></label><label>Default quantity<input id="lpb-quantity-default" type="number" min="1" max="99" step="1" /></label></div>
                <div class="lpb-three"><label>Minimum<input id="lpb-quantity-min" type="number" min="1" max="99" step="1" /></label><label>Maximum<input id="lpb-quantity-max" type="number" min="1" max="99" step="1" /></label><label>Bundles<select id="lpb-bundle-enabled"><option value="off">Off</option><option value="on">On</option></select></label></div>

                <div class="lpb-color-builder">
                  <div class="lpb-color-builder-head"><div><strong>Product colors</strong><span>Choose as many colors as the product needs.</span></div><span id="lpb-color-count">0 selected</span></div>
                  <textarea id="lpb-product-colors" class="lpb-color-storage" aria-hidden="true" tabindex="-1"></textarea>
                  <div class="lpb-color-preset-grid" id="lpb-color-preset-grid">
                    <button type="button" data-product-color="Black|#111111"><i style="background:#111111"></i><span>Black</span></button>
                    <button type="button" data-product-color="White|#FFFFFF"><i style="background:#FFFFFF"></i><span>White</span></button>
                    <button type="button" data-product-color="Gray|#94A3B8"><i style="background:#94A3B8"></i><span>Gray</span></button>
                    <button type="button" data-product-color="Red|#EF4444"><i style="background:#EF4444"></i><span>Red</span></button>
                    <button type="button" data-product-color="Rose|#F43F5E"><i style="background:#F43F5E"></i><span>Rose</span></button>
                    <button type="button" data-product-color="Pink|#EC4899"><i style="background:#EC4899"></i><span>Pink</span></button>
                    <button type="button" data-product-color="Purple|#8B5CF6"><i style="background:#8B5CF6"></i><span>Purple</span></button>
                    <button type="button" data-product-color="Blue|#3B82F6"><i style="background:#3B82F6"></i><span>Blue</span></button>
                    <button type="button" data-product-color="Navy|#1E3A8A"><i style="background:#1E3A8A"></i><span>Navy</span></button>
                    <button type="button" data-product-color="Cyan|#06B6D4"><i style="background:#06B6D4"></i><span>Cyan</span></button>
                    <button type="button" data-product-color="Teal|#14B8A6"><i style="background:#14B8A6"></i><span>Teal</span></button>
                    <button type="button" data-product-color="Green|#22C55E"><i style="background:#22C55E"></i><span>Green</span></button>
                    <button type="button" data-product-color="Lime|#84CC16"><i style="background:#84CC16"></i><span>Lime</span></button>
                    <button type="button" data-product-color="Yellow|#EAB308"><i style="background:#EAB308"></i><span>Yellow</span></button>
                    <button type="button" data-product-color="Orange|#F97316"><i style="background:#F97316"></i><span>Orange</span></button>
                    <button type="button" data-product-color="Brown|#92400E"><i style="background:#92400E"></i><span>Brown</span></button>
                    <button type="button" data-product-color="Beige|#D6C3A5"><i style="background:#D6C3A5"></i><span>Beige</span></button>
                    <button type="button" data-product-color="Gold|#D4AF37"><i style="background:#D4AF37"></i><span>Gold</span></button>
                  </div>
                  <div class="lpb-custom-color-row">
                    <input id="lpb-custom-color-name" placeholder="Custom color name" />
                    <input id="lpb-custom-color-hex" type="color" value="#D96A98" aria-label="Custom color" />
                    <button id="lpb-add-custom-color" type="button">+ Add color</button>
                  </div>
                  <div id="lpb-selected-colors" class="lpb-selected-colors"></div>
                </div>

                <label>Other variants <span>Optional · Name: option 1, option 2</span><textarea id="lpb-variants-text" rows="4" placeholder="Size: Small, Medium, Large&#10;Material: Cotton, Linen"></textarea></label>
                <label>Bundle options <span>Optional · Label|Quantity, one per line</span><textarea id="lpb-bundle-options" rows="4" placeholder="Single|1&#10;Pack of 2|2&#10;Pack of 3|3"></textarea></label>
                <p class="lpb-media-help lpb-media-help-strong">When activated, order details appear only beside the lead form near the bottom of the landing page — never under the hero.</p>
              </div>
            </div>
          </div>
          <div class="lpb-editor-section">
            <small>CONVERSION</small>
            <div class="lpb-two">
              <label>CTA text<input id="lpb-cta-text" placeholder="Get a quote" /></label>
              <label>CTA action
                <select id="lpb-cta-action"><option value="form">Scroll to lead form</option><option value="whatsapp">WhatsApp</option><option value="call">Call</option><option value="email">Email</option></select>
              </label>
            </div>
            <div class="lpb-two">
              <label>Lead form
                <select id="lpb-lead-form-enabled"><option value="on">Show</option><option value="off">Hidden</option></select>
              </label>
              <label>Form button text<input id="lpb-form-button-text" placeholder="Send request" /></label>
            </div>
            <p class="lpb-media-help">CTA action controls the main button. Business phone, WhatsApp, email and address are managed at the top of the workspace.</p>
          </div>

          <div class="lpb-editor-section lpb-media-pro-section">
            <small>HERO VISUAL · OPTIONAL</small>
            <div class="lpb-media-toggle-row">
              <div><strong>Hero visual</strong><span>Use an image, use the hero video below, or hide the visual completely.</span></div>
              <select id="lpb-hero-media-enabled"><option value="on">Show</option><option value="off">Hidden</option></select>
            </div>
            <details class="lpb-advanced-media" open>
              <summary>Hero image</summary>
              <label>Image URL<input id="lpb-hero-image-url" type="url" inputmode="url" placeholder="https://...hero-image.jpg" /></label>
              <label class="lpb-upload-label lpb-upload-pro">
                Upload hero image
                <input id="lpb-hero-image-file" type="file" accept="image/*" />
                <span class="lpb-upload-button">Choose hero image</span>
                <span>JPG / PNG / WebP · optimized for preview</span>
              </label>
            </details>
          </div>

          <div class="lpb-editor-section lpb-media-pro-section">
            <small>VIDEO / HERO VIDEO · OPTIONAL</small>
            <div class="lpb-media-toggle-row">
              <div><strong>Product or hero video</strong><span>Place it inside the hero or as a separate section. Slider stays images-only.</span></div>
              <select id="lpb-video-enabled"><option value="on">Enabled</option><option value="off">Hidden</option></select>
            </div>
            <label>Video section title<input id="lpb-video-title" placeholder="See the product in action." /></label>
            <label>Video URL<input id="lpb-video-url" type="text" inputmode="url" placeholder="YouTube / Vimeo / .mp4 URL" /></label>
            <label class="lpb-upload-label lpb-upload-pro">
              Upload video
              <input id="lpb-video-file" type="file" accept="video/mp4,video/webm,video/ogg,video/*" />
              <span class="lpb-upload-button">Choose video</span>
              <span>MP4 / WebM / OGG · uploaded to YOUYOU media storage for export and publish.</span>
            </label>
            <label>Video position
              <select id="lpb-video-position">
                <option value="hero">Inside hero · replace hero image</option>
                <option value="after-hero">After hero</option>
                <option value="after-benefits">After benefits</option>
                <option value="before-contact">Before final CTA</option>
              </select>
            </label>
            <p class="lpb-media-help">Choose “Inside hero” to make the video the main visual at the top. Uploaded videos preview instantly and are saved to permanent media storage so Export and Publish use the same URL.</p>
          </div>

          <div class="lpb-editor-section lpb-media-pro-section">
            <small>IMAGES / GALLERY</small>
            <div class="lpb-media-toggle-row">
              <div><strong>Product images</strong><span>Choose a slider, normal static images, or hide this section.</span></div>
              <select id="lpb-slider-enabled"><option value="grid">Image gallery</option><option value="on">3-card carousel</option><option value="off">Hidden</option></select>
            </div>
            <label>Gallery title<input id="lpb-slider-title" placeholder="See it from every angle." /></label>

            <label class="lpb-upload-label lpb-upload-pro">
              Add your images
              <input id="lpb-image-files" type="file" accept="image/*" multiple />
              <span class="lpb-upload-button">Choose images</span>
              <span>Up to 20 photos · any image size is fitted automatically. Recommended: 1200 × 1200 JPG/PNG/WebP.</span>
            </label>

            <div id="lpb-gallery-manager" class="lpb-gallery-manager" aria-live="polite"></div>

            <details class="lpb-advanced-media">
              <summary>Advanced image URLs</summary>
              <label>First image URL<input id="lpb-image-url" type="text" inputmode="url" placeholder="https://...product-front.jpg" /></label>
              <label>Additional image URLs <span>One per line · up to 20</span>
                <textarea id="lpb-media-gallery" rows="5" placeholder="https://...front.jpg&#10;https://...side.jpg&#10;https://...detail.jpg"></textarea>
              </label>
            </details>

            <div class="lpb-slider-settings-pro" data-slider-only>
              <label>Auto-play
                <select id="lpb-slider-autoplay"><option value="on">On</option><option value="off">Off</option></select>
              </label>
              <label>Speed
                <select id="lpb-slider-speed">
                  <option value="2500">2.5 sec</option>
                  <option value="4000">4 sec</option>
                  <option value="5500">5.5 sec</option>
                  <option value="7000">7 sec</option>
                </select>
              </label>
              <label>Arrows
                <select id="lpb-slider-arrows"><option value="on">Show</option><option value="off">Hide</option></select>
              </label>
              <label>Dots
                <select id="lpb-slider-dots"><option value="on">Show</option><option value="off">Hide</option></select>
              </label>
              <label>Image shape
                <select id="lpb-slider-ratio"><option value="square">Square 1:1</option><option value="portrait">Portrait 4:5</option><option value="landscape">Landscape 4:3</option></select>
              </label>
            </div>

            <label data-gallery-position>Gallery position
              <select id="lpb-slider-position">
                <option value="after-video">Directly under video</option>
                <option value="after-hero">After hero</option>
                <option value="after-benefits">After benefits</option>
                <option value="before-contact">Before final CTA</option>
              </select>
            </label>

            <p class="lpb-media-help lpb-media-help-strong">Image gallery = normal photos. 3-card carousel = 3 images visible on desktop, 1 + a peek on mobile, with every uploaded image included.</p>
          </div>

          <div class="lpb-editor-section">
            <small>EXTRA TEXT BLOCK</small>
            <label>Section title<input id="lpb-extra-title" placeholder="More about this offer" /></label>
            <label>Extra text <span>Optional · add any message you want</span><textarea id="lpb-extra-text" rows="5" placeholder="Add details, conditions, story, delivery information, guarantees..."></textarea></label>
            <label>Text position
              <select id="lpb-extra-text-position"><option value="after-hero">After hero</option><option value="after-benefits">After benefits</option><option value="before-contact">Before contact form</option></select>
            </label>
          </div>

          <div class="lpb-editor-section lpb-custom-sections-editor">
            <small>CUSTOM SECTIONS · OPTIONAL</small>
            <div class="lpb-media-toggle-row">
              <div><strong>Add your own content blocks</strong><span>Create, reorder or remove extra sections without touching code.</span></div>
              <button id="lpb-add-custom-section" class="lpb-mini-action" type="button">+ Add section</button>
            </div>
            <div id="lpb-custom-sections-manager" class="lpb-custom-sections-manager"></div>
            <p class="lpb-media-help">Up to 8 custom sections. Use the emoji picker below in any title or text field.</p>
          </div>

          <div class="lpb-editor-section">
            <small>COLORS</small>
            <div class="lpb-color-grid">
              <label>Accent<input id="lpb-accent" type="color" /></label>
              <label>Background<input id="lpb-background" type="color" /></label>
              <label>Surface<input id="lpb-surface" type="color" /></label>
              <label>Text<input id="lpb-text-color" type="color" /></label>
            </div>
            <div class="lpb-palette-row">
              <button type="button" data-lpb-palette="#7c5cff|#090b12|#111522|#f7f8fb">Violet</button>
              <button type="button" data-lpb-palette="#d7b46a|#f6f0e4|#fffaf0|#251f18">Cream</button>
              <button type="button" data-lpb-palette="#45a775|#f4fbf7|#ffffff|#14231b">Fresh</button>
              <button type="button" data-lpb-palette="#478edb|#f3f7fc|#ffffff|#17202c">Blue</button>
              <button type="button" data-lpb-palette="#de7aa5|#fff5f8|#ffffff|#2a1821">Rose</button>
              <button type="button" data-lpb-palette="#d7b46a|#0a0a0a|#151310|#f8f4ea">Dark luxury</button>
            </div>
          </div>

          <div class="lpb-editor-section lpb-freedom-editor">
            <small>DESIGN FREEDOM</small>
            <div class="lpb-two">
              <label>Font style
                <select id="lpb-font-family"><option value="system">Clean system</option><option value="modern">Modern</option><option value="elegant">Elegant serif</option><option value="friendly">Friendly</option><option value="mono">Mono / tech</option></select>
              </label>
              <label>Text alignment
                <select id="lpb-content-align"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select>
              </label>
            </div>
            <label>Corner style
              <select id="lpb-corner-radius"><option value="8">Sharp</option><option value="14">Soft</option><option value="18">Premium</option><option value="26">Rounded</option><option value="34">Extra rounded</option></select>
            </label>
            <div class="lpb-two">
              <label>Hero layout
                <select id="lpb-media-position"><option value="right">Visual right</option><option value="left">Visual left</option><option value="top">Visual above</option><option value="bottom">Visual below</option></select>
              </label>
              <label>Page spacing
                <select id="lpb-section-density"><option value="compact">Compact</option><option value="balanced">Balanced</option><option value="airy">Airy</option></select>
              </label>
            </div>
            <div class="lpb-two">
              <label>Hero visual width
                <select id="lpb-media-width"><option value="38">38%</option><option value="46">46%</option><option value="54">54%</option><option value="60">60%</option></select>
              </label>
              <label>Hero visual height
                <select id="lpb-media-height"><option value="300">300 px</option><option value="380">380 px</option><option value="460">460 px</option><option value="540">540 px</option></select>
              </label>
            </div>
            <div class="lpb-section-visibility">
              <label>Benefits<select id="lpb-show-benefits"><option value="on">Show</option><option value="off">Hide</option></select></label>
              <label>FAQ<select id="lpb-show-faq"><option value="on">Show</option><option value="off">Hide</option></select></label>
              <label>Testimonial<select id="lpb-show-testimonial"><option value="on">Show</option><option value="off">Hide</option></select></label>
              <label>Final CTA<select id="lpb-show-contact"><option value="on">Show</option><option value="off">Hide</option></select></label>
            </div>
            <div class="lpb-emoji-picker" aria-label="Quick emoji insert">
              <span>Quick emoji · click a text field, then an emoji</span>
              <div>${['✨','🔥','❤️','✅','⭐','🚀','💎','🌿','📞','📍','🎁','💬'].map((emoji)=>`<button type="button" data-lpb-emoji="${emoji}" aria-label="Insert ${emoji}">${emoji}</button>`).join('')}</div>
            </div>
            <p class="lpb-media-help">These controls are optional. Clients can keep the template style or personalize it without touching code.</p>
          </div>

          <div class="lpb-editor-section lpb-widget-editor">
            <small>AI PAGE WIDGET</small>
            <div class="lpb-media-toggle-row">
              <div><strong>Page-aware chat</strong><span>Reads this landing page content and answers visitor questions.</span></div>
              <select id="lpb-widget-enabled"><option value="on">Enabled</option><option value="off">Hidden</option></select>
            </div>
            <label>Assistant name<input id="lpb-widget-name" placeholder="YOUYOU Assistant" /></label>
            <label>Welcome message<input id="lpb-widget-greeting" placeholder="Hi! Ask me anything about this page." /></label>
            <label>Position<select id="lpb-widget-position"><option value="right">Bottom right</option><option value="left">Bottom left</option></select></label>
            <p class="lpb-media-help lpb-media-help-strong">Works now as a page-context preview without a paid AI API. Later, OpenAI can replace the local responder while keeping the same widget and page context.</p>
          </div>

          <div class="lpb-editor-section">
            <small>TRUST & FAQ</small>
            <label>Testimonial<textarea id="lpb-testimonial" rows="3"></textarea></label>
            <label>FAQ question<input id="lpb-faq-q" /></label>
            <label>FAQ answer<textarea id="lpb-faq-a" rows="3"></textarea></label>
          </div>

          <div class="lpw-editor-footer">
            <button id="lpw-save-bottom" class="primary" type="button">Save draft</button>
            <button id="lpw-publish-bottom" class="lpw-publish-button" type="button">${current.publishedUrl ? (landingNeedsRendererUpdate(current) ? "Update live design" : "Update live page") : "Publish"}</button>
            <button id="lpw-export-bottom" type="button">Export HTML</button>
          </div>
        </aside>

        <section class="lpw-canvas">
          <div class="lpw-canvas-toolbar">
            <div>
              <small>LIVE CANVAS</small>
              <strong>See every change immediately</strong>
            </div>

            <div class="lpw-canvas-tools">
              <div class="lpb-device-toggle">
                <button class="is-active" type="button" data-lpb-device="desktop">Desktop</button>
                <button type="button" data-lpb-device="mobile">Mobile</button>
              </div>
              <span class="lpw-preview-badge">LIVE PREVIEW</span>
            </div>
          </div>

          <div id="lpb-preview-frame" class="lpw-preview-stage">
            <div class="lpw-device-shell">
              <iframe id="lpb-live-preview" class="lpw-preview-iframe" title="Exact landing page preview" sandbox="allow-scripts allow-same-origin allow-popups" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"></iframe>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

async function optimizeLandingImageFile(file, maxSide = 1600, quality = 0.86) {
  if (!file || !String(file.type || "").startsWith("image/")) return "";
  const original = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
  if (!original) return "";
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = original;
    });
    const width = Number(image.naturalWidth || image.width || 0);
    const height = Number(image.naturalHeight || image.height || 0);
    if (!width || !height) return original;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d", { alpha:true });
    if (!ctx) return original;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const optimized = canvas.toDataURL("image/webp", quality);
    return optimized && optimized.length < original.length ? optimized : original;
  } catch (_) {
    return original;
  }
}


const YOUYOU_LANDING_MEDIA_BUCKET = "landing-media";
const YOUYOU_LANDING_MAX_IMAGES = 20;
const YOUYOU_LANDING_MAX_VIDEO_BYTES = 100_000_000;

function landingSafeFileName(name = "media") {
  const raw = String(name || "media").toLowerCase();
  const extMatch = raw.match(/\.[a-z0-9]{2,6}$/i);
  const ext = extMatch ? extMatch[0] : "";
  const stem = raw.replace(/\.[a-z0-9]{2,6}$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 54) || "media";
  return `${stem}${ext}`;
}

function landingDataUrlToBlob(dataUrl = "") {
  const [header, body] = String(dataUrl || "").split(",", 2);
  if (!header || !body) return null;
  const mime = header.match(/^data:([^;]+)/)?.[1] || "application/octet-stream";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type:mime });
}

async function uploadLandingMediaFile(fileOrBlob, { pageId = "page", kind = "media", fileName = "media" } = {}) {
  if (!supabase || !state.user?.id) throw new Error("Sign in and connect Supabase before uploading permanent media.");
  const safePage = String(pageId || "page").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 80) || "page";
  const safeKind = String(kind || "media").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 24) || "media";
  const safeName = landingSafeFileName(fileName || "media");
  const unique = `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  const path = `${state.user.id}/${safePage}/${safeKind}/${unique}-${safeName}`;
  const contentType = String(fileOrBlob?.type || "application/octet-stream");
  const { error } = await supabase.storage.from(YOUYOU_LANDING_MEDIA_BUCKET).upload(path, fileOrBlob, {
    cacheControl:"31536000",
    upsert:false,
    contentType,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(YOUYOU_LANDING_MEDIA_BUCKET).getPublicUrl(path);
  const publicUrl = String(data?.publicUrl || "").trim();
  if (!publicUrl) throw new Error("Media uploaded but no public URL was returned.");
  return publicUrl;
}

function landingStudioStatus(text) {
  const status = document.querySelector("#lpw-save-state");
  if (status) status.textContent = text;
}
function landingStoragePathFromPublicUrl(url = "") {
  const raw = String(url || "").trim();
  if (!raw || !SUPABASE_URL || !state.user?.id) return "";
  const marker = `/storage/v1/object/public/${YOUYOU_LANDING_MEDIA_BUCKET}/`;
  const index = raw.indexOf(marker);
  if (index < 0) return "";
  const path = decodeURIComponent(raw.slice(index + marker.length));
  return path.startsWith(`${state.user.id}/`) ? path : "";
}

async function deleteLandingMediaUrl(url = "") {
  const path = landingStoragePathFromPublicUrl(url);
  if (!path || !supabase) return;
  const { error } = await supabase.storage.from(YOUYOU_LANDING_MEDIA_BUCKET).remove([path]);
  if (error) console.warn("YOUYOU media cleanup:", error);
}


function initLandingPageWorkspace() {
  const request = landingBuilderRequest();
  const storedDrafts = loadLandingDrafts();
  let current = request.mode === "edit"
    ? { ...(storedDrafts.find((item) => item.id === request.pageId) || defaultLandingPageData("product-launch")) }
    : { ...(window.__youyouLandingWorkspaceDraft || defaultLandingPageData(request.templateId)) };

  // Backward-compatible defaults for landing pages saved before V5.07.
  current = { ...defaultLandingPageData(current.templateId || request.templateId), ...current };

  const normalizeCustomSections = () => {
    if (!Array.isArray(current.customSections)) current.customSections = [];
    current.customSections = current.customSections.slice(0, 8).map((item) => ({
      id:String(item?.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2,7)}`),
      eyebrow:String(item?.eyebrow || "MORE"),
      title:String(item?.title || ""),
      text:String(item?.text || ""),
    }));
    return current.customSections;
  };

  const renderCustomSectionsManager = () => {
    const manager = document.querySelector("#lpb-custom-sections-manager");
    if (!manager) return;
    const items = normalizeCustomSections();
    if (!items.length) {
      manager.innerHTML = `<div class="lpb-custom-empty"><span>＋</span><p>No custom sections yet. Add one when the template needs more content.</p></div>`;
      return;
    }
    manager.innerHTML = items.map((item,index) => `
      <article class="lpb-custom-card" data-custom-index="${index}">
        <div class="lpb-custom-card-head"><strong>Section ${index + 1}</strong><div><button type="button" data-custom-move="-1" aria-label="Move section up">↑</button><button type="button" data-custom-move="1" aria-label="Move section down">↓</button><button type="button" data-custom-remove aria-label="Remove section">×</button></div></div>
        <label>Small label<input data-custom-field="eyebrow" value="${escapeHtml(item.eyebrow)}" placeholder="MORE" /></label>
        <label>Title<input data-custom-field="title" value="${escapeHtml(item.title)}" placeholder="Your section title" /></label>
        <label>Text<textarea data-custom-field="text" rows="4" placeholder="Add the content you want visitors to read…">${escapeHtml(item.text)}</textarea></label>
      </article>`).join("");
  };

  const fieldMap = {
    name:"lpb-name", pageType:"lpb-page-type", direction:"lpb-direction",
    badge:"lpb-badge", headline:"lpb-headline", subheadline:"lpb-subheadline",
    description:"lpb-description", benefits:"lpb-benefits", price:"lpb-price",
    oldPrice:"lpb-old-price", currency:"lpb-currency", priceMode:"lpb-price-mode",
    businessName:"lpb-business-name", businessAddress:"lpb-business-address",
    commerceEnabled:"lpb-commerce-enabled", commerceMode:"lpb-commerce-mode", quantityEnabled:"lpb-quantity-enabled", quantityMin:"lpb-quantity-min", quantityMax:"lpb-quantity-max", quantityDefault:"lpb-quantity-default", productColors:"lpb-product-colors", variantsText:"lpb-variants-text", bundleEnabled:"lpb-bundle-enabled", bundleOptions:"lpb-bundle-options",
    ctaText:"lpb-cta-text", ctaAction:"lpb-cta-action", leadFormEnabled:"lpb-lead-form-enabled", formButtonText:"lpb-form-button-text", whatsapp:"lpb-whatsapp", whatsappCountryCode:"lpb-whatsapp-country-code",
    phone:"lpb-phone", email:"lpb-email", heroMediaEnabled:"lpb-hero-media-enabled", heroImageUrl:"lpb-hero-image-url", imageUrl:"lpb-image-url", videoUrl:"lpb-video-url",
    videoEnabled:"lpb-video-enabled", videoTitle:"lpb-video-title", videoPosition:"lpb-video-position",
    mediaGallery:"lpb-media-gallery", sliderEnabled:"lpb-slider-enabled", sliderTitle:"lpb-slider-title",
    sliderPosition:"lpb-slider-position", sliderAutoplay:"lpb-slider-autoplay", sliderSpeed:"lpb-slider-speed",
    sliderArrows:"lpb-slider-arrows", sliderDots:"lpb-slider-dots", sliderRatio:"lpb-slider-ratio",
    mediaPosition:"lpb-media-position", mediaWidth:"lpb-media-width", mediaHeight:"lpb-media-height",
    extraTitle:"lpb-extra-title", extraText:"lpb-extra-text", extraTextPosition:"lpb-extra-text-position",
    accent:"lpb-accent", background:"lpb-background", surface:"lpb-surface",
    textColor:"lpb-text-color", testimonial:"lpb-testimonial",
    faqQuestion:"lpb-faq-q", faqAnswer:"lpb-faq-a",
    widgetEnabled:"lpb-widget-enabled", widgetGreeting:"lpb-widget-greeting", widgetPosition:"lpb-widget-position", widgetName:"lpb-widget-name",
    fontFamily:"lpb-font-family", contentAlign:"lpb-content-align", cornerRadius:"lpb-corner-radius", sectionDensity:"lpb-section-density",
    showBenefits:"lpb-show-benefits", showFaq:"lpb-show-faq", showTestimonial:"lpb-show-testimonial", showContact:"lpb-show-contact",
  };

  const hydrateFields = () => {
    Object.entries(fieldMap).forEach(([key,id]) => {
      const el = document.getElementById(id);
      if (el) el.value = current[key] ?? "";
    });
    renderCustomSectionsManager();
    renderProductColorManager();
    syncPriceModeUi();
  };

  const readFields = () => {
    Object.entries(fieldMap).forEach(([key,id]) => {
      const el = document.getElementById(id);
      if (el) current[key] = el.value;
    });
  };

  const productColorLines = () => String(current.productColors || "").split("\n").map((line) => line.trim()).filter(Boolean).slice(0,16);
  const renderProductColorManager = () => {
    const selected = productColorLines();
    const selectedNames = new Set(selected.map((line) => String(line.split("|")[0] || "").trim().toLowerCase()));
    const storage = document.getElementById("lpb-product-colors");
    if (storage && storage.value !== selected.join("\n")) storage.value = selected.join("\n");
    document.querySelectorAll("[data-product-color]").forEach((button) => {
      const name = String(button.dataset.productColor || "").split("|")[0].trim().toLowerCase();
      button.classList.toggle("is-active", selectedNames.has(name));
    });
    const count = document.getElementById("lpb-color-count");
    if (count) count.textContent = `${selected.length} selected`;
    const host = document.getElementById("lpb-selected-colors");
    if (host) host.innerHTML = selected.length ? selected.map((line,index)=>{const [name,hex] = line.split("|");return `<span><i style="background:${escapeHtml(hex || '#CBD5E1')}"></i>${escapeHtml(name || 'Color')}<button type="button" data-remove-product-color="${index}" aria-label="Remove ${escapeHtml(name || 'color')}">×</button></span>`}).join("") : `<small>No colors selected yet.</small>`;
  };
  const setProductColors = (lines) => {
    current.productColors = [...new Set(lines.map((line)=>String(line||"").trim()).filter(Boolean))].slice(0,16).join("\n");
    const storage = document.getElementById("lpb-product-colors");
    if (storage) storage.value = current.productColors;
    renderProductColorManager();
  };
  const syncPriceModeUi = () => {
    const mode = String(document.getElementById("lpb-price-mode")?.value || current.priceMode || "show");
    document.querySelectorAll("[data-price-mode-value]").forEach((button)=>button.classList.toggle("is-active", button.dataset.priceModeValue === mode));
    const editor = document.querySelector("[data-price-editor]");
    if (editor) editor.classList.toggle("is-muted", mode !== "show");
  };

  const updateGalleryControls = () => {
    const mode = document.getElementById("lpb-slider-enabled")?.value || "off";
    document.querySelectorAll("[data-slider-only]").forEach((el) => {
      el.style.display = mode === "on" ? "grid" : "none";
    });
    document.querySelectorAll("[data-gallery-position]").forEach((el) => {
      el.style.display = mode === "off" ? "none" : "grid";
    });
  };

  const galleryItems = () => {
    const urls = [String(current.imageUrl || "").trim(), ...String(current.mediaGallery || "").split("\n").map((x) => x.trim())]
      .filter(Boolean)
      .filter((url, index, arr) => arr.indexOf(url) === index)
      .filter((url) => !landingVideoSource(url))
      .slice(0, 20);
    return urls;
  };

  const renderGalleryManager = () => {
    const manager = document.querySelector("#lpb-gallery-manager");
    if (!manager) return;
    const urls = galleryItems();
    if (!urls.length) {
      manager.innerHTML = `<div class="lpb-gallery-empty"><span>▧</span><div><strong>No product photos yet</strong><small>Choose images above or add hosted image URLs.</small></div></div>`;
      return;
    }
    manager.innerHTML = `<div class="lpb-gallery-manager-head"><strong>${urls.length} photo${urls.length === 1 ? "" : "s"}</strong><small>Preview · remove any image</small></div><div class="lpb-gallery-thumbs">${urls.map((url,index)=>`<figure><img src="${escapeHtml(url)}" alt="Gallery image ${index+1}" /><button type="button" data-gallery-remove="${index}" aria-label="Remove image ${index+1}">×</button></figure>`).join("")}</div>`;
  };

  let previewScrollY = 0;
  let previewToken = 0;
  const renderPreview = () => {
    readFields();
    const commerceEnabled = String(document.getElementById("lpb-commerce-enabled")?.value || current.commerceEnabled || "off") === "on";
    const explicitMode = String(document.getElementById("lpb-commerce-mode")?.value || current.commerceMode || "product");
    const effectiveProduct = commerceEnabled && explicitMode === "product";
    document.querySelectorAll("[data-commerce-settings]").forEach((el) => { el.style.display = commerceEnabled ? "grid" : "none"; });
    document.querySelectorAll("[data-product-settings]").forEach((el) => { el.style.display = effectiveProduct ? "grid" : "none"; });
    current.rendererVersion = YOUYOU_LANDING_RENDERER_VERSION;
    updateGalleryControls();
    renderGalleryManager();
    const preview = document.querySelector("#lpb-live-preview");
    const name = document.querySelector("#lpw-document-name");
    if (preview && preview.tagName === "IFRAME") {
      try { previewScrollY = preview.contentWindow?.scrollY || previewScrollY || 0; } catch (_) {}
      const token = ++previewToken;
      preview.addEventListener("load", () => {
        if (token !== previewToken) return;
        try { preview.contentWindow?.scrollTo(0, previewScrollY); } catch (_) {}
      }, { once:true });
      preview.srcdoc = landingExportHtml({ ...current, publicUrl:current.publishedUrl || "" }, { preview:true });
    } else if (preview) {
      preview.innerHTML = landingPreviewMarkup(current);
      initLandingCarousels(preview);
      yyInitCommerce(preview);
    }
    if (name) name.textContent = current.name || "Untitled page";
    const widthValue = document.querySelector("#lpb-media-width-value");
    const heightValue = document.querySelector("#lpb-media-height-value");
    if (widthValue) widthValue.textContent = `${current.mediaWidth || 46}%`;
    if (heightValue) heightValue.textContent = `${current.mediaHeight || 380}px`;
  };

  let autosaveTimer = null;
  let remoteSaveTimer = null;
  let lastFocusedTextField = null;
  // Always compare the cloud copy when editing. This prevents a stale local cache
  // from silently overwriting a newer draft saved on another device/session.
  let remoteHydrationDone = request.mode !== "edit";

  const statusText = () => {
    if (current.publishedUrl && landingNeedsRendererUpdate(current)) return "Live design update required";
    if (current.publishedUrl) return current.hasUnpublishedChanges ? "Changes not published" : "Published";
    return "Draft auto-saved";
  };

  const updateSaveState = (message = "") => {
    const stateEl = document.querySelector("#lpw-save-state");
    if (!stateEl) return;
    stateEl.textContent = message || statusText();
    const rendererUpdate = landingNeedsRendererUpdate(current);
    stateEl.classList.toggle("is-published", Boolean(current.publishedUrl && !current.hasUnpublishedChanges && !rendererUpdate));
    stateEl.classList.toggle("has-changes", Boolean(current.publishedUrl && (current.hasUnpublishedChanges || rendererUpdate)));
    stateEl.classList.toggle("needs-renderer-update", rendererUpdate);
  };

  const persistLocalCurrent = () => {
    current.updatedAt = current.updatedAt || new Date().toISOString();
    const drafts = loadLandingDrafts();
    const index = drafts.findIndex((item) => item.id === current.id);
    const safeCurrent = {
      ...current,
      videoUrl: String(current.videoUrl || "").startsWith("blob:") ? "" : current.videoUrl
    };
    if (index >= 0) drafts[index] = { ...safeCurrent };
    else drafts.unshift({ ...safeCurrent });
    try {
      saveLandingDrafts(drafts);
    } catch (error) {
      console.warn("YOUYOU local draft cache:", error);
    }

    const nextPath = landingBuilderRoute({ pageId: current.id });
    if (window.location.pathname !== nextPath) {
      window.history.replaceState({ section:"pages-builder", pageId:current.id }, "", nextPath);
    }
  };

  const persistRemoteCurrent = async () => {
    if (!remoteHydrationDone || !supabase || !state.user || !state.company?.id) return false;
    if (landingHasTemporaryMedia(current)) return false;
    const now = new Date().toISOString();
    const isPublished = Boolean(current.publishedUrl || current.publishedSlug);
    const slug = isPublished
      ? String(current.publishedSlug || landingSlugify(current.name)).trim()
      : landingDraftRemoteSlug(current.id);
    const safeContent = { ...current, updatedAt:now, videoUrl:String(current.videoUrl || "").startsWith("blob:") ? "" : current.videoUrl };
    const payload = {
      company_id:state.company.id,
      draft_id:current.id,
      slug,
      name:String(current.name || "Landing page").trim().slice(0,160) || "Landing page",
      template_id:String(current.templateId || "product-launch").slice(0,80),
      content:safeContent,
      status:isPublished ? "published" : "draft",
      published_at:isPublished ? (current.publishedAt || null) : null,
      updated_at:now,
    };
    const { data:saved, error } = await supabase
      .from("landing_pages")
      .upsert(payload, { onConflict:"company_id,draft_id" })
      .select("id,slug,status,published_at,updated_at")
      .single();
    if (error) {
      console.warn("YOUYOU draft cloud autosave:", error);
      return false;
    }
    current.remotePageId = saved?.id || current.remotePageId || "";
    current.updatedAt = saved?.updated_at || now;
    persistLocalCurrent();
    return true;
  };

  const queueRemoteSave = (delay = 900) => {
    clearTimeout(remoteSaveTimer);
    remoteSaveTimer = setTimeout(async () => {
      const ok = await persistRemoteCurrent();
      updateSaveState(ok ? statusText() : (current.publishedUrl ? "Changes saved locally · live page unchanged" : "Draft saved locally"));
    }, delay);
  };

  const markChangedAndAutosave = ({ remoteDelay = 900 } = {}) => {
    readFields();
    current.status = current.publishedUrl ? "Published" : "Draft";
    current.rendererVersion = YOUYOU_LANDING_RENDERER_VERSION;
    if (current.publishedUrl) current.hasUnpublishedChanges = true;
    current.updatedAt = new Date().toISOString();
    persistLocalCurrent();
    updateSaveState("Auto-saving…");
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => updateSaveState(statusText()), 450);
    queueRemoteSave(remoteDelay);
    setPublishUi(current.publishedUrl || "");
  };

  const saveDraft = async () => {
    readFields();
    current.status = current.publishedUrl ? "Published" : "Draft";
    current.rendererVersion = YOUYOU_LANDING_RENDERER_VERSION;
    if (current.publishedUrl) current.hasUnpublishedChanges = true;
    current.updatedAt = new Date().toISOString();
    persistLocalCurrent();
    updateSaveState("Saving…");
    clearTimeout(remoteSaveTimer);
    const ok = await persistRemoteCurrent();
    updateSaveState(ok ? statusText() : (current.publishedUrl ? "Saved locally · changes not published" : "Draft saved locally"));
    setPublishUi(current.publishedUrl || "");
  };

  const hydrateRemoteDraftIfNeeded = async () => {
    if (request.mode !== "edit" || remoteHydrationDone || !supabase || !state.company?.id) return;
    try {
      const { data:row, error } = await supabase
        .from("landing_pages")
        .select("id,draft_id,slug,name,template_id,content,status,published_at,created_at,updated_at")
        .eq("company_id", state.company.id)
        .eq("draft_id", request.pageId)
        .maybeSingle();
      if (error) throw error;
      if (row) {
        const remoteDraft = landingDraftFromRemoteRow(row);
        const remoteTime = Date.parse(remoteDraft.updatedAt || row.updated_at || 0) || 0;
        const localTime = Date.parse(current.updatedAt || current.createdAt || 0) || 0;
        if (remoteTime > localTime) {
          current = { ...defaultLandingPageData(remoteDraft.templateId || request.templateId), ...remoteDraft };
        } else {
          current = { ...defaultLandingPageData(current.templateId || request.templateId), ...current };
          if (!current.remotePageId && row.id) current.remotePageId = String(row.id);
          if (!current.publishedSlug && row.status === 'published') current.publishedSlug = String(row.slug || '');
          if (!current.publishedUrl && row.status === 'published' && row.slug) current.publishedUrl = landingPublicUrl(row.slug);
          if (!current.publishedAt && row.published_at) current.publishedAt = row.published_at;
        }
        persistLocalCurrent();
        hydrateFields();
        renderPreview();
        setPublishUi(current.publishedUrl || "");
      }
    } catch (error) {
      console.warn("YOUYOU draft recovery:", error);
    } finally {
      remoteHydrationDone = true;
      updateSaveState(statusText());
    }
  };

  const setPublishUi = (url = "") => {
    const result = document.querySelector("#lpw-publish-result");
    const input = document.querySelector("#lpw-publish-url");
    const open = document.querySelector("#lpw-open-publish-url");
    if (result) result.hidden = !url;
    if (input) input.value = url;
    if (open) open.href = url || "#";
    document.querySelectorAll("#lpw-publish-top,#lpw-publish-bottom").forEach((button) => {
      button.textContent = current.publishedUrl
        ? (landingNeedsRendererUpdate(current) ? "Update live design" : "Update live page")
        : "Publish";
    });
  };

  const publishPage = async () => {
    readFields();
    if (!supabase || !state.user || !state.company?.id) {
      landingStudioStatus("Sign in to publish this page.");
      return;
    }
    if (!String(current.name || "").trim()) {
      landingStudioStatus("Add a page name before publishing.");
      document.querySelector("#lpb-name")?.focus();
      return;
    }
    if (landingHasTemporaryMedia(current)) {
      landingStudioStatus("Some media is still local. Re-upload it and wait until YOUYOU confirms permanent storage before publishing.");
      return;
    }

    const buttons = [...document.querySelectorAll("#lpw-publish-top,#lpw-publish-bottom")];
    buttons.forEach((button) => { button.disabled = true; button.textContent = "Publishing…"; });
    landingStudioStatus(current.status === "Published" ? "Updating live page…" : "Publishing page…");

    try {
      let slug = String(current.publishedSlug || "").trim();
      let remotePageId = String(current.remotePageId || "").trim();

      if (!slug) {
        const { data: existing, error: existingError } = await supabase
          .from("landing_pages")
          .select("id,slug,status")
          .eq("company_id", state.company.id)
          .eq("draft_id", current.id)
          .maybeSingle();
        if (existingError) throw existingError;
        if (existing?.id) remotePageId = existing.id || remotePageId;
        if (existing?.status === "published" && existing?.slug && !String(existing.slug).startsWith("draft-")) {
          slug = existing.slug;
        }
      }

      if (!slug) slug = `${landingSlugify(current.name)}-${landingShortToken()}`;
      const publicUrl = landingPublicUrl(slug);
      const now = new Date().toISOString();
      const publishData = {
        ...current,
        status:"Published",
        publishedSlug:slug,
        publishedUrl:publicUrl,
        publishedAt:current.publishedAt || now,
        hasUnpublishedChanges:false,
        rendererVersion:YOUYOU_LANDING_RENDERER_VERSION,
        publishedRendererVersion:YOUYOU_LANDING_RENDERER_VERSION,
        companyName:state.company?.name || "YOUR BRAND",
      };
      const htmlSnapshot = landingExportHtml({ ...publishData, publicUrl });
      const payload = {
        company_id:state.company.id,
        draft_id:current.id,
        slug,
        name:String(current.name || "Landing page").trim().slice(0,160),
        template_id:String(current.templateId || "product-launch").slice(0,80),
        content:publishData,
        html_snapshot:htmlSnapshot,
        status:"published",
        published_at:publishData.publishedAt,
        updated_at:now,
      };

      const { data: saved, error } = await supabase
        .from("landing_pages")
        .upsert(payload, { onConflict:"company_id,draft_id" })
        .select("id,slug,published_at,updated_at")
        .single();
      if (error) throw error;

      current = {
        ...publishData,
        remotePageId:saved?.id || remotePageId,
        publishedSlug:saved?.slug || slug,
        publishedUrl:landingPublicUrl(saved?.slug || slug),
        publishedAt:saved?.published_at || publishData.publishedAt,
        updatedAt:saved?.updated_at || now,
        status:"Published",
      };
      if (remoteSaveTimer) { clearTimeout(remoteSaveTimer); remoteSaveTimer = null; }
      persistLocalCurrent();
      setPublishUi(current.publishedUrl);
      updateSaveState("Published · all changes live");
      const nextPath = landingBuilderRoute({ pageId:current.id });
      if (window.location.pathname !== nextPath) {
        window.history.replaceState({ section:"pages-builder", pageId:current.id }, "", nextPath);
      }
    } catch (error) {
      console.error("YOUYOU publish error:", error);
      const message = String(error?.message || error || "");
      if (/landing_pages|relation .* does not exist|schema cache/i.test(message)) {
        landingStudioStatus("Publishing database is not ready · run supabase-v7.2-published-landing-pages.sql once.");
      } else if (/duplicate key|unique/i.test(message)) {
        current.publishedSlug = "";
        landingStudioStatus("That public URL was already used. Click Publish again and YOUYOU will create a new unique link.");
      } else {
        landingStudioStatus(`Publish failed · ${message.slice(0, 150) || "please try again"}`);
      }
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
      setPublishUi(current.publishedUrl || "");
    }
  };

  const exportHtml = () => {
    readFields();
    if (String(current.videoUrl || "").startsWith("blob:")) {
      const stateEl = document.querySelector("#lpw-save-state");
      if (stateEl) stateEl.textContent = "Video upload is not finished. Wait until it says Ready for export, then export again.";
      return;
    }
    const html = landingExportHtml(current);
    const blob = new Blob([html], { type:"text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = String(current.name || "landing-page")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-|-$/g,"");

    link.href = url;
    link.download = `${slug || "landing-page"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  hydrateFields();
  renderPreview();

  Object.values(fieldMap).forEach((id) => {
    const el = document.getElementById(id);
    const onEdit = () => { renderPreview(); markChangedAndAutosave(); };
    el?.addEventListener("input", onEdit);
    el?.addEventListener("change", onEdit);
    if (el && (el.matches("input[type=text],input[type=email],input[type=url],input:not([type]),textarea") || el.tagName === "TEXTAREA")) {
      el.addEventListener("focus", () => { lastFocusedTextField = el; });
    }
  });

  document.querySelectorAll("[data-price-mode-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.priceModeValue || "show";
      const select = document.getElementById("lpb-price-mode");
      if (select) select.value = mode;
      current.priceMode = mode;
      syncPriceModeUi();
      renderPreview();
      markChangedAndAutosave();
    });
  });

  document.querySelector("#lpb-color-preset-grid")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-product-color]");
    if (!button) return;
    const line = String(button.dataset.productColor || "").trim();
    const name = line.split("|")[0].trim().toLowerCase();
    const lines = productColorLines();
    const index = lines.findIndex((item) => item.split("|")[0].trim().toLowerCase() === name);
    if (index >= 0) lines.splice(index,1); else lines.push(line);
    setProductColors(lines);
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelector("#lpb-add-custom-color")?.addEventListener("click", () => {
    const nameEl = document.getElementById("lpb-custom-color-name");
    const hexEl = document.getElementById("lpb-custom-color-hex");
    const name = String(nameEl?.value || "Custom").trim() || "Custom";
    const hex = String(hexEl?.value || "#D96A98").trim();
    const lines = productColorLines().filter((line) => line.split("|")[0].trim().toLowerCase() !== name.toLowerCase());
    lines.push(`${name}|${hex}`);
    setProductColors(lines);
    if (nameEl) nameEl.value = "";
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelector("#lpb-selected-colors")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-remove-product-color]");
    if (!button) return;
    const index = Number(button.dataset.removeProductColor);
    const lines = productColorLines();
    if (Number.isInteger(index) && index >= 0 && index < lines.length) lines.splice(index,1);
    setProductColors(lines);
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelector("#lpb-add-custom-section")?.addEventListener("click", () => {
    const items = normalizeCustomSections();
    if (items.length >= 8) { landingStudioStatus("Maximum 8 custom sections per landing page"); return; }
    items.push({ id:`custom_${Date.now()}`, eyebrow:"MORE", title:"", text:"" });
    current.customSections = items;
    renderCustomSectionsManager();
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelector("#lpb-custom-sections-manager")?.addEventListener("input", (event) => {
    const field = event.target.closest?.("[data-custom-field]");
    if (!field) return;
    const card = field.closest("[data-custom-index]");
    const index = Number(card?.dataset.customIndex);
    const items = normalizeCustomSections();
    if (!Number.isInteger(index) || !items[index]) return;
    items[index][field.dataset.customField] = field.value;
    current.customSections = items;
    lastFocusedTextField = field;
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelector("#lpb-custom-sections-manager")?.addEventListener("focusin", (event) => {
    if (event.target.matches?.("input,textarea")) lastFocusedTextField = event.target;
  });

  document.querySelector("#lpb-custom-sections-manager")?.addEventListener("click", (event) => {
    const card = event.target.closest?.("[data-custom-index]");
    if (!card) return;
    const index = Number(card.dataset.customIndex);
    const items = normalizeCustomSections();
    if (!Number.isInteger(index) || !items[index]) return;
    if (event.target.closest("[data-custom-remove]")) {
      items.splice(index,1);
    } else {
      const move = event.target.closest("[data-custom-move]");
      if (!move) return;
      const next = index + Number(move.dataset.customMove || 0);
      if (next < 0 || next >= items.length) return;
      [items[index],items[next]] = [items[next],items[index]];
    }
    current.customSections = items;
    renderCustomSectionsManager();
    renderPreview();
    markChangedAndAutosave();
  });

  document.querySelectorAll("[data-lpb-emoji]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = lastFocusedTextField || document.querySelector("#lpb-headline");
      if (!target) return;
      const emoji = button.dataset.lpbEmoji || "";
      const start = Number.isFinite(target.selectionStart) ? target.selectionStart : target.value.length;
      const end = Number.isFinite(target.selectionEnd) ? target.selectionEnd : start;
      target.value = `${target.value.slice(0,start)}${emoji}${target.value.slice(end)}`;
      target.focus();
      const next = start + emoji.length;
      try { target.setSelectionRange(next,next); } catch (_) {}
      renderPreview();
      markChangedAndAutosave();
    });
  });

  document.querySelector("#lpb-hero-image-file")?.addEventListener("change", async (event) => {
    const inputEl = event.currentTarget;
    const file = inputEl.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8_000_000) {
      landingStudioStatus("Use a hero image under 8 MB — YOUYOU will optimize it automatically.");
      inputEl.value = "";
      return;
    }
    const previousHeroUrl = String(current.heroImageUrl || "").trim();
    landingStudioStatus("Optimizing hero image…");
    const optimized = await optimizeLandingImageFile(file, 1800, 0.88);
    let finalUrl = optimized;
    try {
      const blob = landingDataUrlToBlob(optimized);
      if (blob) finalUrl = await uploadLandingMediaFile(blob, { pageId:current.id, kind:"hero", fileName:`${file.name.replace(/\.[^.]+$/, "")}.webp` });
      /* Shared media can belong to duplicated pages. Old hero files are detached, not auto-deleted. */
      landingStudioStatus("Hero image uploaded · ready for export");
    } catch (error) {
      console.warn("YOUYOU hero image storage fallback:", error);
      landingStudioStatus("Hero image ready locally · run the landing-media storage SQL for permanent hosting");
    }
    current.heroImageUrl = finalUrl;
    current.heroMediaEnabled = "on";
    const input = document.querySelector("#lpb-hero-image-url");
    const enabled = document.querySelector("#lpb-hero-media-enabled");
    if (input) input.value = current.heroImageUrl;
    if (enabled) enabled.value = "on";
    inputEl.value = "";
    renderPreview();
    markChangedAndAutosave({ remoteDelay:250 });
  });

  document.querySelector("#lpb-image-files")?.addEventListener("change", async (event) => {
    const inputEl = event.currentTarget;
    readFields();
    const existing = galleryItems();
    const remainingSlots = Math.max(0, YOUYOU_LANDING_MAX_IMAGES - existing.length);
    const picked = [...(inputEl.files || [])];
    const files = picked.filter((file) => file.type.startsWith("image/") && file.size <= 8_000_000).slice(0, remainingSlots);
    if (!files.length) {
      landingStudioStatus(remainingSlots === 0 ? `Gallery is full · maximum ${YOUYOU_LANDING_MAX_IMAGES} photos` : "Choose JPG, PNG or WebP images under 8 MB each");
      inputEl.value = "";
      return;
    }

    const uploaded = [];
    let storageReady = true;
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      landingStudioStatus(`Processing photo ${index + 1} of ${files.length}…`);
      const optimized = await optimizeLandingImageFile(file, 1600, 0.86);
      let finalUrl = optimized;
      if (storageReady) {
        try {
          const blob = landingDataUrlToBlob(optimized);
          if (blob) finalUrl = await uploadLandingMediaFile(blob, { pageId:current.id, kind:"gallery", fileName:`${file.name.replace(/\.[^.]+$/, "")}.webp` });
        } catch (error) {
          storageReady = false;
          console.warn("YOUYOU gallery storage fallback:", error);
        }
      }
      uploaded.push(finalUrl);
    }

    const legacyFirst = String(current.imageUrl || "").trim();
    const galleryExisting = String(current.mediaGallery || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const merged = [...galleryExisting, ...uploaded].filter((url, index, arr) => arr.indexOf(url) === index);
    current.mediaGallery = merged.slice(0, YOUYOU_LANDING_MAX_IMAGES - (legacyFirst ? 1 : 0)).join("\n");

    const galleryInput = document.querySelector("#lpb-media-gallery");
    if (galleryInput) galleryInput.value = current.mediaGallery;
    inputEl.value = "";
    renderPreview();
    markChangedAndAutosave({ remoteDelay:250 });
    const total = galleryItems().length;
    landingStudioStatus(storageReady
      ? `${total} photo${total === 1 ? "" : "s"} ready · stored for export`
      : `${total} photo${total === 1 ? "" : "s"} ready locally · run landing-media storage SQL for permanent hosting`);
  });

  document.querySelector("#lpb-gallery-manager")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-gallery-remove]");
    if (!button) return;
    readFields();
    const urls = galleryItems();
    const index = Number(button.dataset.galleryRemove);
    const target = urls[index];
    if (!target) return;
    if (String(current.imageUrl || "").trim() === target) current.imageUrl = "";
    /* Shared media can belong to duplicated pages. Removing a card detaches the URL only. */
    const remaining = String(current.mediaGallery || "").split("\n").map((x) => x.trim()).filter(Boolean).filter((url) => url !== target);
    current.mediaGallery = remaining.join("\n");
    const firstInput = document.querySelector("#lpb-image-url");
    const galleryInput = document.querySelector("#lpb-media-gallery");
    if (firstInput) firstInput.value = current.imageUrl || "";
    if (galleryInput) galleryInput.value = current.mediaGallery || "";
    renderPreview();
    markChangedAndAutosave({ remoteDelay:250 });
  });

  document.querySelector("#lpb-video-file")?.addEventListener("change", async (event) => {
    const inputEl = event.currentTarget;
    const file = inputEl.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;

    if (file.size > YOUYOU_LANDING_MAX_VIDEO_BYTES) {
      landingStudioStatus("Video is too large · use a file under 100 MB");
      inputEl.value = "";
      return;
    }

    const previousVideoUrl = String(current.videoUrl || "").trim();
    if (window.__youyouLocalVideoUrl) URL.revokeObjectURL(window.__youyouLocalVideoUrl);
    window.__youyouLocalVideoUrl = URL.createObjectURL(file);
    current.videoUrl = window.__youyouLocalVideoUrl;
    current.videoEnabled = "on";
    const videoInput = document.querySelector("#lpb-video-url");
    const enabledInput = document.querySelector("#lpb-video-enabled");
    if (videoInput) videoInput.value = current.videoUrl;
    if (enabledInput) enabledInput.value = "on";
    renderPreview();
    landingStudioStatus("Uploading video to YOUYOU media storage… keep this page open");

    try {
      const permanentUrl = await uploadLandingMediaFile(file, { pageId:current.id, kind:"video", fileName:file.name });
      current.videoUrl = permanentUrl;
      /* Shared media can belong to duplicated pages. Old video files are detached, not auto-deleted. */
      if (videoInput) videoInput.value = permanentUrl;
      if (window.__youyouLocalVideoUrl) {
        URL.revokeObjectURL(window.__youyouLocalVideoUrl);
        window.__youyouLocalVideoUrl = null;
      }
      renderPreview();
      markChangedAndAutosave({ remoteDelay:150 });
      landingStudioStatus("Video uploaded · Ready for export");
    } catch (error) {
      console.error("YOUYOU video upload failed:", error);
      landingStudioStatus("Video preview works, but permanent storage is not ready · run supabase-v7.1-landing-media-storage.sql once");
    } finally {
      inputEl.value = "";
    }
  });

  document.querySelectorAll("[data-lpb-palette]").forEach((button) => {
    button.addEventListener("click", () => {
      const [accent,background,surface,textColor] = button.dataset.lpbPalette.split("|");
      current = { ...current, accent, background, surface, textColor };
      hydrateFields();
      renderPreview();
      markChangedAndAutosave();
    });
  });

  document.querySelectorAll("[data-lpb-device]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-lpb-device]").forEach((item) => item.classList.toggle("is-active", item === button));
      const mobile = button.dataset.lpbDevice === "mobile";
      document.querySelector("#lpb-preview-frame")?.classList.toggle("is-mobile", mobile);
      document.querySelector("#lpb-live-preview")?.setAttribute("data-device", mobile ? "mobile" : "desktop");
    });
  });

  document.querySelector("#lpw-back")?.addEventListener("click", async () => {
    readFields();
    persistLocalCurrent();
    clearTimeout(remoteSaveTimer);
    await persistRemoteCurrent();
    navigateDashboard("pages");
  });
  document.querySelector("#lpw-save-top")?.addEventListener("click", saveDraft);
  document.querySelector("#lpw-save-bottom")?.addEventListener("click", saveDraft);
  document.querySelector("#lpw-export-top")?.addEventListener("click", exportHtml);
  document.querySelector("#lpw-export-bottom")?.addEventListener("click", exportHtml);
  document.querySelector("#lpw-publish-top")?.addEventListener("click", publishPage);
  document.querySelector("#lpw-publish-bottom")?.addEventListener("click", publishPage);
  document.querySelector("#lpw-copy-publish-url")?.addEventListener("click", async (event) => {
    const url = String(document.querySelector("#lpw-publish-url")?.value || current.publishedUrl || "").trim();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      event.currentTarget.textContent = "Copied";
    } catch (_) {
      const input = document.querySelector("#lpw-publish-url");
      input?.select();
      document.execCommand?.("copy");
      event.currentTarget.textContent = "Copied";
    }
    setTimeout(() => { event.currentTarget.textContent = "Copy link"; }, 1400);
  });
  setPublishUi(current.publishedUrl || "");
  updateSaveState(statusText());

  // A new workspace becomes a real draft immediately, so refresh/back never starts over.
  if (request.mode === "new") {
    current.status = "Draft";
    current.updatedAt = new Date().toISOString();
    persistLocalCurrent();
    remoteHydrationDone = true;
    queueRemoteSave(1200);
  } else {
    hydrateRemoteDraftIfNeeded();
  }

  const beforeUnload = () => {
    try { readFields(); persistLocalCurrent(); } catch (_) {}
  };
  window.addEventListener("beforeunload", beforeUnload, { once:true });
}


function initLandingPages() {
  const root = document.querySelector(".landing-builder-page");
  if (!root) return;

  let current = defaultLandingPageData("product-launch");
  let savedQuery = "";
  let savedFilter = "all";

  const fieldMap = {
    name:"lpb-name", pageType:"lpb-page-type", direction:"lpb-direction",
    badge:"lpb-badge", headline:"lpb-headline", subheadline:"lpb-subheadline",
    description:"lpb-description", benefits:"lpb-benefits", price:"lpb-price",
    oldPrice:"lpb-old-price", currency:"lpb-currency", priceMode:"lpb-price-mode",
    commerceMode:"lpb-commerce-mode", quantityEnabled:"lpb-quantity-enabled", quantityMin:"lpb-quantity-min", quantityMax:"lpb-quantity-max", quantityDefault:"lpb-quantity-default", variantsText:"lpb-variants-text", bundleEnabled:"lpb-bundle-enabled", bundleOptions:"lpb-bundle-options",
    ctaText:"lpb-cta-text", ctaAction:"lpb-cta-action", whatsapp:"lpb-whatsapp", whatsappCountryCode:"lpb-whatsapp-country-code",
    phone:"lpb-phone", email:"lpb-email", heroMediaEnabled:"lpb-hero-media-enabled", heroImageUrl:"lpb-hero-image-url", imageUrl:"lpb-image-url", videoUrl:"lpb-video-url",
    accent:"lpb-accent", background:"lpb-background", surface:"lpb-surface",
    textColor:"lpb-text-color", testimonial:"lpb-testimonial",
    faqQuestion:"lpb-faq-q", faqAnswer:"lpb-faq-a",
  };

  const setView = (view) => {
    root.querySelectorAll("[data-lpb-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lpbView === view);
    });
    root.querySelectorAll("[data-lpb-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.lpbPanel !== view;
    });
    if (view === "saved") renderSaved();
    if (view === "builder") requestAnimationFrame(renderPreview);
  };

  const hydrateFields = () => {
    Object.entries(fieldMap).forEach(([key,id]) => {
      const el = document.getElementById(id);
      if (el) el.value = current[key] ?? "";
    });
    const saveState = document.querySelector("#lpb-save-state");
    if (saveState) saveState.textContent = current.status || "Draft";
  };

  const readFields = () => {
    Object.entries(fieldMap).forEach(([key,id]) => {
      const el = document.getElementById(id);
      if (el) current[key] = el.value;
    });
  };

  const renderPreview = () => {
    readFields();
    const preview = document.querySelector("#lpb-live-preview");
    const name = document.querySelector("#lpb-preview-name");
    if (preview) preview.innerHTML = landingPreviewMarkup(current);
    if (name) name.textContent = current.name || "Untitled landing page";
  };

  const setSelectedTemplateV510 = (templateId) => {
    root.querySelectorAll(".lpb-template-card-v509").forEach((card) => {
      card.classList.toggle("is-selected-v510", card.dataset.templateId === templateId);
    });
  };

  const openTemplate = (templateId) => {
    setSelectedTemplateV510(templateId);
    openLandingBuilder({ templateId });
  };

  const landingEditedLabel = (value = "") => {
    const time = Date.parse(value || "");
    if (!Number.isFinite(time)) return "Recently edited";
    try { return `Edited ${new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(time))}`; }
    catch (_) { return "Recently edited"; }
  };

  const updateLandingCounts = () => {
    const drafts = loadLandingDrafts();
    const publishedCount = drafts.filter((item) => item.publishedUrl || item.status === "Published").length;
    const pagesCount = document.querySelector("#lpb-pages-count");
    const published = document.querySelector("#lpb-published-count");
    const tab = document.querySelector("#lpb-tab-pages-count");
    if (pagesCount) pagesCount.textContent = String(drafts.length);
    if (published) published.textContent = String(publishedCount);
    if (tab) tab.textContent = String(drafts.length);
  };

  const renderSaved = () => {
    const container = document.querySelector("#lpb-saved-grid");
    if (!container) return;
    const allDrafts = loadLandingDrafts();
    const query = savedQuery.trim().toLowerCase();
    const drafts = allDrafts.filter((item) => {
      const published = Boolean(item.publishedUrl || item.status === "Published");
      const hasChanges = published && Boolean(item.hasUnpublishedChanges);
      const statusOk = savedFilter === "all" || (savedFilter === "draft" && !published) || (savedFilter === "published" && published && !hasChanges) || (savedFilter === "changes" && hasChanges);
      const haystack = `${item.name || ""} ${item.headline || ""} ${item.pageType || ""}`.toLowerCase();
      return statusOk && (!query || haystack.includes(query));
    });

    if (!drafts.length) {
      container.innerHTML = `
        <div class="lpb-empty dashboard-card">
          <span>▣</span><strong>${allDrafts.length ? "No pages match this filter." : "No saved landing pages yet."}</strong>
          <p>${allDrafts.length ? "Try another status or search term." : "Choose one of the 30 templates, customize it, then save the draft here."}</p>
          <button class="primary" type="button" data-lpb-open-builder="product-launch">Create first page →</button>
        </div>`;
      container.querySelector("[data-lpb-open-builder]")?.addEventListener("click", (event) => openTemplate(event.currentTarget.dataset.lpbOpenBuilder));
      return;
    }

    container.innerHTML = drafts.map((item) => `
      <article class="lpb-saved-card dashboard-card" data-lpb-saved-id="${escapeHtml(item.id)}">
        <div class="lpb-saved-swatch" style="--saved-bg:${escapeHtml(item.background)};--saved-accent:${escapeHtml(item.accent)}">
          <span></span><b></b><i></i>
        </div>
        <div class="lpb-saved-copy">
          <small class="lpb-page-status ${item.publishedUrl ? (item.hasUnpublishedChanges ? "has-changes" : "is-published") : "is-draft"}">${escapeHtml(item.publishedUrl ? (item.hasUnpublishedChanges ? "Published · changes not live" : "Published") : "Draft")} · ${escapeHtml(item.pageType || "Landing Page")}</small>
          <strong>${escapeHtml(item.name || "Untitled page")}</strong>
          <span>${escapeHtml(item.headline || "")}</span>
          <em>${escapeHtml(landingEditedLabel(item.updatedAt || item.createdAt))}</em>
        </div>
        <div class="lpb-saved-actions">
          <button type="button" class="lpb-continue-editing" data-lpb-edit="${escapeHtml(item.id)}">Continue editing</button>
          ${item.publishedUrl ? `<a class="lpb-open-live" href="${escapeHtml(item.publishedUrl)}" target="_blank" rel="noopener">Open live ↗</a><button type="button" data-lpb-copy-live="${escapeHtml(item.id)}">Copy link</button>` : ""}
          <button type="button" data-lpb-duplicate="${escapeHtml(item.id)}">Duplicate</button>
          <button type="button" data-lpb-delete="${escapeHtml(item.id)}">Delete</button>
        </div>
      </article>
    `).join("");

    container.querySelectorAll("[data-lpb-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = loadLandingDrafts().find((entry) => entry.id === button.dataset.lpbEdit);
        if (!item) return;
        openLandingBuilder({ pageId: item.id });
      });
    });

    container.querySelectorAll("[data-lpb-copy-live]").forEach((button) => {
      button.addEventListener("click", async () => {
        const item = loadLandingDrafts().find((entry) => entry.id === button.dataset.lpbCopyLive);
        if (!item?.publishedUrl) return;
        try {
          await navigator.clipboard.writeText(item.publishedUrl);
          const previous = button.textContent;
          button.textContent = "Copied ✓";
          setTimeout(() => { button.textContent = previous; }, 1400);
        } catch (_) {
          window.prompt("Copy your live page link:", item.publishedUrl);
        }
      });
    });

    container.querySelectorAll("[data-lpb-duplicate]").forEach((button) => {
      button.addEventListener("click", () => {
        const draftsNow = loadLandingDrafts();
        const item = draftsNow.find((entry) => entry.id === button.dataset.lpbDuplicate);
        if (!item) return;
        const copy = {
          ...item,
          id:`lp_${Date.now()}`,
          name:`${item.name} Copy`,
          status:"Draft",
          publishedSlug:"",
          publishedUrl:"",
          remotePageId:"",
          publishedAt:"",
          hasUnpublishedChanges:false,
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString(),
        };
        saveLandingDrafts([copy, ...draftsNow]);
        renderSaved();
        updateLandingCounts();
      });
    });

    container.querySelectorAll("[data-lpb-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        const draftsNow = loadLandingDrafts();
        const item = draftsNow.find((entry) => entry.id === button.dataset.lpbDelete);
        if (!item) return;
        const message = item.publishedUrl
          ? "Delete this landing page? Its live public URL will stop working."
          : "Delete this draft?";
        if (!window.confirm(message)) return;
        if ((item.remotePageId || item.publishedUrl) && supabase && state.company?.id) {
          button.disabled = true;
          button.textContent = "Deleting…";
          const { error } = await supabase
            .from("landing_pages")
            .delete()
            .eq("company_id", state.company.id)
            .eq("draft_id", item.id);
          if (error) {
            console.error("YOUYOU delete published page:", error);
            button.disabled = false;
            button.textContent = "Delete";
            window.alert("The live page could not be deleted. Please try again.");
            return;
          }
        }
        const next = draftsNow.filter((entry) => entry.id !== item.id);
        saveLandingDrafts(next);
        renderSaved();
        updateLandingCounts();
      });
    });
  };

  root.querySelectorAll("[data-lpb-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.lpbView));
  });

  root.querySelectorAll("[data-lpb-open-builder]").forEach((button) => {
    button.addEventListener("click", () => openTemplate(button.dataset.lpbOpenBuilder));
  });

  const templateSliderV509 = document.querySelector("#lpb-template-grid");

  const updateTemplateDotsV509 = () => {
    if (!templateSliderV509) return;
    const maxScroll = Math.max(1, templateSliderV509.scrollWidth - templateSliderV509.clientWidth);
    const progress = Math.max(0, Math.min(1, templateSliderV509.scrollLeft / maxScroll));
    const dots = [...root.querySelectorAll(".lpb-slider-dots-v509 i")];
    const active = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === active));
  };

  root.querySelectorAll("[data-lpb-slider]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!templateSliderV509) return;
      const direction = Number(button.dataset.lpbSlider || 1);
      templateSliderV509.scrollBy({
        left: direction * Math.max(320, templateSliderV509.clientWidth * .78),
        behavior:"smooth"
      });
      setTimeout(updateTemplateDotsV509, 350);
    });
  });

  templateSliderV509?.addEventListener("scroll", updateTemplateDotsV509, { passive:true });

  document.querySelector("#lpb-copy-preview-link")?.addEventListener("click", async (event) => {
    const input = document.querySelector("#lpb-public-page-link");
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input.value);
      event.currentTarget.textContent = "Copied";
      setTimeout(() => { event.currentTarget.textContent = "Copy"; }, 1200);
    } catch {
      input.select();
      document.execCommand?.("copy");
    }
  });

  document.querySelector("#lpb-pages-search")?.addEventListener("input", (event) => {
    savedQuery = String(event.currentTarget.value || "");
    renderSaved();
  });

  root.querySelectorAll("[data-lpb-pages-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      savedFilter = button.dataset.lpbPagesFilter || "all";
      root.querySelectorAll("[data-lpb-pages-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
      renderSaved();
    });
  });

  document.querySelector("#lpb-template-category")?.addEventListener("change", (event) => {
    const value = event.currentTarget.value;
    root.querySelectorAll(".lpb-template-card").forEach((card) => {
      card.hidden = value !== "all" && card.dataset.templateCategory !== value;
    });
    templateSliderV509?.scrollTo({ left:0, behavior:"smooth" });
    setTimeout(updateTemplateDotsV509, 250);
  });

  Object.values(fieldMap).forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", renderPreview);
    el?.addEventListener("change", renderPreview);
  });

  document.querySelector("#lpb-image-file")?.addEventListener("change", (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      const stateEl = document.querySelector("#lpb-save-state");
      if (stateEl) stateEl.textContent = "Image too large for local preview";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      current.imageUrl = String(reader.result || "");
      const imageUrlInput = document.querySelector("#lpb-image-url");
      if (imageUrlInput) imageUrlInput.value = current.imageUrl;
      renderPreview();
    };
    reader.readAsDataURL(file);
  });

  root.querySelectorAll("[data-lpb-palette]").forEach((button) => {
    button.addEventListener("click", () => {
      const [accent,background,surface,textColor] = button.dataset.lpbPalette.split("|");
      current = { ...current, accent, background, surface, textColor };
      hydrateFields();
      renderPreview();
    });
  });

  root.querySelectorAll("[data-lpb-device]").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll("[data-lpb-device]").forEach((item) => item.classList.toggle("is-active", item === button));
      document.querySelector("#lpb-preview-frame")?.classList.toggle("is-mobile", button.dataset.lpbDevice === "mobile");
    });
  });

  document.querySelector("#lpb-save-draft")?.addEventListener("click", () => {
    readFields();
    current.status = "Draft";
    current.updatedAt = new Date().toISOString();
    const drafts = loadLandingDrafts();
    const index = drafts.findIndex((item) => item.id === current.id);
    if (index >= 0) drafts[index] = { ...current };
    else drafts.unshift({ ...current });
    saveLandingDrafts(drafts);
    const stateEl = document.querySelector("#lpb-save-state");
    if (stateEl) stateEl.textContent = "Saved";
    setTimeout(() => { if (stateEl) stateEl.textContent = "Draft"; }, 1500);
  });

  document.querySelector("#lpb-export-html")?.addEventListener("click", () => {
    readFields();
    const html = landingExportHtml(current);
    const blob = new Blob([html], { type:"text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = String(current.name || "landing-page").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    link.href = url;
    link.download = `${slug || "landing-page"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.querySelector("#lpb-publish")?.addEventListener("click", () => {
    readFields();
    openLandingBuilder({ templateId:current.templateId || "product-launch" });
  });

  hydrateFields();
  renderPreview();
  renderSaved();
  updateLandingCounts();
  syncRemoteLandingDraftsToLocal().then(() => {
    renderSaved();
    updateLandingCounts();
  }).catch((error) => console.warn("YOUYOU draft list sync:", error));
  setSelectedTemplateV510(LANDING_PAGE_TEMPLATES[0]?.id || "");
}


function renderDashboard() {
  if (state.section === "pages-builder") {
    renderLandingPageWorkspace();
    initLandingPageWorkspace();
    return;
  }

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


else if (state.section === "pages") {
  body = renderLandingPagesSection();
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
            <p>Launch your AI growth foundation.</p>
            <ul><li>✓ AI Conversations + Website Widget</li><li>✓ Knowledge Base + file import</li><li>✓ Conversations inbox + basic lead capture</li><li>✓ AI Control Center</li><li>✓ Landing Pages · starter usage</li><li>✓ AI Studio · core text creation</li></ul>
            <button class="billing-select-btn" data-billing-plan="Starter" type="button">Choose Starter →</button>
          </article>

          <article class="billing-plan-card billing-plan-featured ${selectedPlan === "growth" ? "is-selected" : ""}" data-billing-card="growth">
            <div class="billing-plan-popular">MOST POPULAR</div>
            <div class="billing-plan-label">GROWTH</div>
            <div class="billing-price"><strong>$59</strong><span>/month</span></div>
            <p>Create campaigns and convert more leads.</p>
            <ul><li>✓ Everything in Starter</li><li>✓ Lead scoring + qualification</li><li>✓ Revenue Rescue + follow-up workflows</li><li>✓ Website SEO audit + growth actions</li><li>✓ More Smart Landing Pages</li><li>✓ AI Studio · ads, social, email & campaigns</li><li>✓ Growth analytics + WhatsApp handoff readiness</li></ul>
            <button class="billing-select-btn billing-select-primary" data-billing-plan="Growth" type="button">Choose Growth →</button>
          </article>

          <article class="billing-plan-card ${selectedPlan === "pro" ? "is-selected" : ""}" data-billing-card="pro">
            <div class="billing-plan-label">PRO</div>
            <div class="billing-price"><strong>$99</strong><span>/month</span></div>
            <p>The full YOUYOU growth platform for serious daily use.</p>
            <ul><li>✓ Everything in Growth</li><li>✓ Full SEO Growth Center + advanced insights</li><li>✓ WhatsApp AI integration</li><li>✓ AI Studio · full workflow + video-ready creation</li><li>✓ Landing Pages · unlimited normal business use</li><li>✓ Advanced AI controls + priority workflows</li><li>✓ Unlimited normal business use · Fair Use</li></ul>
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

if (state.section === "pages") {
  initLandingPages();
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
