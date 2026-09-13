import { supabaseConfig } from './stripe-shared.js';

// A valid Stripe signature identifies the event source, not the YOUYOU tenant.
export async function checkoutOrderOwner(event, session) {
  const account = String(event.account || '');
  const companyId = String(session.metadata?.company_id || '');
  const pageId = String(session.metadata?.landing_page_id || '');
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!/^acct_[A-Za-z0-9]+$/.test(account) || !/^cs_[A-Za-z0-9_]+$/.test(session.id || '') || !uuid.test(companyId) || !uuid.test(pageId)) return null;
  const {url, key} = supabaseConfig({service:true});
  async function lookup(query) {
    const response = await fetch(`${url}/rest/v1/${query}`, {headers:{apikey:key, Accept:'application/json'}});
    if (!response.ok) throw new Error(`Order ownership lookup failed (${response.status}).`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Invalid order ownership response.');
    return rows[0] || null;
  }
  const existing = await lookup(`stripe_orders?checkout_session_id=eq.${encodeURIComponent(session.id)}&select=company_id,landing_page_id,connected_account_id&limit=1`);
  if (existing) {
    // Historical orders keep their original merchant even after a reconnection.
    return existing.company_id === companyId && existing.landing_page_id === pageId && existing.connected_account_id === account
      ? existing : null;
  }
  const company = await lookup(`companies?id=eq.${companyId}&stripe_account_id=eq.${encodeURIComponent(account)}&select=id,stripe_account_id&limit=1`);
  if (company?.id !== companyId || company.stripe_account_id !== account) return null;
  const page = await lookup(`landing_pages?id=eq.${pageId}&company_id=eq.${companyId}&select=id,company_id&limit=1`);
  if (page?.id !== pageId || page.company_id !== companyId) return null;
  return {company_id:companyId, landing_page_id:pageId, connected_account_id:account};
}
