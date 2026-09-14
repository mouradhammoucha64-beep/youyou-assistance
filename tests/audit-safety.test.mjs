import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { visitorMessages } from '../shared/visitor-messages.js';
import { fetchPublicUrl, isPublicAddress, readPublicResponse } from '../server/public-fetch.js';
import { publishedOrigins } from '../server/published-origin.js';
import handler from '../api/published-page.js';
import middleware from '../middleware.js';

test('agent sales text cannot manufacture a HOT lead or customer email',()=>{
  const main=fs.readFileSync(new URL('../main.js',import.meta.url),'utf8');
  const context={visitorMessages};vm.createContext(context);
  vm.runInContext(main.slice(main.indexOf('function scoreLeadFromMessages'),main.indexOf('function hoursSince')),context);
  const messages=[{sender:'visitor',content:'Hi'},{sender:'agent',content:'buy purchase book booking demo quote price pricing support@business.test'}];
  assert.equal(context.scoreLeadFromMessages(messages),10);
  assert.equal(context.extractLeadContact({},messages).email,'');
  messages.push({sender:'visitor',content:'Please contact buyer@example.test'});
  assert.equal(context.extractLeadContact({},messages).email,'buyer@example.test');
});

test('publication origins must be distinct HTTPS hosts without credentials or paths',()=>{
  for(const pages of ['https://app.example','http://pages.example','https://user@pages.example','https://pages.example/path']) {
    assert.throws(()=>publishedOrigins({APP_ORIGIN:'https://app.example',PUBLISHED_PAGES_ORIGIN:pages}));
  }
});

test('main origin redirects page before fetching untrusted HTML; isolated host blocks app routes',async t=>{
  const old={app:process.env.APP_ORIGIN,pages:process.env.PUBLISHED_PAGES_ORIGIN};
  process.env.APP_ORIGIN='https://app.example';process.env.PUBLISHED_PAGES_ORIGIN='https://pages.example';
  t.after(()=>{for(const [name,value] of [['APP_ORIGIN',old.app],['PUBLISHED_PAGES_ORIGIN',old.pages]]) {
    if(value===undefined) delete process.env[name];else process.env[name]=value;
  }});
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},end(){return this;}};
  await handler({method:'GET',headers:{host:'app.example'},query:{slug:'test',payment:'success',session_id:'cs_test',redirect:'https://bad.example'}},res);
  assert.equal(res.code,307);
  assert.equal(res.headers.Location,'https://pages.example/p/test?payment=success&session_id=cs_test');
  for(const path of ['/','/dashboard/orders','/index.html','/api/ai/studio','/assets/app.js']) {
    const result=middleware(new Request('https://pages.example'+path));
    assert.equal(result.status,307);assert.equal(result.headers.get('location'),'https://app.example/');
  }
  assert.equal(middleware(new Request('https://pages.example/p/test')),undefined);
  assert.equal(middleware(new Request('https://pages.example/api/stripe/create-checkout-session')),undefined);
});

test('redirects to private addresses are rejected before a second connection',async()=>{
  let calls=0;
  await assert.rejects(fetchPublicUrl('https://public.example',{
    lookup:async()=>[{address:'8.8.8.8',family:4}],
    read:async(_url,address)=>{calls++;assert.equal(address.address,'8.8.8.8');return {status:302,headers:{location:'http://127.0.0.1/'}};},
  }),/Private/);
  assert.equal(calls,1);
  for(const address of ['127.0.0.1','10.0.0.1','169.254.169.254','::1','::ffff:127.0.0.1','fc00::1']) assert.equal(isPublicAddress(address),false);
});

function fakeRequest(write) {
  return (_url,options,callback)=>{
    const req=new EventEmitter();
    req.destroy=error=>req.emit('error',error);
    req.end=()=>queueMicrotask(()=>{
      const stream=new PassThrough();stream.headers={};stream.statusCode=200;
      callback(stream);write(stream,options);
    });
    return req;
  };
}
test('SEO rejects oversized chunked bodies during streaming',async()=>{
  await assert.rejects(readPublicResponse(new URL('https://example.test'),{address:'8.8.8.8',family:4},{
    maxBytes:4,timeoutMs:100,requestImpl:fakeRequest(stream=>{stream.write('123');stream.end('456');}),
  }),/too large/);
});
test('SEO timeout remains active after headers arrive',async()=>{
  await assert.rejects(readPublicResponse(new URL('https://example.test'),{address:'8.8.8.8',family:4},{
    maxBytes:10,timeoutMs:15,requestImpl:fakeRequest(()=>{}),
  }),/too long/);
});
test('connection lookup returns exactly the validated DNS address',async()=>{
  const result=await readPublicResponse(new URL('https://example.test'),{address:'8.8.8.8',family:4},{
    maxBytes:10,timeoutMs:100,requestImpl:fakeRequest((stream,options)=>{
      options.lookup('example.test',{all:true},(error,rows)=>{assert.equal(error,null);assert.deepEqual(rows,[{address:'8.8.8.8',family:4}]);});
      stream.end('ok');
    }),
  });
  assert.equal(result.body,'ok');
});
