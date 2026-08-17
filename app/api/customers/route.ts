import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customers = await db.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const existing = await db.customer.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json(existing);
  const customer = await db.customer.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? "",
      address: body.address ?? "",
      company: body.company ?? "",
      notes: body.notes ?? "",
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
