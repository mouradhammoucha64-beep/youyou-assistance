const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('en-US',{maximumFractionDigits:2}) : '—';
export function mountGoogleConsole({supabase,company}) {
  const root = document.querySelector('#seo-google-panel');
  if (!root) return;
  const state = {google:null,website:company?.website_url || '',sites:[],report:null,days:28,busy:false,message:'',error:false};
  const callback = new URL(location.href).searchParams.get('google');
  if (callback) {
    state.message = callback==='connected' ? 'Google connected. Choose your property to load performance.' : callback==='cancelled' ? 'Google connection cancelled. You can try again.' : 'Google connection failed or expired. Try connecting again.';
    state.error = callback !== 'connected';
    const url=new URL(location.href);url.searchParams.delete('google');history.replaceState({},'',url);
  }
  async function request(action,body={}) {
    const {data}=await supabase.auth.getSession();
    if(!data?.session?.access_token) throw new Error('Sign in again to connect Google.');
    const response=await fetch('/api/seo',{method:action?'POST':'GET',headers:{Authorization:`Bearer ${data.session.access_token}`,...(action?{'Content-Type':'application/json'}:{})},...(action?{body:JSON.stringify({action,...body})}:{}),signal:AbortSignal.timeout(65000)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error || 'Google connection could not be loaded. Please retry.');
    return result;
  }
  async function load() {
    const data=await request();state.google=data.google;state.website=data.settings?.website || company?.website_url || '';
  }
  async function run(fn) {
    if(state.busy)return;state.busy=true;state.error=false;render();
    try {await fn();} catch(e) {state.error=true;state.message=e.name==='TimeoutError'?'The request timed out. Please retry.':e.message;}
    finally {state.busy=false;render();}
  }
  function table(title,rows) {
    return `<h3>${title}</h3>${rows.length?`<div class="gsc-table-wrap"><table><thead><tr><th scope="col">${title==='Search queries'?'Query':title==='Daily performance'?'Date':'Page'}</th><th scope="col">Clicks</th><th scope="col">Impressions</th><th scope="col">CTR</th><th scope="col">Position</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${esc(r.keys?.[0])}</th><td>${number(r.clicks)}</td><td>${number(r.impressions)}</td><td>${number(r.ctr*100)}%</td><td>${number(r.position)}</td></tr>`).join('')}</tbody></table></div>`:'<p>No rows available for this period.</p>'}`;
  }
  function render() {
    if(!root.isConnected)return;
    const g=state.google,r=state.report;
    root.innerHTML=`<small>SEARCH PERFORMANCE</small><h2>Google Search Console</h2>
      <p>Read your website’s real Google search performance. This connection does not edit your website or guarantee indexing.</p>
      <p role="status" class="gsc-message ${state.error?'gsc-error':''}">${esc(state.message || (state.busy?'Loading…':''))}</p>
      ${g?`<p><strong>${g.connected?'Connected':'Not connected'}</strong> · ${esc(g.property || 'No property selected')}</p>
      ${!g.configured?'<p>Google connection setup is pending. Ask your workspace administrator to complete the deployment settings.</p>':''}
      <form id="gsc-website"><label>Website to report on<input name="website" type="text" required value="${esc(state.website)}" placeholder="https://www.example.com"></label><button>Save website</button></form>
      <p>Save the website here before choosing a property. This reporting setting does not change your business profile.</p>
      <div class="gsc-actions">${g.configured?`<button data-gsc="connect">${g.connected?'Reconnect Google':'Connect Google'}</button>`:''}${g.connected?'<button data-gsc="sites">Choose / change property</button><button data-gsc="disconnect">Disconnect</button>':''}<button data-gsc="reload">Refresh connection</button></div>
      ${state.sites.length?`<form id="gsc-property"><label>Search Console property<select name="property" required><option value="">Choose your website</option>${state.sites.map(s=>`<option value="${esc(s.siteUrl)}" ${g.property===s.siteUrl?'selected':''}>${esc(s.siteUrl)}</option>`).join('')}</select></label><button>Use this property</button></form>`:''}
      ${g.property?`<div class="gsc-actions"><label>Reporting period<select id="gsc-days"><option value="28" ${state.days===28?'selected':''}>28 days</option><option value="90" ${state.days===90?'selected':''}>90 days</option></select></label><button data-gsc="report">Load Google performance</button></div><p>Completed search data ending three days ago.</p>`:''}`:'<button data-gsc="reload">Retry connection status</button>'}
      ${r?`<h3>${esc(r.property)}</h3><p>${esc(r.startDate)} – ${esc(r.endDate)} · Loaded ${esc(new Date(r.fetchedAt).toLocaleString())}</p>${r.totals?`<div class="gsc-stats">${[['Clicks',number(r.totals.clicks)],['Impressions',number(r.totals.impressions)],['CTR',number(r.totals.ctr*100)+'%'],['Average position',number(r.totals.position)]].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>`:'<p>No search data available for this property and period. New or low-traffic websites may have no data yet.</p>'}<p>Top 50 queries and pages. Google may omit queries for privacy; table totals may differ from overall totals.</p>${table('Search queries',r.queries)}${table('Pages in search',r.pages)}${table('Daily performance',r.daily)}`:''}`;
    root.setAttribute('aria-busy',String(state.busy));
    root.querySelectorAll('button,input,select').forEach(el=>el.disabled=state.busy);
    root.querySelector('#gsc-days')?.addEventListener('change',e=>{state.days=Number(e.target.value);state.report=null;render();});
    root.querySelector('#gsc-website')?.addEventListener('submit',e=>{e.preventDefault();const website=new FormData(e.target).get('website');run(async()=>{const data=await request('google-website',{website});state.website=data.website;state.google.property=null;state.report=null;state.sites=[];state.message='Website saved. Choose the matching property.';});});
    root.querySelector('#gsc-property')?.addEventListener('submit',e=>{e.preventDefault();const property=new FormData(e.target).get('property');run(async()=>{const data=await request('google-select',{property});state.google.property=data.property;state.report=null;state.sites=[];state.message='Property selected. Load Google performance.';});});
    root.querySelectorAll('[data-gsc]').forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.gsc;
      if(action==='disconnect'&&!confirm('Disconnect Google for this workspace?'))return;
      run(async()=>{
        if(action==='reload'){await load();state.message='Connection status refreshed.';}
        if(action==='connect'){const data=await request('google-start');location.assign(data.url);}
        if(action==='sites'){const data=await request('google-sites');state.sites=data.sites;state.message=data.sites.length?'Choose the property matching your saved website.':'No accessible properties. Verify your site in Google Search Console, then retry.';}
        if(action==='disconnect'){await request('google-disconnect');state.google.connected=false;state.google.property=null;state.report=null;state.sites=[];state.message='Google disconnected from this workspace.';}
        if(action==='report'){state.report=null;state.report=await request('google-performance',{days:state.days});state.message='Google report loaded.';}
      });
    }));
  }
  run(load);
}
