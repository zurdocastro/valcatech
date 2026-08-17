import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";
import { getResend, SUPPORT_EMAIL, renderCampaignEmailHtml } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/emailTemplate";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const campaigns = await db.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, include: { recipients: false } });
  return NextResponse.json({ campaigns, resendConfigured: !!getResend(), webhookConfigured: !!process.env.RESEND_WEBHOOK_SECRET });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { subject, body: htmlBody, headerImageUrl, imageUrl, footerImageUrl, sendNow, customerIds, listId } = body;

  const campaign = await db.emailCampaign.create({
    data: { subject, body: htmlBody, headerImageUrl: headerImageUrl ?? "", imageUrl: imageUrl ?? "", footerImageUrl: footerImageUrl ?? "", status: sendNow ? "sending" : "draft" },
  });

  if (sendNow) {
    const customers = listId
      ? (await db.contactListMember.findMany({ where: { listId }, include: { customer: true } })).map((m) => m.customer)
      : Array.isArray(customerIds) && customerIds.length > 0
      ? await db.customer.findMany({ where: { id: { in: customerIds } } })
      : await db.customer.findMany();
    const resend = getResend();
    for (const customer of customers) {
      let messageId = "";
      let status = "skipped";
      if (resend) {
        try {
          const personalizedSubject = renderEmailTemplate(subject, customer);
          const result = await resend.emails.send({
            from: "PureBlendLabs <orders@pureblendlabs.com>",
            replyTo: SUPPORT_EMAIL,
            to: customer.email,
            subject: personalizedSubject,
            html: renderCampaignEmailHtml({ body: htmlBody, headerImageUrl, imageUrl, footerImageUrl }, customer),
          });
          // Resend never throws on API-level errors (e.g. an unverified sending
          // domain) — it resolves with { data: null, error }. Must check both.
          if (result.error) {
            console.error(`Campaign email to ${customer.email} failed:`, result.error);
            status = "failed";
          } else {
            messageId = result.data?.id ?? "";
            status = "sent";
          }
        } catch (e) {
          console.error(`Campaign email to ${customer.email} failed:`, e);
          status = "failed";
        }
      }
      await db.emailRecipient.create({ data: { campaignId: campaign.id, customerId: customer.id, email: customer.email, messageId, status } });
    }
    // deliveredCount/openCount/bounceCount are updated later by the Resend
    // webhook (app/api/webhooks/resend) as delivery/open/bounce events come
    // in — a successful API call here only means Resend accepted the send,
    // not that it was actually delivered.
    await db.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: "sent", sentAt: new Date(), recipientCount: customers.length },
    });
  }

  const updated = await db.emailCampaign.findUnique({ where: { id: campaign.id } });
  return NextResponse.json(updated, { status: 201 });
}
