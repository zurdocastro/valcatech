export type PromoCodeMatch =
  | { valid: true; kind: "affiliate"; affiliateId: string; discountType: "fixed" | "percent"; discountValue: number }
  | { valid: true; kind: "discount"; discountCodeId: string; discountType: "fixed" | "percent"; discountValue: number }
  | { valid: false; error: string };

type AffiliateRecord = { id: string; active: boolean; customerDiscountType: string; customerDiscountValue: number };
type DiscountCodeRecord = { id: string; active: boolean; type: string; value: number; maxUses: number | null; usedCount: number };

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

// Pure decision logic, separated from the DB lookup (see app/api/checkout/*)
// so it's directly unit-testable. Affiliate codes and discount codes share
// one uniqueness namespace enforced at creation time, so at most one of the
// two records is ever passed in.
export function evaluatePromoCode(affiliate: AffiliateRecord | null, discountCode: DiscountCodeRecord | null): PromoCodeMatch {
  if (affiliate) {
    if (!affiliate.active) return { valid: false, error: "This code is no longer active." };
    return {
      valid: true,
      kind: "affiliate",
      affiliateId: affiliate.id,
      discountType: affiliate.customerDiscountType as "fixed" | "percent",
      discountValue: affiliate.customerDiscountValue,
    };
  }
  if (discountCode) {
    if (!discountCode.active) return { valid: false, error: "This code is no longer active." };
    if (discountCode.maxUses !== null && discountCode.usedCount >= discountCode.maxUses) {
      return { valid: false, error: "This code has reached its usage limit." };
    }
    return {
      valid: true,
      kind: "discount",
      discountCodeId: discountCode.id,
      discountType: discountCode.type as "fixed" | "percent",
      discountValue: discountCode.value,
    };
  }
  return { valid: false, error: "Invalid code." };
}

// Never lets a discount exceed the subtotal (so an order can't go negative)
// or go below zero (a misconfigured negative-value code shouldn't increase
// the total).
export function computeDiscountAmount(subtotal: number, discountType: "fixed" | "percent", discountValue: number): number {
  const raw = discountType === "percent" ? subtotal * (discountValue / 100) : discountValue;
  return Math.max(0, Math.min(raw, subtotal));
}
