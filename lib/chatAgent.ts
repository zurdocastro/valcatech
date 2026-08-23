import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import type { ChatSession } from "@/app/generated/prisma/client";
import { BRAND, getContent, type Locale } from "@/lib/content";

export type { Locale };

// Graceful no-op until a key is supplied, matching lib/email.ts's pattern —
// the widget/route degrade to a "chat unavailable" message instead of
// throwing when ANTHROPIC_API_KEY hasn't been configured yet.
export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const MODEL = "claude-sonnet-5";
const MAX_HISTORY = 30;

// Relying on the model to "ignore earlier turns and follow the latest message"
// wasn't reliable once a conversation had a few messages in the other
// language. Deciding the language in code, per turn, and building a system
// prompt that's already 100% in that language removes the ambiguity instead of
// asking the model to resolve it. Common function words are used rather than
// content words — they appear in nearly every sentence of their language.
const ES_WORDS = /\b(el|la|los|las|un|una|unos|unas|es|son|era|eran|quien|qui[eé]n|qu[eé]|cu[aá]ndo|cu[aá]l|cu[aá]les|d[oó]nde|porqu[eé]|por qu[eé]|c[oó]mo|este|esta|estos|estas|pero|con|para|sobre|hace|hizo|puede|podr[ií]a|deber[ií]a|tiene|tienes|tengo|hola|buenas|gracias|precio|proyecto|necesito|ayuda|quiero|empresa|cotizar|automatizar)\b/i;
const EN_WORDS = /\b(the|is|are|was|were|who|what|when|where|why|how|which|this|that|these|those|and|but|with|for|about|from|don't|doesn't|isn't|can|could|would|should|will|have|has|had|hello|hi|hey|thanks|please|price|project|need|want|help|build|automate|company)\b/i;

export function detectLocale(text: string, fallback: Locale): Locale {
  const esSignal = /[ñáéíóúü¿¡]/i.test(text) || ES_WORDS.test(text);
  const enSignal = EN_WORDS.test(text);
  if (esSignal && !enSignal) return "es";
  if (enSignal && !esSignal) return "en";
  return fallback;
}

// The knowledge base is generated from lib/content.ts — the same constants the
// marketing page renders — so the agent can never describe a service the site
// doesn't advertise, and never goes stale when the copy changes.
// Built from the reply's own language so the agent quotes the site's wording
// back to the visitor rather than translating it on the fly.
function knowledgeBase(locale: Locale) {
  const c = getContent(locale);
  const services = c.capabilities.map(
    (g) => `${g.group}:\n${g.items.map((i) => `- ${i.title}: ${i.body}`).join("\n")}`
  ).join("\n\n");
  const agents = c.agents.map((a) => `- ${a.name} (${a.category}): ${a.body}`).join("\n");
  const process = c.process.map((p) => `${p.step} ${p.title}: ${p.body}`).join("\n");
  const faq = c.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  return `SERVICES\n${services}\n\nAGENT STACK\n${c.agentsIntro}\n${agents}\n\nPROCESS\n${process}\n\nFAQ\n${faq}\n\nCONTACT\nEmail: ${BRAND.email} · WhatsApp: ${BRAND.phone} · ${BRAND.location}`;
}

async function buildSystemPrompt(locale: Locale): Promise<string> {
  const isEs = locale === "es";
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });

  // Putting the language rule first (LLMs weight prompt start most heavily)
  // and repeating it at the end fixed replies drifting to the wrong language.
  const languageRule = isEs
    ? `INSTRUCCIÓN MÁS IMPORTANTE DE TODAS: responde en ESPAÑOL. Si el visitante te escribe en inglés, cambia a inglés para esa respuesta y las siguientes, hasta que vuelva a escribirte en español. Ignora el idioma de mensajes anteriores si el más reciente está en otro idioma — sigue siempre el idioma del ÚLTIMO mensaje.`
    : `MOST IMPORTANT INSTRUCTION OF ALL: reply in ENGLISH. If the visitor writes to you in Spanish, switch to Spanish for that reply and the following ones, until they write in English again. Ignore the language of earlier messages if the most recent one is in a different language — always follow the language of the LATEST message.`;

  const rules = isEs
    ? `Eres el asistente de ${BRAND.name} (${BRAND.tagline}), una firma de software a la medida y agentes de IA.

Reglas:
- Solo hablas de los servicios listados abajo. Nunca inventes servicios, tecnologías, plazos ni casos de éxito que no estén aquí.
- NUNCA des un precio ni un rango de precios. El precio siempre sale de la consultoría de descubrimiento, que es gratis.
- Sé breve y concreto: 2 a 4 frases por respuesta. Nada de párrafos de marketing.
- Tu objetivo es entender qué quiere construir o automatizar el visitante y agendarle el descubrimiento gratuito.
- Cuando tengas su nombre, correo y una descripción de lo que necesita, usa la herramienta capture_lead. Pídele esos datos de forma natural, no como un formulario.
- Después de capture_lead, dile que el equipo lo contacta en menos de 24 horas y que la propuesta con enfoque en ROI llega dentro de 48 horas después de la llamada.
- Nunca pidas contraseñas, datos de tarjetas ni información financiera.`
    : `You are the assistant for ${BRAND.name} (${BRAND.tagline}), a custom software and AI agent firm.

Rules:
- Only discuss the services listed below. Never invent services, technologies, timelines or case studies that aren't here.
- NEVER quote a price or a price range. Pricing always comes out of the free discovery consultation.
- Be short and concrete: 2 to 4 sentences per reply. No marketing paragraphs.
- Your goal is to understand what the visitor wants built or automated, and to get them booked for the free discovery call.
- Once you have their name, email and a description of what they need, call the capture_lead tool. Ask for those naturally, not as a form.
- After capture_lead, tell them the team follows up in under 24 hours, and that the ROI-focused proposal lands within 48 hours of that call.
- Never ask for passwords, card details or financial information.`;

  const flagged = await db.chatMessage.findMany({ where: { feedback: { not: "" } }, orderBy: { createdAt: "desc" }, take: 50 });
  const corrections = flagged
    .map((m) => `- ${isEs ? "Respuesta marcada" : "Flagged reply"}: "${m.body.slice(0, 200)}${m.body.length > 200 ? "…" : ""}"\n  ${isEs ? "Corrección del equipo" : "Team's correction"}: ${m.feedback}`)
    .join("\n");

  const correctionsLabel = isEs
    ? "Correcciones de conversaciones pasadas (un admin marcó estas respuestas como incorrectas o incompletas — no repitas el mismo error):"
    : "Corrections from past conversations (an admin flagged these replies as wrong or incomplete — don't repeat the same mistake):";
  const infoLabel = isEs ? "Información adicional del equipo:" : "Additional info from the team:";

  return `${languageRule}

${rules}
${settings?.agentInfo ? `\n${infoLabel}\n${settings.agentInfo}` : ""}
${corrections ? `\n${correctionsLabel}\n${corrections}` : ""}

${knowledgeBase(locale)}

${languageRule}`;
}

