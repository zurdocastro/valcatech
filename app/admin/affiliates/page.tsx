"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Handshake, Copy } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import PasswordInput from "@/components/site/PasswordInput";
import QrCodeButton from "@/components/admin/QrCodeButton";

type Tier = { id?: string; minSales: number; rate: number };
type AffiliateSummary = {
  affiliate: {
    id: string; name: string; email: string; code: string;
    customerDiscountType: string; customerDiscountValue: number;
    baseCommissionRate: number; active: boolean; tiers: Tier[];
  };
  totalReferredCustomers: number;
  totalOrders: number;
  totalPaidOrders: number;
  totalRevenue: number;
  totalCommission: number;
  currentRate: number;
  customers: { id: string; name: string; email: string; orderCount: number; paidOrderCount: number; revenue: number; commission: number }[];
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
const describeDiscount = (type: string, value: number) => (type === "percent" ? `${value}% off` : `${fmt(value)} off`);

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800, color: accent ? "var(--violet-600)" : "var(--ink)" }}>{value}</p>
    </div>
  );
}

function AffiliateDetail({ stats }: { stats: AffiliateSummary }) {
  const { affiliate } = stats;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(affiliate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="card" style={{ padding: 20, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Your affiliate code</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 22 }}>{affiliate.code}</span>
            <button onClick={copyCode} className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }}><Copy size={13} /> {copied ? "Copied!" : "Copy"}</button>
            <QrCodeButton code={affiliate.code} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Customer discount</p>
          <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{describeDiscount(affiliate.customerDiscountType, affiliate.customerDiscountValue)}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
        <StatCard label="Referred customers" value={String(stats.totalReferredCustomers)} />
        <StatCard label="Paid orders" value={String(stats.totalPaidOrders)} />
        <StatCard label="Referred sales" value={fmt(stats.totalRevenue)} />
        <StatCard label="Current commission rate" value={`${stats.currentRate}%`} accent />
        <StatCard label="Commission earned" value={fmt(stats.totalCommission)} accent />
      </div>

      {affiliate.tiers.length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13 }}>Commission tiers</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="badge" style={{ background: "var(--mist)" }}>Base: {affiliate.baseCommissionRate}%</span>
            {[...affiliate.tiers].sort((a, b) => a.minSales - b.minSales).map((t, i) => (
              <span key={i} className="badge" style={{ background: "var(--mist)" }}>At {fmt(t.minSales)}+: {t.rate}%</span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Customer", "Orders", "Paid orders", "Sales", "Commission"].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.customers.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No referred customers yet</td></tr>}
            {stats.customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{c.email}</div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.orderCount}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.paidOrderCount}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{fmt(c.revenue)}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--violet-600)", fontWeight: 700 }}>{fmt(c.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptyForm = { name: "", email: "", password: "", code: "", customerDiscountType: "percent", customerDiscountValue: "", baseCommissionRate: "", active: true, tiers: [] as Tier[] };

export default function AffiliatesPage() {
  const { role, canWrite } = useAdminRole();
  const isAffiliate = role === "affiliate";

  const [ownStats, setOwnStats] = useState<AffiliateSummary | null>(null);
  const [list, setList] = useState<AffiliateSummary[]>([]);
  const [selected, setSelected] = useState<AffiliateSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AffiliateSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const loadOwn = useCallback(async () => {
    const r = await fetch("/api/affiliates/me");
    if (r.ok) setOwnStats(await r.json());
  }, []);
  const loadList = useCallback(async () => {
    const r = await fetch("/api/affiliates");
    if (r.ok) setList(await r.json());
  }, []);

  useEffect(() => {
    if (role === null) return;
    if (isAffiliate) loadOwn();
    else loadList();
  }, [role, isAffiliate, loadOwn, loadList]);

  function openCreate() { setEditing(null); setError(""); setForm(emptyForm); setShowForm(true); }
  function openEdit(a: AffiliateSummary) {
    setEditing(a);
    setError("");
    setForm({
      name: a.affiliate.name, email: a.affiliate.email, password: "", code: a.affiliate.code,
      customerDiscountType: a.affiliate.customerDiscountType, customerDiscountValue: String(a.affiliate.customerDiscountValue),
      baseCommissionRate: String(a.affiliate.baseCommissionRate), active: a.affiliate.active,
      tiers: a.affiliate.tiers.map((t) => ({ minSales: t.minSales, rate: t.rate })),
    });
    setShowForm(true);
  }
  function close() { setShowForm(false); setEditing(null); }

  function addTierRow() { setForm((f) => ({ ...f, tiers: [...f.tiers, { minSales: 0, rate: 0 }] })); }
  function updateTierRow(i: number, field: "minSales" | "rate", value: string) {
    setForm((f) => ({ ...f, tiers: f.tiers.map((t, idx) => (idx === i ? { ...t, [field]: Number(value) || 0 } : t)) }));
  }
  function removeTierRow(i: number) { setForm((f) => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) })); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload: Record<string, unknown> = {
      name: form.name, email: form.email, code: form.code,
      customerDiscountType: form.customerDiscountType, customerDiscountValue: Number(form.customerDiscountValue) || 0,
      baseCommissionRate: Number(form.baseCommissionRate) || 0, active: form.active, tiers: form.tiers,
    };
    if (form.password) payload.password = form.password;

    const res = editing
      ? await fetch(`/api/affiliates/${editing.affiliate.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/affiliates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Could not save the affiliate."); return; }
    close();
    loadList();
    if (selected && editing && selected.affiliate.id === editing.affiliate.id) {
      const updated = await res.json();
      setSelected(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this affiliate? Their referred customers and past orders are kept, just unlinked.")) return;
    await fetch(`/api/affiliates/${id}`, { method: "DELETE" });
    if (selected?.affiliate.id === id) setSelected(null);
    loadList();
  }

  if (role === null) return null;

  if (isAffiliate) {
    return (
      <div style={{ padding: "32px 28px" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Affiliate Dashboard</h1>
        {ownStats ? <AffiliateDetail stats={ownStats} /> : <p style={{ color: "var(--muted)" }}>Loading...</p>}
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ padding: "32px 28px" }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--violet-600)", fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0, fontSize: 13.5 }}>← Back to affiliates</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{selected.affiliate.name}</h1>
          {canWrite && <button onClick={() => openEdit(selected)} className="btn-outline" style={{ padding: "9px 16px", fontSize: 13 }}><Pencil size={14} /> Edit</button>}
        </div>
        <AffiliateDetail stats={selected} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Affiliates</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{list.length} affiliates</p>
        </div>
        {canWrite && <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> Add affiliate</button>}
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Name", "Code", "Customers", "Sales", "Commission", "Status", ...(canWrite ? ["Actions"] : [])].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No affiliates yet</td></tr>}
            {list.map((a) => (
              <tr key={a.affiliate.id} onClick={() => setSelected(a)} style={{ borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Handshake size={14} color="var(--violet-600)" /> {a.affiliate.name}</div>
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{a.affiliate.code}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{a.totalReferredCustomers}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{fmt(a.totalRevenue)}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--violet-600)", fontWeight: 700 }}>{fmt(a.totalCommission)}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span className="badge" style={{ background: a.affiliate.active ? "var(--color-green-100)" : "var(--color-red-100)", color: a.affiliate.active ? "var(--color-green-700)" : "#B91C1C" }}>{a.affiliate.active ? "Active" : "Inactive"}</span>
                </td>
                {canWrite && (
                  <td style={{ padding: "12px 14px" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(a)} style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(a.affiliate.id)} style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? "Edit affiliate" : "Add affiliate"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={labelStyle}>Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Affiliate code</label><input required disabled={!!editing} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} style={{ ...inputStyle, fontFamily: "var(--font-mono)", textTransform: "uppercase" }} /></div>
              </div>
              <div><label style={labelStyle}>Login email</label><input required type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>{editing ? "New password (leave blank to keep current)" : "Password"}</label><PasswordInput required={!editing} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} style={inputStyle} /></div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Customer discount type</label>
                  <select value={form.customerDiscountType} onChange={(e) => setForm((f) => ({ ...f, customerDiscountType: e.target.value }))} style={inputStyle}>
                    <option value="percent">Percent off order</option>
                    <option value="fixed">Fixed amount off order</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{form.customerDiscountType === "percent" ? "Discount (%)" : "Discount (USD)"}</label>
                  <input required type="number" min={0} step="0.01" value={form.customerDiscountValue} onChange={(e) => setForm((f) => ({ ...f, customerDiscountValue: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div><label style={labelStyle}>Base commission rate (%)</label><input required type="number" min={0} step="0.01" value={form.baseCommissionRate} onChange={(e) => setForm((f) => ({ ...f, baseCommissionRate: e.target.value }))} style={inputStyle} /></div>

              <div>
                <label style={labelStyle}>Commission tiers (optional)</label>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: -2, marginBottom: 8 }}>Once cumulative referred sales reach an amount, that rate applies going forward.</p>
                {form.tiers.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <input type="number" min={0} placeholder="Sales ($)" value={t.minSales || ""} onChange={(e) => updateTierRow(i, "minSales", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" min={0} placeholder="Rate (%)" value={t.rate || ""} onChange={(e) => updateTierRow(i, "rate", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={() => removeTierRow(i)} style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "#B91C1C", flexShrink: 0 }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={addTierRow} className="btn-outline" style={{ padding: "8px 14px", fontSize: 12.5 }}><Plus size={13} /> Add tier</button>
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
