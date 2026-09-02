import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 9000;
const MAX_REDIRECTS = 3;

function normalizeUrl(value = "") {
  let raw = String(value || "").trim();
  if (!raw) throw new Error("Website URL is required.");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only public http/https websites can be audited.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not supported.");
  }
  return url;
}

function isPrivateIp(ip) {
  if (!ip) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10 || parts[0] === 127 || parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    if (parts[0] >= 224) return true;
    return false;
  }

  const low = ip.toLowerCase();
  return (
    low === "::1" ||
    low === "::" ||
    low.startsWith("fc") ||
    low.startsWith("fd") ||
    low.startsWith("fe80:")
  );
}

async function assertPublicHost(hostname) {
  const lowered = hostname.toLowerCase();
  if (
    lowered === "localhost" ||
    lowered.endsWith(".localhost") ||
    lowered.endsWith(".local")
  ) {
    throw new Error("Private/local network addresses cannot be audited.");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Private/local network addresses cannot be audited.");
    return;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error("This hostname resolves to a private/local network address.");
  }
}

async function fetchPublicUrl(initialUrl, { method = "GET", maxBytes = MAX_BYTES } = {}) {
  let current = normalizeUrl(initialUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicHost(current.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;
    try {
      response = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "YOUYOU-SEO-Audit/1.0 (+https://youyou.pro)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
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

    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > maxBytes) throw new Error("Page is too large for this lightweight audit.");

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error("Page is too large for this lightweight audit.");

    return {
      response,
      body: buffer.toString("utf8"),
      finalUrl: current.toString(),
      contentType,
    };
  }

  throw new Error("Too many redirects.");
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
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

function allTags(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) || [];
}

function metaContent(html, name) {
  const tags = allTags(html, "meta");
  const target = name.toLowerCase();

  for (const tag of tags) {
    const nameValue = (attrFromTag(tag, "name") || attrFromTag(tag, "property")).toLowerCase();
    if (nameValue === target) return attrFromTag(tag, "content");
  }
  return "";
}

function linkHrefByRel(html, relNeedle) {
  const links = allTags(html, "link");
  for (const tag of links) {
    const rel = attrFromTag(tag, "rel").toLowerCase().split(/\s+/);
    if (rel.includes(relNeedle.toLowerCase())) return attrFromTag(tag, "href");
  }
  return "";
}

function countStructuredData(html) {
  return (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi) || []).length;
}

function getVisibleText(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  return cleanText(body);
}

function includesNeedle(haystack = "", needle = "") {
  const n = cleanText(needle).toLowerCase();
  if (!n) return null;
  return cleanText(haystack).toLowerCase().includes(n);
}

function scoreLabel(score) {
  if (score >= 90) return "Strong live foundation";
  if (score >= 75) return "Good foundation";
  if (score >= 55) return "Needs improvement";
  return "Priority fixes needed";
}

function addFinding(findings, item) {
  findings.push({
    severity: item.severity || "medium",
    category: item.category || "SEO",
    problem: item.problem,
    where: item.where,
    fix: item.fix,
    suggested: item.suggested || "",
    why: item.why,
  });
}