const CAPTURE_LEAD_TOOL: Anthropic.Tool = {
  name: "capture_lead",
  description:
    "Record a qualified lead once the visitor has given their name, email, and a description of what they want built or automated. Call this exactly once per conversation, as soon as those three are known.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Visitor's full name" },
      email: { type: "string", description: "Visitor's email address" },
      phone: { type: "string", description: "Phone or WhatsApp number, if given" },
      company: { type: "string", description: "Company name, if given" },
      summary: { type: "string", description: "A clear summary of what the visitor wants built or automated, in their own terms" },
    },
    required: ["name", "email", "summary"],
  },
};

async function captureLead(session: ChatSession, args: { name: string; email: string; phone?: string; company?: string; summary: string }) {
  const email = args.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, reason: "That email doesn't look valid — ask the visitor to confirm it." };

  const [firstName, ...rest] = args.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "-";
  const phone = args.phone ?? "";
  const company = args.company ?? "";

  const existing = await db.customer.findUnique({ where: { email } });
  const customer = existing
    ? await db.customer.update({
        where: { id: existing.id },
        data: {
          phone: phone || existing.phone,
          company: company || existing.company,
          notes: [args.summary, existing.notes].filter(Boolean).join("\n\n---\n\n").slice(0, 8000),
        },
      })
    : await db.customer.create({
        data: { firstName: firstName || args.name, lastName, email, phone, company, notes: args.summary, source: "chat" },
      });

  await db.chatSession.update({
    where: { id: session.id },
    data: { name: args.name, email, phone, customerId: customer.id },
  });

  await sendLeadNotification({ name: args.name, email, phone, company, message: args.summary, source: "chat" }).catch((e) =>
    console.error("Failed to send lead notification:", e)
  );

  return { ok: true };
}

const FALLBACK_REPLY: Record<Locale, string> = {
  en: `Sorry, the assistant is temporarily unavailable. Write to ${BRAND.email} or WhatsApp ${BRAND.phone} and we'll get right back to you.`,
  es: `Disculpa, el asistente no está disponible por ahora. Escríbenos a ${BRAND.email} o por WhatsApp al ${BRAND.phone} y te respondemos de inmediato.`,
};

export async function generateReply(session: ChatSession, incomingText: string, locale: Locale): Promise<string> {
  const anthropic = getAnthropic();
  if (!anthropic) return FALLBACK_REPLY[detectLocale(incomingText, locale)];

  const history = await db.chatMessage.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" }, take: MAX_HISTORY });
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role as "user" | "assistant", content: m.body }));
  messages.push({ role: "user", content: incomingText });

  // An ambiguous message (too short, or no clear per-language signal) falls
  // back to whatever language the conversation has actually been in, not the
  // static site locale — otherwise a short follow-up could snap an English
  // conversation back to a Spanish default.
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  const continuityFallback = lastAssistant ? detectLocale(lastAssistant.body, locale) : locale;
  const replyLocale = detectLocale(incomingText, continuityFallback);
  const system = await buildSystemPrompt(replyLocale);
  const tools = [CAPTURE_LEAD_TOOL];

  let response = await anthropic.messages.create({ model: MODEL, max_tokens: 1024, system, tools, messages });

  // A tool_use turn needs its result fed back before the model produces the
  // visitor-facing reply — loop until it stops asking for tools, capped to
  // avoid a runaway loop.
  let iterations = 0;
  while (response.stop_reason === "tool_use" && iterations < 3) {
    iterations++;
    const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) break;
    messages.push({ role: "assistant", content: response.content });
    const toolResults = await Promise.all(
      toolUses.map(async (toolUse) => {
        const result =
          toolUse.name === "capture_lead"
            ? await captureLead(session, toolUse.input as Parameters<typeof captureLead>[1])
            : { ok: false, reason: "Unknown tool" };
        return { type: "tool_result" as const, tool_use_id: toolUse.id, content: JSON.stringify(result) };
      })
    );
    messages.push({ role: "user", content: toolResults });
    response = await anthropic.messages.create({ model: MODEL, max_tokens: 1024, system, tools, messages });
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  return textBlock?.text || FALLBACK_REPLY[replyLocale];
}
