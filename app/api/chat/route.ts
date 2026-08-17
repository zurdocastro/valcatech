import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateReply, type Locale } from "@/lib/chatAgent";

// Public endpoint — the site chat widget talks to this with only a
// browser-generated visitorId, no login required (same trust model as the
// disclaimer-gated guest browsing already used elsewhere on the storefront).
export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });

  const session = await db.chatSession.findUnique({ where: { visitorId } });
  if (!session) return NextResponse.json({ messages: [] });

  const messages = await db.chatMessage.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ messages: messages.map((m) => ({ role: m.role, body: m.body })) });
}

// Every user message reaching generateReply() triggers a real, billed
// Anthropic API call — and since visitorId is just a client-controlled
// localStorage UUID (no login), nothing stops a script from POSTing here
// directly at any rate, with any visitorId, bypassing the widget's
// disabled-while-loading button entirely. These limits exist specifically
// to bound that cost exposure, checked cheapest-first so an attacker never
// reaches the expensive LLM call:
//   1. reject oversized messages outright (bounds worst-case tokens/call)
//   2. cap requests per IP in a sliding window (the one signal that
//      survives an attacker rotating visitorId)
//   3. cap requests per session in the same window (defense in depth for
//      a single session being hammered directly)
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const IP_RATE_LIMIT = 30;
const SESSION_RATE_LIMIT = 15;
const LOG_RETENTION_MS = 24 * 60 * 60 * 1000;

const RATE_LIMIT_REPLY: Record<Locale, string> = {
  en: "You're sending messages a bit too fast — please wait a few minutes and try again.",
  es: "Estás enviando mensajes demasiado rápido — espera unos minutos e intenta de nuevo.",
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { visitorId, message, locale } = body;
  if (!visitorId || !message) return NextResponse.json({ error: "Missing visitorId or message" }, { status: 400 });

  const loc: Locale = locale === "es" ? "es" : "en";

  if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS);

  // Awaited, not fire-and-forget — Vercel can freeze the function the
  // instant the response is sent, so an un-awaited call here may never
  // actually run (see lib/orderPaymentLink.ts's callers for the same note).
  await db.chatRequestLog.create({ data: { ip } });
  await db.chatRequestLog.deleteMany({ where: { createdAt: { lt: new Date(now - LOG_RETENTION_MS) } } });

  const ipRequestCount = await db.chatRequestLog.count({ where: { ip, createdAt: { gte: windowStart } } });
  if (ipRequestCount > IP_RATE_LIMIT) {
    return NextResponse.json({ reply: RATE_LIMIT_REPLY[loc] }, { status: 429 });
  }

  const session = await db.chatSession.upsert({
    where: { visitorId },
    update: {},
    create: { visitorId },
  });

  const sessionMessageCount = await db.chatMessage.count({ where: { sessionId: session.id, role: "user", createdAt: { gte: windowStart } } });
  if (sessionMessageCount > SESSION_RATE_LIMIT) {
    return NextResponse.json({ reply: RATE_LIMIT_REPLY[loc] }, { status: 429 });
  }

  await db.chatMessage.create({ data: { sessionId: session.id, role: "user", body: message } });

  const reply = await generateReply(session, message, loc);

  await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", body: reply } });

  return NextResponse.json({ reply });
}
