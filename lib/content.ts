// Single source of truth for the marketing site's copy. The chat agent reads
// the same constants for its system prompt, so what the agent claims we do
// can never drift from what the site says we do.

export const BRAND = {
  name: "VALCA Tech",
  tagline: "AI Solutions Firm",
  email: "hello@valcatech.com",
  phone: "+506 6419-0202",
  whatsapp: "50664190202",
  location: "Costa Rica · USA → Argentina",
};

// The hero graph. These are the systems a real operation already runs on —
// naming them is what makes the diagram legible in two seconds instead of
// reading as abstract decoration.
export const OPS_CORE = { label: "VALCA", sub: "agents + integrations" };

export const OPS_NODES = [
  { label: "ORDERS", sub: "rest api" },
  { label: "PAYMENTS", sub: "onvo · 3ds" },
  { label: "INVENTORY", sub: "two-way sync" },
  { label: "WHATSAPP", sub: "webhook" },
  { label: "SCHEDULING", sub: "multi-site" },
  { label: "ERP", sub: "dynamics" },
];

export const HERO = {
  status: "Free discovery · answer in under 24h",
  headline: ["We wire your", "operation together."],
  body:
    "Custom software and AI agents that connect what your business already runs on — orders, 3DS payments, inventory, scheduling, your ERP. Built by engineers who learn your process before writing a line.",
  cta: "Start a project",
  secondaryCta: "See the agent stack",
  // Read as live telemetry under the hero, in mono. Facts, not slogans.
  metrics: [
    { value: "20+", label: "systems shipped" },
    { value: "6 wks", label: "typical first release" },
    { value: "100%", label: "code stays yours" },
  ],
};

export const CAPABILITIES = [
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
];

export const AGENTS_INTRO =
  "Schedule chaos, leads that go cold, manual follow-ups, reconciliations that eat a week every month. Each of these has a specific agent behind it — not one chatbot pointed at every problem.";

export const AGENTS = [
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
];

export const STATS = [
  { value: 20, suffix: "+", label: "systems shipped" },
  { value: 5, suffix: " yrs", label: "building" },
  { value: 100, suffix: "%", label: "you own the code" },
  { value: 24, prefix: "<", suffix: "h", label: "first response" },
];

export const PROCESS = [
  { step: "01", title: "Discovery", body: "We map your real process on the ground and find where automating actually pays. Free, and it stays free if the answer is no." },
  { step: "02", title: "ROI-first proposal", body: "Pricing comes out of that conversation, scoped to tangible return. You get it within 48 hours." },
  { step: "03", title: "Build", body: "Weekly sprints against a running system. Something usable in weeks, not a demo in six months." },
  { step: "04", title: "Implement & scale", body: "Deploy into your operation, integrate with what exists, and stay through the scale-up." },
];

export const FAQ = [
  {
    q: "How long does a typical project take?",
    a: "Most engagements put something usable in your hands in the first few weeks. We work in weekly sprints, so you are never waiting on a big reveal — a full platform typically lands in 6 to 12 weeks depending on scope.",
  },
  {
    q: "Where are your clients based?",
    a: "Born in Costa Rica, working from the USA down to Argentina. Distributed teams and split time zones are the normal case for us, not an exception.",
  },
  {
    q: "Can I see the code and keep it?",
    a: "Always. Everything we build lives in your repositories and your infrastructure. Your code, your data, 100% yours — no lock-in and nothing you cannot read.",
  },
  {
    q: "How do you price?",
    a: "Pricing comes out of the free discovery call and is scoped to real return, not a rate card. You get a proposal within 48 hours of that conversation.",
  },
  {
    q: "What if we already have systems we cannot replace?",
    a: "That is the normal starting point, and it is the work we are best at. We integrate with the ERP, the payment processor and the spreadsheet that somehow runs payroll — replacing them is a decision you make later, not a precondition.",
  },
];

export const CLOSING = {
  tagline: "We don't wait — we build the region's technological future",
  headline: "Let's wire it together.",
  body: "Free discovery, and an ROI-focused proposal within 48 hours. If automating does not pay for your operation, we will tell you that instead.",
};

export const FOOTER_BLURB =
  "A custom software company — AI agents, webapps, systems and integrations that connect complex operations. Born in Costa Rica, working from the USA to Argentina. Your code, your data, 100% yours.";

export const NAV = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#agents", label: "Agents" },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];
