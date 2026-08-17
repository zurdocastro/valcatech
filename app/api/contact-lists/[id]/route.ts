import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const list = await db.contactList.findUnique({ where: { id }, include: { members: { include: { customer: true } } } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(list);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { name, description, customerIds } = await req.json();

  await db.contactList.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });

  // customerIds, when provided, replaces the full member set — simplest
  // correct semantics for a "these are the members now" edit from the UI,
  // rather than diffing individual adds/removes.
  if (Array.isArray(customerIds)) {
    await db.contactListMember.deleteMany({ where: { listId: id } });
    if (customerIds.length > 0) {
      await db.contactListMember.createMany({ data: customerIds.map((customerId: string) => ({ listId: id, customerId })) });
    }
  }

  const updated = await db.contactList.findUnique({ where: { id }, include: { members: { include: { customer: true } } } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.contactList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
