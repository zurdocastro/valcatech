// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  createAdminSession,
  createCustomerSession,
  verifyAdminSession,
  verifyCustomerSession,
} from "./auth";

describe("auth sessions", () => {
  it("round-trips an admin session with the correct payload", async () => {
    const token = await createAdminSession("admin-1", "admin@pureblendlabs.com", "super_admin");
    const payload = await verifyAdminSession(token);
    expect(payload).toMatchObject({
      userId: "admin-1",
      email: "admin@pureblendlabs.com",
      role: "super_admin",
    });
  });

  it("round-trips a customer session with the correct payload", async () => {
    const token = await createCustomerSession("cust-1", "customer@example.com");
    const payload = await verifyCustomerSession(token);
    expect(payload).toMatchObject({
      customerId: "cust-1",
      email: "customer@example.com",
    });
  });

  it("rejects a garbage token instead of throwing", async () => {
    await expect(verifyAdminSession("not-a-real-jwt")).resolves.toBeNull();
    await expect(verifyCustomerSession("not-a-real-jwt")).resolves.toBeNull();
  });

  // Regression: session-cookie confusion — a customer token, if placed in the
  // admin cookie slot (e.g. copied via browser devtools, since both cookies
  // are signed with the same AUTH_SECRET), was accepted by every admin GET
  // route that only checked `if (!session)` without checking session shape.
  // That gave any customer read access to /api/customers, /api/products,
  // /api/orders, /api/stats, /api/expenses, /api/emails and /api/users.
  // Found by /qa on 2026-07-05.
  it("never lets a customer token verify as an admin session", async () => {
    const customerToken = await createCustomerSession("cust-2", "customer2@example.com");
    await expect(verifyAdminSession(customerToken)).resolves.toBeNull();
  });

  // Symmetric check: an admin token must not verify as a customer session
  // either (it has no customerId claim, which would previously have produced
  // `{ customerId: undefined }` — Prisma treats an undefined `where` filter as
  // "no filter", which would leak every customer's orders via /api/account/orders).
  it("never lets an admin token verify as a customer session", async () => {
    const adminToken = await createAdminSession("admin-2", "admin2@pureblendlabs.com", "admin");
    await expect(verifyCustomerSession(adminToken)).resolves.toBeNull();
  });

  it("round-trips an affiliate session with its affiliateId claim", async () => {
    const token = await createAdminSession("", "affiliate@example.com", "affiliate", "aff-1");
    const payload = await verifyAdminSession(token);
    expect(payload).toMatchObject({ email: "affiliate@example.com", role: "affiliate", affiliateId: "aff-1" });
  });

  it("rejects a role: affiliate token that's missing its affiliateId claim", async () => {
    const token = await createAdminSession("", "affiliate@example.com", "affiliate");
    await expect(verifyAdminSession(token)).resolves.toBeNull();
  });
});