function safeSuggestedTitle(service, city, companyName) {
  const s = cleanText(service) || "Core Service";
  const c = cleanText(city);
  const brand = cleanText(companyName) || "Your Business";
  const title = c ? `${s} in ${c} | ${brand}` : `${s} | ${brand}`;
  return title.slice(0, 60);
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
  const value = c
    ? `${brand} provides ${s} in ${c}. Explore what is included, common questions and the next step to get started.`
    : `${brand} provides ${s}. Explore what is included, common questions and the next step to get started.`;
  return value.slice(0, 155);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST for website audits." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const service = cleanText(body.service);
    const city = cleanText(body.city);
    const companyName = cleanText(body.companyName);

    const startedAt = Date.now();
    const targetUrl = normalizeUrl(body.url);
    const { response, body: html, finalUrl, contentType } = await fetchPublicUrl(targetUrl);
    const elapsedMs = Date.now() - startedAt;

    if (!contentType.toLowerCase().includes("html")) {
      return res.status(400).json({ error: "The URL did not return an HTML webpage." });
    }

    const final = new URL(finalUrl);
    const title = firstTagContent(html, "title");
    const metaDescription = metaContent(html, "description");
    const metaRobots = metaContent(html, "robots");
    const canonicalRaw = linkHrefByRel(html, "canonical");
    const canonical = canonicalRaw ? new URL(canonicalRaw, final).toString() : "";
    const viewport = metaContent(html, "viewport");
    const htmlTag = (html.match(/<html\b[^>]*>/i) || [""])[0];
    const htmlLang = attrFromTag(htmlTag, "lang");

    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h2Matches = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
    const h1 = h1Matches.length ? cleanText(h1Matches[0][1]) : "";

    const imageTags = allTags(html, "img");
    const imagesMissingAlt = imageTags.filter((tag) => {
      const alt = attrFromTag(tag, "alt");
      return !alt;
    }).length;

    const anchorTags = allTags(html, "a");
    let internal = 0;
    let external = 0;
    let emptyHref = 0;

    for (const tag of anchorTags) {
      const href = attrFromTag(tag, "href");
      if (!href || href === "#" || href.toLowerCase().startsWith("javascript:")) {
        emptyHref += 1;
        continue;
      }
      if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;

      try {
        const parsed = new URL(href, final);
        if (parsed.hostname === final.hostname) internal += 1;
        else external += 1;
      } catch {
        emptyHref += 1;
      }
    }

    const visibleText = getVisibleText(html);
    const wordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0;
    const noindex = /(^|[\s,])noindex([\s,]|$)/i.test(metaRobots);

    const [robotsCheck, sitemapCheck] = await Promise.allSettled([
      fetchPublicUrl(new URL("/robots.txt", final), { maxBytes: 300_000 }),
      fetchPublicUrl(new URL("/sitemap.xml", final), { maxBytes: 800_000 }),
    ]);

    const robotsResult = robotsCheck.status === "fulfilled" ? robotsCheck.value : null;
    const sitemapResult = sitemapCheck.status === "fulfilled" ? sitemapCheck.value : null;

    const robotsFound = Boolean(
      robotsResult &&
      robotsResult.response.ok &&
      /user-agent\s*:/i.test(robotsResult.body)
    );
    const sitemapFound = Boolean(
      sitemapResult &&
      sitemapResult.response.ok &&
      /<(urlset|sitemapindex)\b/i.test(sitemapResult.body)
    );

    const serviceInTitle = includesNeedle(title, service);
    const serviceInH1 = includesNeedle(h1, service);
    const serviceInBody = includesNeedle(visibleText, service);
    const cityInTitle = includesNeedle(title, city);
    const cityInH1 = includesNeedle(h1, city);
    const cityInBody = includesNeedle(visibleText, city);

    const findings = [];
    let score = 100;

    if (!response.ok) {
      score -= 25;
      addFinding(findings, {
        severity: "high",
        category: "TECHNICAL",
        problem: `Page returned HTTP ${response.status}`,
        where: "Requested live URL",
        fix: "Make sure the page returns a successful 200 response to normal visitors and search crawlers.",
        why: "Search engines and users need a reliably accessible page.",
      });
    }

    if (!title) {
      score -= 14;
      addFinding(findings, {
        severity: "high",
        category: "ON-PAGE",
        problem: "SEO title is missing",
        where: "<head> → <title>",
        fix: "Add one descriptive page title.",
        suggested: safeSuggestedTitle(service, city, companyName),
        why: "The title is one of the clearest signals describing the page in search results.",
      });
    } else if (title.length < 25 || title.length > 65) {
      score -= 6;
      addFinding(findings, {
        severity: "medium",
        category: "ON-PAGE",
        problem: `SEO title length is ${title.length} characters`,
        where: "<head> → <title>",
        fix: "Make the title concise and descriptive, usually around 30–60 characters.",
        suggested: safeSuggestedTitle(service, city, companyName),
        why: "A clear title helps users understand the result and avoids excessive truncation.",
      });
    }

    if (!metaDescription) {
      score -= 10;
      addFinding(findings, {
        severity: "medium",
        category: "ON-PAGE",
        problem: "Meta description is missing",
        where: '<head> → meta[name="description"]',
        fix: "Add a useful description that explains the page and next step.",
        suggested: safeSuggestedMeta(service, city, companyName),
        why: "Google may use the description as a search snippet and it helps shape click expectations.",
      });
    } else if (metaDescription.length < 70 || metaDescription.length > 170) {
      score -= 4;
      addFinding(findings, {
        severity: "low",
        category: "ON-PAGE",
        problem: `Meta description length is ${metaDescription.length} characters`,
        where: '<head> → meta[name="description"]',
        fix: "Tighten the description so it communicates value clearly without unnecessary text.",
        suggested: safeSuggestedMeta(service, city, companyName),
        why: "A focused description is easier for searchers to scan and understand.",
      });
    }

    if (h1Matches.length === 0) {
      score -= 12;
      addFinding(findings, {
        severity: "high",
        category: "CONTENT",
        problem: "No H1 heading was found",
        where: "Main page content",
        fix: "Add one clear main heading that describes the page topic.",
        suggested: safeSuggestedH1(service, city),
        why: "A clear H1 helps visitors and search engines understand the primary page topic.",
      });
    } else if (h1Matches.length > 1) {
      score -= 4;
      addFinding(findings, {
        severity: "low",
        category: "CONTENT",
        problem: `${h1Matches.length} H1 headings were found`,
        where: "Main page content",
        fix: "Review heading structure and keep one obvious primary page heading.",
        suggested: safeSuggestedH1(service, city),
        why: "A simple heading hierarchy makes the page easier to scan and understand.",
      });
    }

    if (!canonical) {
      score -= 5;
      addFinding(findings, {
        severity: "low",
        category: "TECHNICAL",
        problem: "Canonical URL was not found",
        where: '<head> → link[rel="canonical"]',
        fix: "Add a self-referencing canonical if this is the preferred version of the page.",
        suggested: finalUrl,
        why: "Canonical signals help clarify which URL version should represent duplicated or similar content.",
      });
    }

    if (noindex) {
      score -= 25;
      addFinding(findings, {
        severity: "high",
        category: "INDEXING",
        problem: "The page contains a noindex directive",
        where: '<head> → meta[name="robots"]',
        fix: "Remove noindex if this page is intended to appear in search results.",
        why: "A noindex directive asks search engines not to include the page in their index.",
      });
    }

    if (!viewport) {
      score -= 5;
      addFinding(findings, {
        severity: "medium",
        category: "MOBILE",
        problem: "Viewport meta tag was not found",
        where: "<head>",
        fix: 'Add a responsive viewport meta tag such as width=device-width, initial-scale=1.',
        why: "Mobile-friendly rendering is important for users and modern search experiences.",
      });
    }

    if (!htmlLang) {
      score -= 2;
      addFinding(findings, {
        severity: "low",
        category: "ACCESSIBILITY",
        problem: "HTML language attribute is missing",
        where: "<html lang=\"...\">",
        fix: "Declare the primary language of the page.",
        why: "Language metadata helps browsers and assistive technologies interpret content correctly.",
      });
    }

    if (imageTags.length && imagesMissingAlt > 0) {
      const ratio = imagesMissingAlt / imageTags.length;
      score -= ratio > 0.5 ? 7 : 4;
      addFinding(findings, {
        severity: ratio > 0.5 ? "medium" : "low",
        category: "IMAGES",
        problem: `${imagesMissingAlt} of ${imageTags.length} images are missing alt text`,
        where: "<img> elements on the live page",
        fix: "Add useful alt text to meaningful images; leave decorative image alt text empty when appropriate.",
        why: "Alt text improves accessibility and can help search engines understand image context.",
      });
    }

    if (wordCount < 250) {
      score -= 5;
      addFinding(findings, {
        severity: "medium",
        category: "CONTENT",
        problem: `The page has about ${wordCount} visible words`,
        where: "Main page content",
        fix: "Make sure the page fully answers the customer’s decision-making questions instead of adding filler.",
        suggested: "Explain the service, who it is for, what is included, trust signals, FAQs and a clear next step.",
        why: "Thin pages can fail to answer the questions a potential customer needs before acting.",
      });
    }

    if (!robotsFound) {
      score -= 3;
      addFinding(findings, {
        severity: "low",
        category: "CRAWLING",
        problem: "robots.txt was not confirmed",
        where: `${final.origin}/robots.txt`,
        fix: "Confirm that robots.txt exists and does not accidentally block important pages.",
        why: "robots.txt helps manage crawler access to parts of a website.",
      });
    }

    if (!sitemapFound) {
      score -= 4;
      addFinding(findings, {
        severity: "low",
        category: "CRAWLING",
        problem: "XML sitemap was not confirmed at /sitemap.xml",
        where: `${final.origin}/sitemap.xml`,
        fix: "Publish an XML sitemap and submit it in Google Search Console.",
        why: "A sitemap can help search engines discover important URLs efficiently.",
      });
    }

    if (service && serviceInTitle === false) {
      score -= 5;
      addFinding(findings, {
        severity: "medium",
        category: "TARGET TOPIC",
        problem: `Target service “${service}” is not clear in the title`,
        where: "<title>",
        fix: "Make the page title clearly describe the target service when that matches the page intent.",
        suggested: safeSuggestedTitle(service, city, companyName),
        why: "The page should clearly communicate what service it is about.",
      });
    }

    if (service && serviceInH1 === false) {
      score -= 5;
      addFinding(findings, {
        severity: "medium",
        category: "TARGET TOPIC",
        problem: `Target service “${service}” is not clear in the H1`,
        where: "Main H1",
        fix: "Use a natural main heading that reflects the service offered on this page.",
        suggested: safeSuggestedH1(service, city),
        why: "The main heading should match what the customer expects to find on the page.",
      });
    }

    if (city && cityInBody === false) {
      score -= 3;
      addFinding(findings, {
        severity: "low",
        category: "LOCAL SEO",
        problem: `Target city “${city}” is not clearly present in the page text`,
        where: "Customer-facing page content",
        fix: "If this page genuinely serves that location, explain the service area naturally and add real local context.",
        why: "Clear, genuine location context helps local customers understand whether the business serves them.",
      });
    }

    if (internal < 2) {
      score -= 3;
      addFinding(findings, {
        severity: "low",
        category: "INTERNAL LINKS",
        problem: "Very few internal links were found",
        where: "Page navigation / content",
        fix: "Link to relevant service, FAQ, contact or related pages using descriptive anchor text.",
        why: "Internal links help users and search engines discover related content.",
      });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    return res.status(200).json({
      url: targetUrl.toString(),
      finalUrl,
      status: response.status,
      responseMs: elapsedMs,
      score,
      scoreLabel: scoreLabel(score),
      page: {
        title,
        titleLength: title.length,
        metaDescription,
        metaDescriptionLength: metaDescription.length,
        h1,
        h1Count: h1Matches.length,
        h2Count: h2Matches.length,
        wordCount,
        imagesCount: imageTags.length,
        imagesMissingAlt,
        htmlLang,
        viewport: Boolean(viewport),
        structuredDataCount: countStructuredData(html),
        openGraph: {
          title: Boolean(metaContent(html, "og:title")),
          description: Boolean(metaContent(html, "og:description")),
          image: Boolean(metaContent(html, "og:image")),
        },
      },
      technical: {
        canonical,
        metaRobots,
        noindex,
        robotsFound,
        robotsStatus: robotsResult?.response?.status || null,
        sitemapFound,
        sitemapStatus: sitemapResult?.response?.status || null,
      },
      links: {
        internal,
        external,
        empty: emptyHref,
      },
      target: {
        service,
        city,
        serviceInTitle,
        serviceInH1,
        serviceInBody,
        cityInTitle,
        cityInH1,
        cityInBody,
      },
      findings: findings.slice(0, 16),
      scope: "single-page-live-audit",
    });
  } catch (error) {
    const message =
      error?.name === "AbortError"
        ? "The website took too long to respond."
        : error?.message || "Could not audit this website.";

    return res.status(400).json({ error: message });
  }
}
