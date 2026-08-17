import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySvixSignature } from "@/lib/webhookSignature";

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("RESEND_WEBHOOK_SECRET not set, rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 401 });
  }

  const rawBody = await req.text();
  if (!verifySvixSignature(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const type: string | undefined = payload?.type;
  const emailId: string | undefined = payload?.data?.email_id;
  if (!emailId) return NextResponse.json({ ok: true });

  const recipient = await db.emailRecipient.findFirst({ where: { messageId: emailId } });
  if (!recipient) return NextResponse.json({ ok: true });

  // Guard on current status so a recipient's open/delivery is only ever
  // counted once on the parent campaign, even if Resend redelivers the
  // webhook or the customer opens the email multiple times.
  if (type === "email.delivered" && recipient.status !== "delivered" && recipient.status !== "opened") {
    await db.$transaction([
      db.emailRecipient.update({ where: { id: recipient.id }, data: { status: "delivered" } }),
      db.emailCampaign.update({ where: { id: recipient.campaignId }, data: { deliveredCount: { increment: 1 } } }),
    ]);
  } else if (type === "email.opened" && recipient.status !== "opened") {
    await db.$transaction([
      db.emailRecipient.update({ where: { id: recipient.id }, data: { status: "opened" } }),
      db.emailCampaign.update({ where: { id: recipient.campaignId }, data: { openCount: { increment: 1 } } }),
    ]);
  } else if (type === "email.bounced" && recipient.status !== "bounced") {
    await db.$transaction([
      db.emailRecipient.update({ where: { id: recipient.id }, data: { status: "bounced" } }),
      db.emailCampaign.update({ where: { id: recipient.campaignId }, data: { bounceCount: { increment: 1 } } }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
