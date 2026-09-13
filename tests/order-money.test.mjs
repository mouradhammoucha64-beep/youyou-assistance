import test from 'node:test';
import assert from 'node:assert/strict';
import { orderMoney, orderRevenue, orderMatchesPaymentFilter } from '../shared/order-money.js';

test('45 USD paid, 1 USD refunded retains 44 USD before fees', () => {
  const order = {status:'partially_refunded',amount_total:4500,amount_refunded:100,currency:'USD'};
  assert.deepEqual(orderMoney(order), {total:4500,refunded:100,retained:4400});
  const totals = orderRevenue([order, {status:'refunded',amount_total:3000,currency:'USD'},
    {status:'failed',amount_total:2000,currency:'USD'}, {status:'paid',amount_total:500,currency:'CAD'}]);
  assert.deepEqual([...totals], [['USD',{amount:4400,complete:true}],['CAD',{amount:500,complete:true}]]);
  assert.equal(orderMatchesPaymentFilter(order,'paid'),true);
  assert.equal(orderMatchesPaymentFilter(order,'refunded'),true);
  assert.equal(orderMatchesPaymentFilter(order,'processing'),false);
});

test('unknown historical partial refunds cannot produce misleading revenue', () => {
  for (const amount_refunded of [undefined,null,0,-1,5000,1.5]) {
    const order = {status:'partially_refunded',amount_total:4500,amount_refunded,currency:'USD'};
    assert.equal(orderMoney(order).retained,null);
    assert.equal(orderRevenue([order]).get('USD').complete,false);
  }
  assert.equal(orderMoney({status:'refunded',amount_total:3000}).retained,0);
});
