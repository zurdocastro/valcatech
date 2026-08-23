// Single source of truth for the marketing site's copy, in both languages the
// site ships. The chat agent reads the same constants for its system prompt, so
// what the agent claims we do can never drift from what the site says we do.

export type Locale = "en" | "es";

// Spanish first: the market is Costa Rica through Argentina.
export const LOCALES = ["es", "en"] as const;
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Same page, other language: swap only the leading locale segment. A path that
 * does not start with a known locale gets one prefixed rather than having its
 * first segment overwritten — otherwise the language toggle would silently
 * rewrite "/privacy" into "/en".
 */
export function swapLocalePath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) {
    parts[1] = next;
    return parts.join("/");
  }
  const rest = pathname.replace(/^\/+/, "");
  return rest ? `/${next}/${rest}` : `/${next}`;
}

// Facts that do not translate.
export const BRAND = {
  name: "VALCAS Tech",
  tagline: "AI Solutions Firm",
  email: "valcastech@gmail.com",
  phone: "+506 7097-8298",
  whatsapp: "50670978298",
  location: "Costa Rica · USA → Argentina",
};

const en = {
  tagline: "AI Solutions Firm",
  localeName: "English",

  // The hero graph. These are the systems a real operation already runs on —
  // naming them is what makes the diagram legible in two seconds instead of
  // reading as abstract decoration.
  opsCore: { label: "VALCAS", sub: "agents + integrations" },
  opsNodes: [
    { label: "ORDERS", sub: "rest api" },
    { label: "PAYMENTS", sub: "onvo · 3ds" },
    { label: "INVENTORY", sub: "two-way sync" },
    { label: "WHATSAPP", sub: "webhook" },
    { label: "SCHEDULING", sub: "multi-site" },
    { label: "ERP", sub: "dynamics" },
  ],

  hero: {
    status: "Free discovery · answer in under 24h",
    headline: ["We wire your", "operation together."],
    body:
      "Custom software and AI agents that connect what your business already runs on — orders, 3DS payments, inventory, scheduling, your ERP. Built by engineers who learn your process before writing a line.",
    cta: "Start a project",
    secondaryCta: "See the agent stack",
    metrics: [
      { value: "20+", label: "systems shipped" },
      { value: "3 wks", label: "typical first release" },
      { value: "100%", label: "code stays yours" },
    ],
  },

  sections: {
    build: { num: "01", label: "What we build", heading: "Two kinds of work, one operation." },
    agents: { num: "02", label: "The agent stack", heading: "One agent per problem." },
    process: { num: "03", label: "How we work", heading: "Four steps, no surprises." },
    proof: { num: "04", label: "Why VALCAS Tech" },
    faq: { num: "05", label: "Questions", heading: "Asked before you ask." },
  },

  capabilities: [
    {
      group: "Custom software",
      items: [
        { title: "E-commerce & stores", body: "Storefronts with variants, inventory and 3D-Secure card checkout. Built for your catalogue, not bent out of a template." },
        { title: "Client & member portals", body: "Logins, gated content, progress tracking and private member areas your users actually return to." },
        { title: "Backoffice & dashboards", body: "Inventory, orders and metrics in one admin panel shaped around how your team already works." },
        { title: "Booking & price calculators", body: "Multi-site scheduling, dynamic pricing and pay-in-three-steps flows that turn a visit into a booking." },
      ],
    },
    {
      group: "Automation",
      items: [
        { title: "Payments & 3DS", body: "Subscriptions, billing and reconciliation across ONVO, Stripe and SINPE — 3D-Secure, automated, and matched at the end of the month." },
        { title: "Communities & memberships", body: "Membership tiers, live events and cohort programs, with the access rules enforced in code." },
        { title: "AI agents", body: "Voice, support and sales agents running on your data and your processes, inside your infrastructure." },
        { title: "Flows, CRM & messaging", body: "Email and WhatsApp sequences, reminders and follow-ups that never quietly drop a lead." },
      ],
    },
  ],

  agentsIntro:
    "Schedule chaos, leads that go cold, manual follow-ups, reconciliations that eat a week every month. Each of these has a specific agent behind it — not one chatbot pointed at every problem.",

  agents: [
    { name: "Data Intake Agent", category: "Ops", body: "Turns emails, PDFs and forms into structured operational data, without anyone retyping it." },
    { name: "Conciliation Agent", category: "Ops", body: "Reconciles financial records across systems, invoices and data sources, and flags what does not match." },
    { name: "Logistics Agent", category: "Ops", body: "Tracks shipments, routes and stock in real time, raising issues before they cost you a delivery." },
    { name: "Social Media Manager Agent", category: "Content", body: "Keeps a consistent posting cadence running across channels without a standing meeting." },
    { name: "Content Creation Agent", category: "Content", body: "Produces channel-ready content at volume, in a voice you approve once and reuse." },
    { name: "Outbound Prospecting Agent", category: "Sales", body: "Runs targeting through qualification, so your team only sees prospects worth a call." },
    { name: "Quoting Agent", category: "Sales", body: "Builds quotes in minutes with consistent pricing and margins that hold." },
    { name: "Lead Qualification Agent", category: "Sales", body: "Captures, qualifies and validates leads before anyone on your side touches them." },
    { name: "Sales Agent", category: "Sales", body: "Handles outreach, follow-up and closing prep end to end." },
    { name: "Knowledge Management Agent", category: "Support", body: "Answers instantly from your own documentation, so support scales without headcount." },
    { name: "Support Agent", category: "Support", body: "Resolves tickets across chat, email and your help center." },
    { name: "Voice Agent", category: "Voice", body: "Answers the phone, books and qualifies in natural conversation, at 2am included." },
  ],

  stats: [
    { value: 20, suffix: "+", label: "systems shipped" },
    { value: 5, suffix: " yrs", label: "building" },
    { value: 100, suffix: "%", label: "you own the code" },
    { value: 24, prefix: "<", suffix: "h", label: "first response" },
  ],

  process: [
    { step: "01", title: "Discovery", body: "We map your real process on the ground and find where automating actually pays. Free, and it stays free if the answer is no." },
    { step: "02", title: "ROI-first proposal", body: "Pricing comes out of that conversation, scoped to tangible return. You get it within 48 hours." },
    { step: "03", title: "Build", body: "Weekly sprints against a running system. Something usable in weeks, not a demo in six months." },
    { step: "04", title: "Implement & scale", body: "Deploy into your operation, integrate with what exists, and stay through the scale-up." },
  ],

  faq: [
    { q: "How long does a typical project take?", a: "Most engagements put something usable in your hands in the first few weeks. We work in weekly sprints, so you are never waiting on a big reveal — a full platform typically lands in 6 to 12 weeks depending on scope." },
    { q: "Where are your clients based?", a: "Born in Costa Rica, working from the USA down to Argentina. Distributed teams and split time zones are the normal case for us, not an exception." },
    { q: "Can I see the code and keep it?", a: "Always. Everything we build lives in your repositories and your infrastructure. Your code, your data, 100% yours — no lock-in and nothing you cannot read." },
    { q: "How do you price?", a: "Pricing comes out of the free discovery call and is scoped to real return, not a rate card. You get a proposal within 48 hours of that conversation." },
    { q: "What if we already have systems we cannot replace?", a: "That is the normal starting point, and it is the work we are best at. We integrate with the ERP, the payment processor and the spreadsheet that somehow runs payroll — replacing them is a decision you make later, not a precondition." },
  ],

  closing: {
    tagline: "We don't wait — we build the region's technological future",
    headline: "Let's wire it together.",
    body: "Free discovery, and an ROI-focused proposal within 48 hours. If automating does not pay for your operation, we will tell you that instead.",
  },

  footerBlurb:
    "A custom software company — AI agents, webapps, systems and integrations that connect complex operations. Born in Costa Rica, working from the USA to Argentina. Your code, your data, 100% yours.",

  nav: [
    { href: "#what-we-do", label: "What we do" },
    { href: "#agents", label: "Agents" },
    { href: "#process", label: "Process" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ],

  footer: { site: "Site", contact: "Contact", privacy: "Privacy" },

  form: {
    name: "Name",
    email: "Email",
    company: "Company (optional)",
    phone: "Phone (optional)",
    message: "What are you trying to build or automate?",
    submit: "Start a project",
    sending: "Sending…",
    sentTitle: "Thanks — we got it.",
    sentBody: "You'll hear from us in under 24 hours, with an ROI-focused proposal within 48 hours of the discovery call.",
    error: "Something went wrong",
  },

  privacy: {
    title: "Privacy.",
    back: "← Back home",
    sections: [
      { title: "What we collect", body: "When you submit the contact form or talk to the assistant on this site, we store the name, email, phone, company and message you give us. Nothing else is collected — we do not run advertising trackers or sell data." },
      { title: "Why we collect it", body: "Solely to reply to you, scope the work you asked about, and follow up on that conversation. If you never hear from us again, that is the only outcome we use it for." },
      { title: "Who can see it", body: "Our own team, through our backoffice. Messages are delivered through Resend and the site assistant runs on Anthropic's API; both process the content strictly to deliver the service." },
      { title: "Your code and your data", body: "For client engagements: everything we build lives in your repositories and your infrastructure. Your code, your data, 100% yours — no lock-in, no black boxes." },
      { title: "Removing your data", body: `Email ${BRAND.email} and we will delete your record. No forms, no retention period, no argument.` },
    ],
  },

  meta: {
    title: "VALCAS Tech — AI Solutions Firm",
    description:
      "Custom software and AI agents — webapps, systems and integrations that connect complex operations. Born in Costa Rica, working from the USA to Argentina. Your code, your data.",
  },
};

const es: typeof en = {
  tagline: "Software a la medida y agentes de IA",
  localeName: "Español",

  opsCore: { label: "VALCAS", sub: "agentes + integraciones" },
  opsNodes: [
    { label: "PEDIDOS", sub: "api rest" },
    { label: "PAGOS", sub: "onvo · 3ds" },
    { label: "INVENTARIO", sub: "sync bidireccional" },
    { label: "WHATSAPP", sub: "webhook" },
    { label: "AGENDA", sub: "multisede" },
    { label: "ERP", sub: "dynamics" },
  ],

  hero: {
    status: "Diagnóstico gratis · respuesta en menos de 24 h",
    headline: ["Conectamos toda", "tu operación."],
    body:
      "Software a la medida y agentes de IA que conectan lo que tu negocio ya usa — pedidos, pagos 3DS, inventario, agenda, tu ERP. Lo construyen ingenieros que entienden tu proceso antes de escribir una línea.",
    cta: "Empezar un proyecto",
    secondaryCta: "Ver los agentes",
    metrics: [
      { value: "20+", label: "sistemas entregados" },
      { value: "3 sem", label: "primera entrega típica" },
      { value: "100%", label: "el código es tuyo" },
    ],
  },

  sections: {
    build: { num: "01", label: "Qué construimos", heading: "Dos tipos de trabajo, una sola operación." },
    agents: { num: "02", label: "El stack de agentes", heading: "Un agente por problema." },
    process: { num: "03", label: "Cómo trabajamos", heading: "Cuatro pasos, sin sorpresas." },
    proof: { num: "04", label: "Por qué VALCAS Tech" },
    faq: { num: "05", label: "Preguntas", heading: "Resueltas antes de que preguntes." },
  },

  capabilities: [
    {
      group: "Software a la medida",
      items: [
        { title: "E-commerce y tiendas", body: "Tiendas con variantes, inventario y cobro con tarjeta 3D-Secure. Hechas para tu catálogo, no forzadas dentro de una plantilla." },
        { title: "Portales de clientes y socios", body: "Accesos, contenido privado, seguimiento de progreso y áreas de miembros a las que tus usuarios sí vuelven." },
        { title: "Back office y tableros", body: "Inventario, pedidos y métricas en un solo panel, armado alrededor de cómo ya trabaja tu equipo." },
        { title: "Reservas y calculadoras de precio", body: "Agenda multisede, precios dinámicos y flujos de pago en tres pasos que convierten una visita en una reserva." },
      ],
    },
    {
      group: "Automatización",
      items: [
        { title: "Pagos y 3DS", body: "Suscripciones, facturación y conciliación con ONVO, Stripe y SINPE — 3D-Secure, automatizado y cuadrado a fin de mes." },
        { title: "Comunidades y membresías", body: "Niveles de membresía, eventos en vivo y programas por cohortes, con las reglas de acceso aplicadas en código." },
        { title: "Agentes de IA", body: "Agentes de voz, soporte y ventas que corren sobre tus datos y tus procesos, dentro de tu infraestructura." },
        { title: "Flujos, CRM y mensajería", body: "Secuencias de correo y WhatsApp, recordatorios y seguimientos que nunca dejan caer un prospecto." },
      ],
    },
  ],

  agentsIntro:
    "Agendas desordenadas, prospectos que se enfrían, seguimientos a mano, conciliaciones que se comen una semana al mes. Cada uno de estos tiene un agente específico detrás — no un solo chatbot apuntado a todos los problemas.",

  agents: [
    { name: "Agente de captura de datos", category: "Ops", body: "Convierte correos, PDF y formularios en datos operativos estructurados, sin que nadie los retranscriba." },
    { name: "Agente de conciliación", category: "Ops", body: "Concilia registros financieros entre sistemas, facturas y fuentes de datos, y marca lo que no cuadra." },
    { name: "Agente de logística", category: "Ops", body: "Sigue envíos, rutas e inventario en tiempo real, y levanta la alerta antes de que te cueste una entrega." },
    { name: "Agente de redes sociales", category: "Contenido", body: "Mantiene una cadencia de publicación constante en todos los canales sin una reunión semanal." },
    { name: "Agente de creación de contenido", category: "Contenido", body: "Produce contenido listo para publicar a volumen, con una voz que apruebas una vez y se reutiliza." },
    { name: "Agente de prospección", category: "Ventas", body: "Lleva la segmentación hasta la calificación, para que tu equipo solo vea prospectos que valen una llamada." },
    { name: "Agente de cotización", category: "Ventas", body: "Arma cotizaciones en minutos, con precios consistentes y márgenes que se sostienen." },
    { name: "Agente de calificación de prospectos", category: "Ventas", body: "Captura, califica y valida prospectos antes de que alguien de tu lado los toque." },
    { name: "Agente de ventas", category: "Ventas", body: "Se encarga del contacto, el seguimiento y la preparación del cierre, de punta a punta." },
    { name: "Agente de conocimiento", category: "Soporte", body: "Responde al instante desde tu propia documentación, para que soporte escale sin contratar más gente." },
    { name: "Agente de soporte", category: "Soporte", body: "Resuelve tickets en chat, correo y tu centro de ayuda." },
    { name: "Agente de voz", category: "Voz", body: "Contesta el teléfono, agenda y califica en conversación natural, incluso a las 2 de la mañana." },
  ],

  stats: [
    { value: 20, suffix: "+", label: "sistemas entregados" },
    { value: 5, suffix: " años", label: "construyendo" },
    { value: 100, suffix: "%", label: "el código es tuyo" },
    { value: 24, prefix: "<", suffix: " h", label: "primera respuesta" },
  ],

  process: [
    { step: "01", title: "Descubrimiento", body: "Mapeamos tu proceso real en el terreno y encontramos dónde automatizar de verdad paga. Gratis, y sigue siendo gratis si la respuesta es que no." },
    { step: "02", title: "Propuesta con ROI", body: "El precio sale de esa conversación, dimensionado a un retorno concreto. Lo tienes en menos de 48 horas." },
    { step: "03", title: "Construcción", body: "Sprints semanales sobre un sistema que ya corre. Algo usable en semanas, no una demo en seis meses." },
    { step: "04", title: "Implementación y escala", body: "Lo desplegamos dentro de tu operación, lo integramos con lo que ya existe y te acompañamos durante el crecimiento." },
  ],

  faq: [
    { q: "¿Cuánto toma un proyecto típico?", a: "En la mayoría de los casos tienes algo usable en las primeras semanas. Trabajamos en sprints semanales, así que nunca estás esperando una gran revelación — una plataforma completa suele caer entre 6 y 12 semanas según el alcance." },
    { q: "¿Dónde están sus clientes?", a: "Nacimos en Costa Rica y trabajamos desde Estados Unidos hasta Argentina. Los equipos distribuidos y los husos horarios partidos son lo normal para nosotros, no la excepción." },
    { q: "¿Puedo ver el código y quedármelo?", a: "Siempre. Todo lo que construimos vive en tus repositorios y tu infraestructura. Tu código, tus datos, 100% tuyos — sin ataduras y sin nada que no puedas leer." },
    { q: "¿Cómo cobran?", a: "El precio sale del descubrimiento gratuito y se dimensiona a un retorno real, no a una lista de tarifas. Recibes la propuesta dentro de las 48 horas siguientes a esa conversación." },
    { q: "¿Y si ya tenemos sistemas que no podemos reemplazar?", a: "Ese es el punto de partida normal, y es justo en lo que somos mejores. Nos integramos con el ERP, la pasarela de pago y la hoja de cálculo que de alguna forma corre la planilla — reemplazarlos es una decisión que tomas después, no un requisito." },
  ],

  closing: {
    tagline: "No esperamos — construimos el futuro tecnológico de la región",
    headline: "Conectemos tu operación.",
    body: "Descubrimiento gratis y una propuesta enfocada en ROI en menos de 48 horas. Si automatizar no te conviene, también te lo decimos.",
  },

  footerBlurb:
    "Una empresa de software a la medida — agentes de IA, webapps, sistemas e integraciones que conectan operaciones complejas. Nacimos en Costa Rica y trabajamos desde Estados Unidos hasta Argentina. Tu código, tus datos, 100% tuyos.",

  nav: [
    { href: "#what-we-do", label: "Qué hacemos" },
    { href: "#agents", label: "Agentes" },
    { href: "#process", label: "Proceso" },
    { href: "#faq", label: "Preguntas" },
    { href: "#contact", label: "Contacto" },
  ],

  footer: { site: "Sitio", contact: "Contacto", privacy: "Privacidad" },

  form: {
    name: "Nombre",
    email: "Correo",
    company: "Empresa (opcional)",
    phone: "Teléfono (opcional)",
    message: "¿Qué quieres construir o automatizar?",
    submit: "Empezar un proyecto",
    sending: "Enviando…",
    sentTitle: "Listo — nos llegó.",
    sentBody: "Te escribimos en menos de 24 horas, y la propuesta enfocada en ROI llega dentro de las 48 horas siguientes a la llamada de descubrimiento.",
    error: "Algo salió mal",
  },

  privacy: {
    title: "Privacidad.",
    back: "← Volver al inicio",
    sections: [
      { title: "Qué recogemos", body: "Cuando envías el formulario de contacto o hablas con el asistente de este sitio, guardamos el nombre, correo, teléfono, empresa y mensaje que nos das. Nada más — no usamos rastreadores publicitarios ni vendemos datos." },
      { title: "Para qué lo recogemos", body: "Únicamente para responderte, dimensionar el trabajo que consultaste y dar seguimiento a esa conversación. Si nunca vuelves a saber de nosotros, ese es el único uso que le dimos." },
      { title: "Quién puede verlo", body: "Nuestro propio equipo, a través del back office. Los mensajes se entregan con Resend y el asistente del sitio corre sobre la API de Anthropic; ambos procesan el contenido estrictamente para prestar el servicio." },
      { title: "Tu código y tus datos", body: "Para proyectos con clientes: todo lo que construimos vive en tus repositorios y tu infraestructura. Tu código, tus datos, 100% tuyos — sin ataduras ni cajas negras." },
      { title: "Eliminar tus datos", body: `Escribe a ${BRAND.email} y borramos tu registro. Sin formularios, sin periodo de retención, sin discusión.` },
    ],
  },

  meta: {
    title: "VALCAS Tech — Software a la medida y agentes de IA",
    description:
      "Software a la medida y agentes de IA — webapps, sistemas e integraciones que conectan operaciones complejas. Nacimos en Costa Rica y trabajamos desde Estados Unidos hasta Argentina. Tu código, tus datos.",
  },
};

export const CONTENT = { en, es };

export function getContent(locale: Locale) {
  return CONTENT[locale];
}
