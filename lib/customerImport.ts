import * as XLSX from "xlsx";

export type ParsedCustomerRow = { firstName: string; lastName: string; email: string; phone: string; address: string; company: string };
export type ParseResult = { rows: ParsedCustomerRow[]; errors: { row: number; reason: string }[] };

export const MAX_IMPORT_ROWS = 2000;

// Column headers vary a lot between whatever CRM/spreadsheet an admin
// exports from, so we match on a normalized (lowercased, accent-stripped)
// header against a handful of common English/Spanish aliases rather than
// requiring one exact set of column names.
const FIELD_ALIASES: Record<string, keyof ParsedCustomerRow | "name"> = {
  firstname: "firstName", "first name": "firstName", nombre: "firstName",
  lastname: "lastName", "last name": "lastName", apellido: "lastName", apellidos: "lastName",
  email: "email", "e-mail": "email", correo: "email", "correo electronico": "email",
  phone: "phone", telefono: "phone", celular: "phone", whatsapp: "phone",
  address: "address", direccion: "address", "shipping address": "address",
  company: "company", empresa: "company", compania: "company", organization: "company", organizacion: "company",
  name: "name", "full name": "name", "nombre completo": "name",
};

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// SheetJS assumes Latin-1 for plain-text (CSV) input without a byte-order
// mark, which mangles accented headers/values in UTF-8 files (e.g. "Tel\u00e9fono"
// becomes "Tel\u00c3\u00a9fono"). Prepending a UTF-8 BOM fixes decoding. Real .xlsx/.xls
// files are zip archives (start with the "PK" signature) and must be left
// untouched.
function ensureUtf8Bom(buffer: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(buffer);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  if (isZip || hasBom) return buffer;
  const combined = new Uint8Array(3 + bytes.length);
  combined.set([0xef, 0xbb, 0xbf], 0);
  combined.set(bytes, 3);
  return combined.buffer;
}

export function parseCustomersFile(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(ensureUtf8Bom(buffer), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const rows: ParsedCustomerRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  raw.forEach((record, index) => {
    const rowNumber = index + 2; // +1 for the header row, +1 to be 1-indexed
    const mapped: Partial<Record<keyof ParsedCustomerRow | "name", string>> = {};
    for (const [key, value] of Object.entries(record)) {
      const field = FIELD_ALIASES[normalizeHeader(key)];
      if (field) mapped[field] = String(value ?? "").trim();
    }

    let firstName = mapped.firstName ?? "";
    let lastName = mapped.lastName ?? "";
    if (!firstName && !lastName && mapped.name) {
      const parts = mapped.name.split(/\s+/);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }

    const email = mapped.email ?? "";
    if (!email) { errors.push({ row: rowNumber, reason: "Missing email" }); return; }
    if (!firstName) { errors.push({ row: rowNumber, reason: "Missing first name" }); return; }

    rows.push({ firstName, lastName, email, phone: mapped.phone ?? "", address: mapped.address ?? "", company: mapped.company ?? "" });
  });

  return { rows, errors };
}
