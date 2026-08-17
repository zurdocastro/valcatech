import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createAdminSession, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await db.adminUser.findUnique({ where: { email } });
  if (user && user.active) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (valid) {
      const token = await createAdminSession(user.id, user.email, user.role);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
      return res;
    }
  }

  // Affiliates share this same login form but aren't AdminUser rows — they're
  // a separate credential/table entirely (see prisma/schema.prisma Affiliate).
  const affiliate = await db.affiliate.findUnique({ where: { email } });
  if (affiliate && affiliate.active) {
    const valid = await bcrypt.compare(password, affiliate.passwordHash);
    if (valid) {
      const token = await createAdminSession("", affiliate.email, "affiliate", affiliate.id);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
      return res;
    }
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
