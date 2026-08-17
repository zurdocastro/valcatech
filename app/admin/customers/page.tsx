"use client";
import { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, X, Check, MessageCircle, Upload, Download } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import { waLink } from "@/lib/whatsapp";
import Pagination from "@/components/admin/Pagination";

type Customer = { id: string; firstName: string; lastName: string; email: string; phone: string; address: string; company: string; notes: string; createdAt: string };
type ImportResult = { created: number; skipped: number; errors: { row: number; reason: string }[] };

const PAGE_SIZE = 20;
const TEMPLATE_CSV = "firstName,lastName,email,phone,company\nJane,Doe,jane@example.com,555-1234,Acme Inc";

export default function CustomersPage() {
  const router = useRouter();
  const { canWrite } = useAdminRole();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "" });
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/customers");
    if (res.ok) setCustomers(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm({ firstName: "", lastName: "", email: "", phone: "", company: "" }); setShowForm(true); }
  function openEdit(c: Customer) { setEditing(c); setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, company: c.company ?? "" }); setShowForm(true); }
  function close() { setShowForm(false); setEditing(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await fetch(`/api/customers/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setLoading(false);
    close();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  function openImport() { setImportResult(null); setImportError(""); setShowImport(true); }
  function closeImport() { setShowImport(false); }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/customers/import", { method: "POST", body });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) { setImportError(data.error || "Import failed."); }
    else { setImportResult(data); load(); }
    if (importFileRef.current) importFileRef.current.value = "";
  }

  const filtered = customers.filter((c) => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Customers</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{customers.length} customers total</p>
        </div>
        {canWrite && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={openImport} className="btn-outline" style={{ padding: "10px 18px", fontSize: 14 }}><Upload size={16} /> Import</button>
            <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New customer</button>
          </div>
        )}
      </div>

      <div style={{ position: "relative", maxWidth: 320, marginBottom: 20 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..." style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, background: "#fff", outline: "none" }} />
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Name", "Email", "Phone", "Company", ...(canWrite ? ["Actions"] : [])].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => (
              <tr key={c.id} onClick={() => router.push(`/admin/customers/${c.id}`)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{c.firstName} {c.lastName}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--muted)" }}>{c.email}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>
                  {c.phone ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {c.phone}
                      {waLink(c.phone) && (
                        <a
                          href={waLink(c.phone)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`WhatsApp ${c.firstName}`}
                          title="Chat on WhatsApp"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#25D366", flexShrink: 0 }}
                        >
                          <MessageCircle size={13} color="#fff" fill="#fff" />
                        </a>
                      )}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--muted)", maxWidth: 220 }}>{c.company || "—"}</td>
                {canWrite && (
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 460, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? "Edit customer" : "New customer"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="First name"><input required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} style={inputStyle} /></Field>
                <Field label="Last name"><input required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} style={inputStyle} /></Field>
              </div>
              <Field label="Email"><input required type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} /></Field>
              <Field label="Company"><input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} style={inputStyle} /></Field>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={close} className="btn-outline" style={{ padding: "10px 20px" }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "10px 20px" }}><Check size={15} /> {loading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Import customers</h2>
              <button onClick={closeImport} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Upload a CSV or Excel (.xlsx) file with your customers. Existing customers (matched by email) are skipped, not overwritten.
            </p>

            <button type="button" onClick={downloadTemplate} className="btn-outline" style={{ padding: "8px 14px", fontSize: 13, marginBottom: 20, display: "inline-flex" }}>
              <Download size={14} /> Download CSV template
            </button>

            <div>
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                disabled={importing}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
              >
                <Upload size={15} /> {importing ? "Importing..." : "Choose file to import"}
              </button>
              <input ref={importFileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} style={{ display: "none" }} />
            </div>

            {importError && (
              <p style={{ marginTop: 16, fontSize: 13, color: "#B91C1C", background: "var(--color-red-100)", padding: "10px 14px", borderRadius: 8 }}>{importError}</p>
            )}

            {importResult && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: importResult.errors.length ? 14 : 0 }}>
                  <span className="badge" style={{ background: "var(--color-green-100)", color: "var(--color-green-700)" }}>{importResult.created} added</span>
                  <span className="badge" style={{ background: "var(--mist)", color: "var(--muted)" }}>{importResult.skipped} already existed</span>
                  {importResult.errors.length > 0 && <span className="badge" style={{ background: "var(--color-red-100)", color: "#B91C1C" }}>{importResult.errors.length} skipped with errors</span>}
                </div>
                {importResult.errors.length > 0 && (
                  <div style={{ maxHeight: 160, overflow: "auto", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px" }}>
                    {importResult.errors.map((e, i) => (
                      <p key={i} style={{ fontSize: 12.5, color: "var(--muted)", margin: "4px 0" }}>
                        {e.row > 0 ? `Row ${e.row}: ` : ""}{e.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button type="button" onClick={closeImport} className="btn-outline" style={{ padding: "10px 20px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>{children}</div>;
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 14, outline: "none" };
