import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";

export async function GET() {
  const session = await getAdminSession();
  if (!session || !canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, email: true, name: true, role: true, active: true, createdAt: true } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.email || !body.password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await db.adminUser.create({ data: { email: body.email, name: body.name ?? "", role: body.role ?? "admin", passwordHash, active: true } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, active: user.active }, { status: 201 });
}
