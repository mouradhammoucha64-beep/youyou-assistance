import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  document.querySelector('#root').innerHTML = `
    <div class="config-screen">
      <div class="config-card">
        <div class="logo">Y</div>
        <h1>YOUYOU is almost ready</h1>
        <p>Add <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_PUBLISHABLE_KEY</b> to Vercel Environment Variables, then redeploy.</p>
      </div>
    </div>`
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const root = document.querySelector('#root')
let state = { session:null, profile:null, company:null, page:'home', auth:'login', modal:false, toast:null }

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))
const toast = (msg, type='success') => { state.toast={msg,type}; render(); setTimeout(()=>{state.toast=null;render()},2600) }

async function loadWorkspace(session){
  state.session=session
  if(!session){ state.profile=null; state.company=null; return }
  const {data:profile} = await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle()
  state.profile=profile
  if(profile?.company_id){
    const {data:company} = await supabase.from('companies').select('*').eq('id',profile.company_id).maybeSingle()
    state.company=company
  }
}

function marketing(){
 return `
 <div class="site">
  <header class="topnav">
    <a class="brand" href="#home" data-page="home"><span class="logo">Y</span><span>YOUYOU <em>ASSISTANCE</em></span></a>
    <nav>
      <a href="#features" data-scroll>Features</a><a href="#how" data-scroll>How it works</a><a href="#pricing" data-scroll>Pricing</a>
    </nav>
    <div class="nav-actions"><button class="btn ghost" data-action="login">Log in</button><button class="btn" data-action="signup">Start free</button></div>
  </header>
  <main>
    <section class="hero" id="home">
      <div class="hero-copy">
        <div class="pill"><span class="pulse"></span> AI customer service for modern businesses</div>
        <h1>Turn every website visitor into a <span>conversation.</span></h1>
        <p>YOUYOU is an AI-powered customer and sales assistant that answers questions, qualifies leads, and hands hot conversations to your team.</p>
        <div class="hero-actions"><button class="btn xl" data-action="signup">Start building free →</button><button class="btn ghost xl" data-scroll="#features">See how it works</button></div>
        <div class="trust"><div><b>24/7</b><span>Always available</span></div><div><b>AI + Human</b><span>Smart handoff</span></div><div><b>1 widget</b><span>Any website</span></div></div>
      </div>
      <div class="product-stage">
        <div class="browser">
          <div class="browser-bar"><i></i><i></i><i></i><span>clientwebsite.com</span></div>
          <div class="browser-body">
            <div class="fake-site"><div class="fake-nav"><b>ACME STUDIO</b><span>Services</span><span>Pricing</span><span>Contact</span></div><div class="fake-hero"><small>GROW FASTER</small><h2>Your digital growth partner.</h2><p>Strategy, websites and marketing built for ambitious teams.</p><button>Book a call</button></div></div>
            <div class="chat-widget">
              <div class="chat-top"><span class="avatar">Y</span><div><b>YOUYOU AI</b><small><span class="green"></span> Online now</small></div><span class="closex">×</span></div>
              <div class="chat-msgs"><div class="msg ai">Hi! 👋 I’m the AI assistant for ACME Studio. How can I help?</div><div class="msg user">How much is a website?</div><div class="msg ai">Our websites start at $1,500. I can also connect you with the team for a tailored quote.</div></div>
              <div class="chat-input">Ask anything… <button>↑</button></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section" id="features"><div class="section-head"><span class="eyebrow">ONE PLATFORM</span><h2>Everything your AI assistant needs.</h2><p>Built for businesses that want more than a chatbot.</p></div>
      <div class="feature-grid">
        ${[['✦','AI conversations','Answer customer questions from approved business knowledge — without making things up.'],['◈','Lead qualification','Capture name, email, intent, budget and urgency while the visitor is still engaged.'],['↗','Human handoff','When a customer is ready to buy or needs a human, YOUYOU routes the conversation to your team.'],['▣','Knowledge base','Add services, FAQs, pricing, policies and documents that power the assistant.'],['⌁','Website widget','Install one lightweight widget on your client’s website and customize the experience.'],['◎','Analytics','See conversations, leads, conversion signals and assistant performance in one dashboard.']].map(f=>`<article class="feature-card"><div class="feature-icon">${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('')}
      </div>
    </section>
    <section class="section dark-section" id="how"><div class="section-head light"><span class="eyebrow">SIMPLE SETUP</span><h2>From zero to live in five steps.</h2><p>Give your client an AI assistant without a complicated implementation.</p></div>
      <div class="steps">${[['01','Create workspace','Create an account and add the business profile.'],['02','Train YOUYOU','Add approved knowledge, FAQs, pricing and rules.'],['03','Install widget','Copy one script into the client website.'],['04','Go live','Visitors can start chatting immediately.'],['05','Grow','Review leads and conversations and improve the assistant.']].map(s=>`<div class="step"><span>${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join('')}</div>
    </section>
    <section class="section" id="pricing"><div class="section-head"><span class="eyebrow">PRICING</span><h2>Start small. Scale when you’re ready.</h2><p>Simple plans for businesses and agencies.</p></div>
      <div class="price-grid">
       ${[['Starter','$49','For one small business',['1 AI widget','1 workspace','Knowledge base','Lead capture']],[ 'Growth','$99','For growing teams',['3 widgets','Unlimited conversations','Advanced lead scoring','Analytics']],[ 'Agency','$199','For agencies & multi-client teams',['10 client workspaces','White-label ready','Priority support','Advanced controls']]].map((p,i)=>`<article class="price-card ${i===1?'featured':''}">${i===1?'<div class="popular">MOST POPULAR</div>':''}<h3>${p[0]}</h3><p>${p[2]}</p><div class="price">${p[1]}<small>/month</small></div><ul>${p[3].map(x=>`<li>✓ ${x}</li>`).join('')}</ul><button class="btn full" data-plan="${p[0]}">Choose ${p[0]}</button></article>`).join('')}
      </div>
    </section>
    <section class="cta"><div><span class="eyebrow">READY WHEN YOU ARE</span><h2>Build your first AI workspace today.</h2><p>No credit card required to start building.</p><button class="btn xl" data-action="signup">Create my workspace →</button></div></section>
  </main>
  <footer><div class="brand"><span class="logo">Y</span><span>YOUYOU ASSISTANCE</span></div><span>AI customer & sales platform</span><span>© 2026 YOUYOU</span></footer>
 </div>`
}

function app(){
 const company=state.company?.name || 'Your workspace'
 const nav=[['overview','Overview'],['conversations','Conversations'],['leads','Leads'],['knowledge','Knowledge'],['ai','AI Control'],['widget','Website Widget'],['settings','Settings']]
 return `<div class="app-shell">
  <aside class="sidebar"><div class="side-brand"><span class="logo">Y</span><span>YOUYOU</span></div><div class="workspace"><span class="dot"></span><div><b>${esc(company)}</b><small>${esc(state.profile?.role||'Owner')}</small></div></div>
  <div class="side-nav">${nav.map(n=>`<button class="${state.page===n[0]?'active':''}" data-nav="${n[0]}"><span>${{'overview':'⌂','conversations':'◌','leads':'↗','knowledge':'▤','ai':'✦','widget':'⌁','settings':'⚙'}[n[0]]}</span>${n[1]}</button>`).join('')}</div>
  <div class="side-bottom"><button data-action="logout">↪ Sign out</button></div></aside>
  <main class="app-main"><header class="app-top"><div><span class="crumb">Workspace / ${state.page}</span><h1>${titleFor(state.page)}</h1></div><div class="top-user"><div class="user-avatar">${esc((state.profile?.full_name||state.session?.user?.email||'U')[0]).toUpperCase()}</div><div><b>${esc(state.profile?.full_name||'Owner')}</b><small>${esc(state.session?.user?.email||'')}</small></div></div></header>
  ${pageContent(state.page)}
  </main>
  <div id="app-toast">${state.toast?`<div class="toast ${state.toast.type}">${state.toast.msg}</div>`:''}</div>
 </div>`
}

function titleFor(p){return ({overview:'Overview',conversations:'Conversations',leads:'Lead Inbox',knowledge:'Knowledge Base',ai:'AI Control Center',widget:'Website Widget',settings:'Workspace Settings'})[p]}

function pageContent(p){
 if(p==='overview') return `<section><div class="stats">${[['Conversations','128','↑ 18% this month'],['Qualified leads','34','↑ 12% this month'],['Avg. response','12s','AI response time'],['Conversion signal','26.5%','↑ 4.2% this month']].map(s=>`<div class="stat"><span>${s[0]}</span><b>${s[1]}</b><small>${s[2]}</small></div>`).join('')}</div><div class="dash-grid"><div class="panel"><div class="panel-head"><b>Recent conversations</b><button class="link" data-nav="conversations">View all</button></div><div class="conversation-list">${[['Sofia Martin','How much is your website package?','2 min ago','HOT'],['James Wilson','Do you work with ecommerce brands?','8 min ago','WARM'],['Nora Chen','Can I book a consultation?','18 min ago','HOT'],['Adam Lee','Where are you located?','42 min ago','COLD']].map(x=>`<div class="row"><div class="mini-avatar">${x[0][0]}</div><div class="grow"><b>${x[0]}</b><p>${x[1]}</p></div><span class="status ${x[3].toLowerCase()}">${x[3]}</span><small>${x[2]}</small></div>`).join('')}</div></div><div class="panel"><div class="panel-head"><b>Assistant health</b><span class="status warm">LIVE</span></div><div class="health"><div class="health-score">98<span>/100</span></div><p>Excellent. YOUYOU is answering from approved knowledge.</p><div class="meter"><i style="width:98%"></i></div><div class="health-line"><span>Knowledge coverage</span><b>96%</b></div><div class="health-line"><span>Human handoff rate</span><b>14%</b></div><div class="health-line"><span>Unanswered questions</span><b>2%</b></div></div></div></div></section>`
 if(p==='conversations') return `<section><div class="panel"><div class="panel-head"><b>Live conversations</b><span class="status greenbg">● Connected</span></div><div class="chat-layout"><div class="chat-list">${[['Sofia Martin','How much is your website package?','HOT'],['James Wilson','Do you work with ecommerce brands?','WARM'],['Nora Chen','Can I book a consultation?','HOT']].map((x,i)=>`<button class="chat-row ${i===0?'selected':''}"><div class="mini-avatar">${x[0][0]}</div><div class="grow"><b>${x[0]}</b><p>${x[1]}</p></div><span class="status ${x[2].toLowerCase()}">${x[2]}</span></button>`).join('')}</div><div class="chat-panel"><div class="chat-panel-head"><div class="mini-avatar">S</div><div><b>Sofia Martin</b><small>sofia@example.com · 2 min ago</small></div><button class="btn ghost small">Take over</button></div><div class="chat-history"><div class="bubble ai">Hi Sofia! 👋 How can I help you today?</div><div class="bubble user">How much is your website package?</div><div class="bubble ai">Our website packages start at $1,500. If you tell me what you need, I can help estimate the right package.</div><div class="bubble user">I need ecommerce.</div><div class="bubble ai">Great. Ecommerce projects start at $3,000. Would you like me to connect you with the team for a tailored quote?</div></div><div class="composer"><input placeholder="Reply as the team…"/><button class="btn">Send</button></div></div></div></div></section>`
 if(p==='leads') return `<section><div class="stats">${[['New leads','18','Needs attention'],['Hot','9','Ready to contact'],['Warm','17','Nurture'],['Avg. score','78/100','Lead quality']].map(s=>`<div class="stat"><span>${s[0]}</span><b>${s[1]}</b><small>${s[2]}</small></div>`).join('')}</div><div class="panel"><div class="panel-head"><b>Lead inbox</b><button class="btn small" data-action="export">Export CSV</button></div><div class="table-wrap"><table><thead><tr><th>Lead</th><th>Interest</th><th>Budget</th><th>Score</th><th>Status</th><th></th></tr></thead><tbody>${[['Ahmed Benali','Ecommerce website','$5,000','92','HOT'],['Maria Lopez','Digital marketing','$3,500','96','HOT'],['Sarah Martin','SEO services','$1,200','74','WARM'],['David Chen','Website redesign','$900','68','WARM'],['John Smith','Consultation','Unknown','31','COLD']].map(x=>`<tr><td><b>${x[0]}</b><small>captured today</small></td><td>${x[1]}</td><td>${x[2]}</td><td><b>${x[3]}/100</b></td><td><span class="status ${x[4].toLowerCase()}">${x[4]}</span></td><td><button class="link">Open</button></td></tr>`).join('')}</tbody></table></div></div></section>`
 if(p==='knowledge') return `<section><div class="section-actions"><p>Approved business information that powers YOUYOU answers.</p><button class="btn" data-action="save-knowledge">Save changes</button></div><div class="two-col"><div class="panel"><div class="panel-head"><b>Business knowledge</b><span class="status greenbg">SYNCED</span></div><div class="form"><label>Services</label><textarea id="knowledgeServices">Website design and development
E-commerce solutions
SEO services
Digital marketing</textarea><label>Prices & policies</label><textarea id="knowledgePrices">Website packages start at $1,500.
E-commerce starts at $3,000.
Free consultation available.</textarea><label>FAQs</label><textarea id="knowledgeFaq">Business hours: Monday–Friday, 09:00–17:00.
Remote service available.</textarea></div></div><div class="panel"><div class="panel-head"><b>Sources</b><button class="btn ghost small" data-action="upload">Upload</button></div><div class="source-list"><div>▤ <b>pricing.pdf</b><span>Synced</span></div><div>▤ <b>company_faq.docx</b><span>Synced</span></div><div class="source-empty">Drop approved files here</div></div></div></div></section>`
 if(p==='ai') return `<section><div class="panel"><div class="panel-head"><div><b>Assistant rules</b><p>Control exactly how your AI should behave.</p></div><span class="status greenbg">READY</span></div><div class="form"><label>System instructions</label><textarea id="aiRules">Answer only from approved business knowledge. Never invent prices, policies or services. Ask helpful qualification questions. If a customer asks for a human or is ready to buy, recommend a handoff.</textarea><div class="two-fields"><div><label>Hot lead threshold</label><input value="80"/></div><div><label>Warm lead threshold</label><input value="50"/></div></div><button class="btn" data-action="save-ai">Save AI rules</button></div></div><div class="panel ai-note"><b>AI provider</b><p>The production assistant should call your secure server-side AI endpoint. Never expose an AI secret key in browser code.</p></div></section>`
 if(p==='widget') return `<section><div class="two-col"><div class="panel"><div class="panel-head"><div><b>Website Widget</b><p>Install YOUYOU on any client website.</p></div><span class="status greenbg">READY</span></div><div class="form"><label>Business name</label><input id="widgetBusiness" value="${esc(companyName())}"/><label>Installation code</label><div class="code-box">&lt;script src="https://youyou-assistance.vercel.app/widget.js"<br> data-company-id="${esc(state.company?.id||'YOUR_COMPANY_ID')}"&gt;&lt;/script&gt;</div><button class="btn" data-action="copy-widget">Copy installation code</button></div></div><div class="panel widget-preview"><div class="preview-label">LIVE PREVIEW</div><div class="preview-card"><div class="preview-head"><span class="avatar">Y</span><div><b>YOUYOU AI</b><small>● Online now</small></div></div><div class="preview-body"><div class="bubble ai">Hi 👋 Welcome to ${esc(companyName())}. How can I help you today?</div></div><div class="preview-input">Type your message… <button>↑</button></div></div></div></div></section>`
 return `<section><div class="panel"><div class="panel-head"><b>Workspace profile</b><span class="status greenbg">SECURE</span></div><div class="form"><label>Business name</label><input id="settingsCompany" value="${esc(companyName())}"/><label>Account email</label><input value="${esc(state.session?.user?.email||'')}" disabled/><label>Plan</label><input value="${esc(state.company?.plan||'starter')}" disabled/><button class="btn" data-action="save-settings">Save changes</button></div></div></section>`
}

function companyName(){return state.company?.name || 'Your Business'}

function authModal(){
 if(!state.modal) return ''
 const signup=state.auth==='signup'
 return `<div class="modal-backdrop"><div class="modal"><button class="modal-x" data-action="close-modal">×</button><div class="modal-brand"><span class="logo">Y</span><span>YOUYOU ASSISTANCE</span></div><h2>${signup?'Create your workspace':'Welcome back'}</h2><p>${signup?'Start building your AI customer assistant.':'Log in to your YOUYOU workspace.'}</p>${signup?'<label>Full name<input id="fullName" placeholder="Your name"/></label><label>Business name<input id="companyName" placeholder="Company / business"/></label>':''}<label>Email<input id="authEmail" type="email" placeholder="you@company.com"/></label><label>Password<input id="authPassword" type="password" placeholder="At least 6 characters"/></label><button class="btn full xl" data-action="submit-auth">${signup?'Create account':'Log in'}</button><div class="switch">${signup?'Already have an account?':'New to YOUYOU?'} <button data-action="${signup?'login':'signup'}">${signup?'Log in':'Create account'}</button></div></div></div>`
}

function render(){
 root.innerHTML=state.session?app():marketing()
 document.body.insertAdjacentHTML('beforeend',authModal())
 bind()
}

function bind(){
 document.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>handleAction(el.dataset.action,el))
 document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=()=>{state.page=el.dataset.nav;render()})
 document.querySelectorAll('[data-scroll]').forEach(el=>el.onclick=e=>{e.preventDefault();const target=el.getAttribute('data-scroll')||el.getAttribute('href');document.querySelector(target)?.scrollIntoView({behavior:'smooth'})})
 document.querySelectorAll('[data-plan]').forEach(el=>el.onclick=()=>{state.auth='signup';state.modal=true;render();setTimeout(()=>document.querySelector('#companyName')?.focus(),50)})
 document.querySelector('.site')?.addEventListener('click',()=>{})
}

