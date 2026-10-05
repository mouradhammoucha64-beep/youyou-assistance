import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/seo.js';
import { normalizeSettings, setupChecks, strategy, propertyMatchesWebsite, tabFromUrl, tabUrl } from '../shared/seo-model.js';
import { encryptToken, decryptToken, hash, googleSetupIssues, googleConfig } from '../server/seo-shared.js';
import { googleCallback, startGoogle, reportDates, performance, SCOPE } from '../server/seo-google.js';
const company='11111111-1111-4111-8111-111111111111', other='22222222-2222-4222-8222-222222222222';
const env={SUPABASE_URL:'https://storage.test',SUPABASE_SECRET_KEY:'service-test',APP_ORIGIN:'https://www.youyouapp.com',GOOGLE_SEARCH_CONSOLE_CLIENT_ID:'client-test',GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET:'secret-test',SEO_TOKEN_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64')};
const response=data=>new Response(JSON.stringify(data));
test('Google setup identifies every missing setting without exposing values',()=>{
  assert.deepEqual(googleSetupIssues(env),[]);
  assert.equal(googleSetupIssues({}).length,4);
  for(const name of ['APP_ORIGIN','GOOGLE_SEARCH_CONSOLE_CLIENT_ID','GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET','SEO_TOKEN_ENCRYPTION_KEY']) {
    const issues=googleSetupIssues({...env,[name]:''});
    assert.equal(issues.length,1);assert.ok(issues[0].includes(name));
  }
  for(const origin of ['http://example.com','https://user:private@example.com','invalid-private-value']) {
    const issues=googleSetupIssues({...env,APP_ORIGIN:origin});
    assert.equal(issues.length,1);assert.ok(!JSON.stringify(issues).includes(origin));
  }
  assert.equal(googleSetupIssues({...env,SEO_TOKEN_ENCRYPTION_KEY:Buffer.alloc(31).toString('base64')}).length,1);
  assert.equal(googleConfig({...env,GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET:' secret-test \n'}).clientSecret,'secret-test');
});
function res(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(data){this.body=data;return this;},end(){return this;}};}
function mock(t,fetch){const oldFetch=globalThis.fetch;const old={...process.env};Object.assign(process.env,env);globalThis.fetch=fetch;t.after(()=>{globalThis.fetch=oldFetch;for(const k of Object.keys(env)){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}});}
const request=(action,body={})=>({method:'POST',url:'/api/seo',headers:{authorization:'Bearer user-token',origin:env.APP_ORIGIN},body:{action,...body}});
function authenticatedFetch(callback){return async(url,options)=>{
  if(url.includes('/auth/v1/user'))return response({id:'user-A'});
  if(url.includes('/profiles?'))return response([{id:'user-A',company_id:company}]);
  if(url.includes('/rpc/seo_consume_limit'))return response(true);
  return callback(url,options);
};}
test('local placeholders fail setup; international plan never injects city/near-me',()=>{
  const s=normalizeSettings({website:'https://example.com',service:'Customer support software',mode:'online',city:'test',market:'USA and Canada'});
  assert.ok(strategy(s).keywords.every(k=>!/near me|test|local/i.test(k)));
  assert.equal(setupChecks({...s,mode:'local'}).find(x=>x.key==='city').done,false);
  assert.throws(()=>normalizeSettings({website:'https://user:password@example.com'}));
});
test('SEO routes deep link and unknown tabs return to SEO Overview',()=>{
  assert.equal(tabFromUrl('/dashboard/seo-growth?tab=google'),'google');
  assert.equal(tabFromUrl('/dashboard/seo-growth?tab=whatsapp'),'overview');
  assert.equal(tabUrl('onpage'),'/dashboard/seo-growth?tab=onpage');
});
test('property matching respects domains, subdomains, scheme and URL prefixes',()=>{
  assert.equal(propertyMatchesWebsite('sc-domain:example.com','https://www.example.com/faq'),true);
  assert.equal(propertyMatchesWebsite('sc-domain:example.com','https://example.com.evil.test'),false);
  assert.equal(propertyMatchesWebsite('https://example.com/blog/','https://example.com/blog/post'),true);
  assert.equal(propertyMatchesWebsite('https://example.com/blog/','https://example.com/store/'),false);
  assert.equal(propertyMatchesWebsite('https://example.com/','http://example.com/'),false);
});
test('encrypted Google token cannot cross tenants or survive ciphertext modification',()=>{
  const token=encryptToken('private-refresh',company,env);
  assert.ok(!token.includes('private-refresh'));
  assert.equal(decryptToken(token,company,env),'private-refresh');
  assert.throws(()=>decryptToken(token,other,env));
  const parts=token.split('.');parts[2]=Buffer.alloc(16).toString('base64url');
  assert.throws(()=>decryptToken(parts.join('.'),company,env));
});
test('both SEO endpoints reject unauthenticated requests before external work',async t=>{
  mock(t,()=>{throw new Error('Network must not run');});
  for(const fn of [handler]){const r=res();await fn({method:'POST',url:'/api/seo',headers:{},body:{}},r);assert.equal(r.statusCode,401);}
});
test('saving a forged company id is always scoped to the authenticated workspace',async t=>{
  let saved;
  mock(t,authenticatedFetch(async(url,options)=>{assert.match(url,/seo_workspaces/);saved=JSON.parse(options.body);return response(null);}));
  const r=res();await handler(request('save-settings',{company_id:other,settings:{website:'https://example.com',service:'Accounting',company_id:other}}),r);
  assert.equal(r.statusCode,200);assert.equal(saved.company_id,company);assert.ok(!JSON.stringify(r.body).includes(other));
});
test('load returns no Google credential and scopes every storage read',async t=>{
  mock(t,authenticatedFetch(async(url)=>{assert.ok(url.includes(`company_id=eq.${company}`));return response(url.includes('seo_google_connections')?[{company_id:company,property:'sc-domain:example.com',refresh_token_ciphertext:'secret-cipher'}]:[]);}));
  const r=res();await handler({method:'GET',url:'/api/seo',headers:{authorization:'Bearer user-token'}},r);
  assert.equal(r.statusCode,200);assert.equal(r.body.google.connected,true);assert.ok(!JSON.stringify(r.body).includes('secret-cipher'));
});
test('property selection rejects an accessible Google property belonging to another configured site',async t=>{
  mock(t,authenticatedFetch(async(url,options)=>{
    if(url.includes('seo_google_connections'))return response([{company_id:company,refresh_token_ciphertext:encryptToken('refresh',company)}]);
    if(url.includes('oauth2.googleapis.com'))return response({access_token:'access'});
    if(url.endsWith('/sites'))return response({siteEntry:[{siteUrl:'sc-domain:other.com',permissionLevel:'siteOwner'}]});
    if(url.includes('seo_workspaces'))return response([{settings:{website:'https://example.com'}}]);
    throw new Error('Must not persist mismatched property');
  }));
  const r=res();await handler(request('google-select',{property:'sc-domain:other.com'}),r);assert.equal(r.statusCode,400);assert.match(r.body.error,/does not match/);
});
test('OAuth binds browser, consumes state once and redirects to SEO for success, replay and denial',async t=>{
  let stored, tokenWrites=0;
  mock(t,async(url,options)=>{
    if(url.includes('seo_oauth_states') && options.method==='POST'){stored=JSON.parse(options.body);return response(null);}
    if(url.includes('seo_oauth_states') && url.includes('expires_at=lt'))return response([]);
    if(url.includes('seo_oauth_states') && options.method==='DELETE'){
      const match=stored&&url.includes(`state_hash=eq.${stored.state_hash}`)&&url.includes(`browser_hash=eq.${stored.browser_hash}`);
      const rows=match?[stored]:[];if(match)stored=null;return response(rows);
    }
    if(url.includes('/profiles?'))return response([{id:'user-A'}]);
    if(url.includes('oauth2.googleapis.com'))return response({refresh_token:'refresh-secret',scope:SCOPE});
    if(url.includes('seo_google_connections')){tokenWrites++;assert.equal(JSON.parse(options.body).company_id,company);return response(null);}
    throw new Error(url);
  });
  const start=res();const {url}=await startGoogle(request('google-start'),start,{companyId:company,userId:'user-A'});
  const state=new URL(url).searchParams.get('state'), browser=start.headers['Set-Cookie'].split(';')[0];
  assert.match(start.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax/);
  const bad=res();await googleCallback({headers:{cookie:'__Host-youyou-seo-oauth='+'x'.repeat(43)}},bad,new URLSearchParams({state,code:'code'}));assert.match(bad.headers.Location,/google=failed/);assert.equal(tokenWrites,0);
  const ok=res();await googleCallback({headers:{cookie:browser}},ok,new URLSearchParams({state,code:'code'}));assert.equal(ok.statusCode,303);assert.match(ok.headers.Location,/tab=google&google=connected/);assert.equal(tokenWrites,1);
  const replay=res();await googleCallback({headers:{cookie:browser}},replay,new URLSearchParams({state,code:'code'}));assert.match(replay.headers.Location,/google=failed/);assert.equal(tokenWrites,1);
  const cancelledStart=res();const next=await startGoogle(request('google-start'),cancelledStart,{companyId:company,userId:'user-A'});
  const denied=res();await googleCallback({headers:{cookie:cancelledStart.headers['Set-Cookie'].split(';')[0]}},denied,new URLSearchParams({state:new URL(next.url).searchParams.get('state'),error:'access_denied'}));assert.match(denied.headers.Location,/google=cancelled/);assert.equal(tokenWrites,1);
});
test('Google report uses aggregate totals separately from limited query rows',async t=>{
  mock(t,async(url,options)=>{const b=JSON.parse(options.body);assert.equal(b.dataState,'final');assert.equal(b.type,'web');return response({rows:b.dimensions?[{keys:['example'],clicks:3,impressions:50,ctr:.06,position:8}]:[{clicks:100,impressions:1000,ctr:.1,position:4}]});});
  const report=await performance('access','sc-domain:example.com',28);assert.equal(report.totals.clicks,100);assert.equal(report.queries[0].clicks,3);
  assert.deepEqual(reportDates(28,new Date('2026-09-22T12:00:00Z')),{startDate:'2026-08-23',endDate:'2026-09-19'});
  assert.throws(()=>reportDates(100000));
});
test('persistent quota failures stop before calling Google',async t=>{
  mock(t,async url=>url.includes('/auth/v1/user')?response({id:'user-A'}):url.includes('/profiles?')?response([{company_id:company}]):url.includes('seo_consume_limit')?response(false):Promise.reject(new Error('Unexpected provider call')));
  const r=res();await handler(request('google-performance'),r);assert.equal(r.statusCode,429);
});

