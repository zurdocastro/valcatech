import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const chatSession = await db.chatSession.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!chatSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(chatSession);
}
