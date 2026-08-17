import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { renderCampaignEmailHtml } from "@/lib/email";

// A generic stand-in recipient for the preview — the actually-sent emails
// are personalized per real customer, but the design/layout is identical,
// which is all "see how this looked" needs.
const PREVIEW_CUSTOMER = { firstName: "Alex", lastName: "Doe" };

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const campaign = await db.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previewHtml = renderCampaignEmailHtml(
    { body: campaign.body, headerImageUrl: campaign.headerImageUrl, imageUrl: campaign.imageUrl, footerImageUrl: campaign.footerImageUrl },
    PREVIEW_CUSTOMER
  );

  return NextResponse.json({ ...campaign, previewHtml });
}
