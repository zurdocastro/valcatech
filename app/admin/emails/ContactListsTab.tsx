"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import CustomerMultiSelect from "@/components/admin/CustomerMultiSelect";

type Customer = { id: string; firstName: string; lastName: string; email: string };
type ContactList = { id: string; name: string; description: string; memberCount: number };
type ContactListDetail = { id: string; name: string; description: string; members: { customer: Customer }[] };

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 14, outline: "none" };

export default function ContactListsTab({ customers, canWrite }: { customers: Customer[]; canWrite: boolean }) {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/contact-lists");
    if (res.ok) setLists(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditingId(null); setName(""); setDescription(""); setSelectedIds(new Set()); setShowForm(true); }

  async function openEdit(list: ContactList) {
    const res = await fetch(`/api/contact-lists/${list.id}`);
    if (!res.ok) return;
    const detail: ContactListDetail = await res.json();
    setEditingId(detail.id);
    setName(detail.name);
    setDescription(detail.description);
    setSelectedIds(new Set(detail.members.map((m) => m.customer.id)));
    setShowForm(true);
  }

  function close() { setShowForm(false); setEditingId(null); }

  function toggleCustomer(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { name, description, customerIds: Array.from(selectedIds) };
    if (editingId) {
      await fetch(`/api/contact-lists/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/contact-lists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); close(); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact list? Campaigns already sent to it are not affected.")) return;
    await fetch(`/api/contact-lists/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {canWrite && <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New list</button>}
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Name", "Description", "Members", ...(canWrite ? ["Actions"] : [])].map((h) => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lists.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No contact lists yet</td></tr>}
            {lists.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{l.name}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--muted)" }}>{l.description || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{l.memberCount}</td>
                {canWrite && (
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(l)} title="Edit list" style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(l.id)} title="Delete list" style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
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
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editingId ? "Edit contact list" : "New contact list"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Name</label><input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. VIP customers" /></div>
              <div><label style={labelStyle}>Description (optional)</label><input value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Members</label>
                <CustomerMultiSelect customers={customers} selectedIds={selectedIds} onToggle={toggleCustomer} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={close} className="btn-outline" style={{ padding: "10px 20px" }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "10px 20px" }}>{saving ? "Saving..." : "Save list"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
