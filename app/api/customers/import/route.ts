import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";
import { parseCustomersFile, MAX_IMPORT_ROWS } from "@/lib/customerImport";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canWrite(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });

  let parsed;
  try {
    parsed = parseCustomersFile(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read file. Make sure it's a valid CSV or Excel file." }, { status: 400 });
  }

  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    return NextResponse.json({ error: `This file has ${parsed.rows.length} rows — please split it into batches of ${MAX_IMPORT_ROWS} or fewer.` }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;
  const errors = [...parsed.errors];

  for (const row of parsed.rows) {
    try {
      const existing = await db.customer.findUnique({ where: { email: row.email } });
      if (existing) { skipped++; continue; }
      await db.customer.create({ data: row });
      created++;
    } catch (e) {
      errors.push({ row: 0, reason: `${row.email}: ${e instanceof Error ? e.message : "unknown error"}` });
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
