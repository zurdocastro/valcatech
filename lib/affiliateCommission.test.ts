import { describe, it, expect } from "vitest";
import { computeAffiliateCommissions, sumCommissions, currentApplicableRate } from "./affiliateCommission";

describe("currentApplicableRate", () => {
  it("returns the base rate when no tiers are crossed", () => {
    expect(currentApplicableRate(100, 10, [{ minSales: 500, rate: 15 }])).toBe(10);
  });

  it("returns the tier rate once its threshold is crossed", () => {
    expect(currentApplicableRate(500, 10, [{ minSales: 500, rate: 15 }])).toBe(15);
  });

  it("picks the highest crossed tier out of several, regardless of input order", () => {
    const tiers = [{ minSales: 1000, rate: 20 }, { minSales: 500, rate: 15 }];
    expect(currentApplicableRate(1200, 10, tiers)).toBe(20);
    expect(currentApplicableRate(700, 10, tiers)).toBe(15);
  });
});

describe("computeAffiliateCommissions", () => {
  it("applies the base rate when there are no tiers", () => {
    const results = computeAffiliateCommissions([{ id: "o1", netRevenue: 100 }, { id: "o2", netRevenue: 200 }], 10, []);
    expect(results).toEqual([
      { orderId: "o1", rate: 10, commission: 10 },
      { orderId: "o2", rate: 10, commission: 20 },
    ]);
  });

  it("stays at the base rate until cumulative sales cross the first tier threshold", () => {
    const orders = [{ id: "o1", netRevenue: 400 }, { id: "o2", netRevenue: 400 }];
    const results = computeAffiliateCommissions(orders, 10, [{ minSales: 500, rate: 15 }]);
    // o1: cumulative before = 0 (< 500) -> base rate 10%
    // o2: cumulative before = 400 (< 500) -> still base rate 10%
    expect(results).toEqual([
      { orderId: "o1", rate: 10, commission: 40 },
      { orderId: "o2", rate: 10, commission: 40 },
    ]);
  });

  it("upgrades to a higher tier once cumulative sales cross the threshold — not retroactively", () => {
    const orders = [{ id: "o1", netRevenue: 600 }, { id: "o2", netRevenue: 100 }];
    const results = computeAffiliateCommissions(orders, 10, [{ minSales: 500, rate: 15 }]);
    // o1: cumulative before = 0 (< 500) -> base rate 10%, commission 60
    // o2: cumulative before = 600 (>= 500) -> tier rate 15%, commission 15
    expect(results).toEqual([
      { orderId: "o1", rate: 10, commission: 60 },
      { orderId: "o2", rate: 15, commission: 15 },
    ]);
  });

  it("picks the highest applicable tier when multiple thresholds are crossed", () => {
    const orders = [{ id: "o1", netRevenue: 0 }, { id: "o2", netRevenue: 50 }];
    const tiers = [{ minSales: 1000, rate: 20 }, { minSales: 500, rate: 15 }]; // unsorted on purpose
    const results = computeAffiliateCommissions([{ id: "o0", netRevenue: 1000 }, ...orders], 10, tiers);
    expect(results[1].rate).toBe(20); // cumulative before o1 = 1000 -> top tier
  });

  it("returns an empty array for no orders", () => {
    expect(computeAffiliateCommissions([], 10, [{ minSales: 100, rate: 20 }])).toEqual([]);
  });
});

describe("sumCommissions", () => {
  it("sums commission amounts", () => {
    expect(sumCommissions([{ orderId: "o1", rate: 10, commission: 10 }, { orderId: "o2", rate: 10, commission: 20 }])).toBe(30);
  });

  it("returns 0 for an empty list", () => {
    expect(sumCommissions([])).toBe(0);
  });
});
