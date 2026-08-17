import { describe, it, expect } from "vitest";
import { normalizePromoCode, evaluatePromoCode, computeDiscountAmount } from "./promoCode";

describe("normalizePromoCode", () => {
  it("trims whitespace and uppercases", () => {
    expect(normalizePromoCode("  save10 ")).toBe("SAVE10");
  });
});

describe("evaluatePromoCode", () => {
  it("returns an affiliate match when an active affiliate is given", () => {
    const result = evaluatePromoCode({ id: "aff-1", active: true, customerDiscountType: "percent", customerDiscountValue: 10 }, null);
    expect(result).toEqual({ valid: true, kind: "affiliate", affiliateId: "aff-1", discountType: "percent", discountValue: 10 });
  });

  it("rejects an inactive affiliate", () => {
    const result = evaluatePromoCode({ id: "aff-1", active: false, customerDiscountType: "percent", customerDiscountValue: 10 }, null);
    expect(result).toEqual({ valid: false, error: "This code is no longer active." });
  });

  it("returns a discount code match when an active code with room left is given", () => {
    const result = evaluatePromoCode(null, { id: "dc-1", active: true, type: "fixed", value: 15, maxUses: 10, usedCount: 3 });
    expect(result).toEqual({ valid: true, kind: "discount", discountCodeId: "dc-1", discountType: "fixed", discountValue: 15 });
  });

  it("rejects an inactive discount code", () => {
    const result = evaluatePromoCode(null, { id: "dc-1", active: false, type: "fixed", value: 15, maxUses: null, usedCount: 0 });
    expect(result).toEqual({ valid: false, error: "This code is no longer active." });
  });

  it("rejects a discount code that has hit its usage cap", () => {
    const result = evaluatePromoCode(null, { id: "dc-1", active: true, type: "fixed", value: 15, maxUses: 5, usedCount: 5 });
    expect(result).toEqual({ valid: false, error: "This code has reached its usage limit." });
  });

  it("allows an unlimited-use discount code (maxUses null) regardless of usedCount", () => {
    const result = evaluatePromoCode(null, { id: "dc-1", active: true, type: "percent", value: 20, maxUses: null, usedCount: 9999 });
    expect(result.valid).toBe(true);
  });

  it("returns invalid when neither an affiliate nor a discount code matched", () => {
    const result = evaluatePromoCode(null, null);
    expect(result).toEqual({ valid: false, error: "Invalid code." });
  });

  it("prefers the affiliate match when (hypothetically) both are passed", () => {
    const result = evaluatePromoCode(
      { id: "aff-1", active: true, customerDiscountType: "percent", customerDiscountValue: 5 },
      { id: "dc-1", active: true, type: "fixed", value: 15, maxUses: null, usedCount: 0 }
    );
    expect(result).toMatchObject({ kind: "affiliate" });
  });
});

describe("computeDiscountAmount", () => {
  it("computes a percent discount", () => {
    expect(computeDiscountAmount(200, "percent", 10)).toBe(20);
  });

  it("computes a fixed discount", () => {
    expect(computeDiscountAmount(200, "fixed", 15)).toBe(15);
  });

  it("caps a fixed discount at the subtotal so the order can't go negative", () => {
    expect(computeDiscountAmount(10, "fixed", 50)).toBe(10);
  });

  it("caps a percent discount over 100% at the subtotal", () => {
    expect(computeDiscountAmount(50, "percent", 150)).toBe(50);
  });

  it("never returns a negative discount for a negative value", () => {
    expect(computeDiscountAmount(100, "fixed", -20)).toBe(0);
  });
});
