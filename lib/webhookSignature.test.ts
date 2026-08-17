// @vitest-environment node
import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifySvixSignature } from "./webhookSignature";

const secret = "whsec_" + Buffer.from("test-secret-bytes").toString("base64");

function sign(id: string, timestamp: string, body: string) {
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${body}`;
  return crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");
}

describe("verifySvixSignature", () => {
  it("accepts a correctly signed payload", () => {
    const id = "msg_1";
    const timestamp = "1700000000";
    const body = JSON.stringify({ type: "email.opened" });
    const headers = new Headers({ "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${sign(id, timestamp, body)}` });
    expect(verifySvixSignature(body, headers, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const id = "msg_1";
    const timestamp = "1700000000";
    const body = JSON.stringify({ type: "email.opened" });
    const headers = new Headers({ "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${sign(id, timestamp, body)}` });
    const tamperedBody = JSON.stringify({ type: "email.bounced" });
    expect(verifySvixSignature(tamperedBody, headers, secret)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    const id = "msg_1";
    const timestamp = "1700000000";
    const body = JSON.stringify({ type: "email.opened" });
    const wrongSecret = "whsec_" + Buffer.from("a-different-secret").toString("base64");
    const secretBytes = Buffer.from(wrongSecret.replace(/^whsec_/, ""), "base64");
    const badSig = crypto.createHmac("sha256", secretBytes).update(`${id}.${timestamp}.${body}`).digest("base64");
    const headers = new Headers({ "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${badSig}` });
    expect(verifySvixSignature(body, headers, secret)).toBe(false);
  });

  it("rejects when required headers are missing", () => {
    const body = "{}";
    expect(verifySvixSignature(body, new Headers(), secret)).toBe(false);
    expect(verifySvixSignature(body, new Headers({ "svix-id": "x" }), secret)).toBe(false);
  });
});
