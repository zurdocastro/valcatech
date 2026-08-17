import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAffiliateStats } from "@/lib/affiliateStats";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "affiliate" || !session.affiliateId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getAffiliateStats(session.affiliateId);
  if (!stats) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  return NextResponse.json(stats);
}
