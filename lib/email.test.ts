// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Regression: the Resend SDK never throws on API-level failures (e.g. an
// unverified sending domain) — it resolves with { data: null, error }. Send
// helpers that don't check `result.error` make every .catch() at every call
// site dead code: a failed send gets reported as a success and the lead
// silently never reaches anyone.
const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const LEAD = { name: "Ada Lovelace", email: "ada@example.com", message: "We need a booking flow", source: "contact_form" };

describe("email send error handling", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    process.env.RESEND_API_KEY = "test-key";
  });

  it("throws when Resend resolves with an error instead of rejecting", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "The example.com domain is not verified.", statusCode: 403, name: "validation_error" } });
    const { sendLeadNotification } = await import("./email");
    await expect(sendLeadNotification(LEAD)).rejects.toThrow(/not verified/);
  });

  it("resolves normally when Resend reports success", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    const { sendLeadNotification } = await import("./email");
    await expect(sendLeadNotification(LEAD)).resolves.toBeUndefined();
  });

  it("escapes lead-supplied text so a submitted <script> can't reach the inbox as markup", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    const { sendLeadNotification } = await import("./email");
    await sendLeadNotification({ ...LEAD, name: '<script>alert(1)</script>', message: 'a & b <img onerror="x">' });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('<img onerror=');
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a &amp; b");
  });

  it("acknowledgement replies to the support inbox, not to the lead", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    const { sendLeadAcknowledgement, SUPPORT_EMAIL } = await import("./email");
    await sendLeadAcknowledgement({ to: "ada@example.com", name: "Ada" });
    expect(sendMock.mock.calls[0][0].replyTo).toBe(SUPPORT_EMAIL);
    expect(sendMock.mock.calls[0][0].to).toBe("ada@example.com");
  });
});
