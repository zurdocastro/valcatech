"use client";
import { useState, useEffect, useCallback } from "react";
import { Check, MessageSquare, X, Flag, Pencil } from "lucide-react";
import { useAdminRole } from "@/lib/useAdminRole";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 10;

type ChatSessionSummary = { id: string; name: string; email: string; phone: string; updatedAt: string; lastMessage: string };
type ChatMessage = { id: string; role: string; body: string; feedback: string; createdAt: string };
type ChatSessionDetail = { id: string; name: string; email: string; phone: string; messages: ChatMessage[] };

export default function AgentSettingsPage() {
  const { canWrite } = useAdminRole();
  const [agentInfo, setAgentInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [selected, setSelected] = useState<ChatSessionDetail | null>(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [page, setPage] = useState(1);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) setAgentInfo((await res.json()).agentInfo ?? "");
  }, []);
  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/chat-sessions");
    if (res.ok) setSessions(await res.json());
  }, []);
  useEffect(() => { loadSettings(); loadSessions(); }, [loadSettings, loadSessions]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentInfo }) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 1800); }
  }

  async function openSession(id: string) {
    const res = await fetch(`/api/chat-sessions/${id}`);
    if (res.ok) setSelected(await res.json());
    setEditingFeedbackId(null);
  }

  function openFeedbackEditor(m: ChatMessage) {
    setEditingFeedbackId(m.id);
    setFeedbackDraft(m.feedback);
  }

  async function saveFeedback(messageId: string) {
    setSavingFeedback(true);
    const res = await fetch(`/api/chat-messages/${messageId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedback: feedbackDraft }) });
    setSavingFeedback(false);
    if (res.ok && selected) {
      setSelected({ ...selected, messages: selected.messages.map((m) => (m.id === messageId ? { ...m, feedback: feedbackDraft } : m)) });
      setEditingFeedbackId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSessions = sessions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Chat Sales Agent</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Configure what the AI assistant tells customers, and review its conversations.</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Delivery &amp; support info</h2>
        <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--muted)" }}>
          Free text, fed directly into the agent&apos;s knowledge alongside the live product catalog — shipping times, coverage areas, payment options, escalation instructions, anything customers commonly ask about.
        </p>
        <textarea
          value={agentInfo}
          onChange={(e) => setAgentInfo(e.target.value)}
          rows={8}
          disabled={!canWrite}
          placeholder="e.g. Shipping takes 3-5 business days within the US. We accept card payments only. For urgent issues, tell the customer to email support@pureblendlabs.com."
          style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
        />
        {canWrite && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
              <Check size={14} /> {saving ? "Saving..." : "Save"}
            </button>
            {saved && <span style={{ fontSize: 12.5, color: "#15803D", fontWeight: 600 }}>Saved.</span>}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Conversations ({sessions.length})</h2>
        <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--muted)" }}>
          Open a conversation and flag any reply that was wrong or incomplete — the correction gets fed into every future conversation.
        </p>
        {sessions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No one has used the chat widget yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pagedSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                style={{ textAlign: "left", background: "var(--mist)", border: "none", borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
              >
                <MessageSquare size={16} color="var(--violet-600)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name || "Anonymous visitor"} {s.email && <span style={{ fontWeight: 400, color: "var(--muted)" }}>— {s.email}</span>}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.lastMessage}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{new Date(s.updatedAt).toLocaleDateString("en-US")}</span>
              </button>
            ))}
          </div>
        )}
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,16,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={() => { setSelected(null); setEditingFeedbackId(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 620, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.name || "Anonymous visitor"}</h2>
              <button onClick={() => { setSelected(null); setEditingFeedbackId(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {selected.messages.map((m) => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ background: m.role === "user" ? "var(--grad-brand-soft)" : "var(--mist)", borderRadius: 10, padding: "8px 12px", fontSize: 13, whiteSpace: "pre-wrap" }}>
                      {m.body}
                    </div>
                    {m.role === "assistant" && canWrite && (
                      <button
                        onClick={() => openFeedbackEditor(m)}
                        title={m.feedback ? "Edit correction" : "Flag this reply"}
                        style={{ background: m.feedback ? "var(--color-amber-100, #FEF3C7)" : "var(--mist)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: m.feedback ? "#92400E" : "var(--muted)", flexShrink: 0 }}
                      >
                        {m.feedback ? <Pencil size={13} /> : <Flag size={13} />}
                      </button>
                    )}
                  </div>

                  {m.feedback && editingFeedbackId !== m.id && (
                    <div style={{ marginTop: 4, fontSize: 11.5, color: "#92400E", background: "var(--color-amber-100, #FEF3C7)", borderRadius: 8, padding: "6px 10px", maxWidth: "100%" }}>
                      <strong>Correction:</strong> {m.feedback}
                    </div>
                  )}

                  {editingFeedbackId === m.id && (
                    <div style={{ marginTop: 6, width: 320 }}>
                      <textarea
                        autoFocus
                        value={feedbackDraft}
                        onChange={(e) => setFeedbackDraft(e.target.value)}
                        rows={3}
                        placeholder="What should the agent have said instead? This gets shown to it as a standing correction."
                        style={{ width: "100%", padding: "8px 10px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 12.5, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                      />
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button onClick={() => saveFeedback(m.id)} disabled={savingFeedback} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
                          {savingFeedback ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditingFeedbackId(null)} className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }}>Cancel</button>
                        {m.feedback && (
                          <button onClick={() => { setFeedbackDraft(""); saveFeedback(m.id); }} style={{ background: "none", border: "none", color: "#B91C1C", fontSize: 12, cursor: "pointer" }}>Remove</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
