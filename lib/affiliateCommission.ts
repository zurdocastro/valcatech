export type CommissionTier = { minSales: number; rate: number };
export type CommissionableOrder = { id: string; netRevenue: number };
export type OrderCommission = { orderId: string; rate: number; commission: number };

// The rate that applies once cumulative referred (paid) revenue reaches
// `cumulativeRevenue` — the highest tier whose minSales threshold has been
// crossed, or the base rate if none have.
export function currentApplicableRate(cumulativeRevenue: number, baseRate: number, tiers: CommissionTier[]): number {
  let rate = baseRate;
  for (const tier of [...tiers].sort((a, b) => a.minSales - b.minSales)) {
    if (cumulativeRevenue >= tier.minSales) rate = tier.rate;
  }
  return rate;
}

// Tiers apply going forward, not retroactively: once an affiliate's
// cumulative referred (paid) revenue crosses a tier's `minSales` threshold,
// that tier's rate applies to further sales — orders that already happened
// below the threshold keep whatever rate applied to them at the time.
// `orders` must be in chronological order (oldest first); netRevenue is
// typically subtotal minus any discount, excluding shipping.
export function computeAffiliateCommissions(
  orders: CommissionableOrder[],
  baseRate: number,
  tiers: CommissionTier[]
): OrderCommission[] {
  let cumulative = 0;
  const results: OrderCommission[] = [];

  for (const order of orders) {
    const rate = currentApplicableRate(cumulative, baseRate, tiers);
    results.push({ orderId: order.id, rate, commission: order.netRevenue * (rate / 100) });
    cumulative += order.netRevenue;
  }

  return results;
}

export function sumCommissions(results: OrderCommission[]): number {
  return results.reduce((sum, r) => sum + r.commission, 0);
}
