import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite, isStaff } from "@/lib/permissions";
import { normalizePromoCode } from "@/lib/promoCode";

export async function GET() {
  const session = await getAdminSession();
  if (!session || !isStaff(session.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();

  const code = normalizePromoCode(body.code ?? "");
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!["fixed", "percent"].includes(body.type)) return NextResponse.json({ error: "Type must be fixed or percent" }, { status: 400 });

  // Affiliate codes and discount codes share one uniqueness namespace since
  // both are looked up against the same single "code" field at checkout.
  const [existingAffiliate, existingCode] = await Promise.all([
    db.affiliate.findUnique({ where: { code } }),
    db.discountCode.findUnique({ where: { code } }),
  ]);
  if (existingAffiliate || existingCode) return NextResponse.json({ error: "That code is already in use." }, { status: 409 });

  const discountCode = await db.discountCode.create({
    data: {
      code,
      type: body.type,
      value: Number(body.value) || 0,
      maxUses: body.maxUses === null || body.maxUses === undefined || body.maxUses === "" ? null : Number(body.maxUses),
      active: body.active ?? true,
    },
  });
  return NextResponse.json(discountCode, { status: 201 });
}
