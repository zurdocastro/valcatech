import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminLayout from "./layout";

let mockPathname = "/admin/login";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Regression: ISSUE-002 — the role-fetch effect had an empty dependency
// array, so it only ran once on mount. Because AdminLayout persists across
// the client-side router.push from /admin/login to /admin after a
// successful login, the sidebar stayed stuck showing the pre-login (no
// role) state — hiding the Users nav item and role badge — until a manual
// page reload. Fix: depend on pathname so the effect re-fires on the
// login -> dashboard transition, same pattern as SiteHeader.tsx.
// Found by /qa on 2026-07-05.
describe("AdminLayout role refresh", () => {
  beforeEach(() => {
    mockPathname = "/admin/login";
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ role: "super_admin" }) }))
    );
  });

  it("re-fetches the admin role when the route changes after login", async () => {
    const { rerender } = render(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Simulate the post-login client-side navigation from /admin/login to /admin.
    mockPathname = "/admin";
    rerender(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(await screen.findAllByText("Users")).not.toHaveLength(0);
  });
});
