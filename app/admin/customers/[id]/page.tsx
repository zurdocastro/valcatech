"use client";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, Calendar, MessageCircle, MessageSquare } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

type ChatMessage = { id: string; role: string; body: string; createdAt: string };
type ChatSession = { id: string; createdAt: string; messages: ChatMessage[] };
type CustomerDetail = {
  id: string; firstName: string; lastName: string; email: string; phone: string; address: string;
  company: string; notes: string; source: string; createdAt: string; chatSessions: ChatSession[];
};

const SOURCE_LABELS: Record<string, string> = { contact_form: "Contact form", chat: "Chat agent", manual: "Added manually" };

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/customers/${id}`);
    if (res.ok) setCustomer(await res.json());
    else setNotFound(true);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (notFound) {
    return (
      <div style={{ padding: "32px 28px" }}>
        <Link href="/admin/customers" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--violet-600)", fontWeight: 700, marginBottom: 20 }}><ArrowLeft size={15} /> Back to leads</Link>
        <p style={{ color: "var(--muted)" }}>Lead not found.</p>
      </div>
    );
  }
  if (!customer) return <div style={{ padding: "32px 28px", color: "var(--muted)" }}>Loading...</div>;

  const conversations = customer.chatSessions ?? [];

  return (
    <div style={{ padding: "32px 28px" }}>
      <Link href="/admin/customers" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--violet-600)", fontWeight: 700, marginBottom: 20 }}><ArrowLeft size={15} /> Back to leads</Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{customer.firstName} {customer.lastName}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            {SOURCE_LABELS[customer.source] ?? customer.source} · {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Contact information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <InfoRow Icon={Mail} label="Email" value={<a href={`mailto:${customer.email}`} style={{ color: "var(--violet-600)" }}>{customer.email}</a>} />
          <InfoRow
            Icon={Phone}
            label="Phone"
            value={
              customer.phone ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {customer.phone}
                  {waLink(customer.phone) && (
                    <a
                      href={waLink(customer.phone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${customer.firstName}`}
                      title="Chat on WhatsApp"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#25D366", flexShrink: 0 }}
                    >
                      <MessageCircle size={12} color="#fff" fill="#fff" />
                    </a>
                  )}
                </span>
              ) : "—"
            }
          />
          <InfoRow Icon={Building2} label="Company" value={customer.company || "—"} />
          <InfoRow Icon={Calendar} label="First contact" value={new Date(customer.createdAt).toLocaleDateString("en-US")} />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>What they want built</h2>
        {customer.notes ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{customer.notes}</p>
        ) : (
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>Nothing captured yet.</p>
        )}
      </div>

      <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Chat history</h2>
      {conversations.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>No chat conversations yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conversations.map((s) => (
            <div key={s.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <MessageSquare size={15} color="var(--violet)" />
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(s.createdAt).toLocaleString("en-US")}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      background: m.role === "user" ? "var(--violet)" : "var(--mist)",
                      color: m.role === "user" ? "#fff" : "var(--ink)",
                      borderRadius: 12, padding: "8px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: "80%", whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.body}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ Icon, label, value }: { Icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Icon size={16} color="var(--violet)" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 13.5 }}>{value}</p>
      </div>
    </div>
  );
}
