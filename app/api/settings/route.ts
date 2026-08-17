import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";

export async function GET() {
  const settings = await db.siteSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const settings = await db.siteSettings.update({
    where: { id: "default" },
    data: {
      ...(body.shippingFee !== undefined && { shippingFee: Number(body.shippingFee) }),
      ...(body.pagoTarjeta !== undefined && { pagoTarjeta: body.pagoTarjeta }),
      ...(body.agentInfo !== undefined && { agentInfo: body.agentInfo }),
      ...(body.shipperName !== undefined && { shipperName: body.shipperName }),
      ...(body.shipperCompany !== undefined && { shipperCompany: body.shipperCompany }),
      ...(body.shipperPhone !== undefined && { shipperPhone: body.shipperPhone }),
      ...(body.shipperStreet !== undefined && { shipperStreet: body.shipperStreet }),
      ...(body.shipperCity !== undefined && { shipperCity: body.shipperCity }),
      ...(body.shipperState !== undefined && { shipperState: body.shipperState }),
      ...(body.shipperZip !== undefined && { shipperZip: body.shipperZip }),
      ...(body.shipperCountry !== undefined && { shipperCountry: body.shipperCountry }),
      ...(body.defaultPackageWeightLb !== undefined && { defaultPackageWeightLb: Number(body.defaultPackageWeightLb) }),
    },
  });
  return NextResponse.json(settings);
}
