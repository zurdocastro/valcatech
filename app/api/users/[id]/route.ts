import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12);
  const user = await db.adminUser.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true, active: true } });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (id === session.userId) return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  await db.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
