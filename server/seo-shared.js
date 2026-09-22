import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(String(value)).digest('hex');
export function fail(message, status = 400) { const e = new Error(message); e.status = status; return e; }
export function config(env = process.env) {
  const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw fail('SEO storage is not configured. Contact the workspace administrator.', 503);
  return {url, key};
}
export async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {...options, signal:AbortSignal.timeout(15000)});
  const data = await response.json().catch(()=>null);
  return {response, data};
}
export async function db(path, {method='GET', body, prefer='return=representation'} = {}, conf = config()) {
  const {response, data} = await jsonFetch(`${conf.url}/rest/v1/${path}`, {method, headers:{apikey:conf.key, Authorization:`Bearer ${conf.key}`, 'Content-Type':'application/json', Prefer:prefer}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
  if (!response.ok) throw fail('SEO storage is unavailable. Check that the SEO database migration has been applied.', 503);
  return data;
}
export async function authenticate(req) {
  const token = String(req.headers?.authorization || '').match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) throw fail('Sign in to use SEO.', 401);
  const conf = config();
  const {response, data:user} = await jsonFetch(`${conf.url}/auth/v1/user`, {headers:{apikey:conf.key,Authorization:`Bearer ${token}`}});
  if (!response.ok || !user?.id) throw fail('Your session expired. Sign in again.', 401);
  const profiles = await db(`profiles?id=eq.${encodeURIComponent(user.id)}&select=company_id&limit=1`, {}, conf);
  if (!profiles?.[0]?.company_id) throw fail('Workspace access is unavailable.',403);
  return {companyId:profiles[0].company_id, userId:user.id};
}
export async function limit(companyId, action, max=10, seconds=60) {
  const allowed = await db('rpc/seo_consume_limit', {method:'POST',body:{p_company:companyId,p_action:action,p_limit:max,p_seconds:seconds}});
  if (allowed !== true) throw fail('Too many requests. Please wait before trying again.',429);
}
export function parseBody(req) {
  if (Buffer.byteLength(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})) > 150000) throw fail('Request is too large.',413);
  try { return typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}; } catch { throw fail('Invalid request.'); }
}
function encryptionKey(env) {
  const key = Buffer.from(env.SEO_TOKEN_ENCRYPTION_KEY || '', 'base64');
  if (key.length !== 32) throw fail('Google connection is not configured yet.',503);
  return key;
}
export function encryptToken(token, companyId, env=process.env) {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm',encryptionKey(env),iv);
  cipher.setAAD(Buffer.from(companyId));
  const bytes = Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);
  return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),bytes.toString('base64url')].join('.');
}
export function decryptToken(value, companyId, env=process.env) {
  const [version,iv,tag,bytes] = String(value).split('.');
  if (version !== 'v1' || !bytes) throw fail('Reconnect Google to restore access.',409);
  const decipher = createDecipheriv('aes-256-gcm',encryptionKey(env),Buffer.from(iv,'base64url'));
  decipher.setAAD(Buffer.from(companyId)); decipher.setAuthTag(Buffer.from(tag,'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(bytes,'base64url')),decipher.final()]).toString('utf8');
}
export function googleConfig(env=process.env) {
  let origin;
  try { origin = new URL(env.APP_ORIGIN).origin; } catch { throw fail('Google connection is not configured yet.',503); }
  if (!origin.startsWith('https://') || !env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || !env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET) throw fail('Google connection is not configured yet.',503);
  encryptionKey(env);
  return {origin, redirect:`${origin}/api/seo`, clientId:env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,clientSecret:env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET};
}
export function sendError(res,error) { return res.status(error.status || 500).json({error:error.status ? error.message : 'SEO could not complete this request. Please try again.'}); }
