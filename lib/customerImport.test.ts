import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseCustomersFile } from "./customerImport";

function csvToBuffer(csv: string): ArrayBuffer {
  return new TextEncoder().encode(csv).buffer as ArrayBuffer;
}

function xlsxToBuffer(rows: Record<string, unknown>[]): ArrayBuffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("parseCustomersFile", () => {
  it("parses a CSV with standard English headers", () => {
    const csv = "firstName,lastName,email,phone,address\nJane,Doe,jane@example.com,555-1234,123 Main St";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "555-1234", address: "123 Main St", company: "" }]);
  });

  it("matches Spanish header aliases", () => {
    const csv = "Nombre,Apellido,Correo,Telefono,Direccion\nJuan,Perez,juan@example.com,8888-0000,San Jose";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ firstName: "Juan", lastName: "Perez", email: "juan@example.com", phone: "8888-0000", address: "San Jose", company: "" }]);
  });

  it("matches accented Spanish headers", () => {
    const csv = "Nombre,Apellido,Correo,Teléfono,Dirección\nAna,Lopez,ana@example.com,7777-1111,Alajuela";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(errors).toEqual([]);
    expect(rows[0].phone).toBe("7777-1111");
    expect(rows[0].address).toBe("Alajuela");
  });

  it("splits a single full-name column into first/last name", () => {
    const csv = "Full Name,Email\nJohn Michael Smith,john@example.com";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(errors).toEqual([]);
    expect(rows[0].firstName).toBe("John");
    expect(rows[0].lastName).toBe("Michael Smith");
  });

  it("reports a row missing an email with its row number", () => {
    const csv = "firstName,lastName,email\nJane,Doe,jane@example.com\nBob,Smith,";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(rows).toHaveLength(1);
    expect(errors).toEqual([{ row: 3, reason: "Missing email" }]);
  });

  it("reports a row missing a first name", () => {
    const csv = "firstName,lastName,email\n,Doe,jane@example.com";
    const { rows, errors } = parseCustomersFile(csvToBuffer(csv));
    expect(rows).toHaveLength(0);
    expect(errors).toEqual([{ row: 2, reason: "Missing first name" }]);
  });

  it("parses an .xlsx workbook the same way as CSV", () => {
    const buffer = xlsxToBuffer([{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "", address: "" }]);
    const { rows, errors } = parseCustomersFile(buffer);
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "", address: "", company: "" }]);
  });

  it("ignores unrecognized columns", () => {
    const csv = "firstName,lastName,email,notes\nJane,Doe,jane@example.com,VIP customer";
    const { rows } = parseCustomersFile(csvToBuffer(csv));
    expect(rows[0]).not.toHaveProperty("notes");
  });
});
