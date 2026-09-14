import test from 'node:test';
import assert from 'node:assert/strict';
import rootHandler, { hardenPublishedHtml, YOUYOU_PUBLISHED_RENDERER_VERSION } from '../published-page.js';
import apiHandler from '../api/published-page.js';

test('root and Vercel entrypoints use the same renderer implementation', () => {
  assert.equal(rootHandler, apiHandler);
  assert.equal(YOUYOU_PUBLISHED_RENDERER_VERSION, '9.0.0');
});

test('renderer emits one matching version in meta and HTML marker', () => {
  const html = hardenPublishedHtml('<!doctype html><html><head><meta name="youyou-renderer" content="8.8.0"></head><body style="--lp-bg:#ffffff"><script src="/landing-ai.js"></script></body></html>');
  assert.match(html, /name="youyou-renderer" content="9\.0\.0"/);
  assert.match(html, /YOUYOU_PUBLIC_RENDERER:9\.0\.0/);
  assert.equal((html.match(/name="youyou-renderer"/g) || []).length, 1);
  assert.doesNotMatch(html, /8\.8\.0/);
  assert.equal((html.match(/src="\/landing-ai\.js"/g) || []).length, 1);
});

test('deployed handler advertises the same version header', async t => {
  const priorApp = process.env.APP_ORIGIN;
  const priorPages = process.env.PUBLISHED_PAGES_ORIGIN;
  process.env.APP_ORIGIN='https://app.example';
  process.env.PUBLISHED_PAGES_ORIGIN='https://pages.example';
  t.after(()=>{
    if(priorApp===undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN=priorApp;
    if(priorPages===undefined) delete process.env.PUBLISHED_PAGES_ORIGIN; else process.env.PUBLISHED_PAGES_ORIGIN=priorPages;
  });
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify([{html_snapshot:'<html><head></head><body>Published</body></html>'}]), {status:200});
  t.after(() => { globalThis.fetch = oldFetch; });
  const headers = {};
  let statusCode;
  let body;
  const res = {
    setHeader(name,value) { headers[name] = value; },
    status(code) { statusCode = code; return this; },
    send(value) { body = value; return this; },
    end() { return this; },
  };
  await apiHandler({method:'GET',headers:{host:'pages.example'},query:{slug:'renderer-test'}},res);
  assert.equal(statusCode,200);
  assert.equal(headers['X-YOUYOU-Renderer'],'9.0.0');
  assert.match(body,/YOUYOU_PUBLIC_RENDERER:9\.0\.0/);
});
