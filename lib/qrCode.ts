// Where a discount/affiliate code's QR points: scanning it should do exactly
// what typing the code into the cart does, so it's just the cart page with
// the code pre-filled as a query param (see app/[locale]/cart/page.tsx,
// which reads ?code= on mount and applies it automatically).
export function buildPromoCodeUrl(code: string, baseUrl?: string): string {
  const base = (baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://pureblendlabs.com").replace(/\/$/, "");
  return `${base}/en/cart?code=${encodeURIComponent(code)}`;
}
