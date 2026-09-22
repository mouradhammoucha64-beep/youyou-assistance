// Optional browser check: install Playwright and Chromium locally, then start Vite on port 5173.
import { chromium } from 'playwright';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let settings={website:'https://www.example.com/',businessName:'Example',service:'Customer support software',description:'Example helps small teams answer customer questions, organize enquiries and keep track of follow-up work in one place.',mode:'online',city:'test',market:'USA and Canada',language:'English',address:''};
let drafts=[], audits=[], connected=false, property=null, requests=[];
const fixtureAudit={auditedAt:'2026-09-22T10:00:00Z',finalUrl:'https://www.example.com/',url:'https://www.example.com/',score:78,page:{title:'Example | Support',h1:'Help your customers',wordCount:410,imagesMissingAlt:2,metaDescription:'Sample live description'},technical:{noindex:false,canonical:'https://www.example.com/',robotsFound:true,sitemapFound:true},findings:[{severity:'medium',category:'IMAGES',problem:'Two images are missing alt text',where:'Image tags',fix:'Describe informative images.',why:'Helps visitors using assistive technology.'}],saved:true};
await page.route('**/api/seo*',async route=>{
 const req=route.request(),body=req.postDataJSON() || {};requests.push(body);
 let data;
 if(req.url().includes('seo-audit')){data=fixtureAudit;audits=[{url:data.finalUrl,result:data,created_at:data.auditedAt}];}
 else if(req.method()==='GET')data={settings,audits,drafts,google:{configured:true,connected,property}};
 else if(body.action==='save-settings'){settings=body.settings;data={settings};}
 else if(body.action==='save-draft'){drafts=[{draft:body.draft}];data={draft:body.draft};}
 else if(body.action==='google-sites')data={sites:[{siteUrl:'sc-domain:example.com'}]};
 else if(body.action==='google-select'){property=body.property;data={property};}
 else if(body.action==='google-performance')data={property,days:28,startDate:'2026-08-23',endDate:'2026-09-19',fetchedAt:new Date().toISOString(),totals:{clicks:100,impressions:1000,ctr:.1,position:6},queries:[{keys:['support software'],clicks:80,impressions:900,ctr:.0889,position:5}],pages:[],daily:[]};
 else if(body.action==='google-disconnect'){connected=false;property=null;data={disconnected:true};}
 else throw new Error(body.action);
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
});
const harness=`<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=1"><div class="dashboard workspace-light"><main class="dashboard-main" style="width:100%!important;margin:0!important"><div id="mount"></div></main></div><script type="module">import '/style.css';import '/workspace-theme.css';import '/seo-workspace.css';import {renderSeoWorkspace,mountSeoWorkspace,handleSeoPopstate} from '/seo-workspace.js';document.querySelector('#mount').innerHTML=renderSeoWorkspace();window.addEventListener('popstate',handleSeoPopstate);window.mount=()=>mountSeoWorkspace({company:{name:'Example'},supabase:{auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})}}});window.mount();</script>`;
await page.route('**/dashboard/seo-growth*',route=>route.fulfill({status:200,contentType:'text/html',body:harness}));
await page.goto('http://127.0.0.1:5173/dashboard/seo-growth');
await page.getByText('Setup completeness:').waitFor();
await page.screenshot({path:join(tmpdir(),'seo-overview-desktop.png'),fullPage:true});
await page.locator('.seo-nav [data-tab="keywords"]').click();
await page.getByRole('button',{name:'Use in page draft'}).first().click();
await page.locator('#seo-draft-form [name="url"]').fill('https://www.example.com/support');
await page.locator('#seo-draft-form [name="title"]').fill('Support for small teams');
await page.getByRole('button',{name:'Save page draft',exact:true}).click();
await page.getByText('Page draft saved.').waitFor();
await page.goBack();
assert.match(page.url(),/tab=keywords/);
assert.equal(await page.locator('#seo-panel-title').textContent(),'Keywords');
await page.getByRole('button',{name:'Back to SEO Overview'}).click();
assert.match(page.url(),/tab=overview/);
await page.locator('.seo-nav [data-tab="audit"]').click();
await page.getByRole('button',{name:'Run website audit',exact:true}).click();
await page.getByText('Audit completed and saved.').waitFor();
await page.reload();
await page.getByText('Two images are missing alt text').waitFor();
await page.locator('.seo-nav [data-tab="onpage"]').click();
assert.equal(await page.locator('#seo-draft-form [name="title"]').inputValue(),'Support for small teams');
await page.locator('.seo-config summary').click();
await page.locator('[name="mode"]').selectOption('local');
await page.locator('[name="city"]').fill('Montreal');
await page.getByRole('button',{name:'Save SEO configuration'}).click();
await page.getByText('SEO configuration saved.').waitFor();
await page.locator('.seo-config summary').click();
await page.locator('.seo-nav [data-tab="local"]').click();
assert.match(await page.getByRole('link',{name:'Open location in Google Maps'}).getAttribute('href'),/Montreal/);
connected=true;await page.reload();
await page.locator('.seo-nav [data-tab="google"]').click();
await page.getByRole('button',{name:'Choose / change property'}).click();
await page.locator('[name="property"]').selectOption('sc-domain:example.com');
await page.getByRole('button',{name:'Use this property'}).click();
await page.getByRole('button',{name:'Load Google performance'}).click();
await page.getByText('Google report loaded.').waitFor();
await page.screenshot({path:join(tmpdir(),'seo-google-desktop.png'),fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:join(tmpdir(),'seo-google-mobile.png'),fullPage:true});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No page-wide mobile overflow');
assert.deepEqual(errors,[]);
assert.ok(requests.some(x=>x.action==='save-settings'));assert.ok(requests.some(x=>x.action==='google-performance'));
console.log('Browser flow passed: tabs/back, draft save/reload, audit save/reload, local map link, Google property/report, 390px mobile layout. Provider responses mocked.');
await browser.close();
