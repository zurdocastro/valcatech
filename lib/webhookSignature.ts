import crypto from "crypto";

// Resend signs webhooks using Svix. Verify the signature ourselves (no svix
// dependency needed): signed content is "{svix-id}.{svix-timestamp}.{rawBody}",
// HMAC-SHA256'd with the base64-decoded secret (after stripping "whsec_").
export function verifySvixSignature(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");

  return signature.split(" ").some((sig) => {
    const [, value] = sig.split(",");
    if (!value) return false;
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
