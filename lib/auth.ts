import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "valcatech-dev-fallback-secret"
);

// Two fully isolated session cookies: an admin session can never be used to
// read customer-portal data and vice versa. Every /api/account/* route reads
// customerId from ACCOUNT_COOKIE's own payload — never from the request body.
export const ADMIN_COOKIE = "valca_admin_session";
export const ACCOUNT_COOKIE = "valca_customer_session";

// `affiliateId` is only set for role "affiliate" — affiliates aren't
// AdminUser rows, they're a separate Affiliate credential, so `userId` is
// left empty for them and `affiliateId` is the subject id instead.
export async function createAdminSession(userId: string, email: string, role: string, affiliateId?: string) {
  return new SignJWT({ userId, email, role, ...(affiliateId ? { affiliateId } : {}) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function createCustomerSession(customerId: string, email: string) {
  return new SignJWT({ customerId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

async function verify<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as T;
  } catch {
    return null;
  }
}

const ADMIN_ROLES = ["super_admin", "admin", "viewer", "affiliate"];

export async function verifyAdminSession(token: string) {
  const payload = await verify<{ userId: string; email: string; role: string; affiliateId?: string }>(token);
  // Both cookies are signed with the same secret, so a customer token is a
  // cryptographically valid JWT here too — it just lacks admin claims. Without
  // this shape check, a customer session placed in the admin cookie (e.g. via
  // browser devtools) would pass every `if (!session)` guard in the admin API.
  if (!payload || typeof payload.userId !== "string" || !ADMIN_ROLES.includes(payload.role)) return null;
  if (payload.role === "affiliate" && typeof payload.affiliateId !== "string") return null;
  return payload;
}

export async function verifyCustomerSession(token: string) {
  const payload = await verify<{ customerId: string; email: string }>(token);
  if (!payload || typeof payload.customerId !== "string") return null;
  return payload;
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export async function getCustomerSession() {
  const store = await cookies();
  const token = store.get(ACCOUNT_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSession(token);
}
