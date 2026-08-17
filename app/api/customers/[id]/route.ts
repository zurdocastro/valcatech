import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      chatSessions: {
        orderBy: { createdAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const customer = await db.customer.update({
    where: { id },
    data: {
      ...(body.firstName !== undefined && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.company !== undefined && { company: body.company }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(customer);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
