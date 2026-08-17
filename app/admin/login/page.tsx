"use client";

import { useState, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/site/Logo";
import PasswordInput from "@/components/site/PasswordInput";

function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) { setError("Invalid credentials"); return; }
    router.push(search.get("redirect") || "/admin");
    router.refresh();
  }

  return (
    <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <Logo size={34} />
      </div>
      <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 26 }}>
        Backoffice
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
          <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </div>
        {error && <p style={{ color: "#B91C1C", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: "center", marginTop: 6 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ink)", padding: 20 }}>
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, outline: "none",
};
