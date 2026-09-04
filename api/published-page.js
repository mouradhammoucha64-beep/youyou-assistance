const DEFAULT_SUPABASE_URL = "https://zprvmydgjxsifuhjplll.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_emmyZ-bcTdUcaVWi_tWONw_1zDbGSSK";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeHex(value = "", fallback = "#ffffff") {
  const raw = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
}

function extractLandingColor(html = "", variable = "", fallback = "#ffffff") {
  const escaped = String(variable).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(html).match(new RegExp(`${escaped}\\s*:\\s*(#[0-9a-f]{6})`, "i"));
  return normalizeHex(match?.[1], fallback);
}

function hardenPublishedHtml(html = "") {
  let out = String(html || "");
  if (!out) return out;

  const bg = extractLandingColor(out, "--lp-bg", "#ffffff");
  const surface = extractLandingColor(out, "--lp-surface", "#ffffff");
  const text = extractLandingColor(out, "--lp-text", "#172033");
  const accent = extractLandingColor(out, "--lp-accent", "#7c5cff");

  // Remove every older scheme declaration before adding one authoritative light-only signal.
  out = out.replace(/<meta\s+name=["']color-scheme["'][^>]*>\s*/ig, "");
  out = out.replace(/<meta\s+name=["']supported-color-schemes["'][^>]*>\s*/ig, "");
  out = out.replace(/<meta\s+name=["']theme-color["'][^>]*>\s*/ig, "");
  out = out.replace(/<head([^>]*)>/i, `<head$1><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><meta name="theme-color" content="${escapeHtml(bg)}"><meta name="youyou-renderer" content="7.11.0">`);

  // Remove a prior runtime lock, then append V7.10 last so it wins over legacy snapshots.
  out = out.replace(/<style\s+id=["']youyou-runtime-color-lock["'][\s\S]*?<\/style>/ig, "");
  const lock = `<style id="youyou-runtime-color-lock">
:root{color-scheme:light dark!important;--yy-page-bg:${escapeHtml(bg)};--yy-page-surface:${escapeHtml(surface)};--yy-page-text:${escapeHtml(text)};--yy-page-accent:${escapeHtml(accent)}}
html,body,.lp-live-page,.beauty-wow,.lp-live-page *,.beauty-wow *{forced-color-adjust:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
html,body{color-scheme:light dark!important;background-color:${escapeHtml(bg)}!important;background-image:linear-gradient(${escapeHtml(bg)},${escapeHtml(bg)})!important;color:${escapeHtml(text)}!important;-webkit-text-size-adjust:100%;text-size-adjust:100%}
.lp-live-page,.beauty-wow{color-scheme:light dark!important;background-color:var(--lp-bg)!important;background-image:linear-gradient(var(--lp-bg),var(--lp-bg))!important;color:var(--lp-text)!important;-webkit-text-fill-color:var(--lp-text)!important}
.lp-live-page :is(h1,h2,h3,h4,h5,h6,p,li,label,blockquote,strong,span,small),.beauty-wow :is(h1,h2,h3,h4,h5,h6,p,li,label,blockquote,strong,span,small){-webkit-text-fill-color:currentColor}
.lp-live-nav,.lp-live-footer,.lp-live-section,.beauty-nav,.beauty-hero,.beauty-story,.beauty-faq,.beauty-footer{color:var(--lp-text)!important}
.lp-live-benefit-grid>div,.beauty-benefits article,.beauty-stat-grid>div,.lp-lead-form input,.lp-lead-form textarea,.lp-lead-form select{background-color:var(--lp-surface)!important;background-image:linear-gradient(var(--lp-surface),var(--lp-surface))!important;color:var(--lp-text)!important;color-scheme:light dark!important}
.beauty-marquee,.beauty-editorial-card,.beauty-final-cta{background-color:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)),color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)))!important;color:var(--lp-text)!important}
.beauty-gallery-section,.beauty-wow .lp-product-video{background-color:color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)),color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)))!important}
.beauty-review-section{background-color:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)),color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)))!important;color:var(--lp-text)!important}
.lp-live-badge,.lp-live-section>small,.beauty-eyebrow{color:var(--lp-accent)!important;-webkit-text-fill-color:var(--lp-accent)!important}
.lp-live-primary,.beauty-nav>a,.lp-lead-form button,.lp-lead-followup{background-color:var(--lp-accent)!important;background-image:linear-gradient(var(--lp-accent),var(--lp-accent))!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
.lp-live-contact input,.lp-live-contact textarea,.lp-live-contact select,.lp-live-contact button,.lp-ai-form input,.lp-ai-form button{color-scheme:light dark!important}
@media (prefers-color-scheme: dark){
:root,html,body,.lp-live-page,.beauty-wow{color-scheme:light dark!important}
html,body{background-color:${escapeHtml(bg)}!important;background-image:linear-gradient(${escapeHtml(bg)},${escapeHtml(bg)})!important;color:${escapeHtml(text)}!important}
.lp-live-page,.beauty-wow{background-color:var(--lp-bg)!important;background-image:linear-gradient(var(--lp-bg),var(--lp-bg))!important;color:var(--lp-text)!important;-webkit-text-fill-color:var(--lp-text)!important}
.lp-live-benefit-grid>div,.beauty-benefits article,.beauty-stat-grid>div,.lp-lead-form input,.lp-lead-form textarea,.lp-lead-form select{background-color:var(--lp-surface)!important;background-image:linear-gradient(var(--lp-surface),var(--lp-surface))!important;color:var(--lp-text)!important}
.beauty-marquee,.beauty-editorial-card,.beauty-final-cta{background-color:color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)),color-mix(in srgb,var(--lp-accent) 10%,var(--lp-surface)))!important;color:var(--lp-text)!important}
.beauty-gallery-section,.beauty-wow .lp-product-video{background-color:color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)),color-mix(in srgb,var(--lp-surface) 68%,var(--lp-bg)))!important}
.beauty-review-section{background-color:color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg))!important;background-image:linear-gradient(color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)),color-mix(in srgb,var(--lp-accent) 8%,var(--lp-bg)))!important;color:var(--lp-text)!important}
.lp-live-badge,.lp-live-section>small,.beauty-eyebrow{color:var(--lp-accent)!important;-webkit-text-fill-color:var(--lp-accent)!important}
.lp-live-primary,.beauty-nav>a,.lp-lead-form button,.lp-lead-followup{background-color:var(--lp-accent)!important;background-image:linear-gradient(var(--lp-accent),var(--lp-accent))!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
}
@media(max-width:760px){.lp-image-slide,.beauty-wow .lp-image-slide{flex-basis:82%!important;width:82%!important;min-width:82%!important}}
</style>`;
  out = out.replace(/<\/head>/i, `${lock}<!-- YOUYOU_PUBLIC_RENDERER:7.11.0 --></head>`);
  return out;
}

function notFoundPage(slug = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="color-scheme" content="light dark"><title>Page not found · YOUYOU</title><style>html{color-scheme:only light}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7fb;color:#1f2937;font-family:Inter,system-ui,sans-serif}.card{max-width:520px;margin:24px;padding:36px;border:1px solid #e5e7eb;border-radius:22px;background:white;box-shadow:0 20px 60px #11182712;text-align:center}.mark{width:54px;height:54px;margin:auto;border-radius:16px;display:grid;place-items:center;background:#7859ff;color:#fff;font-weight:900}.card h1{font-size:30px;margin:20px 0 8px}.card p{color:#667085;line-height:1.6}.card a{display:inline-flex;margin-top:12px;padding:12px 16px;border-radius:11px;background:#111827;color:#fff;text-decoration:none;font-weight:800}</style></head><body><main class="card"><div class="mark">Y</div><h1>Page not found</h1><p>The landing page <strong>${escapeHtml(slug)}</strong> is not published or no longer exists.</p><a href="/">Go to YOUYOU</a></main></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("X-YOUYOU-Renderer", "7.11.0");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method Not Allowed");
  }

  const slug = String(req.query?.slug || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(404).send(notFoundPage(slug));
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  try {
    const endpoint = `${supabaseUrl}/rest/v1/rpc/get_published_landing_page`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { apikey: supabaseKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ p_slug: slug }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("YOUYOU published page lookup failed:", response.status, detail.slice(0, 500));
      res.setHeader("Cache-Control", "no-store");
      return res.status(500).send("Publishing service is not ready.");
    }

    const rows = await response.json();
    const html = hardenPublishedHtml(String(rows?.[0]?.html_snapshot || ""));
    if (!html) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send(notFoundPage(slug));
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    console.error("YOUYOU published page server error:", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).send("Publishing service is temporarily unavailable.");
  }
}
