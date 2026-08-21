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

export const HERO = {
  label: "AI Solutions Firm",
  headline: ["AI Solutions", "Firm."],
  body:
    "Software, webapps, systems and integrations that interconnect complex operations — built around how your operation actually runs, delivered by engineers embedded in your business.",
  points: ["Custom software: value in weeks, not months", "AI agents: your code, your data"],
  cta: "Start a project",
  secondaryCta: "See our work",
};

export const CAPABILITIES = [
  {
    group: "Custom software",
    items: [
      { title: "E-commerce & stores", body: "Custom storefronts with product variants, inventory and 3D-Secure card checkout — not a template." },
      { title: "Client & member portals", body: "Logins, gated content, progress tracking and private member areas for your users." },
      { title: "Backoffice & dashboards", body: "Run inventory, orders and metrics from one admin panel built around your team's workflow." },
      { title: "Booking & price calculators", body: "Scheduling, dynamic pricing and pay-in-three-steps flows that turn visits into bookings." },
    ],
  },
  {
    group: "Automation",
    items: [
      { title: "Recurring payments & 3DS", body: "Subscriptions and billing with ONVO, Stripe and SINPE — 3D-Secure, automated and reconciled." },
      { title: "Communities & memberships", body: "Membership access, live events and cohort-based programs that keep members coming back." },
      { title: "AI agents", body: "Voice, support and sales agents working 24/7 across your systems, trained on your processes." },
      { title: "Flows, CRM & messaging", body: "Automated email and WhatsApp, reminders and follow-up sequences that never drop a lead." },
    ],
  },
];

export const AGENTS_INTRO =
  "Schedule chaos, lost clients, manual follow-ups, endless reconciliations — we've built end-to-end platforms that solve real operational problems. The agent stack gives you the right AI partner for each one.";

export const AGENTS = [
  { name: "Data Intake Agent", category: "Ops", body: "Turns unstructured inputs — emails, PDFs, forms — into structured operational data, automatically." },
  { name: "Conciliation Agent", category: "Ops", body: "Reconciles financial records automatically across systems, invoices and data sources." },
  { name: "Logistics Agent", category: "Ops", body: "Tracks shipments, routes and inventory in real time — flagging issues before they cost you." },
  { name: "Social Media Manager Agent", category: "Content", body: "Keeps a consistent, high-performing social presence running on autopilot." },
  { name: "Content Creation Agent", category: "Content", body: "Produces high-quality content across every channel — automatically and at scale." },
  { name: "Outbound Prospecting Agent", category: "Sales", body: "Scales outbound prospecting from targeting to qualification, hands-free." },
  { name: "Quoting Agent", category: "Sales", body: "Generates optimized quotes in minutes, with consistent pricing and protected margins." },
  { name: "Lead & Sales Qualification Agent", category: "Sales", body: "Captures, qualifies and validates leads automatically — before your team touches them." },
  { name: "Sales Agent", category: "Sales", body: "Runs the full motion — outreach, follow-up and closing prep — on autopilot." },
  { name: "Knowledge Management Agent", category: "Support", body: "Instant answers, always available — scale support without adding headcount." },
  { name: "Support Agent", category: "Support", body: "Resolves tickets across your platforms — chat, email and help center — instantly." },
  { name: "Voice Agent", category: "Voice", body: "Answers calls, books and qualifies in natural conversation — working 24/7." },
];

export const STATS = [
  { value: 20, suffix: "+", label: "projects shipped" },
  { value: 5, suffix: " yrs", label: "building" },
  { value: 100, suffix: "%", label: "you own the code" },
  { value: 24, prefix: "<", suffix: "h", label: "first response" },
];

export const PROCESS = [
  { step: "01", title: "Discovery", body: "We map your real process on the ground and find the true value of automating — free." },
  { step: "02", title: "ROI-first proposal", body: "Pricing always comes from that consultation — scoped to real, tangible ROI." },
  { step: "03", title: "Build", body: "Weekly sprints; tangible value in weeks, not months." },
  { step: "04", title: "Implement & scale", body: "Deploy, integration with your operation, and support through the scale-up." },
];

export const FAQ = [
  {
    q: "How long does a typical project take?",
    a: "Most engagements ship something usable in the first few weeks. We work in weekly sprints, so you see tangible value in weeks, not months — a full platform typically lands in 6 to 12 weeks depending on scope.",
  },
  {
    q: "Where are your clients based?",
    a: "Born in Costa Rica, working from the USA to Argentina. We operate across the Americas and are used to distributed teams and time zones.",
  },
  {
    q: "Can I see the code and keep it?",
    a: "Always. Your code, your data, 100% yours. Everything we build lives in your repositories and your infrastructure — no lock-in, no black boxes.",
  },
  {
    q: "How do you price?",
    a: "Pricing always comes out of the free discovery consultation and is scoped to real, tangible ROI. No generic rate cards — you get a proposal within 48 hours of that conversation.",
  },
];

export const CLOSING = {
  tagline: "We don't wait — we build the region's technological future",
  headline: "Let's build together.",
  body: "The right solution at the right price. Free discovery, and an ROI-focused proposal within 48 hours.",
};

export const FOOTER_BLURB =
  "A custom software company — AI agents, webapps, systems and integrations that interconnect complex operations. Born in Costa Rica, working from the USA to Argentina. Your code, your data, 100% yours.";

export const NAV = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#agents", label: "Agents" },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];
