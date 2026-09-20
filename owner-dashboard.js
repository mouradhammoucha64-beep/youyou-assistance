import './owner-dashboard.css';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-US',{dateStyle:'medium'}).format(new Date(value)) : 'Never';
const number = value => Number.isFinite(value) ? new Intl.NumberFormat('en-US').format(value) : 'Unavailable';

export async function renderOwnerDashboard(client, root = document.querySelector('#app')) {
  document.title = 'Owner workspace — YOUYOU';
  let resource = 'users', page = 1, request = 0;
  root.innerHTML = `<div class="owner-app">
    <aside class="owner-sidebar" aria-label="Owner navigation">
      <a class="owner-brand" href="/">YOU<span>YOU</span><i></i></a>
      <span class="owner-caption">PLATFORM MANAGEMENT</span>
      <a href="#owner-overview" class="owner-nav-active">Overview <span>↗</span></a>
      <a href="#owner-directory">Accounts & workspaces</a>
      <a href="#owner-billing">Subscriptions</a>
      <div class="owner-sidebar-bottom"><span class="owner-owner-badge">OWNER ACCESS</span><a href="/dashboard/overview">← Merchant workspace</a><a href="/">View website ↗</a></div>
    </aside>
    <main class="owner-main" id="owner-overview">
      <header class="owner-top"><span>YOUYOU <span class="owner-divider">/</span> Owner workspace</span><span class="owner-private">Private workspace</span></header>
      <section class="owner-heading"><div><span class="owner-eyebrow">YOUR PLATFORM, AT A GLANCE</span><h1>A clearer view of YOUYOU.</h1><p>Keep track of the people and workspaces building with you.</p></div><button id="owner-refresh" class="owner-primary" type="button">Refresh data ↻</button></section>
      <div id="owner-feedback" role="status" aria-live="polite"></div>
      <div id="owner-content" hidden>
        <section class="owner-metrics" aria-label="Platform totals">
          <article><span>WORKSPACES</span><strong id="owner-company-count">—</strong><small>Companies on your platform</small><i>▦</i></article>
          <article><span>MEMBER PROFILES</span><strong id="owner-profile-count">—</strong><small>Provisioned application profiles</small><i>◎</i></article>
          <article><span>PUBLISHED PAGES</span><strong id="owner-page-count">—</strong><small>Pages marked as published</small><i>↗</i></article>
        </section>
        <section class="owner-directory" id="owner-directory">
          <div class="owner-section-head"><div><span class="owner-eyebrow">YOUR COMMUNITY</span><h2>Accounts & workspaces</h2></div><span id="owner-updated" class="owner-updated"></span></div>
          <div class="owner-toolbar"><div class="owner-tabs" role="group" aria-label="Directory type"><button data-resource="users" aria-pressed="true">Registered accounts</button><button data-resource="companies" aria-pressed="false">Workspaces</button></div><span class="owner-list-note">20 results per page</span></div>
          <div id="owner-records" aria-busy="false"></div>
          <div class="owner-pagination"><span id="owner-page-label"></span><div><button id="owner-prev" type="button">← Previous</button><button id="owner-next" type="button">Next →</button></div></div>
        </section>
        <section id="owner-billing" class="owner-billing"><div class="owner-billing-icon">◇</div><div><span class="owner-eyebrow">YOUYOU SUBSCRIPTIONS</span><h2>Connect billing when you are ready.</h2><p>Starter $29 · Growth $59 · Pro $99 per month. Subscription billing is not connected yet. Merchant payments and refunds are managed separately.</p></div><span class="owner-status">Not connected</span></section>
        <footer class="owner-footer">Read-only overview · Account changes and financial actions are not available here.</footer>
      </div>
    </main>
  </div>`;
  const $ = id => root.querySelector(id);
  const feedback = $('#owner-feedback');
  function controls(disabled) { root.querySelectorAll('button').forEach(b => b.disabled = disabled); }
  async function load() {
    const run = ++request;
    controls(true); $('#owner-content').hidden = true;
    feedback.textContent = 'Loading your platform overview…'; feedback.className = 'owner-feedback';
    try {
      const { data, error } = client ? await client.auth.getSession() : { data: null };
      if (error || !data?.session) throw new Error('sign_in_required');
      const response = await fetch(`/api/owner/overview?resource=${resource}&page=${page}`, { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache:'no-store', signal:AbortSignal.timeout(15000) });
      const body = await response.json();
      if (run !== request) return;
      if (!response.ok) throw new Error(body.error || 'owner_data_unavailable');
      $('#owner-company-count').textContent = number(body.counts.companies);
      $('#owner-profile-count').textContent = number(body.counts.profiles);
      $('#owner-page-count').textContent = number(body.counts.publishedPages);
      const users = resource === 'users';
      $('#owner-records').innerHTML = body.rows.length ? `<table><thead><tr><th>${users?'Account':'Workspace'}</th><th>${users?'Registered':'Merchant Stripe'}</th><th>${users?'Last sign-in':'Workspace ID'}</th></tr></thead><tbody>${body.rows.map(row => `<tr><td data-label="${users?'Account':'Workspace'}"><div class="owner-identity"><span class="owner-avatar">${escape((users?row.email:row.name)?.slice(0,1).toUpperCase() || 'Y')}</span><div><strong>${escape((users?row.email:row.name)||'Unnamed')}</strong>${users?`<small>${escape(row.id)}</small>`:''}</div></div></td><td data-label="${users?'Registered':'Merchant Stripe'}">${users?escape(date(row.created_at)):`<span class="owner-status">${escape(String(row.stripe_connect_status).replaceAll('_',' '))}</span>`}</td><td data-label="${users?'Last sign-in':'Workspace ID'}">${users?escape(date(row.last_sign_in_at)):escape(row.id)}</td></tr>`).join('')}</tbody></table>` : '<div class="owner-empty">No records on this page.</div>';
      $('#owner-page-label').textContent = `Page ${page}`;
      $('#owner-updated').textContent = `Updated ${new Intl.DateTimeFormat('en-US',{timeStyle:'short'}).format(new Date(body.updatedAt))}`;
      $('#owner-content').hidden = false;
      feedback.textContent = Object.values(body.counts).some(v=>v===null) ? 'Some totals are unavailable. Refresh to try again.' : '';
      controls(false); $('#owner-prev').disabled = page === 1; $('#owner-next').disabled = !body.hasMore;
    } catch (error) {
      if (run !== request) return;
      const messages = {sign_in_required:'Sign in to your YOUYOU owner account to continue.', owner_access_required:'This account does not have owner access.', owner_data_unavailable:'Platform data is temporarily unavailable. Please try again.'};
      feedback.textContent = messages[error.message] || messages.owner_data_unavailable;
      feedback.className = 'owner-feedback owner-error';
      $('#owner-records').replaceChildren();
      if (error.message === 'sign_in_required') { const a = document.createElement('a'); a.href='/'; a.textContent='Go to sign in →'; feedback.append(a); }
      $('#owner-refresh').disabled = false;
    }
  }
  $('#owner-refresh').onclick = load;
  $('#owner-prev').onclick = () => { page=Math.max(1,page-1); load(); };
  $('#owner-next').onclick = () => { page++; load(); };
  root.querySelectorAll('[data-resource]').forEach(button=>button.onclick=()=>{
    resource=button.dataset.resource;page=1;
    root.querySelectorAll('[data-resource]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    load();
  });
  // Clear sensitive owner data immediately when the session ends.
  client?.auth.onAuthStateChange(event=>{ if(event==='SIGNED_OUT') { request++; $('#owner-content').hidden=true; $('#owner-records').replaceChildren(); feedback.textContent='You have signed out.'; } });
  await load();
}
