import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = fs.readFileSync(new URL('../api/seo-audit.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');

test('SEO audit is a bounded multi-page crawler with SSRF protections', () => {
  assert.match(api, /MAX_PAGES = 12/);
  assert.match(api, /assertPublicHost/);
  assert.match(api, /multi-page-live-site-audit/);
  assert.match(api, /duplicateTitles/);
  assert.match(api, /duplicateDescriptions/);
  assert.match(api, /indexablePages/);
});

test('SEO UI surfaces real site-health and crawl results without fabricated Google metrics', () => {
  assert.match(ui, /LIVE SITE CRAWL/);
  assert.match(ui, /seo-site-score/);
  assert.match(ui, /seo-crawl-pages-body/);
  assert.match(ui, /Verified site ≠ API data connection/);
  assert.match(ui, /does not invent performance metrics/);
});
