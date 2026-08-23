import { Resend } from "resend";
import { renderEmailTemplate } from "@/lib/emailTemplate";
import { BRAND } from "@/lib/content";

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// "From" stays the branded address, but a customer hitting Reply needs to land
// somewhere a human actually reads.
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || BRAND.email;
export const FROM_EMAIL = process.env.RESEND_FROM || `VALCAS Tech <hello@valcatech.com>`;

const DARK = {
  void: "#000000",
  panel: "#0B0B0D",
  iris: "#8052FF",
  saffron: "#FFB829",
  text: "#FFFFFF",
  muted: "#BDBDBD",
};

function shell(inner: string, headerImageUrl?: string) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Inter,-apple-system,'Segoe UI',system-ui,sans-serif;background:${DARK.void};margin:0;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto;background:${DARK.panel};border-radius:24px;padding:40px">
    <div style="margin-bottom:28px">
      ${headerImageUrl
        ? `<img src="${headerImageUrl}" alt="VALCAS Tech" height="28" style="display:block;height:28px" />`
        : `<span style="font-weight:500;font-size:18px;color:${DARK.text};letter-spacing:-0.02em">VALCAS<span style="color:${DARK.iris}"> Tech</span></span>`}
    </div>
    ${inner}
    <p style="margin:32px 0 0;color:#6E6E76;font-size:12px;text-align:center">
      VALCAS Tech — AI Solutions Firm. ${BRAND.location}
    </p>
  </div>
</body>
</html>`;
}

// Shared between the campaign send loop (app/api/emails/route.ts) and the
// preview endpoint, so what the admin previews can never drift from what is
// actually sent.
export function renderCampaignEmailHtml(
  opts: { body: string; headerImageUrl?: string; imageUrl?: string; footerImageUrl?: string },
  customer: { firstName: string; lastName: string }
): string {
  const personalizedBody = renderEmailTemplate(opts.body, customer);
  const headerImageSection = opts.headerImageUrl
    ? `<div style="margin-bottom:24px"><img src="${opts.headerImageUrl}" alt="" style="max-width:100%;border-radius:14px;display:block" /></div>`
    : "";
  const bodySection = opts.imageUrl
    ? `<div style="overflow:auto;color:${DARK.muted};font-size:15px;line-height:1.6">
        <img src="${opts.imageUrl}" alt="" style="float:right;max-width:220px;width:40%;margin:0 0 16px 20px;border-radius:14px" />
        ${personalizedBody}
      </div>`
    : `<div style="color:${DARK.muted};font-size:15px;line-height:1.6">${personalizedBody}</div>`;
  const footerImageSection = opts.footerImageUrl
    ? `<div style="text-align:center;margin-top:28px"><img src="${opts.footerImageUrl}" alt="" style="max-width:100%;border-radius:14px" /></div>`
    : "";
  return shell(`${headerImageSection}${bodySection}${footerImageSection}`);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Internal notification — a new lead landed, from the site form or the chat
// agent. Sent to the team inbox, with Reply-To set to the lead so a reply
// goes straight back to them.
export async function sendLeadNotification(opts: {
  name: string; email: string; phone?: string; company?: string; message: string; source: string;
}) {
  const resend = getResend();
  if (!resend) { console.warn("RESEND_API_KEY not set, skipping lead notification"); return; }
  const rows = [
    ["Name", opts.name],
    ["Email", opts.email],
    ["Phone", opts.phone || "—"],
    ["Company", opts.company || "—"],
    ["Source", opts.source],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6E6E76;font-size:13px">${k}</td><td style="padding:6px 0;color:${DARK.text};font-size:14px">${escapeHtml(v)}</td></tr>`)
    .join("");

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    replyTo: opts.email,
    to: SUPPORT_EMAIL,
    subject: `New lead — ${opts.name}${opts.company ? ` (${opts.company})` : ""}`,
    html: shell(`
      <h1 style="margin:0 0 20px;font-size:24px;font-weight:400;letter-spacing:-0.02em;color:${DARK.text}">New lead</h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">${rows}</table>
      <p style="margin:0 0 6px;color:${DARK.saffron};font-size:12px;letter-spacing:.05em;text-transform:uppercase">What they want built</p>
      <p style="margin:0;color:${DARK.muted};font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(opts.message)}</p>
    `),
  });
  // The Resend SDK resolves with { data: null, error } on API-level failures
  // (e.g. an unverified sending domain) rather than throwing — without this
  // check every .catch() in the callers would be dead code.
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}

// Confirmation back to the person who reached out.
export async function sendLeadAcknowledgement(opts: { to: string; name: string }) {
  const resend = getResend();
  if (!resend) { console.warn("RESEND_API_KEY not set, skipping lead acknowledgement"); return; }
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    replyTo: SUPPORT_EMAIL,
    to: opts.to,
    subject: "We got your message — VALCAS Tech",
    html: shell(`
      <h1 style="margin:0 0 14px;font-size:28px;font-weight:400;letter-spacing:-0.03em;color:${DARK.text}">Thanks, ${escapeHtml(opts.name)}.</h1>
      <p style="margin:0 0 24px;color:${DARK.muted};font-size:16px;line-height:1.6">
        We read every message ourselves. You'll hear back in under 24 hours to book a free discovery call —
        and an ROI-focused proposal lands within 48 hours of that conversation.
      </p>
      <div style="text-align:left">
        <a href="https://wa.me/${BRAND.whatsapp}" style="display:inline-block;background-color:${DARK.iris};color:#fff;font-weight:600;font-size:13px;letter-spacing:.05em;text-transform:uppercase;padding:14px 24px;border-radius:24px;text-decoration:none">Talk on WhatsApp</a>
      </div>
    `),
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}
