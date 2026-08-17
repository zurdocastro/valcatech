import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/auth";

// An affiliate session is only ever allowed to reach /admin/affiliates and a
// small allowlist of its supporting API routes — everything else in the
// backoffice (customers, orders, other affiliates' data, etc.) is off-limits,
// enforced here in one place rather than in every individual API route.
const AFFILIATE_ALLOWED_API_PREFIXES = ["/api/affiliates/me", "/api/auth/me", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifyAdminSession(token) : null;
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === "affiliate" && !pathname.startsWith("/admin/affiliates")) {
      return NextResponse.redirect(new URL("/admin/affiliates", req.url));
    }
  }

  if (pathname.startsWith("/api/") && !AFFILIATE_ALLOWED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifyAdminSession(token) : null;
    if (session?.role === "affiliate") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/:path*"] };
