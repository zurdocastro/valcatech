import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await db.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json(sessions.map((s) => ({
    id: s.id, name: s.name, email: s.email, phone: s.phone, updatedAt: s.updatedAt,
    lastMessage: s.messages[0]?.body ?? "",
  })));
}
