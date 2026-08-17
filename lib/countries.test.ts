import { describe, it, expect } from "vitest";
import { COUNTRIES, flagEmoji } from "./countries";

describe("countries", () => {
  it("converts an ISO2 code into its regional-indicator flag emoji", () => {
    expect(flagEmoji("CR")).toBe("🇨🇷");
    expect(flagEmoji("US")).toBe("🇺🇸");
  });

  it("is case-insensitive", () => {
    expect(flagEmoji("cr")).toBe(flagEmoji("CR"));
  });

  it("lists Costa Rica first with its correct dial code", () => {
    expect(COUNTRIES[0]).toMatchObject({ iso2: "CR", dial: "+506" });
  });

  it("has no duplicate ISO2 codes", () => {
    const codes = COUNTRIES.map((c) => c.iso2);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every country a dial code starting with +", () => {
    for (const c of COUNTRIES) {
      expect(c.dial.startsWith("+")).toBe(true);
    }
  });
});
