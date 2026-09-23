import { authenticate, db, limit, parseBody, googleSetupIssues, sendError, fail } from '../server/seo-shared.js';
import { startGoogle, googleCallback, connection, accessToken, sites, performance } from '../server/seo-google.js';
import { normalizeSettings, normalizeDraft, propertyMatchesWebsite } from '../shared/seo-model.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  const query = new URL(req.url,'https://youyouapp.com').searchParams;
  try {
    if (req.method === 'GET' && (query.has('code') || query.has('state') || query.has('error'))) return await googleCallback(req,res,query);
    if (!['GET','POST'].includes(req.method)) {res.setHeader('Allow','GET, POST');throw fail('Method not allowed.',405);}
    const auth = await authenticate(req);
    const body = req.method === 'POST' ? parseBody(req) : {};
    const action = req.method === 'GET' ? 'load' : body.action;
    const filter = `company_id=eq.${encodeURIComponent(auth.companyId)}`;
    await limit(auth.companyId,'seo-api',60);
    if (action === 'load') {
      const [workspaces,audits,drafts,conn] = await Promise.all([
        db(`seo_workspaces?${filter}&select=settings,updated_at&limit=1`),
        db(`seo_audits?${filter}&select=id,url,result,created_at&order=created_at.desc&limit=20`),
        db(`seo_drafts?${filter}&select=draft,updated_at&order=updated_at.desc&limit=30`),connection(auth.companyId),
      ]);
      const setupIssues=googleSetupIssues();
      return res.status(200).json({settings:workspaces?.[0]?.settings || null,drafts:drafts || [],audits:audits || [],google:{configured:setupIssues.length===0,setupIssues,connected:Boolean(conn),property:conn?.property || null}});
    }
    if (action === 'save-settings') {
      const settings = normalizeSettings(body.settings);
      await db('seo_workspaces?on_conflict=company_id',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{company_id:auth.companyId,settings,updated_at:new Date().toISOString()}});
      return res.status(200).json({settings});
    }
    if (action === 'save-draft') {
      const draft = normalizeDraft(body.draft);
      await db('seo_drafts?on_conflict=company_id,url',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{company_id:auth.companyId,url:draft.url,draft,updated_at:new Date().toISOString()}});
      return res.status(200).json({draft});
    }
    if (action === 'google-start') {await limit(auth.companyId,'google-start',5);return res.status(200).json(await startGoogle(req,res,auth));}
    if (action === 'google-disconnect') {
      await db(`seo_google_connections?${filter}`,{method:'DELETE'});
      await db(`seo_oauth_states?${filter}`,{method:'DELETE'});
      return res.status(200).json({disconnected:true});
    }
    if (['google-sites','google-select','google-performance'].includes(action)) {
      await limit(auth.companyId,'google-read',8);
      const conn = await connection(auth.companyId), token = await accessToken(conn);
      const available = await sites(token);
      if (action === 'google-sites') return res.status(200).json({sites:available});
      const property = action === 'google-select' ? String(body.property || '') : conn.property;
      if (!property || !available.some(s=>s.siteUrl === property)) throw fail('Select a Search Console property you can access.',403);
      const workspaces = await db(`seo_workspaces?${filter}&select=settings&limit=1`);
      if (!propertyMatchesWebsite(property,workspaces?.[0]?.settings?.website)) throw fail('This property does not match your saved SEO website. Update the website or choose the matching property.');
      if (action === 'google-select') {
        await db(`seo_google_connections?${filter}`,{method:'PATCH',body:{property,updated_at:new Date().toISOString()}});
        return res.status(200).json({property});
      }
      return res.status(200).json(await performance(token,property,Number(body.days || 28)));
    }
    throw fail('Unknown SEO action.');
  } catch(error) {return sendError(res,error);}
}
