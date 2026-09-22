import { SEO_TABS, defaults, normalizeSettings, setupChecks, strategy, suggestedDraft, tabFromUrl, tabUrl, meaningful } from './shared/seo-model.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {overview:'Overview',audit:'Website Audit',keywords:'Keywords',onpage:'On-page',content:'Content',local:'Local',technical:'Technical',google:'Google Performance'};
const number = value => Number(value || 0).toLocaleString('en-US',{maximumFractionDigits:1});
const date = value => value ? new Date(value).toLocaleString('en-US') : 'Not yet';
let active = null;
export function renderSeoWorkspace() { return '<section id="seo-workspace" class="seo-workspace" aria-label="SEO workspace"><p role="status">Loading SEO workspace…</p></section>'; }
export function handleSeoPopstate() {
  if (!active?.root.isConnected || location.pathname !== '/dashboard/seo-growth') return false;
  active.route(); return true;
}
export async function mountSeoWorkspace({supabase,company}) {
  const root = document.querySelector('#seo-workspace');
  if (!root) return;
  let settings;
  try {settings=defaults(company);} catch {settings=defaults({...company,website_url:''});}
  const state = {settings,savedSettings:null,tab:tabFromUrl(location.href),audits:[],drafts:[],audit:null,draft:null,google:{configured:false,connected:false,property:null},sites:[],report:null,days:28,busy:false,loaded:false,message:'',error:false,dirty:false,draftDirty:false,configOpen:false,auditUrl:settings.website,mapOpen:false};
  const valid = ()=>root.isConnected;
  const flash = (message,error=false)=>{state.message=message;state.error=error;render();};
  async function request(action,body={},endpoint='/api/seo') {
    const {data} = await supabase.auth.getSession();
    const token=data?.session?.access_token;
    if (!token) throw new Error('Your session expired. Sign in again.');
    const response=await fetch(endpoint,{method:action?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(action?{body:JSON.stringify({action,...body})}:{})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error || 'SEO is temporarily unavailable. Please retry.');
    return result;
  }
  function navigate(tab) {
    state.tab=SEO_TABS.includes(tab)?tab:'overview';
    if(tabUrl(state.tab)!==location.pathname+location.search) history.pushState({...history.state,section:'seo'},'',tabUrl(state.tab));
    render();root.querySelector('#seo-panel-title')?.focus({preventScroll:true});
  }
  active={root,route:()=>{state.tab=tabFromUrl(location.href);render();}};
  async function run(task) {
    if(state.busy)return;
    state.busy=true;state.message='Working…';state.error=false;render();
    try {await task();} catch(e){state.message=e.message;state.error=true;} finally {state.busy=false;if(valid())render();}
  }
  async function load() {
    const data=await request();
    if(!valid())return;
    state.savedSettings=data.settings;
    if(data.settings)state.settings=normalizeSettings(data.settings);
    state.audits=data.audits;state.drafts=data.drafts;state.google=data.google;
    state.audit=data.audits[0]?.result || null;state.auditUrl=state.settings.website;
    state.draft=data.drafts[0]?.draft || suggestedDraft(state.settings);
    state.loaded=true;state.configOpen=!data.settings;
    state.message='';
    const result=new URL(location.href).searchParams.get('google');
    if(result){state.message=result==='connected'?'Google connected. Choose the property for your website.':result==='cancelled'?'Google connection was cancelled. You can try again.':'Google connection failed or expired. Try connecting again.';state.error=result!=='connected';history.replaceState({...history.state,section:'seo'},'',tabUrl(state.tab));}
    render();
  }
  function field(name,label,value,type='text',extra='') {return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
  function configuration() {
    const s=state.settings;
    return `<details class="seo-box seo-config" ${state.configOpen?'open':''}><summary>SEO configuration <span>${state.dirty?'Unsaved changes':state.savedSettings?'Saved for this workspace':'Set up your SEO plan'}</span></summary>
    <form id="seo-config-form"><div class="seo-fields">
      ${field('website','Website URL',s.website,'url','placeholder="https://yourwebsite.com"')}${field('businessName','Business name',s.businessName,'text','maxlength="120"')}${field('service','Main service / product',s.service,'text','maxlength="120"')}
      <label>Business reach<select name="mode"><option value="online" ${s.mode==='online'?'selected':''}>Online / international</option><option value="local" ${s.mode==='local'?'selected':''}>Local / service area</option></select></label>
      ${field('market','Target market',s.market,'text','placeholder="e.g. USA and Canada" maxlength="120"')}<label>Content language<input value="English" readonly></label>
      ${s.mode==='local'?`${field('city','City / service area',s.city,'text','maxlength="120"')}${field('address','Public address (optional)',s.address,'text','maxlength="250"')}`:''}
      <label class="seo-wide">Business description<textarea name="description" rows="3" maxlength="1500">${esc(s.description)}</textarea></label>
    </div><div class="seo-actions"><button class="seo-primary" type="submit" ${!state.loaded?'disabled':''}>Save SEO configuration</button><span>Changes here apply to your SEO plan.</span></div></form></details>`;
  }
  function card(tab,title,value,note) {return `<button class="seo-box seo-card" data-tab="${tab}"><span>${title}</span><strong>${esc(value)}</strong><p>${note}</p><b>Open ${names[tab]} →</b></button>`;}
  function overview() {
    const checks=setupChecks(state.settings),done=checks.filter(x=>x.done).length,plan=strategy(state.settings);
    return `<div class="seo-notice"><strong>Setup completeness: ${done}/${checks.length}</strong><p>This measures the information in your SEO configuration. It is not a Google ranking or a website audit score.</p></div>
    <div class="seo-cards">
    ${card('audit','Website audit',state.audit?`${state.audit.score}/100`:'Not run',state.audit?`Single-page checks · ${esc(date(state.audit.auditedAt))}`:'Check a public page and save the findings.')}
    ${card('keywords','Keyword ideas',plan.keywords.length,'Ideas based on your service and audience. Search volume is not estimated.')}
    ${card('content','Content plan',plan.ideas.length,'Build useful pages around customer questions.')}
    ${card('onpage','Saved page drafts',state.drafts.length,'Edit titles, descriptions, headings and content briefs.')}
    ${card('technical','Audit actions',state.audit?.findings?.length ?? 'Not checked','Review observed page issues and setup gaps.')}
    ${card('google','Google Search Console',state.google.connected?'Connected':'Not connected',state.google.property?esc(state.google.property):'Connect your account and choose your website.')}
    </div>${state.settings.mode==='local'?`<div class="seo-actions"><button data-tab="local">Open local visibility plan →</button></div>`:''}`;
  }
  function findings(items) {
    if(!items?.length)return '<p>No issues were reported by these limited checks. This does not guarantee indexing or ranking.</p>';
    return items.map(x=>`<article class="seo-finding"><span class="seo-tag">${esc(x.severity || 'Action')} · ${esc(x.category || '')}</span><h3>${esc(x.problem)}</h3><p><b>Where:</b> ${esc(x.where)}</p><p><b>Fix:</b> ${esc(x.fix)}</p>${x.suggested?`<p><b>Draft suggestion:</b> ${esc(x.suggested)}</p>`:''}<p class="seo-muted">${esc(x.why)}</p></article>`).join('');
  }
  function audit() {
    const a=state.audit;
    return `<div class="seo-box"><h3>Check a live page</h3><p>Checks the HTML returned by the server for one URL. JavaScript-rendered content, site-wide crawling, mobile rendering and speed are not measured.</p>
    <form id="seo-audit-form" class="seo-actions">${field('auditUrl','Page URL',state.auditUrl,'url','required placeholder="https://yourwebsite.com/page"')}<button class="seo-primary" type="submit" ${!state.loaded?'disabled':''}>Run website audit</button></form>
    ${state.audits.length?`<label>Saved audits (latest 20)<select id="seo-history"><option value="">Choose a previous audit</option>${state.audits.map((x,i)=>`<option value="${i}">${esc(date(x.created_at))} — ${esc(x.url)}</option>`).join('')}</select></label>`:''}</div>
    ${a?`<div class="seo-box"><span class="seo-tag">SINGLE-PAGE HTML AUDIT</span><h3>${esc(a.finalUrl)}</h3><p>${esc(date(a.auditedAt))} · ${a.score}/100 internal audit score</p><div class="seo-stats">${[['Title',a.page.title || 'Missing'],['H1',a.page.h1 || 'Missing'],['Words in server HTML',a.page.wordCount],['Images without alt',a.page.imagesMissingAlt]].map(([label,value])=>`<div><span>${label}</span><strong>${esc(value)}</strong></div>`).join('')}</div>
    <div class="seo-actions"><button data-action="audit-draft">Edit page SEO draft</button><button data-action="copy-audit">Copy action plan</button></div>${a.saveWarning?`<p class="seo-error">${esc(a.saveWarning)}</p>`:''}</div><div class="seo-box"><h3>Prioritized corrections</h3>${findings(a.findings)}</div>`:'<div class="seo-empty">No audit result yet. Run an audit to see observed issues.</div>'}`;
  }
  function keywords() {
    const p=strategy(state.settings);
    return `<div class="seo-box"><span class="seo-tag">PLANNING IDEAS</span><h3>Choose a topic for each page</h3><p>These ideas come from your saved service and market. They are not measured search volumes or competition scores. Google Performance shows queries your site actually appeared for.</p>${p.keywords.length?`<div class="seo-list">${p.keywords.map((word,i)=>`<div><strong>${esc(word)}</strong><button data-keyword="${i}">Use in page draft</button></div>`).join('')}</div>`:'<p>Add a meaningful service in SEO configuration to create ideas.</p>'}<button data-tab="google">See real Google queries →</button></div>`;
  }
  function onpage() {
    const d=state.draft || suggestedDraft(state.settings);
    return `<div class="seo-box"><h3>Edit SEO for a specific page</h3><p>Save a draft, then apply it in your website editor. Saving here does not change your live site.</p>
    ${state.drafts.length?`<label>Saved drafts<select id="seo-draft-select"><option value="">Choose a draft</option>${state.drafts.map((x,i)=>`<option value="${i}">${esc(x.draft.url)}</option>`).join('')}</select></label>`:''}
    <form id="seo-draft-form"><div class="seo-fields">${field('url','Page URL',d.url,'url','required')}${field('keyword','Target topic',d.keyword,'text','maxlength="180"')}${field('title','SEO title',d.title,'text','maxlength="200"')}${field('h1','Main heading (H1)',d.h1,'text','maxlength="250"')}
    <label class="seo-wide">Meta description<textarea name="description" maxlength="500" rows="3">${esc(d.description)}</textarea></label>
    <label class="seo-wide">Content brief<textarea name="brief" maxlength="6000" rows="7">${esc(d.brief)}</textarea></label></div>
    <div class="seo-actions"><button class="seo-primary" type="submit" ${!state.loaded?'disabled':''}>Save page draft</button><button type="button" data-action="copy-draft">Copy SEO pack</button><span>${state.draftDirty?'Unsaved draft changes':''}</span></div></form></div>
    <div class="seo-box"><h3>Search snippet draft</h3><p>Google may display different text. This preview is not a live search result.</p><div class="seo-snippet"><small id="seo-preview-url">${esc(d.url)}</small><h3 id="seo-preview-title">${esc(d.title || 'Your page title')}</h3><p id="seo-preview-description">${esc(d.description || 'Your page description')}</p></div></div>`;
  }
  function content() {
    const p=strategy(state.settings);
    return `<div class="seo-box"><h3>Pages worth creating</h3><p>Start from real services, customer questions and evidence. Each idea becomes an editable draft.</p>${p.ideas.length?p.ideas.map((idea,i)=>`<article class="seo-finding"><h3>${esc(idea.title)}</h3><p>${esc(idea.purpose)}</p><button data-idea="${i}">Create content brief</button></article>`).join(''):'<p>Complete your SEO configuration first.</p>'}</div>`;
  }
  function local() {
    const s=state.settings;
    if(s.mode!=='local')return '<div class="seo-box"><h3>Online / international business</h3><p>Your plan does not require a local address or city-based keywords. Choose Local / service area in SEO configuration if you serve a specific location.</p></div>';
    const query=[s.businessName,s.address,s.city].filter(meaningful).join(',');
    const maps=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    const mapKey=import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;
    return `<div class="seo-box"><h3>Local visibility</h3><p>Use your actual service area, consistent contact details and genuine customer evidence. A map preview does not create or verify a Google Business Profile.</p>
    ${meaningful(s.city)?`<h3>${esc(s.city)}</h3><p>${esc(s.address || 'Service-area business — no public address added.')}</p><a class="seo-button" href="${esc(maps)}" target="_blank" rel="noopener noreferrer">Open location in Google Maps ↗</a>
    ${mapKey?`<button data-action="map">${state.mapOpen?'Hide map':'Preview map'}</button>${state.mapOpen?`<iframe title="Google Maps location preview" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapKey)}&q=${encodeURIComponent(query)}" allowfullscreen></iframe>`:''}`:'<p>Use the Google Maps link to check your location.</p>'}`:'<p>Add a real city or service area in SEO configuration.</p>'}
    <ol><li>Describe the services available in your actual service area.</li><li>Keep your business name, contact details and opening hours consistent.</li><li>Include authentic customer examples, with permission.</li><li>Use accurate business structured data that matches the page.</li></ol></div>`;
  }
  function technical() {
    const a=state.audit,t=a?.technical;
    return `<div class="seo-box"><h3>Configuration checks</h3>${setupChecks(state.settings).map(x=>`<div class="seo-check"><b>${x.done?'✓':'○'} ${esc(x.label)}</b><span>${x.done?'Provided in SEO configuration':esc(x.fix)}</span></div>`).join('')}</div>
    <div class="seo-box"><h3>Observed technical signals</h3>${t?`<p>Page: ${esc(a.finalUrl)} · ${esc(date(a.auditedAt))}</p><div class="seo-list">${[['Indexing directive',t.noindex?'Noindex detected':'No noindex detected — indexing not confirmed'],['Canonical',t.canonical || 'Not found'],['robots.txt',t.robotsFound?'Found; crawl rules need review':'Could not confirm'],['/sitemap.xml',t.sitemapFound?'XML found':'Could not confirm at this path']].map(([k,v])=>`<div><b>${k}</b><span>${esc(v)}</span></div>`).join('')}</div>`:'<p>Run a website audit to check server HTML and technical signals.</p>'}<div class="seo-actions"><button data-tab="audit">Open website audit</button><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Inspect indexing in Search Console ↗</a></div></div>`;
  }
  function rowsTable(title,rows,keyLabel) {
    return `<div class="seo-box"><h3>${title}</h3>${rows.length?`<div class="seo-table-wrap"><table><thead><tr><th>${keyLabel}</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Avg. position</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${esc(row.keys?.[0])}</td><td>${number(row.clicks)}</td><td>${number(row.impressions)}</td><td>${number(row.ctr*100)}%</td><td>${number(row.position)}</td></tr>`).join('')}</tbody></table></div>`:'<p>No rows available for this period.</p>'}</div>`;
  }
  function google() {
    const g=state.google,r=state.report;
    return `<div class="seo-box"><h3>Google Search Console</h3><p>Connect the Google account that has access to your website. YOUYOU reads search performance; it does not modify your Search Console property.</p>
    ${!g.configured?'<div class="seo-notice">Google connection setup is pending. The administrator must complete the Google configuration before accounts can connect.</div>':`<div class="seo-actions"><button class="seo-primary" data-action="google-start">${g.connected?'Reconnect Google':'Connect Google'}</button>${g.connected?'<button data-action="google-sites">Choose / change property</button><button data-action="google-disconnect">Disconnect</button>':''}</div>`}
    ${g.connected?`<p><b>Selected property:</b> ${esc(g.property || 'Choose a property')}</p>`:''}
    ${state.sites.length?`<form id="seo-property-form" class="seo-actions"><label>Your accessible properties<select name="property" required><option value="">Choose the property matching your saved website</option>${state.sites.map(s=>`<option value="${esc(s.siteUrl)}" ${s.siteUrl===g.property?'selected':''}>${esc(s.siteUrl)}</option>`).join('')}</select></label><button type="submit">Use this property</button></form>`:''}
    ${g.property?`<div class="seo-actions"><label>Reporting period<select id="seo-period"><option value="28" ${state.days===28?'selected':''}>Last 28 completed days</option><option value="90" ${state.days===90?'selected':''}>Last 90 completed days</option></select></label><button class="seo-primary" data-action="google-performance">Load Google performance</button></div><p>Reports end three days ago to allow processing. Results may differ from today's Search Console view.</p>`:''}</div>
    ${r?`<div class="seo-box"><h3>${esc(r.property)}</h3><p>${esc(r.startDate)} – ${esc(r.endDate)} · Last loaded: ${esc(date(r.fetchedAt))}</p>${r.totals?`<div class="seo-stats">${[['Clicks',number(r.totals.clicks)],['Impressions',number(r.totals.impressions)],['CTR',`${number(r.totals.ctr*100)}%`],['Average position',number(r.totals.position)]].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`:'<p>No search data available for this property and period. Newly verified or low-traffic sites may have no data yet.</p>'}<p>Top 50 queries/pages only. Google omits some queries for privacy; table totals may differ from overall totals.</p></div>${rowsTable('Search queries',r.queries,'Query')}${rowsTable('Pages in search',r.pages,'Page URL')}${rowsTable('Daily performance',r.daily,'Date')}`:''}`;
  }
  function render() {
    if(!valid())return;
    const views={overview,audit,keywords,onpage,content,local,technical,google};
    root.innerHTML=`<header class="seo-head"><div><span class="seo-tag">SEO WORKSPACE</span><h1>Grow your search visibility</h1><p>Configure your website, fix observed issues and measure Google performance.</p></div></header>
    ${configuration()}<div id="seo-status" class="seo-status ${state.error?'seo-error':''}" role="status" aria-live="polite">${esc(state.message)}</div>
    <nav class="seo-nav" aria-label="SEO sections">${SEO_TABS.map(tab=>`<button data-tab="${tab}" ${state.tab===tab?'aria-current="page"':''}>${names[tab]}</button>`).join('')}</nav>
    <div class="seo-panel-heading">${state.tab!=='overview'?'<button data-tab="overview">← Back to SEO Overview</button>':''}<h2 id="seo-panel-title" tabindex="-1">${names[state.tab]}</h2></div>
    ${state.loaded?views[state.tab]():'<div class="seo-empty"><p>SEO data has not loaded.</p><button data-action="retry">Retry loading</button></div>'}`;
    if(state.busy)root.querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=true);
    bind();
  }
  function readConfig() {
    const form=root.querySelector('#seo-config-form');
    if(form){state.settings={...state.settings,...Object.fromEntries(new FormData(form))};state.dirty=true;}
  }
  function readDraft() {
    const form=root.querySelector('#seo-draft-form');
    if(form){state.draft=Object.fromEntries(new FormData(form));state.draftDirty=true;}
  }
  function prepareDraft(topic,brief) {
    if(state.draftDirty && !window.confirm('Replace the unsaved draft with this idea?'))return;
    state.draft={...suggestedDraft(state.settings),url:'',keyword:topic,title:topic,h1:topic,...(brief?{brief}:{})};state.draftDirty=true;navigate('onpage');
  }
  async function copy(text) {await navigator.clipboard.writeText(text);state.message='Copied to clipboard.';}
  function bind() {
    root.querySelector('details')?.addEventListener('toggle',e=>state.configOpen=e.target.open);
    root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>navigate(b.dataset.tab));
    root.querySelector('#seo-config-form')?.addEventListener('input',()=>{readConfig();root.querySelector('summary span').textContent='Unsaved changes';});
    root.querySelector('[name="mode"]')?.addEventListener('change',()=>{readConfig();state.configOpen=true;render();});
    root.querySelector('#seo-config-form')?.addEventListener('submit',e=>{e.preventDefault();readConfig();run(async()=>{const saved=await request('save-settings',{settings:state.settings});state.settings=saved.settings;state.savedSettings=saved.settings;state.dirty=false;state.auditUrl=saved.settings.website;state.message='SEO configuration saved.';});});
    root.querySelector('#seo-audit-form')?.addEventListener('submit',e=>{e.preventDefault();state.auditUrl=new FormData(e.target).get('auditUrl');run(async()=>{
      const s=state.savedSettings || state.settings;
      const result=await request('audit',{url:state.auditUrl,service:meaningful(s.service)?s.service:'',city:s.mode==='local'&&meaningful(s.city)?s.city:'',companyName:s.businessName},'/api/seo-audit');
      state.audit=result;if(result.saved)state.audits=[{url:result.finalUrl,result,created_at:result.auditedAt},...state.audits].slice(0,20);
      state.message=result.saveWarning || 'Audit completed and saved.';state.error=!result.saved;
    });});
    root.querySelector('#seo-history')?.addEventListener('change',e=>{if(e.target.value==='')return;const item=state.audits[Number(e.target.value)];state.audit=item.result;state.auditUrl=item.url;render();});
    root.querySelector('#seo-draft-select')?.addEventListener('change',e=>{if(e.target.value==='')return;if(state.draftDirty&&!window.confirm('Discard unsaved draft changes?'))return;state.draft={...state.drafts[Number(e.target.value)].draft};state.draftDirty=false;render();});
    root.querySelector('#seo-draft-form')?.addEventListener('input',()=>{readDraft();for(const key of ['url','title','description'])root.querySelector(`#seo-preview-${key}`).textContent=state.draft[key] || '';});
    root.querySelector('#seo-draft-form')?.addEventListener('submit',e=>{e.preventDefault();readDraft();run(async()=>{const {draft}=await request('save-draft',{draft:state.draft});state.draft=draft;state.drafts=[{draft,updated_at:new Date().toISOString()},...state.drafts.filter(x=>x.draft.url!==draft.url)].slice(0,30);state.draftDirty=false;state.message='Page draft saved. Apply it in your website editor to publish the changes.';});});
    root.querySelectorAll('[data-keyword]').forEach(b=>b.onclick=()=>prepareDraft(strategy(state.settings).keywords[Number(b.dataset.keyword)]));
    root.querySelectorAll('[data-idea]').forEach(b=>b.onclick=()=>{const idea=strategy(state.settings).ideas[Number(b.dataset.idea)];prepareDraft(idea.title,`${idea.purpose}\n\n${suggestedDraft(state.settings).brief}`);});
    root.querySelector('#seo-period')?.addEventListener('change',e=>{state.days=Number(e.target.value);state.report=null;render();});
    root.querySelector('#seo-property-form')?.addEventListener('submit',e=>{e.preventDefault();const property=new FormData(e.target).get('property');run(async()=>{const result=await request('google-select',{property});state.google.property=result.property;state.report=null;state.message='Property selected. Load Google performance to see your data.';});});
    root.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
      const action=b.dataset.action;
      if(action==='map'){state.mapOpen=!state.mapOpen;render();return;}
      if(action==='audit-draft'){if(state.draftDirty&&!window.confirm('Replace the unsaved draft?'))return;const a=state.audit;state.draft={...suggestedDraft(state.settings,a.finalUrl),title:a.page.title,h1:a.page.h1,description:a.page.metaDescription};state.draftDirty=true;navigate('onpage');return;}
      if(action==='google-disconnect'&&!window.confirm('Disconnect Google for this workspace? Saved SEO drafts and audits will remain.'))return;
      run(async()=>{
        if(action==='retry'){await load();return;}
        if(action==='copy-draft'){const d=state.draft;await copy(`Page: ${d.url}\nTopic: ${d.keyword}\nTitle: ${d.title}\nH1: ${d.h1}\nDescription: ${d.description}\n\n${d.brief}`);return;}
        if(action==='copy-audit'){await copy(`Page: ${state.audit.finalUrl}\n${state.audit.findings.map(x=>`${x.problem}\nWhere: ${x.where}\nFix: ${x.fix}`).join('\n\n')}`);return;}
        if(action==='google-start'){const {url}=await request(action);window.location.assign(url);return;}
        if(action==='google-sites'){const data=await request(action);state.sites=data.sites;state.message=data.sites.length?'Choose your website property.':'No accessible properties found. Add and verify your website in Search Console, then retry.';return;}
        if(action==='google-disconnect'){await request(action);state.google={...state.google,connected:false,property:null};state.sites=[];state.report=null;state.message='Google disconnected from this workspace.';return;}
        if(action==='google-performance'){state.report=null;state.report=await request(action,{days:state.days});state.message='Google report loaded.';}
      });
    });
  }
  render();
  try {await load();} catch(e){if(valid())flash(e.message,true);}
}
