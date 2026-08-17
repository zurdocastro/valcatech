"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import QrCodeButton from "@/components/admin/QrCodeButton";
import Pagination from "@/components/admin/Pagination";

type DiscountCode = { id: string; code: string; type: string; value: number; maxUses: number | null; usedCount: number; active: boolean; createdAt: string };

const PAGE_SIZE = 20;
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
const describeValue = (c: DiscountCode) => (c.type === "percent" ? `${c.value}%` : fmt(c.value));

export default function DiscountCodesPage() {
  const { canWrite } = useAdminRole();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "", active: true });
  const [page, setPage] = useState(1);

  const load = useCallback(async () => { const r = await fetch("/api/discount-codes"); if (r.ok) setCodes(await r.json()); }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setError(""); setForm({ code: "", type: "percent", value: "", maxUses: "", active: true }); setShowForm(true); }
  function openEdit(c: DiscountCode) { setEditing(c); setError(""); setForm({ code: c.code, type: c.type, value: String(c.value), maxUses: c.maxUses === null ? "" : String(c.maxUses), active: c.active }); setShowForm(true); }
  function close() { setShowForm(false); setEditing(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = { code: form.code, type: form.type, value: Number(form.value), maxUses: form.maxUses === "" ? null : Number(form.maxUses), active: form.active };
    const res = editing
      ? await fetch(`/api/discount-codes/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/discount-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Could not save the code."); return; }
    close(); load();
  }

  async function toggleActive(c: DiscountCode) {
    await fetch(`/api/discount-codes/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }) });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/discount-codes/${id}`, { method: "DELETE" });
    load();
  }

  const totalPages = Math.max(1, Math.ceil(codes.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = codes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Discount Codes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{codes.length} codes</p>
        </div>
        {canWrite && <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New code</button>}
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Code", "Discount", "Uses", "Status", "QR", ...(canWrite ? ["Actions"] : [])].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No discount codes yet</td></tr>}
            {paged.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }}>{c.code}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{describeValue(c)}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : " (unlimited)"}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span className="badge" style={{ background: c.active ? "var(--color-green-100)" : "var(--color-red-100)", color: c.active ? "var(--color-green-700)" : "#B91C1C" }}>{c.active ? "Active" : "Inactive"}</span>
                </td>
                <td style={{ padding: "12px 14px" }}><QrCodeButton code={c.code} /></td>
                {canWrite && (
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleActive(c)} className="btn-outline" style={{ padding: "6px 10px", fontSize: 12 }}>{c.active ? "Deactivate" : "Activate"}</button>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? "Edit discount code" : "New discount code"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Code</label>
                <input required disabled={!!editing} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} style={{ ...inputStyle, fontFamily: "var(--font-mono)", textTransform: "uppercase" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Discount type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle}>
                    <option value="percent">Percent off order</option>
                    <option value="fixed">Fixed amount off order</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{form.type === "percent" ? "Percent (%)" : "Amount (USD)"}</label>
                  <input required type="number" min={0} step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Max uses (leave blank for unlimited)</label>
                <input type="number" min={0} value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} style={inputStyle} placeholder="Unlimited" />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active
              </label>
              {error && <p style={{ color: "#B91C1C", fontSize: 13 }}>{error}</p>}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={close} className="btn-outline" style={{ padding: "10px 20px" }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "10px 20px" }}><Check size={15} /> {loading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 14, outline: "none" };
