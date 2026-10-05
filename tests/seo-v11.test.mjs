import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePage} from '../api/seo-audit.js';
const audit = html => analyzePage({html, finalUrl:'https://example.com/', response:{ok:true,status:200},responseMs:1,service:'Plumbing',city:'Rabat',companyName:'Acme'});
test('JS app shells do not become false missing-H1 or thin-content claims',()=>{
 const result=audit('<html lang="en"><head><title>Example page for customers</title></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>');
 assert.equal(result.page.renderingLimited,true);
 assert.equal(result.target.serviceInBody,null);
 assert.ok(result.findings.some(f=>f.category==='RENDERING'));
 assert.ok(!result.findings.some(f=>/No H1|visible words|Very few internal/.test(f.problem)));
});
test('ordinary HTML still reports missing headings and counts words',()=>{
 const result=audit('<html lang="en"><body><p>Plumbing in Rabat for your home.</p></body></html>');
 assert.equal(result.page.renderingLimited,false);
 assert.equal(result.page.wordCount,6);
 assert.ok(result.findings.some(f=>f.problem==='No H1 heading was found'));
});
test('decorative images with empty alt do not count as missing attributes',()=>{
 const result=audit('<html><body><h1>Plumbing</h1><img alt="" src="a.png"><img src="b.png"></body></html>');
 assert.equal(result.page.imagesMissingAlt,1);
});
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../main.js',import.meta.url),'utf8');
const ctx=vm.createContext({URL});
vm.runInContext(source.slice(source.indexOf('function seoCleanText('),source.indexOf('function renderSeoAnalysis(')),ctx);
test('snippet and SEO pack share title and description; sample city is not ready',()=>{
 const result=ctx.buildSeoWorkspaceAnalysis({name:'Acme',industry:'Plumbing',city:'test',business_description:'Experienced plumbing team serving households with repairs and installation appointments.'},[],{});
 assert.equal(result.title,result.keywordEngine.title);
 assert.equal(result.description,result.keywordEngine.description);
 assert.equal(result.checks.find(x=>x.id==='city').done,false);
 assert.ok(!result.quickWins.some(x=>x.title==='Business description added'));
});
