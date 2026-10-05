import { randomBytes } from 'node:crypto';
import { db, fail, hash, encryptToken, decryptToken, googleConfig, jsonFetch } from './seo-shared.js';
export const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const COOKIE = '__Host-youyou-seo-oauth';
const cookie = (value, age=600) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
export function browserCookie(req) {
  return String(req.headers?.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1) || '';
}
export async function startGoogle(req, res, auth) {
  const cfg = googleConfig();
  // OAuth cookies and the callback must share the configured canonical origin.
  if (req.headers?.origin !== cfg.origin) throw fail(`Open ${cfg.origin} to connect Google.`,400);
  const state = randomBytes(32).toString('base64url'), browser = randomBytes(32).toString('base64url');
  await db(`seo_oauth_states?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`,{method:'DELETE'});
  await db('seo_oauth_states',{method:'POST',body:{state_hash:hash(state),browser_hash:hash(browser),company_id:auth.companyId,user_id:auth.userId,expires_at:new Date(Date.now()+600000).toISOString()}});
  res.setHeader('Set-Cookie',cookie(browser));
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({client_id:cfg.clientId,redirect_uri:cfg.redirect,response_type:'code',scope:SCOPE,access_type:'offline',prompt:'consent',state}).toString();
  return {url:url.href};
}
export async function googleCallback(req, res, query) {
  const cfg = googleConfig();
  let result = 'failed';
  try {
    const state = String(query.get('state') || ''), browser = browserCookie(req);
    if (!/^[\w-]{43}$/.test(state) || !/^[\w-]{43}$/.test(browser)) throw fail('Invalid authorization state.');
    // DELETE RETURNING atomically consumes a valid state; replay and a different browser both fail.
    const states = await db(`seo_oauth_states?state_hash=eq.${hash(state)}&browser_hash=eq.${hash(browser)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,{method:'DELETE'});
    const saved = states?.[0];
    if (!saved) throw fail('Authorization expired.');
    const profiles = await db(`profiles?id=eq.${encodeURIComponent(saved.user_id)}&company_id=eq.${encodeURIComponent(saved.company_id)}&select=id&limit=1`);
    if (!profiles?.length) throw fail('Workspace access changed.');
    if (query.get('error')) result = 'cancelled';
    else {
      const code = query.get('code');
      if (!code || code.length > 4096) throw fail('Missing authorization code.');
      const {response,data} = await jsonFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:cfg.clientId,client_secret:cfg.clientSecret,redirect_uri:cfg.redirect,grant_type:'authorization_code'}).toString()});
      if (!response.ok || !data?.refresh_token || !String(data.scope || '').split(' ').includes(SCOPE)) throw fail('Read-only Search Console permission is required.');
      await db('seo_google_connections?on_conflict=company_id',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{company_id:saved.company_id,connected_by:saved.user_id,refresh_token_ciphertext:encryptToken(data.refresh_token,saved.company_id),property:null,updated_at:new Date().toISOString()}});
      result = 'connected';
    }
  } catch { /* No token, code or provider payload is logged or returned. */ }
  res.setHeader('Set-Cookie',cookie('',0));
  res.setHeader('Location',`${cfg.origin}/dashboard/seo-growth?tab=google&google=${result}`);
  return res.status(303).end();
}
export async function connection(companyId) { return (await db(`seo_google_connections?company_id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`))?.[0] || null; }
export async function accessToken(conn) {
  if (!conn) throw fail('Connect Google first.',409);
  const cfg = googleConfig(); let refresh;
  try { refresh = decryptToken(conn.refresh_token_ciphertext,conn.company_id); } catch { throw fail('Reconnect Google to restore access.',409); }
  const {response,data} = await jsonFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:cfg.clientId,client_secret:cfg.clientSecret,grant_type:'refresh_token',refresh_token:refresh}).toString()});
  if (!response.ok || !data?.access_token) throw fail('Google access expired or was revoked. Reconnect Google.',409);
  return data.access_token;
}
export async function googleRequest(token,path,body) {
  const {response,data} = await jsonFetch(`https://www.googleapis.com/webmasters/v3/${path}`,{method:body ? 'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if (!response.ok) throw fail(response.status===403 ? 'Google denied access. Check the Search Console permission and enabled API.' : response.status===429 ? 'Google request limit reached. Try again later.' : 'Google data is temporarily unavailable. Try reconnecting if this continues.', response.status===429 ? 429:502);
  return data || {};
}
export async function sites(token) { return ((await googleRequest(token,'sites')).siteEntry || []).filter(s=>s.permissionLevel !== 'siteUnverifiedUser'); }
export function reportDates(days, now=new Date()) {
  if (![28,90].includes(Number(days))) throw fail('Choose 28 or 90 days.');
  const end = new Date(now); end.setUTCDate(end.getUTCDate()-3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate()-Number(days)+1);
  return {startDate:start.toISOString().slice(0,10),endDate:end.toISOString().slice(0,10)};
}
export async function performance(token,property,days) {
  const dates = reportDates(days);
  const path = `sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const base = {...dates,type:'web',dataState:'final'};
  const [totals,queries,pages,daily] = await Promise.all([
    googleRequest(token,path,base),googleRequest(token,path,{...base,dimensions:['query'],rowLimit:50}),
    googleRequest(token,path,{...base,dimensions:['page'],rowLimit:50}),googleRequest(token,path,{...base,dimensions:['date'],rowLimit:100}),
  ]);
  return {property,...dates,days:Number(days),fetchedAt:new Date().toISOString(),totals:totals.rows?.[0] || null,queries:queries.rows || [],pages:pages.rows || [],daily:daily.rows || []};
}
