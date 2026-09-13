// All arithmetic stays in Stripe minor units. Null means historical data is unknown.
export function orderMoney(order) {
  const total = Number(order.amount_total);
  if (!Number.isSafeInteger(total) || total < 0) return { total:null, refunded:null, retained:null };
  if (order.status === "refunded") return { total, refunded:total, retained:0 };
  if (order.status === "partially_refunded") {
    const amount = order.amount_refunded == null ? NaN : Number(order.amount_refunded);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > total) return { total, refunded:null, retained:null };
    return { total, refunded:amount, retained:total - amount };
  }
  return { total, refunded:0, retained:order.status === "paid" ? total : 0 };
}

export function orderRevenue(orders) {
  const currencies = new Map();
  for (const order of orders) {
    if (!["paid", "partially_refunded", "refunded"].includes(order.status)) continue;
    const currency = String(order.currency || "USD").toUpperCase();
    const entry = currencies.get(currency) || { amount:0, complete:true };
    const { retained } = orderMoney(order);
    if (retained === null) entry.complete = false;
    else entry.amount += retained;
    currencies.set(currency, entry);
  }
  return currencies;
}

export function orderMatchesPaymentFilter(order, filter) {
  if (filter === "all") return true;
  if (filter === "processing") return ["processing", "failed"].includes(order.status);
  if (filter === "refunded") return ["refunded", "partially_refunded"].includes(order.status);
  if (filter === "paid") return ["paid", "partially_refunded"].includes(order.status);
  return order.status === filter;
}
