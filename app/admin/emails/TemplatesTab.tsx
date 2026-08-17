"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";

export type EmailTemplate = { id: string; name: string; subject: string; body: string; headerImageUrl: string; imageUrl: string; footerImageUrl: string; updatedAt: string };

const EMPTY_FORM = { name: "", subject: "", body: "", headerImageUrl: "", imageUrl: "", footerImageUrl: "" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 14, outline: "none" };

export default function TemplatesTab({ canWrite }: { canWrite: boolean }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/email-templates");
    if (res.ok) setTemplates(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(t: EmailTemplate) { setEditing(t); setForm({ name: t.name, subject: t.subject, body: t.body, headerImageUrl: t.headerImageUrl, imageUrl: t.imageUrl, footerImageUrl: t.footerImageUrl }); setShowForm(true); }
  function close() { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await fetch(`/api/email-templates/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/email-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setSaving(false); close(); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {canWrite && <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New template</button>}
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
              {["Name", "Subject", "Updated", ...(canWrite ? ["Actions"] : [])].map((h) => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No templates yet</td></tr>}
            {templates.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{t.name}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--muted)" }}>{t.subject}</td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>{new Date(t.updatedAt).toLocaleDateString("en-US")}</td>
                {canWrite && (
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(t)} title="Edit template" style={{ background: "var(--mist)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--violet-600)" }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(t.id)} title="Delete template" style={{ background: "var(--color-red-100)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#B91C1C" }}><Trash2 size={14} /></button>
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
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 560, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editing ? "Edit template" : "New template"}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Template name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="e.g. Monthly newsletter" /></div>
              <div><label style={labelStyle}>Subject</label><input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle} /></div>
              <ImageUploadField label="Header image (full-width banner, optional)" value={form.headerImageUrl} onChange={(url) => setForm((f) => ({ ...f, headerImageUrl: url }))} />
              <ImageUploadField label="Body image (floats right of the text)" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
              <div>
                <label style={labelStyle}>Body</label>
                <RichTextEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} />
              </div>
              <ImageUploadField label="Footer image (optional)" value={form.footerImageUrl} onChange={(url) => setForm((f) => ({ ...f, footerImageUrl: url }))} />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={close} className="btn-outline" style={{ padding: "10px 20px" }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "10px 20px" }}>{saving ? "Saving..." : "Save template"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
