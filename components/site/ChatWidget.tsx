"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import type { Locale } from "@/lib/chatAgent";

type Message = { role: "user" | "assistant"; body: string };

function getVisitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("valca_chat_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("valca_chat_visitor_id", id);
  }
  return id;
}

const COPY = {
  en: {
    title: "VALCA Assistant",
    placeholder: "What are you trying to build or automate?",
    greeting: "Hi — tell me what you're trying to build or automate and I'll tell you how we'd approach it. I can also set up your free discovery call.",
    send: "Send",
    error: "Something went wrong. Please try again.",
  },
  es: {
    title: "Asistente VALCA",
    placeholder: "¿Qué querés construir o automatizar?",
    greeting: "Hola — contame qué querés construir o automatizar y te digo cómo lo abordaríamos. También te puedo agendar el descubrimiento gratuito.",
    send: "Enviar",
    error: "Ocurrió un error. Intenta de nuevo.",
  },
};

export default function ChatWidget({ locale = "en" }: { locale?: Locale }) {
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const visitorIdRef = useRef("");

  useEffect(() => {
    visitorIdRef.current = getVisitorId();
  }, []);

  useEffect(() => {
    if (!open || loadedHistory) return;
    (async () => {
      const res = await fetch(`/api/chat?visitorId=${visitorIdRef.current}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length) setMessages(data.messages);
      }
      setLoadedHistory(true);
    })();
  }, [open, loadedHistory]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", body: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visitorIdRef.current, message: text, locale }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", body: data.reply ?? c.error }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", body: c.error }]);
    } finally {
      setLoading(false);
    }
  }

  const bubble = (mine: boolean): React.CSSProperties => ({
    alignSelf: mine ? "flex-end" : "flex-start",
    background: mine ? "var(--signal)" : "rgba(255,255,255,.06)",
    color: mine ? "#12200a" : "var(--t-body)",
    borderRadius: 16,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 200,
    lineHeight: 1.5,
    maxWidth: "85%",
    whiteSpace: "pre-wrap",
  });

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={c.title}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200, width: 56, height: 56, borderRadius: "50%",
          background: "var(--signal)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? <X size={24} color="#171412" /> : <MessageSquare size={24} color="#171412" />}
      </button>

      {open && (
        <div
          style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 199, width: 360, maxWidth: "calc(100vw - 32px)",
            height: 480, maxHeight: "calc(100vh - 140px)",
            background: "#151312", borderRadius: 16,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}
        >
          <div style={{ padding: "18px 20px", color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "0.025em", textTransform: "uppercase" }}>
            {c.title}
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && <div style={bubble(false)}>{c.greeting}</div>}
            {messages.map((m, i) => (
              <div key={i} style={bubble(m.role === "user")}>{m.body}</div>
            ))}
            {loading && <div style={{ ...bubble(false), color: "var(--t-mute)" }}>···</div>}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "12px 16px 16px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={c.placeholder}
              maxLength={2000}
              className="field"
              style={{ flex: 1, fontSize: 14, padding: "8px 0" }}
            />
            <button
              type="submit"
              aria-label={c.send}
              disabled={loading || !input.trim()}
              className="btn btn-signal"
              style={{ padding: 12, borderRadius: "50%" }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
