import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{isOwner} from '../api/owner/overview.js';
const owner='12345678-1234-1234-1234-123456789abc';
const stranger='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
function res(){return {headers:{host:'admin.youyouapp.com'},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this}}}
test('owner allowlist matches exact UUIDs, never emails or partial IDs',()=>{
 assert.equal(isOwner(owner,''),false); assert.equal(isOwner(owner,owner.toUpperCase()),true);
 assert.equal(isOwner(stranger,owner),false);assert.equal(isOwner(owner,owner.slice(0,-1)),false);
 assert.equal(isOwner('owner@example.com','owner@example.com'),false);
});
test('owner endpoint enforces auth before all platform queries',async()=>{
 const oldFetch=global.fetch, oldEnv={...process.env};
 process.env.OWNER_USER_IDS=owner;process.env.VITE_SUPABASE_URL='https://test.supabase.co';process.env.VITE_SUPABASE_PUBLISHABLE_KEY='anon';process.env.SUPABASE_SECRET_KEY='service';
 let calls=[];global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({id:stranger,user_metadata:{role:'owner'}}),{status:200})};
 try {
  let r=res();await handler({method:'GET',headers:{host:'admin.youyouapp.com'}},r);assert.equal(r.code,401);assert.equal(calls.length,0);
  r=res();await handler({method:'POST',headers:{host:'admin.youyouapp.com'}},r);assert.equal(r.code,405);assert.equal(calls.length,0);
  r=res();await handler({method:'GET',headers:{host:'admin.youyouapp.com',authorization:'Bearer bad'},query:{user_id:owner}},r);assert.equal(r.code,403);assert.equal(calls.length,1);assert.match(calls[0].url,/auth\/v1\/user$/);
  assert.equal(r.headers['Cache-Control'],'private, no-store');
  global.fetch=async()=>new Response('{}',{status:401});r=res();await handler({method:'GET',headers:{host:'admin.youyouapp.com',authorization:'Bearer invalid'}},r);assert.equal(r.code,401);
 }finally{global.fetch=oldFetch;for(const key of Object.keys(process.env))if(!(key in oldEnv))delete process.env[key];Object.assign(process.env,oldEnv)}
});
test('authorized owner data is bounded, sanitized, and reports failed totals as unavailable',async()=>{
 const oldFetch=global.fetch,oldEnv={...process.env};Object.assign(process.env,{OWNER_USER_IDS:owner,VITE_SUPABASE_URL:'https://test.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'anon',SUPABASE_SECRET_KEY:'service'});
 const calls=[];global.fetch=async(url,o)=>{
  calls.push({url,o});if(url.endsWith('/auth/v1/user'))return Response.json({id:owner});
  if(o.method==='HEAD')return new Response(null,{status:url.includes('profiles')?503:200,headers:{'content-range':'0-0/24'}});
  return Response.json({users:[{id:owner,email:'owner@example.com',created_at:'2026-09-01',last_sign_in_at:null,encrypted_password:'secret',user_metadata:{private:'hidden'}}],last_page:2});
 };
 try{
  let r=res();await handler({method:'GET',headers:{host:'admin.youyouapp.com',authorization:'Bearer valid'},query:{}},r);
  assert.equal(r.code,200);assert.equal(r.body.counts.profiles,null);assert.equal(r.body.counts.companies,24);assert.equal(r.body.hasMore,true);
  assert.deepEqual(Object.keys(r.body.rows[0]),['id','email','created_at','last_sign_in_at']);assert.ok(calls.some(c=>c.url.endsWith('admin/users?page=1&per_page=20')));
  r=res();await handler({method:'GET',headers:{host:'admin.youyouapp.com',authorization:'Bearer valid'},query:{page:'-1'}},r);assert.equal(r.code,400);
 }finally{global.fetch=oldFetch;for(const key of Object.keys(process.env))if(!(key in oldEnv))delete process.env[key];Object.assign(process.env,oldEnv)}
});

test('owner API is unavailable on customer and preview hosts before any auth lookup',async()=>{
 const oldFetch=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw new Error('unexpected')};
 try { for(const host of ['www.youyouapp.com','youyouapp.com','pages.youyouapp.com','example.vercel.app','admin.youyouapp.com.evil.test',undefined]) {
  const r=res();await handler({method:'GET',headers:{host,authorization:'Bearer token','x-forwarded-host':'admin.youyouapp.com'}},r);
  assert.equal(r.code,404);assert.deepEqual(r.body,{error:'not_found'});
 }assert.equal(calls,0); }finally{global.fetch=oldFetch}
});
