import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lists = await db.contactList.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { members: true } } } });
  return NextResponse.json(lists.map((l) => ({ ...l, memberCount: l._count.members, _count: undefined })));
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, description, customerIds } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const list = await db.contactList.create({
    data: {
      name,
      description: description ?? "",
      members: Array.isArray(customerIds) && customerIds.length > 0
        ? { create: customerIds.map((customerId: string) => ({ customerId })) }
        : undefined,
    },
    include: { _count: { select: { members: true } } },
  });
  return NextResponse.json({ ...list, memberCount: list._count.members, _count: undefined }, { status: 201 });
}
