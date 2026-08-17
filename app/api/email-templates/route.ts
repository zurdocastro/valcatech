import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const templates = await db.emailTemplate.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, subject, body, headerImageUrl, imageUrl, footerImageUrl } = await req.json();
  if (!name?.trim() || !subject?.trim()) return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });

  const template = await db.emailTemplate.create({
    data: { name, subject, body: body ?? "", headerImageUrl: headerImageUrl ?? "", imageUrl: imageUrl ?? "", footerImageUrl: footerImageUrl ?? "" },
  });
  return NextResponse.json(template, { status: 201 });
}
