export const SEO_TABS = ['overview', 'audit', 'keywords', 'onpage', 'content', 'local', 'technical', 'google'];
export const clean = (value, max = 500) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export const meaningful = value => clean(value).length >= 2 && !/^(test\d*|demo|n\/?a|none|placeholder|example|services?|company|business|your business)$/i.test(clean(value));
export function websiteUrl(value) {
  let raw = clean(value, 2048);
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const u = new URL(raw);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || !u.hostname.includes('.')) throw new Error('Enter a public website URL.');
  u.hash = '';
  return u.href;
}
export function normalizeSettings(input = {}) {
  const mode = input.mode === 'local' ? 'local' : 'online';
  return {
    website: websiteUrl(input.website), service: clean(input.service, 120), businessName: clean(input.businessName, 120),
    description: clean(input.description, 1500), mode, city: clean(input.city, 120), market: clean(input.market, 120),
    language: 'English', address: clean(input.address, 250),
  };
}
export function defaults(company = {}) {
  return normalizeSettings({ website: company.website_url, service: company.industry, businessName: company.name,
    description: company.business_description, mode: 'online', market: '', city: meaningful(company.city) ? company.city : '', address: company.business_address });
}
export function setupChecks(s) {
  const checks = [
    {key:'website', label:'Website URL', done:Boolean(s.website), fix:'Add the public website you want to optimize.'},
    {key:'businessName', label:'Business name', done:meaningful(s.businessName), fix:'Use the actual name customers recognize.'},
    {key:'service', label:'Main service', done:meaningful(s.service), fix:'Describe the main service or product customers search for.'},
    {key:'description', label:'Business description', done:meaningful(s.description) && s.description.length >= 80, fix:'Explain what you offer, who it helps and what makes it useful (at least 80 characters).'},
    {key:'market', label:'Target market', done:meaningful(s.market), fix:'Choose the countries or market you serve, for example USA and Canada.'},
  ];
  if (s.mode === 'local') checks.push({key:'city', label:'City / service area', done:meaningful(s.city), fix:'Enter a real city or service area. Test values do not count.'});
  return checks;
}
export function strategy(s) {
  if (!meaningful(s.service)) return {primary:'', keywords:[], ideas:[], actions:setupChecks(s).filter(x=>!x.done)};
  const area = s.mode === 'local' && meaningful(s.city) ? ` in ${s.city}` : '';
  const topic = `${s.service}${area}`;
  return {
    primary: topic,
    keywords: [topic, `${s.service} pricing${area}`, `${s.service} for businesses${area}`, `how does ${s.service} work`, `what does ${s.service} include`],
    ideas: [
      {title:topic, purpose:'Explain the service, who it helps, how it works and how to get started.'},
      {title:`${s.service}: pricing and plans`, purpose:'Explain real prices, included services and factors that affect cost.'},
      {title:`Questions about ${s.service}`, purpose:'Answer actual customer questions about setup, usage, costs and support.'},
      ...(area ? [{title:`${s.service} in ${s.city}: service area`, purpose:'Explain where you operate and include genuine local customer examples.'}] : []),
    ],
    actions: setupChecks(s).filter(x=>!x.done),
  };
}
export function suggestedDraft(s, url = s.website) {
  const topic = strategy(s).primary;
  return {url, keyword:topic, title:topic ? `${topic}${meaningful(s.businessName) ? ` | ${s.businessName}` : ''}` : '', h1:topic,
    description:meaningful(s.description) ? s.description.slice(0, 160) : '', brief:topic ? `Who needs ${s.service}?\nWhat is included?\nHow does it work?\nWhat does it cost?\nWhat do customers ask?\nWhat is the next step?` : ''};
}
export function normalizeDraft(input = {}) {
  const url = websiteUrl(input.url);
  if (!url) throw new Error('Add the page URL before saving a draft.');
  return {url, keyword:clean(input.keyword,180), title:clean(input.title,200), h1:clean(input.h1,250), description:clean(input.description,500), brief:clean(input.brief,6000)};
}
export function tabFromUrl(url) { const tab = new URL(url, 'https://youyouapp.com').searchParams.get('tab'); return SEO_TABS.includes(tab) ? tab : 'overview'; }
export function tabUrl(tab) { return `/dashboard/seo-growth?tab=${SEO_TABS.includes(tab) ? tab : 'overview'}`; }
export function propertyMatchesWebsite(property, website) {
  try {
    const u = new URL(website);
    if (property.startsWith('sc-domain:')) { const host = property.slice(10).toLowerCase(); return u.hostname === host || u.hostname.endsWith(`.${host}`); }
    const p = new URL(property);
    return u.origin === p.origin && u.pathname.startsWith(p.pathname);
  } catch { return false; }
}
