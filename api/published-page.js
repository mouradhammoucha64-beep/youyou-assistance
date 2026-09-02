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

function notFoundPage(slug = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · YOUYOU</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7fb;color:#1f2937;font-family:Inter,system-ui,sans-serif}.card{max-width:520px;margin:24px;padding:36px;border:1px solid #e5e7eb;border-radius:22px;background:white;box-shadow:0 20px 60px #11182712;text-align:center}.mark{width:54px;height:54px;margin:auto;border-radius:16px;display:grid;place-items:center;background:#7859ff;color:#fff;font-weight:900}.card h1{font-size:30px;margin:20px 0 8px}.card p{color:#667085;line-height:1.6}.card a{display:inline-flex;margin-top:12px;padding:12px 16px;border-radius:11px;background:#111827;color:#fff;text-decoration:none;font-weight:800}</style></head><body><main class="card"><div class="mark">Y</div><h1>Page not found</h1><p>The landing page <strong>${escapeHtml(slug)}</strong> is not published or no longer exists.</p><a href="/">Go to YOUYOU</a></main></body></html>`;
}

export default async function handler(req, res) {
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
    const endpoint = `${supabaseUrl}/rest/v1/landing_pages?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=html_snapshot&limit=1`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("YOUYOU published page lookup failed:", response.status, detail.slice(0, 500));
      res.setHeader("Cache-Control", "no-store");
      return res.status(500).send("Publishing service is not ready.");
    }

    const rows = await response.json();
    const html = String(rows?.[0]?.html_snapshot || "");
    if (!html) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send(notFoundPage(slug));
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
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