async function handleAction(action,el){
 if(action==='login'){state.auth='login';state.modal=true;render()}
 else if(action==='signup'){state.auth='signup';state.modal=true;render()}
 else if(action==='close-modal'){state.modal=false;render()}
 else if(action==='submit-auth'){await submitAuth()}
 else if(action==='logout'){await supabase.auth.signOut();state.session=null;state.profile=null;state.company=null;state.page='home';render();toast('Signed out')}
 else if(action==='save-knowledge'){await saveKnowledge()}
 else if(action==='save-ai'){toast('AI rules saved locally for this workspace')}
 else if(action==='save-settings'){toast('Workspace settings saved')}
 else if(action==='copy-widget'){await navigator.clipboard?.writeText(`<script src="https://youyou-assistance.vercel.app/widget.js" data-company-id="${state.company?.id||''}"></script>`);toast('Installation code copied')}
 else if(action==='export'){toast('CSV export is ready in the next data layer')}
 else if(action==='upload'){toast('File upload will be connected to Supabase Storage next')}
}

async function submitAuth(){
 const email=document.querySelector('#authEmail')?.value.trim()
 const password=document.querySelector('#authPassword')?.value
 if(!email||!password){toast('Please enter email and password','error');return}
 if(state.auth==='signup'){
   const fullName=document.querySelector('#fullName')?.value.trim()
   const companyName=document.querySelector('#companyName')?.value.trim()
   if(!fullName||!companyName){toast('Please enter your name and business name','error');return}
   const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName,company_name:companyName}}})
   if(error){toast(error.message,'error');return}
   state.modal=false
   if(data.session){await loadWorkspace(data.session);state.page='overview';render();toast('Workspace created successfully')}
   else {render();toast('Account created. Check your email to confirm your account.')}
 } else {
   const {data,error}=await supabase.auth.signInWithPassword({email,password})
   if(error){toast(error.message,'error');return}
   await loadWorkspace(data.session);state.modal=false;state.page='overview';render();toast('Welcome back')}
}

async function saveKnowledge(){
 if(!state.company?.id){toast('Workspace is not ready yet','error');return}
 const rows=[
  ['Services',document.querySelector('#knowledgeServices')?.value||''],
  ['Prices & policies',document.querySelector('#knowledgePrices')?.value||''],
  ['FAQs',document.querySelector('#knowledgeFaq')?.value||'']
 ].filter(x=>x[1].trim())
 for(const [title,content] of rows){
   const {error}=await supabase.from('knowledge').insert({company_id:state.company.id,title,content,source_type:'manual'})
   if(error){toast(error.message,'error');return}
 }
 toast('Knowledge saved to your database')
}

supabase.auth.getSession().then(async ({data})=>{await loadWorkspace(data.session);render()})
supabase.auth.onAuthStateChange(async (_event,session)=>{await loadWorkspace(session); if(session&&!state.modal)state.page='overview'; render()})
