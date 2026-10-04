import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 2_000_000;
const MAX_SITEMAP_BYTES = 1_500_000;
const TIMEOUT_MS = 9000;
const MAX_REDIRECTS = 3;
const MAX_PAGES = 12;
const MAX_DISCOVERED_URLS = 80;

function normalizeUrl(value = "") {
  let raw = String(value || "").trim();
  if (!raw) throw new Error("Website URL is required.");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only public http/https websites can be audited.");
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not supported.");
  url.hash = "";
  return url;
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10 || p[0] === 127 || p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true;
    if (p[0] >= 224) return true;
    return false;
  }
  const low = ip.toLowerCase();
  return low === "::1" || low === "::" || low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80:");
}

async function assertPublicHost(hostname) {
  const lowered = hostname.toLowerCase();
  if (lowered === "localhost" || lowered.endsWith(".localhost") || lowered.endsWith(".local")) {
    throw new Error("Private/local network addresses cannot be audited.");
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Private/local network addresses cannot be audited.");
    return;
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((r) => isPrivateIp(r.address))) {
    throw new Error("This hostname resolves to a private/local network address.");
  }
}

async function fetchPublicUrl(initialUrl, { maxBytes = MAX_BYTES, accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } = {}) {
  let current = normalizeUrl(initialUrl);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicHost(current.hostname);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "YOUYOU-SEO-Bot/2.0 (+https://youyouapp.com)", Accept: accept },
      });
    } finally {
      clearTimeout(timer);
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Website redirect did not include a destination.");
      current = new URL(location, current);
      continue;
    }
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > maxBytes) throw new Error("Page is too large for this audit.");
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error("Page is too large for this audit.");
    return {
      response,
      body: buffer.toString("utf8"),
      finalUrl: current.toString(),
      contentType: response.headers.get("content-type") || "",
    };
  }
  throw new Error("Too many redirects.");
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attrFromTag(tag = "", attr = "") {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quoted = tag.match(new RegExp(`${escaped}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  if (quoted) return quoted[2].trim();
  const unquoted = tag.match(new RegExp(`${escaped}\\s*=\\s*([^\\s>]+)`, "i"));
  return unquoted ? unquoted[1].trim() : "";
}

function firstTagContent(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanText(match[1]) : "";
}
function allTags(html, tag) { return html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) || []; }
function metaContent(html, name) {
  const target = String(name).toLowerCase();
  for (const tag of allTags(html, "meta")) {
    const key = (attrFromTag(tag, "name") || attrFromTag(tag, "property")).toLowerCase();
    if (key === target) return attrFromTag(tag, "content");
  }
  return "";
}
function linkHrefByRel(html, relNeedle) {
  for (const tag of allTags(html, "link")) {
    const rel = attrFromTag(tag, "rel").toLowerCase().split(/\s+/);
    if (rel.includes(String(relNeedle).toLowerCase())) return attrFromTag(tag, "href");
  }
  return "";
}
function countStructuredData(html) { return (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi) || []).length; }
function getVisibleText(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return cleanText(bodyMatch ? bodyMatch[1] : html);
}
function includesNeedle(haystack = "", needle = "") {
  const n = cleanText(needle).toLowerCase();
  if (!n) return null;
  return cleanText(haystack).toLowerCase().includes(n);
}
function scoreLabel(score) {
  if (score >= 90) return "Excellent foundation";
  if (score >= 75) return "Good foundation";
  if (score >= 55) return "Needs improvement";
  return "Priority fixes needed";
}
function severityWeight(value) { return value === "high" ? 3 : value === "medium" ? 2 : 1; }
function addFinding(findings, item) {
  findings.push({ severity: item.severity || "medium", category: item.category || "SEO", problem: item.problem, where: item.where, fix: item.fix, suggested: item.suggested || "", why: item.why });
}
function safeSuggestedTitle(service, city, companyName) {
  const s = cleanText(service) || "Core Service";
  const c = cleanText(city);
  const brand = cleanText(companyName) || "Your Business";
  return (c ? `${s} in ${c} | ${brand}` : `${s} | ${brand}`).slice(0, 60);
}
function safeSuggestedH1(service, city) {
  const s = cleanText(service) || "Core Service";
  const c = cleanText(city);
  return c ? `${s} in ${c}` : `${s} Services`;
}
function safeSuggestedMeta(service, city, companyName) {
  const s = cleanText(service).toLowerCase() || "professional services";
  const c = cleanText(city);
  const brand = cleanText(companyName) || "Our team";
  return (c ? `${brand} provides ${s} in ${c}. Explore services, common questions and the next step to get started.` : `${brand} provides ${s}. Explore services, common questions and the next step to get started.`).slice(0, 155);
}

function normalizeCrawlUrl(raw, base, host) {
  try {
    const u = new URL(raw, base);
    if (!["http:", "https:"].includes(u.protocol) || u.hostname !== host) return null;
    if (/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mp3|woff2?|ttf|ico|xml)(?:$|\?)/i.test(u.pathname)) return null;
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|gclid|fbclid|mc_)/i.test(key)) u.searchParams.delete(key);
    }
    return u.toString();
  } catch { return null; }
}

function discoverLinks(html, baseUrl, host) {
  const out = [];
  const seen = new Set();
  for (const tag of allTags(html, "a")) {
    const href = attrFromTag(tag, "href");
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    const value = normalizeCrawlUrl(href, baseUrl, host);
    if (value && !seen.has(value)) { seen.add(value); out.push(value); }
    if (out.length >= MAX_DISCOVERED_URLS) break;
  }
  return out;
}

function sitemapUrls(xml, baseUrl, host) {
  const out = [];
  const seen = new Set();
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    const value = normalizeCrawlUrl(match[1].replace(/&amp;/g, "&"), baseUrl, host);
    if (value && !seen.has(value)) { seen.add(value); out.push(value); }
    if (out.length >= MAX_DISCOVERED_URLS) break;
  }
  return out;
}

function analyzePage({ html, finalUrl, response, responseMs, service, city, companyName }) {
  const final = new URL(finalUrl);
  const title = firstTagContent(html, "title");
  const metaDescription = metaContent(html, "description");
  const metaRobots = metaContent(html, "robots");
  const canonicalRaw = linkHrefByRel(html, "canonical");
  let canonical = "";
  try { canonical = canonicalRaw ? new URL(canonicalRaw, final).toString() : ""; } catch { canonical = ""; }
  const viewport = metaContent(html, "viewport");
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [""])[0];
  const htmlLang = attrFromTag(htmlTag, "lang");
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const h1 = h1Matches.length ? cleanText(h1Matches[0][1]) : "";
  const imageTags = allTags(html, "img");
  const imagesMissingAlt = imageTags.filter((tag) => !attrFromTag(tag, "alt")).length;
  const anchorTags = allTags(html, "a");
  let internal = 0, external = 0, emptyHref = 0;
  for (const tag of anchorTags) {
    const href = attrFromTag(tag, "href");
    if (!href || href === "#" || /^javascript:/i.test(href)) { emptyHref += 1; continue; }
    if (/^(mailto:|tel:)/i.test(href)) continue;
    try { const parsed = new URL(href, final); parsed.hostname === final.hostname ? internal++ : external++; } catch { emptyHref++; }
  }
  const visibleText = getVisibleText(html);
  const wordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0;
  const noindex = /(^|[\s,])noindex([\s,]|$)/i.test(metaRobots);
  const serviceInTitle = includesNeedle(title, service);
  const serviceInH1 = includesNeedle(h1, service);
  const serviceInBody = includesNeedle(visibleText, service);
  const cityInTitle = includesNeedle(title, city);
  const cityInH1 = includesNeedle(h1, city);
  const cityInBody = includesNeedle(visibleText, city);
  const findings = [];
  let score = 100;

  if (!response.ok) { score -= 25; addFinding(findings,{severity:"high",category:"TECHNICAL",problem:`Page returned HTTP ${response.status}`,where:finalUrl,fix:"Make the page return HTTP 200 for normal visitors and crawlers.",why:"Search engines need a reliable successful response."}); }
  if (!title) { score -= 14; addFinding(findings,{severity:"high",category:"ON-PAGE",problem:"SEO title is missing",where:finalUrl,fix:"Add one descriptive <title>.",suggested:safeSuggestedTitle(service,city,companyName),why:"The title is a primary search-result and relevance signal."}); }
  else if (title.length < 25 || title.length > 65) { score -= 6; addFinding(findings,{severity:"medium",category:"ON-PAGE",problem:`SEO title length is ${title.length} characters`,where:finalUrl,fix:"Keep the title concise and descriptive, usually around 30–60 characters.",suggested:safeSuggestedTitle(service,city,companyName),why:"Clear titles are easier to understand and less likely to be truncated."}); }
  if (!metaDescription) { score -= 10; addFinding(findings,{severity:"medium",category:"ON-PAGE",problem:"Meta description is missing",where:finalUrl,fix:"Add a useful description that explains the page and next step.",suggested:safeSuggestedMeta(service,city,companyName),why:"A useful description can improve how the result is presented and understood."}); }
  else if (metaDescription.length < 70 || metaDescription.length > 170) { score -= 4; addFinding(findings,{severity:"low",category:"ON-PAGE",problem:`Meta description length is ${metaDescription.length} characters`,where:finalUrl,fix:"Tighten the description so it clearly communicates value.",suggested:safeSuggestedMeta(service,city,companyName),why:"Focused snippets are easier to scan."}); }
  if (!h1Matches.length) { score -= 12; addFinding(findings,{severity:"high",category:"CONTENT",problem:"No H1 heading was found",where:finalUrl,fix:"Add one clear main heading.",suggested:safeSuggestedH1(service,city),why:"The main heading clarifies the page topic."}); }
  else if (h1Matches.length > 1) { score -= 4; addFinding(findings,{severity:"low",category:"CONTENT",problem:`${h1Matches.length} H1 headings were found`,where:finalUrl,fix:"Keep one obvious primary page heading.",why:"A simple hierarchy is easier to scan."}); }
  if (!canonical) { score -= 5; addFinding(findings,{severity:"low",category:"TECHNICAL",problem:"Canonical URL was not found",where:finalUrl,fix:"Add a self-referencing canonical on indexable pages.",suggested:finalUrl,why:"Canonical signals clarify the preferred URL."}); }
  if (noindex) { score -= 25; addFinding(findings,{severity:"high",category:"INDEXING",problem:"The page contains a noindex directive",where:finalUrl,fix:"Remove noindex if this page should appear in search.",why:"Noindex asks search engines not to index the page."}); }
  if (!viewport) { score -= 5; addFinding(findings,{severity:"medium",category:"MOBILE",problem:"Viewport meta tag was not found",where:finalUrl,fix:'Add width=device-width, initial-scale=1.',why:"Responsive rendering matters on mobile devices."}); }
  if (!htmlLang) { score -= 2; addFinding(findings,{severity:"low",category:"ACCESSIBILITY",problem:"HTML language attribute is missing",where:finalUrl,fix:"Declare the primary page language.",why:"Language metadata helps browsers and assistive technologies."}); }
  if (imageTags.length && imagesMissingAlt > 0) { const ratio = imagesMissingAlt/imageTags.length; score -= ratio > .5 ? 7 : 4; addFinding(findings,{severity:ratio>.5?"medium":"low",category:"IMAGES",problem:`${imagesMissingAlt} of ${imageTags.length} images are missing alt text`,where:finalUrl,fix:"Add meaningful alt text to informative images; keep decorative alts empty.",why:"Alt text improves accessibility and image context."}); }
  if (wordCount < 200) { score -= 5; addFinding(findings,{severity:"medium",category:"CONTENT",problem:`The page has about ${wordCount} visible words`,where:finalUrl,fix:"Make sure the page fully answers the visitor’s decision-making questions without filler.",why:"Very thin pages may not satisfy the intent behind a search."}); }
  if (service && serviceInTitle === false) { score -= 5; addFinding(findings,{severity:"medium",category:"TARGET TOPIC",problem:`Target service “${service}” is not clear in the title`,where:finalUrl,fix:"Make the title reflect the target service when it matches page intent.",suggested:safeSuggestedTitle(service,city,companyName),why:"The title should clearly communicate the page topic."}); }
  if (service && serviceInH1 === false) { score -= 5; addFinding(findings,{severity:"medium",category:"TARGET TOPIC",problem:`Target service “${service}” is not clear in the H1`,where:finalUrl,fix:"Use a natural main heading that reflects the service.",suggested:safeSuggestedH1(service,city),why:"The main heading should match visitor expectations."}); }
  if (city && cityInBody === false) { score -= 3; addFinding(findings,{severity:"low",category:"LOCAL SEO",problem:`Target city “${city}” is not clearly present in page text`,where:finalUrl,fix:"If the page genuinely serves that location, add real local context naturally.",why:"Location context helps local customers understand coverage."}); }
  if (internal < 2) { score -= 3; addFinding(findings,{severity:"low",category:"INTERNAL LINKS",problem:"Very few internal links were found",where:finalUrl,fix:"Link to relevant service, FAQ, contact or related pages using descriptive anchors.",why:"Internal links support discovery and navigation."}); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    url: finalUrl, status: response.status, responseMs, score, scoreLabel: scoreLabel(score),
    page:{title,titleLength:title.length,metaDescription,metaDescriptionLength:metaDescription.length,h1,h1Count:h1Matches.length,h2Count:h2Matches.length,wordCount,imagesCount:imageTags.length,imagesMissingAlt,htmlLang,viewport:Boolean(viewport),structuredDataCount:countStructuredData(html),openGraph:{title:Boolean(metaContent(html,"og:title")),description:Boolean(metaContent(html,"og:description")),image:Boolean(metaContent(html,"og:image"))}},
    technical:{canonical,metaRobots,noindex}, links:{internal,external,empty:emptyHref},
    target:{service,city,serviceInTitle,serviceInH1,serviceInBody,cityInTitle,cityInH1,cityInBody}, findings,
    discoveredLinks: discoverLinks(html, finalUrl, final.hostname),
  };
}

function duplicateGroups(pages, getter) {
  const map = new Map();
  pages.forEach((p) => { const key = cleanText(getter(p)).toLowerCase(); if (!key) return; if (!map.has(key)) map.set(key, []); map.get(key).push(p.url); });
  return [...map.entries()].filter(([, urls]) => urls.length > 1).map(([value, urls]) => ({ value, urls }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Use POST for website audits." }); }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const service = cleanText(body.service), city = cleanText(body.city), companyName = cleanText(body.companyName);
    const targetUrl = normalizeUrl(body.url);
    const startedAt = Date.now();
    const firstFetched = await fetchPublicUrl(targetUrl);
    if (!firstFetched.contentType.toLowerCase().includes("html")) return res.status(400).json({ error: "The URL did not return an HTML webpage." });
    const firstElapsed = Date.now() - startedAt;
    const origin = new URL(firstFetched.finalUrl).origin;
    const host = new URL(firstFetched.finalUrl).hostname;

    const [robotsSettled, sitemapSettled] = await Promise.allSettled([
      fetchPublicUrl(new URL("/robots.txt", origin), { maxBytes: 300_000, accept: "text/plain,*/*;q=0.8" }),
      fetchPublicUrl(new URL("/sitemap.xml", origin), { maxBytes: MAX_SITEMAP_BYTES, accept: "application/xml,text/xml,*/*;q=0.8" }),
    ]);
    const robotsResult = robotsSettled.status === "fulfilled" ? robotsSettled.value : null;
    const sitemapResult = sitemapSettled.status === "fulfilled" ? sitemapSettled.value : null;
    const robotsFound = Boolean(robotsResult?.response?.ok && /user-agent\s*:/i.test(robotsResult.body));
    const sitemapFound = Boolean(sitemapResult?.response?.ok && /<(urlset|sitemapindex)\b/i.test(sitemapResult.body));

    const firstPage = analyzePage({ html:firstFetched.body, finalUrl:firstFetched.finalUrl, response:firstFetched.response, responseMs:firstElapsed, service, city, companyName });
    const queue = [];
    const queued = new Set([firstPage.url]);
    const seed = sitemapFound ? sitemapUrls(sitemapResult.body, origin, host) : [];
    for (const url of [...seed, ...firstPage.discoveredLinks]) {
      if (!queued.has(url) && queue.length < MAX_DISCOVERED_URLS) { queue.push(url); queued.add(url); }
    }

    const pages = [firstPage];
    while (queue.length && pages.length < MAX_PAGES) {
      const next = queue.shift();
      const t = Date.now();
      try {
        const fetched = await fetchPublicUrl(next);
        if (!fetched.contentType.toLowerCase().includes("html")) continue;
        const page = analyzePage({ html:fetched.body, finalUrl:fetched.finalUrl, response:fetched.response, responseMs:Date.now()-t, service, city, companyName });
        if (!pages.some((p) => p.url === page.url)) pages.push(page);
        for (const found of page.discoveredLinks) {
          if (!queued.has(found) && queue.length < MAX_DISCOVERED_URLS) { queue.push(found); queued.add(found); }
        }
      } catch { /* one failed URL must not fail the whole crawl */ }
    }

    const siteFindings = [];
    if (!robotsFound) addFinding(siteFindings,{severity:"medium",category:"CRAWLING",problem:"robots.txt was not confirmed",where:`${origin}/robots.txt`,fix:"Publish a valid robots.txt and make sure important pages are not blocked.",why:"robots.txt controls crawler access and should be intentional."});
    if (!sitemapFound) addFinding(siteFindings,{severity:"medium",category:"CRAWLING",problem:"XML sitemap was not confirmed",where:`${origin}/sitemap.xml`,fix:"Publish an XML sitemap containing canonical indexable URLs and submit it in Search Console.",why:"Sitemaps help search engines discover and monitor important URLs."});

    const duplicateTitles = duplicateGroups(pages, (p) => p.page.title);
    const duplicateDescriptions = duplicateGroups(pages, (p) => p.page.metaDescription);
    for (const group of duplicateTitles.slice(0,3)) addFinding(siteFindings,{severity:"high",category:"DUPLICATION",problem:`Duplicate title used on ${group.urls.length} crawled pages`,where:group.urls.join(" · "),fix:"Give each indexable page a unique title that matches its own intent.",suggested:group.value,why:"Duplicate titles make it harder to distinguish pages and their purpose."});
    for (const group of duplicateDescriptions.slice(0,3)) addFinding(siteFindings,{severity:"medium",category:"DUPLICATION",problem:`Duplicate meta description used on ${group.urls.length} crawled pages`,where:group.urls.join(" · "),fix:"Write unique descriptions for pages with different intent.",why:"Unique descriptions improve clarity across search results."});

    const allFindings = [...siteFindings, ...pages.flatMap((p) => p.findings)].sort((a,b) => severityWeight(b.severity)-severityWeight(a.severity));
    const avgScore = Math.round(pages.reduce((sum,p)=>sum+p.score,0)/Math.max(1,pages.length));
    const high = allFindings.filter((f)=>f.severity==="high").length;
    const medium = allFindings.filter((f)=>f.severity==="medium").length;
    const low = allFindings.filter((f)=>f.severity==="low").length;
    const indexable = pages.filter((p)=>!p.technical.noindex && p.status >= 200 && p.status < 400).length;

    const primary = { ...firstPage, technical:{...firstPage.technical,robotsFound,robotsStatus:robotsResult?.response?.status||null,sitemapFound,sitemapStatus:sitemapResult?.response?.status||null}, findings:allFindings.slice(0,24) };
    delete primary.discoveredLinks;

    return res.status(200).json({
      ...primary,
      site:{
        score:avgScore, scoreLabel:scoreLabel(avgScore), pagesCrawled:pages.length, pageLimit:MAX_PAGES,
        indexablePages:indexable, issues:{high,medium,low,total:allFindings.length},
        duplicateTitles:duplicateTitles.length, duplicateDescriptions:duplicateDescriptions.length,
        robotsFound,sitemapFound, crawlMs:Date.now()-startedAt,
      },
      pages:pages.map((p)=>({url:p.url,status:p.status,score:p.score,title:p.page.title,description:p.page.metaDescription,h1:p.page.h1,wordCount:p.page.wordCount,noindex:p.technical.noindex,canonical:p.technical.canonical,issues:p.findings.length})),
      findings:allFindings.slice(0,24),
      scope:"multi-page-live-site-audit",
      notes:[`Crawls up to ${MAX_PAGES} same-host HTML pages per run.`,`Search Console clicks, impressions, queries and positions require a Google OAuth/API connection and are never fabricated.`],
    });
  } catch (error) {
    const message = error?.name === "AbortError" ? "The website took too long to respond." : error?.message || "Could not audit this website.";
    return res.status(400).json({ error: message });
  }
}
