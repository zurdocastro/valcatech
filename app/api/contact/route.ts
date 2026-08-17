import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendLeadNotification, sendLeadAcknowledgement } from "@/lib/email";

// Public, unauthenticated endpoint — anyone on the internet can POST here, so
// every field is length-capped and the IP is rate-limited before anything is
// written or emailed. ChatRequestLog is reused as the sliding-window counter
// (prefixed key) rather than adding a second near-identical table.
const LIMITS = { name: 120, email: 200, company: 160, phone: 40, message: 4000 };
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const IP_RATE_LIMIT = 5;

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = str(body.name, LIMITS.name);
  const email = str(body.email, LIMITS.email).toLowerCase();
  const company = str(body.company, LIMITS.company);
  const phone = str(body.phone, LIMITS.phone);
  const message = str(body.message, LIMITS.message);

  if (!name || !message) return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const ipKey = `contact:${clientIp(req)}`;
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  await db.chatRequestLog.create({ data: { ip: ipKey } });
  const recent = await db.chatRequestLog.count({ where: { ip: ipKey, createdAt: { gte: windowStart } } });
  if (recent > IP_RATE_LIMIT) {
    return NextResponse.json({ error: "Too many submissions — please try again shortly." }, { status: 429 });
  }

  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(" ") || "-";

  // A returning lead updates the existing row instead of failing on the
  // unique email — the newest message is the one the team needs to see.
  const existing = await db.customer.findUnique({ where: { email } });
  if (existing) {
    await db.customer.update({
      where: { id: existing.id },
      data: {
        phone: phone || existing.phone,
        company: company || existing.company,
        notes: [message, existing.notes].filter(Boolean).join("\n\n---\n\n").slice(0, 8000),
      },
    });
  } else {
    await db.customer.create({
      data: { firstName, lastName, email, phone, company, notes: message, source: "contact_form" },
    });
  }

  // Awaited, not fire-and-forget — Vercel can freeze the function the instant
  // the response is sent, so an un-awaited send may never actually run. The
  // lead is already persisted, so a mail failure must not fail the request.
  await Promise.allSettled([
    sendLeadNotification({ name, email, phone, company, message, source: "contact_form" }),
    sendLeadAcknowledgement({ to: email, name: firstName }),
  ]).then((results) => {
    for (const r of results) if (r.status === "rejected") console.error("Contact email failed:", r.reason);
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
