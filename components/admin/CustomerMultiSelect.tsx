"use client";
import { useState } from "react";
import { Search } from "lucide-react";

type Customer = { id: string; firstName: string; lastName: string; email: string };

export default function CustomerMultiSelect({ customers, selectedIds, onToggle }: { customers: Customer[]; selectedIds: Set<string>; onToggle: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q);
  });

  return (
    <div style={{ border: "1.5px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ position: "relative", borderBottom: "1px solid var(--line)" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name or email..."
          style={{ width: "100%", padding: "9px 10px 9px 30px", border: "none", outline: "none", fontSize: 13 }}
        />
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {filtered.length === 0 && <p style={{ padding: 14, fontSize: 12.5, color: "var(--muted)" }}>No matches.</p>}
        {filtered.map((c) => (
          <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid var(--line)" }}>
            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggle(c.id)} />
            <span style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</span>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{c.email}</span>
          </label>
        ))}
      </div>
      <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--muted)", background: "var(--mist)" }}>{selectedIds.size} selected</div>
    </div>
  );
}
