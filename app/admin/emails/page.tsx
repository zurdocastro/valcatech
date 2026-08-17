"use client";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { Plus, X, Send, Mail, Users, List as ListIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import CustomerMultiSelect from "@/components/admin/CustomerMultiSelect";
import TemplatesTab, { EmailTemplate } from "./TemplatesTab";
import ContactListsTab from "./ContactListsTab";
import Pagination from "@/components/admin/Pagination";

type Campaign = { id: string; subject: string; status: string; recipientCount: number; deliveredCount: number; openCount: number; bounceCount: number; sentAt: string | null; createdAt: string };
type Customer = { id: string; firstName: string; lastName: string; email: string };
type ContactList = { id: string; name: string; memberCount: number };
type Tab = "campaigns" | "templates" | "lists";

const EMPTY_FORM = { subject: "", body: "", headerImageUrl: "", imageUrl: "", footerImageUrl: "" };
const PAGE_SIZE = 20;
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 14, outline: "none" };

export default function EmailsPage() {
  const { canWrite } = useAdminRole();
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [resendConfigured, setResendConfigured] = useState(true);
  const [webhookConfigured, setWebhookConfigured] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [audience, setAudience] = useState<"all" | "select" | "list">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedListId, setSelectedListId] = useState("");
  const [previewCampaignId, setPreviewCampaignId] = useState<string | null>(null);
  const [bodyKey, setBodyKey] = useState(0);
  const [campaignsPage, setCampaignsPage] = useState(1);

  const load = useCallback(async () => {
    const [campaignsRes, customersRes, listsRes, templatesRes] = await Promise.all([
      fetch("/api/emails"), fetch("/api/customers"), fetch("/api/contact-lists"), fetch("/api/email-templates"),
    ]);
    if (campaignsRes.ok) {
      const data = await campaignsRes.json();
      setCampaigns(data.campaigns);
      setResendConfigured(data.resendConfigured);
      setWebhookConfigured(data.webhookConfigured);
    }
    if (customersRes.ok) setCustomers(await customersRes.json());
    if (listsRes.ok) setContactLists(await listsRes.json());
    if (templatesRes.ok) setTemplates(await templatesRes.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setAudience("all");
    setSelectedIds(new Set());
    setSelectedListId("");
    setBodyKey((k) => k + 1);
    setShowForm(true);
  }
  function close() { setShowForm(false); }

  // RichTextEditor only pushes `value` into its contentEditable DOM on mount
  // (so the caret doesn't jump while typing) — remounting it via `key` is how
  // we force a template's body to actually show up when applied mid-session.
  function applyTemplate(templateId: string) {
    if (!templateId) return;
    const t = templates.find((tpl) => tpl.id === templateId);
    if (!t) return;
    setForm({ subject: t.subject, body: t.body, headerImageUrl: t.headerImageUrl, imageUrl: t.imageUrl, footerImageUrl: t.footerImageUrl });
    setBodyKey((k) => k + 1);
  }

  function toggleCustomer(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const recipientLabel = audience === "select" ? `${selectedIds.size} selected customer(s)` : audience === "list" ? `the list "${contactLists.find((l) => l.id === selectedListId)?.name ?? ""}"` : "all customers";
    if (!form.body.replace(/<[^>]*>/g, "").trim()) { alert("Write a message body before sending."); return; }
    if (audience === "select" && selectedIds.size === 0) { alert("Select at least one customer, or switch audience."); return; }
    if (audience === "list" && !selectedListId) { alert("Choose a contact list, or switch audience."); return; }
    if (!confirm(`Send this email to ${recipientLabel} now?`)) return;
    setLoading(true);
    await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: form.subject,
        body: form.body,
        headerImageUrl: form.headerImageUrl,
        imageUrl: form.imageUrl,
        footerImageUrl: form.footerImageUrl,
        sendNow: true,
        customerIds: audience === "select" ? Array.from(selectedIds) : undefined,
        listId: audience === "list" ? selectedListId : undefined,
      }),
    });
    setLoading(false); close(); load();
  }

  const campaignsTotalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
  const campaignsSafePage = Math.min(campaignsPage, campaignsTotalPages);
  const pagedCampaigns = campaigns.slice((campaignsSafePage - 1) * PAGE_SIZE, campaignsSafePage * PAGE_SIZE);

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Emails</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{campaigns.length} campaigns sent</p>
        </div>
        {tab === "campaigns" && canWrite && <button onClick={openCreate} className="btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}><Plus size={16} /> New campaign</button>}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--line)" }}>
        {([["campaigns", "Campaigns"], ["templates", "Templates"], ["lists", "Contact Lists"]] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 16px", fontSize: 13.5, fontWeight: 700, background: "none", border: "none", cursor: "pointer",
              color: tab === key ? "var(--violet-600)" : "var(--muted)",
              borderBottom: tab === key ? "2px solid var(--violet-600)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "templates" && <TemplatesTab canWrite={canWrite} />}
      {tab === "lists" && <ContactListsTab customers={customers} canWrite={canWrite} />}

      {tab === "campaigns" && (
        <>
          {!resendConfigured && (
            <div style={{ background: "var(--color-amber-100)", color: "#92400E", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", marginBottom: 18, fontSize: 12.5 }}>
              <AlertTriangle size={14} /> RESEND_API_KEY is not configured — campaigns will not send.
            </div>
          )}
          {resendConfigured && !webhookConfigured && (
            <div style={{ background: "var(--mist)", color: "var(--muted)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", marginBottom: 18, fontSize: 12.5 }}>
              <Mail size={14} /> Delivered/Opened/Bounced won&apos;t update until a Resend webhook is configured (see below).
            </div>
          )}

          <div className="card" style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--mist)" }}>
                  {["Subject", "Status", "Sent to", "Delivered", "Opened", "Bounced", "Date"].map((h) => <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No campaigns yet</td></tr>}
                {pagedCampaigns.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>
                      <button onClick={() => setPreviewCampaignId(c.id)} title="See how this email looked" style={{ background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 700, color: "var(--violet-600)", cursor: "pointer", textDecoration: "underline" }}>
                        {c.subject}
                      </button>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span className="badge" style={{ background: "var(--mist)", color: "var(--violet-600)", textTransform: "capitalize" }}>{c.status}</span></td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.recipientCount}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.deliveredCount}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.openCount}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: c.bounceCount > 0 ? "#B91C1C" : undefined }}>{c.bounceCount}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>{c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-US") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={campaignsSafePage} totalPages={campaignsTotalPages} onPageChange={setCampaignsPage} />

          {resendConfigured && !webhookConfigured && (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14 }}>
              To track Delivered/Opened/Bounced, add a webhook in your Resend dashboard pointing to <code>https://pureblendlabs.com/api/webhooks/resend</code> for the <code>email.delivered</code>, <code>email.opened</code> and <code>email.bounced</code> events, then set the signing secret it gives you as <code>RESEND_WEBHOOK_SECRET</code> in your environment variables.
            </p>
          )}
        </>
      )}

      {previewCampaignId && <CampaignPreviewModal campaignId={previewCampaignId} onClose={() => setPreviewCampaignId(null)} />}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 560, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>New email campaign</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ background: resendConfigured ? "var(--color-green-100)" : "var(--color-amber-100)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", marginBottom: 18, fontSize: 12.5, color: resendConfigured ? "#15803D" : "#92400E" }}>
              {resendConfigured ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {resendConfigured ? "Resend is configured — this will send for real." : "RESEND_API_KEY is not configured — this campaign will be saved but nothing will send."}
            </div>
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {templates.length > 0 && (
                <div>
                  <label style={labelStyle}>Start from a template (optional)</label>
                  <select defaultValue="" onChange={(e) => applyTemplate(e.target.value)} style={inputStyle}>
                    <option value="">Blank campaign</option>
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div><label style={labelStyle}>Subject</label><input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle} /></div>

              <ImageUploadField label="Header image (optional — full-width banner at the top)" value={form.headerImageUrl} onChange={(url) => setForm((f) => ({ ...f, headerImageUrl: url }))} />

              <ImageUploadField label="Body image (optional — floats to the right of the text)" value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />

              <div>
                <label style={labelStyle}>Body</label>
                <RichTextEditor key={bodyKey} value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} />
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                  Click <strong>Insert name</strong> to add <code>{"{{first_name}}"}</code> — it&apos;s automatically replaced with each customer&apos;s own name when the email sends. <code>{"{{last_name}}"}</code> and <code>{"{{full_name}}"}</code> also work if typed manually.
                </p>
              </div>

              <ImageUploadField label="Footer image (optional)" value={form.footerImageUrl} onChange={(url) => setForm((f) => ({ ...f, footerImageUrl: url }))} />

              <div>
                <label style={labelStyle}>Recipients</label>
                <div style={{ display: "flex", gap: 16, marginBottom: audience !== "all" ? 10 : 0, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                    <input type="radio" checked={audience === "all"} onChange={() => setAudience("all")} /> All customers ({customers.length})
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                    <input type="radio" checked={audience === "select"} onChange={() => setAudience("select")} /> <Users size={14} /> Select customers
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer" }}>
                    <input type="radio" checked={audience === "list"} onChange={() => setAudience("list")} /> <ListIcon size={14} /> A contact list
                  </label>
                </div>

                {audience === "select" && <CustomerMultiSelect customers={customers} selectedIds={selectedIds} onToggle={toggleCustomer} />}

                {audience === "list" && (
                  contactLists.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: "var(--muted)" }}>No contact lists yet — create one under the &quot;Contact Lists&quot; tab first.</p>
                  ) : (
                    <select value={selectedListId} onChange={(e) => setSelectedListId(e.target.value)} style={inputStyle}>
                      <option value="">Select a list...</option>
                      {contactLists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.memberCount})</option>)}
                    </select>
                  )
                )}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={close} className="btn-outline" style={{ padding: "10px 20px" }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "10px 20px" }}><Send size={15} /> {loading ? "Sending..." : "Send now"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignPreviewModal({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const [data, setData] = useState<{ subject: string; previewHtml: string } | null>(null);

  useEffect(() => {
    fetch(`/api/emails/${campaignId}`).then((r) => (r.ok ? r.json() : null)).then(setData);
  }, [campaignId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 640, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{data?.subject ?? "Loading..."}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--muted)" }}>Preview only — merge tags like {"{{first_name}}"} show a sample name here, not the real recipient&apos;s.</p>
        {data ? (
          <iframe srcDoc={data.previewHtml} title="Email preview" style={{ flex: 1, width: "100%", minHeight: 480, border: "1px solid var(--line)", borderRadius: 10 }} />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Loading...</div>
        )}
      </div>
    </div>
  );
}
