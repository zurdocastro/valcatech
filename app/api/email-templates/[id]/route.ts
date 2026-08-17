import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { name, subject, body, headerImageUrl, imageUrl, footerImageUrl } = await req.json();

  const template = await db.emailTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(subject !== undefined && { subject }),
      ...(body !== undefined && { body }),
      ...(headerImageUrl !== undefined && { headerImageUrl }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(footerImageUrl !== undefined && { footerImageUrl }),
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.emailTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
