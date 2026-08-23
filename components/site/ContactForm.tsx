"use client";
import { useState } from "react";

type FormCopy = ReturnType<typeof import("@/lib/content").getContent>["form"];

export default function ContactForm({ copy }: { copy: FormCopy }) {
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
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || copy.error);
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <p className="h-2xs" style={{ marginBottom: 12 }}>{copy.sentTitle}</p>
        <p className="body-muted" style={{ margin: 0 }}>{copy.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="two-col-grid">
        <input className="field" name="name" placeholder={copy.name} required autoComplete="name" />
        <input className="field" name="email" type="email" placeholder={copy.email} required autoComplete="email" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="two-col-grid">
        <input className="field" name="company" placeholder={copy.company} autoComplete="organization" />
        <input className="field" name="phone" placeholder={copy.phone} autoComplete="tel" />
      </div>
      <textarea className="field" name="message" placeholder={copy.message} rows={3} required style={{ resize: "vertical" }} />
      {error && <p style={{ color: "#ff8a8a", fontSize: 14, margin: 0 }}>{error}</p>}
      <button type="submit" className="btn btn-signal" disabled={status === "sending"} style={{ alignSelf: "flex-start" }}>
        {status === "sending" ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
