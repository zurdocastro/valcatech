import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const discountCode = await db.discountCode.update({
    where: { id },
    data: {
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses === null || body.maxUses === "" ? null : Number(body.maxUses) }),
      ...(body.active !== undefined && { active: Boolean(body.active) }),
    },
  });
  return NextResponse.json(discountCode);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.discountCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
