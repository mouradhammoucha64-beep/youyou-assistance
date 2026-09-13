import test from 'node:test';
import assert from 'node:assert/strict';
import { saveOrder } from '../api/stripe/webhook.js';
import { authenticatedCompany } from '../server/stripe-shared.js';
const company = '11111111-1111-4111-8111-111111111111';
const page = '22222222-2222-4222-8222-222222222222';
const other = '33333333-3333-4333-8333-333333333333';
const event = {account:'acct_Attacker',type:'checkout.session.completed'};
const session = {id:'cs_test_owned',amount_total:4500,payment_status:'paid',metadata:{company_id:company,landing_page_id:page}};
function setup(t, mock) {
  const oldFetch = globalThis.fetch;
  const oldEnv = {...process.env};
  process.env.SUPABASE_SECRET_KEY = 'test-service';
  process.env.SUPABASE_ANON_KEY = 'test-public';
  globalThis.fetch = mock;
  t.after(() => {
    globalThis.fetch = oldFetch;
    for (const key of ['SUPABASE_SECRET_KEY','SUPABASE_ANON_KEY']) {
      if (oldEnv[key] === undefined) delete process.env[key]; else process.env[key] = oldEnv[key];
    }
  });
}

test('signed checkout cannot insert into a company owned by another Stripe account', async t => {
  const reads = [];
  setup(t, async (url, options) => {
    assert.equal(options.method, undefined, 'no writes allowed');
    reads.push(url);
    return new Response('[]');
  });
  assert.equal(await saveOrder(event,session),false);
  assert.equal(reads.length,2);
  assert.match(reads[1],/stripe_account_id=eq.acct_Attacker/);
});

test('checkout cannot relabel an existing order or use another company landing page', async t => {
  let existing = true;
  setup(t, async (url,options) => {
    assert.equal(options.method,undefined,'no writes allowed');
    const path = new URL(url).pathname;
    return new Response(JSON.stringify(path.endsWith('stripe_orders')
      ? existing ? [{company_id:other,landing_page_id:page,connected_account_id:event.account}] : []
      : path.endsWith('companies') ? [{id:company,stripe_account_id:event.account}]
      : [{id:page,company_id:other}]));
  });
  assert.equal(await saveOrder(event,session),false);
  existing = false;
  assert.equal(await saveOrder(event,session),false);
});

test('ownership lookup errors fail closed for webhook retry', async t => {
  setup(t, async () => new Response('{}',{status:503}));
  await assert.rejects(saveOrder(event,session),/ownership lookup failed/);
});

test('Connect ignores a forged company in request body and uses authenticated profile', async t => {
  const calls = [];
  setup(t, async (url,options) => {
    calls.push(url);
    if (url.includes('/auth/v1/user')) {
      assert.equal(options.headers.Authorization,'Bearer valid-test-token');
      return new Response(JSON.stringify({id:'user_A'}));
    }
    if (url.includes('/profiles?')) {
      assert.match(url,/id=eq.user_A/);
      return new Response(JSON.stringify([{company_id:company}]));
    }
    assert.match(url,new RegExp(`companies\\?id=eq.${company}`));
    return new Response(JSON.stringify([{id:company,stripe_account_id:'acct_Owner'}]));
  });
  const result = await authenticatedCompany({headers:{authorization:'Bearer valid-test-token'},body:{company_id:other,stripe_account_id:'acct_Other'}});
  assert.equal(result.company.id,company);
  assert.equal(calls.length,3);
});

test('missing or invalid login token cannot reach tenant data', async t => {
  let calls = 0;
  setup(t, async url => {
    calls++;
    assert.match(url,/\/auth\/v1\/user$/);
    return new Response('{}',{status:401});
  });
  await assert.rejects(authenticatedCompany({headers:{}}),/AUTH_REQUIRED/);
  assert.equal(calls,0);
  await assert.rejects(authenticatedCompany({headers:{authorization:'Bearer invalid'}}),/AUTH_REQUIRED/);
  assert.equal(calls,1);
});
