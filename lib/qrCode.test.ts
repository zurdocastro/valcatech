import { describe, it, expect } from "vitest";
import { buildPromoCodeUrl } from "./qrCode";

describe("buildPromoCodeUrl", () => {
  it("builds a cart URL with the code as a query param", () => {
    expect(buildPromoCodeUrl("SAVE10", "https://pureblendlabs.com")).toBe("https://pureblendlabs.com/en/cart?code=SAVE10");
  });

  it("strips a trailing slash from a custom base URL", () => {
    expect(buildPromoCodeUrl("SAVE10", "https://pureblendlabs.com/")).toBe("https://pureblendlabs.com/en/cart?code=SAVE10");
  });

  it("URL-encodes special characters in the code", () => {
    expect(buildPromoCodeUrl("SAVE 10%", "https://pureblendlabs.com")).toBe("https://pureblendlabs.com/en/cart?code=SAVE%2010%25");
  });
});