test('Google revoked refresh token produces a reconnect message without disclosing credentials',async t=>{
  mock(t,authenticatedFetch(async url=>{
    if(url.includes('seo_google_connections'))return response([{company_id:company,refresh_token_ciphertext:encryptToken('do-not-leak',company)}]);
    if(url.includes('oauth2.googleapis.com'))return new Response(JSON.stringify({error:'invalid_grant',error_description:'sensitive-provider-text'}),{status:400});
    throw new Error(url);
  }));
  const r=res();await handler(request('google-sites'),r);assert.equal(r.statusCode,409);assert.match(r.body.error,/Reconnect Google/);assert.ok(!JSON.stringify(r.body).includes('sensitive-provider-text'));
});
test('an empty Google report remains empty instead of synthesizing rankings',async t=>{
  mock(t,async()=>response({}));const report=await performance('access','sc-domain:example.com',90);
  assert.equal(report.totals,null);assert.deepEqual(report.queries,[]);assert.deepEqual(report.pages,[]);
});

test('reporting website update preserves saved settings and clears old property within tenant',async t=>{
  const writes=[];
  mock(t,authenticatedFetch(async(url,options)=>{
    assert.ok(url.includes('seo_workspaces') || url.includes(`company_id=eq.${company}`));
    if(options.method==='GET')return response([{settings:{website:'https://old.example.com',service:'Original service',mode:'online'}}]);
    writes.push({url,body:JSON.parse(options.body)});return response(null);
  }));
  const r=res();await handler(request('google-website',{website:'new.example.com',company_id:other}),r);
  assert.equal(r.statusCode,200);assert.equal(r.body.website,'https://new.example.com/');
  assert.equal(writes[0].body.settings.service,'Original service');assert.equal(writes[0].body.company_id,company);
  assert.equal(writes[1].body.property,null);assert.ok(writes[1].url.includes(`company_id=eq.${company}`));
});
test('invalid reporting website produces actionable error and no writes',async t=>{
  mock(t,authenticatedFetch(async()=>{throw Error('Storage must not be written');}));
  const r=res();await handler(request('google-website',{website:'https://user:pass@example.com'}),r);
  assert.equal(r.statusCode,400);assert.match(r.body.error,/valid public website/);
});
