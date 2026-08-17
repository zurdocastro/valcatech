"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import PasswordInput from "@/components/site/PasswordInput";

type AdminUserRow = { id: string; email: string; name: string; role: string; active: boolean; createdAt: string };

export default function UsersPage() {
  const { role } = useAdminRole();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "admin", password: "", active: true });

  const load = useCallback(async () => { const r = await fetch("/api/users"); if (r.ok) setUsers(await r.json()); }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm({ email: "", name: "", role: "admin", password: "", active: true }); setShowForm(true); }
  function openEdit(u: AdminUserRow) { setEditing(u); setForm({ email: u.email, name: u.name, role: u.role, password: "", active: u.active }); setShowForm(true); }
  function close() { setShowForm(false); setEditing(null); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await fetch(`/api/users/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, role: form.role, active: form.active, ...(form.password && { password: form.password }) }) });
    } else {
      await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setLoading(false); close(); load();
  }

  async function handleDelete(id: string) { if (!confirm("Delete this user?")) return; await fetch(`/api/users/${id}`, { method: "DELETE" }); load(); }

  if (role && role !== "super_admin") {
    return <div style={{ padding: 40 }}><p>You don't have permission to view this page.</p></div>;
  }

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Users</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{users.length} admin users</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New user</button>
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Name", "Email", "Role", "Status", "Actions"].map((h) => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{u.name || "—"}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--muted)" }}>{u.email}</td>
                <td style={{ padding: "12px 14px" }}><span className="badge" style={{ background: "var(--mist)", color: "var(--violet-600)", textTransform: "uppercase" }}>{u.role}</span></td>
                <td style={{ padding: "12px 14px" }}><span className="badge" style={{ background: u.active ? "var(--color-green-100)" : "var(--color-red-100)", color: u.active ? "var(--color-green-700)" : "var(--color-red-700)" }}>{u.active ? "Active" : "Inactive"}</span></td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(u)} style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(u.id)} style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? "Edit user" : "New user"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Email</label><input required type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={inputStyle}>
                  <option value="viewer">Viewer</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div><label style={labelStyle}>{editing ? "New password (leave blank to keep)" : "Password"}</label><PasswordInput required={!editing} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} style={inputStyle} /></div>
              {editing && <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /> Active</label>}
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
