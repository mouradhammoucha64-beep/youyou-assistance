// Optional development check: install jsdom locally, then node tests/seo-google-panel.dom.mjs
import {JSDOM} from 'jsdom';
import assert from 'node:assert/strict';
import {mountGoogleConsole} from '../seo-google-panel.js';
const dom=new JSDOM('<article id="seo-google-panel"></article>',{url:'https://www.youyouapp.com/dashboard/seo-growth?tab=google&google=connected'});
for(const key of ['document','location','history','FormData'])globalThis[key]=dom.window[key];
globalThis.confirm=()=>true;
let property=null,website='',reportFail=false;
const calls=[];
globalThis.fetch=async(url,options)=>{
 const b=options.body?JSON.parse(options.body):{};calls.push(b);
 const data=!b.action?{google:{configured:true,connected:true,property},settings:{website}}:
 b.action==='google-website'?{website:website=b.website}:
 b.action==='google-sites'?{sites:[{siteUrl:'sc-domain:example.com'}]}:
 b.action==='google-select'?{property:property=b.property}:
 b.action==='google-performance'? reportFail?{error:'Google access expired. Reconnect Google.'}:{property,startDate:'2026-09-01',endDate:'2026-09-28',fetchedAt:'2026-10-01T12:00:00Z',totals:null,queries:[],pages:[],daily:[]}:{disconnected:true};
 return {ok:!(b.action==='google-performance'&&reportFail),json:async()=>data};
};
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
const click=async(key)=>{document.querySelector(`[data-gsc="${key}"]`).click();await settle();};
const submit=async(id)=>{document.querySelector(id).dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await settle();};
mountGoogleConsole({supabase:{auth:{getSession:async()=>({data:{session:{access_token:'mock-token'}}})}},company:{website_url:'https://example.com'}});
await settle();assert.match(document.body.textContent,/Google connected/);assert.ok(!location.search.includes('google=connected'));
await submit('#gsc-website');assert.equal(calls.at(-1).action,'google-website');
await click('sites');document.querySelector('[name="property"]').value='sc-domain:example.com';await submit('#gsc-property');
await click('report');assert.match(document.body.textContent,/No search data available/);assert.equal(document.querySelector('.gsc-stats'),null);
reportFail=true;await click('report');assert.match(document.body.textContent,/Reconnect Google/);
await click('disconnect');assert.match(document.body.textContent,/Not connected/);assert.equal(document.querySelector('[data-gsc="report"]'),null);
console.log('PASS: callback, saved website, property selection, empty report, revoked access and disconnect DOM flows');
