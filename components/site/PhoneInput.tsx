"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, flagEmoji, type Country } from "@/lib/countries";

export function parseValue(value: string): { country: Country; number: string } {
  const match = COUNTRIES
    .filter((c) => value.startsWith(c.dial))
    .sort((a, b) => b.dial.length - a.dial.length)[0];
  if (match) return { country: match, number: value.slice(match.dial.length).trim() };
  return { country: COUNTRIES[0], number: value };
}

export default function PhoneInput({
  value,
  onChange,
  style,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  required?: boolean;
}) {
  const { country, number } = parseValue(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q));
  }, [query]);

  function selectCountry(c: Country) {
    onChange(`${c.dial} ${number}`.trim());
    setOpen(false);
    setQuery("");
  }

  function setNumber(n: string) {
    onChange(`${country.dial} ${n}`.trim());
  }

  return (
    <div style={{ position: "relative", display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setTimeout(() => searchRef.current?.focus(), 0); }}
        style={{
          display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          padding: "10px 10px", border: "1.5px solid var(--line)", borderRadius: 10,
          background: "#fff", cursor: "pointer", fontSize: 14,
        }}
      >
        <span style={{ fontSize: 16 }}>{flagEmoji(country.iso2)}</span>
        <span style={{ fontWeight: 600 }}>{country.dial}</span>
        <ChevronDown size={14} color="var(--muted)" />
      </button>

      <input
        required={required}
        type="tel"
        inputMode="tel"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        style={{ ...style, flex: 1, minWidth: 0, width: "auto" }}
      />

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 29 }} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, width: 280, maxHeight: 320,
              background: "#fff", border: "1px solid var(--line)", borderRadius: 14,
              boxShadow: "var(--shadow-md)", overflow: "hidden", zIndex: 30, display: "flex", flexDirection: "column",
            }}
          >
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              style={{ padding: "10px 14px", border: "none", borderBottom: "1px solid var(--line)", outline: "none", fontSize: 13.5 }}
            />
            <div style={{ overflowY: "auto" }}>
              {filtered.length === 0 && (
                <p style={{ padding: "14px", fontSize: 13, color: "var(--muted)" }}>No matches.</p>
              )}
              {filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => selectCountry(c)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    padding: "9px 14px", background: c.iso2 === country.iso2 ? "var(--mist)" : "transparent",
                    border: "none", cursor: "pointer", fontSize: 13.5,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{flagEmoji(c.iso2)}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
