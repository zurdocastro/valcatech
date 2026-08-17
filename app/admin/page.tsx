"use client";
import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, Bot, Mail, Send, Sparkles } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Stats = {
  newLeads: number; totalLeads: number; chatSessions: number; chatConverted: number;
  campaignsSent: number; emailsDelivered: number;
  series: { date: string; leads: number }[];
  sources: { source: string; count: number }[];
};

const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const SOURCE_COLORS: Record<string, string> = { contact_form: "#8052FF", chat: "#15846E", manual: "#FFB829" };
const SOURCE_LABELS: Record<string, string> = { contact_form: "Contact form", chat: "Chat agent", manual: "Added manually" };

const PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All time", days: null },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [preset, setPreset] = useState<string>("30D");
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(async (fromDate: string | null, toDate: string | null) => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const qs = params.toString();
    const res = await fetch(`/api/stats${qs ? `?${qs}` : ""}`);
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => { load(from, to); }, [load, from, to]);

  function applyPreset(label: string) {
    setPreset(label);
    const p = PRESETS.find((x) => x.label === label)!;
    if (p.days === null) { setFrom(""); setTo(""); return; }
    setFrom(isoDaysAgo(p.days));
    setTo(new Date().toISOString().slice(0, 10));
  }

  function applyCustom(field: "from" | "to", value: string) {
    setPreset("");
    if (field === "from") setFrom(value); else setTo(value);
  }

  const cards = stats ? [
    { label: "New leads", value: stats.newLeads, Icon: UserPlus, color: "var(--violet)" },
    { label: "Total leads", value: stats.totalLeads, Icon: Users, color: "var(--violet-600)" },
    { label: "Chat conversations", value: stats.chatSessions, Icon: Bot, color: "#15846E" },
    { label: "Chats that left contact", value: stats.chatConverted, Icon: Sparkles, color: "var(--magenta)" },
    { label: "Campaigns sent", value: stats.campaignsSent, Icon: Send, color: "var(--violet)" },
    { label: "Emails delivered", value: stats.emailsDelivered, Icon: Mail, color: "var(--violet-600)" },
  ] : [];

  const sourceData = (stats?.sources ?? []).map((s) => ({ ...s, name: SOURCE_LABELS[s.source] ?? s.source }));

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Leads, conversations and outbound at a glance</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--mist)", borderRadius: 10, padding: 3 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.label)}
                style={{
                  border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                  background: preset === p.label ? "#fff" : "transparent",
                  color: preset === p.label ? "var(--violet-600)" : "var(--muted)",
                  boxShadow: preset === p.label ? "var(--shadow-sm)" : "none",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="date" value={from} onChange={(e) => applyCustom("from", e.target.value)} style={dateInputStyle} />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
            <input type="date" value={to} onChange={(e) => applyCustom("to", e.target.value)} style={dateInputStyle} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</span>
              <c.Icon size={18} color={c.color} />
            </div>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="dashboard-charts-grid">
        <div className="card" style={{ padding: "20px 20px 8px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Leads over time</h3>
          {stats && stats.series.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.series} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8052FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8052FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtDate} fontSize={11} stroke="var(--muted)" />
                <YAxis fontSize={11} stroke="var(--muted)" allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) => fmtDate(String(v))}
                  formatter={(value) => [String(value), "Leads"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }}
                />
                <Area type="monotone" dataKey="leads" stroke="#8052FF" strokeWidth={2} fill="url(#leadGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No leads in this range yet.</p>
          )}
        </div>

        <div className="card" style={{ padding: "20px 20px 8px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Where leads come from</h3>
          {sourceData.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sourceData} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {sourceData.map((s) => <Cell key={s.source} fill={SOURCE_COLORS[s.source] ?? "#9A9A9A"} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [String(value), String(name)]} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No leads in this range yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const dateInputStyle: React.CSSProperties = { padding: "7px 10px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 12.5, background: "#fff", outline: "none" };
