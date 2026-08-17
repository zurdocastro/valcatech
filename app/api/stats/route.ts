import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // `<input type="date">` sends a bare "YYYY-MM-DD", which `new Date()` parses
  // as UTC midnight. Appending a time makes it parse in the server's local
  // zone instead — without that, west-of-UTC deployments (Costa Rica is
  // UTC-6) end the range at 05:59 UTC and silently drop everything captured
  // later the same day, so today's leads never show up.
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(`${fromParam}T00:00:00`) : undefined;
  const to = toParam ? new Date(`${toParam}T23:59:59.999`) : undefined;
  const dateFilter = from || to ? { gte: from, lte: to } : undefined;
  const where = dateFilter ? { createdAt: dateFilter } : undefined;

  const [leads, totalLeads, chatSessions, campaigns, emailRecipients] = await Promise.all([
    db.customer.findMany({ where, orderBy: { createdAt: "asc" } }),
    db.customer.count(),
    db.chatSession.findMany({ where, select: { id: true, customerId: true } }),
    db.emailCampaign.findMany({ where: dateFilter ? { sentAt: dateFilter } : { status: "sent" } }),
    db.emailRecipient.count({ where }),
  ]);

  // Daily time series over the selected range, driving the dashboard charts.
  const byDay = new Map<string, { date: string; leads: number }>();
  for (const lead of leads) {
    const day = lead.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { date: day, leads: 0 };
    entry.leads += 1;
    byDay.set(day, entry);
  }
  const series = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));

  const sources = ["contact_form", "chat", "manual"].map((source) => ({
    source,
    count: leads.filter((l) => (l.source || "manual") === source).length,
  }));

  return NextResponse.json({
    newLeads: leads.length,
    totalLeads,
    chatSessions: chatSessions.length,
    chatConverted: chatSessions.filter((s) => s.customerId).length,
    campaignsSent: campaigns.filter((c) => c.status === "sent").length,
    emailsDelivered: emailRecipients,
    series,
    sources,
  });
}
