import { bearerToken, supabaseConfig } from '../../server/stripe-shared.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isOwner(id, configured = process.env.OWNER_USER_IDS || '') {
  return uuid.test(String(id)) && configured.split(',').map(s => s.trim().toLowerCase())
    .filter(s => uuid.test(s)).includes(String(id).toLowerCase());
}
const get = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(8000) });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'sign_in_required' });
  try {
    const config = supabaseConfig();
    const auth = await get(`${config.url}/auth/v1/user`, { headers: { apikey: config.key, Authorization: `Bearer ${token}` } });
    if (!auth.ok) return res.status(401).json({ error: 'sign_in_required' });
    const user = await auth.json();
    // Never trust client metadata, profile roles, email addresses or query IDs.
    if (!isOwner(user.id)) return res.status(403).json({ error: 'owner_access_required' });
    const resource = req.query?.resource || 'users';
    const page = Number(req.query?.page || 1);
    if (!['users', 'companies'].includes(resource) || !Number.isInteger(page) || page < 1 || page > 10000) {
      return res.status(400).json({ error: 'invalid_request' });
    }
    // The service credential is acquired only AFTER server-verified authorization.
    const { url, key } = supabaseConfig({ service: true });
    const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
    async function count(table, filter = '') {
      const response = await get(`${url}/rest/v1/${table}?select=id${filter}`, { method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' } });
      if (!response.ok) return null;
      const total = response.headers.get('content-range')?.split('/')[1];
      return /^\d+$/.test(total || '') ? Number(total) : null;
    }
    const [profiles, companies, publishedPages] = await Promise.all([
      count('profiles'), count('companies'), count('landing_pages', '&status=eq.published')
    ]);
    let rows, hasMore;
    if (resource === 'users') {
      const response = await get(`${url}/auth/v1/admin/users?page=${page}&per_page=20`, { headers });
      if (!response.ok) throw new Error('users_unavailable');
      const payload = await response.json();
      if (!Array.isArray(payload.users)) throw new Error('invalid_users');
      rows = payload.users.map(u => ({ id: u.id, email: u.email || '', created_at: u.created_at || null, last_sign_in_at: u.last_sign_in_at || null }));
      hasMore = Number.isFinite(payload.last_page) ? page < payload.last_page : rows.length === 20;
    } else {
      const response = await get(`${url}/rest/v1/companies?select=id,name,stripe_connect_status&order=id.asc&limit=21&offset=${(page - 1) * 20}`, { headers });
      if (!response.ok) throw new Error('companies_unavailable');
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error('invalid_companies');
      hasMore = payload.length > 20;
      rows = payload.slice(0,20).map(c => ({ id:c.id, name:c.name, stripe_connect_status:c.stripe_connect_status || 'not_connected' }));
    }
    return res.status(200).json({ counts: { profiles, companies, publishedPages }, resource, page, hasMore, rows, updatedAt: new Date().toISOString() });
  } catch (_) {
    // No tokens, provider payloads, customer data or secrets in logs/errors.
    return res.status(503).json({ error: 'owner_data_unavailable' });
  }
}
