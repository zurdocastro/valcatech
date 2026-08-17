import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite, isStaff } from "@/lib/permissions";
import { normalizePromoCode } from "@/lib/promoCode";
import { getAffiliateStats } from "@/lib/affiliateStats";

export async function GET() {
  const session = await getAdminSession();
  if (!session || !isStaff(session.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const affiliates = await db.affiliate.findMany({ orderBy: { createdAt: "desc" } });
  // Affiliate counts are typically small (tens, not thousands), so computing
  // full stats per row here is simpler and always correct — no separate
  // cached/denormalized totals to keep in sync.
  const withStats = await Promise.all(affiliates.map((a) => getAffiliateStats(a.id)));
  return NextResponse.json(withStats.filter(Boolean));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  const code = normalizePromoCode(body.code ?? "");
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!body.name || !body.email || !body.password) return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });

  const [existingAffiliate, existingCode, existingEmail] = await Promise.all([
    db.affiliate.findUnique({ where: { code } }),
    db.discountCode.findUnique({ where: { code } }),
    db.affiliate.findUnique({ where: { email: body.email } }),
  ]);
  if (existingAffiliate || existingCode) return NextResponse.json({ error: "That code is already in use." }, { status: 409 });
  if (existingEmail) return NextResponse.json({ error: "An affiliate with that email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(body.password, 10);
  const tiers = Array.isArray(body.tiers) ? body.tiers : [];

  const affiliate = await db.affiliate.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      code,
      customerDiscountType: body.customerDiscountType === "fixed" ? "fixed" : "percent",
      customerDiscountValue: Number(body.customerDiscountValue) || 0,
      baseCommissionRate: Number(body.baseCommissionRate) || 0,
      tiers: { create: tiers.map((t: { minSales: number; rate: number }) => ({ minSales: Number(t.minSales) || 0, rate: Number(t.rate) || 0 })) },
    },
  });
  return NextResponse.json(affiliate, { status: 201 });
}
