"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Something went wrong");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <p className="h-2xs" style={{ marginBottom: 12 }}>Thanks — we got it.</p>
        <p className="body-muted" style={{ margin: 0 }}>
          You&apos;ll hear from us in under 24 hours, with an ROI-focused proposal within 48 hours of the discovery call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="two-col-grid">
        <input className="field" name="name" placeholder="Name" required autoComplete="name" />
        <input className="field" name="email" type="email" placeholder="Email" required autoComplete="email" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="two-col-grid">
        <input className="field" name="company" placeholder="Company (optional)" autoComplete="organization" />
        <input className="field" name="phone" placeholder="Phone (optional)" autoComplete="tel" />
      </div>
      <textarea className="field" name="message" placeholder="What are you trying to build or automate?" rows={3} required style={{ resize: "vertical" }} />
      {error && <p style={{ color: "var(--saffron)", fontSize: 14, margin: 0 }}>{error}</p>}
      <button type="submit" className="pill" disabled={status === "sending"} style={{ alignSelf: "flex-start" }}>
        {status === "sending" ? "Sending…" : "Start a project"}
      </button>
    </form>
  );
}
