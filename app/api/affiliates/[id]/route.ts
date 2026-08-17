import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite, isStaff } from "@/lib/permissions";
import { getAffiliateStats } from "@/lib/affiliateStats";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !isStaff(session.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const stats = await getAffiliateStats(id);
  if (!stats) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  return NextResponse.json(stats);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.customerDiscountType !== undefined && { customerDiscountType: body.customerDiscountType === "fixed" ? "fixed" : "percent" }),
    ...(body.customerDiscountValue !== undefined && { customerDiscountValue: Number(body.customerDiscountValue) }),
    ...(body.baseCommissionRate !== undefined && { baseCommissionRate: Number(body.baseCommissionRate) }),
    ...(body.active !== undefined && { active: Boolean(body.active) }),
  };
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  if (Array.isArray(body.tiers)) {
    // Simplest correct way to replace a small nested list: drop and
    // recreate. Affiliates have at most a handful of tiers, so this is
    // cheap and avoids diffing existing tier rows by id.
    await db.affiliateTier.deleteMany({ where: { affiliateId: id } });
    data.tiers = { create: body.tiers.map((t: { minSales: number; rate: number }) => ({ minSales: Number(t.minSales) || 0, rate: Number(t.rate) || 0 })) };
  }

  await db.affiliate.update({ where: { id }, data });
  const stats = await getAffiliateStats(id);
  return NextResponse.json(stats);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.affiliate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
