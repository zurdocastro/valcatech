import { describe, it, expect } from "vitest";
import { parseValue } from "./PhoneInput";

describe("PhoneInput parseValue", () => {
  it("splits a combined value into country and local number", () => {
    expect(parseValue("+506 70978298")).toMatchObject({
      country: { iso2: "CR", dial: "+506" },
      number: "70978298",
    });
  });

  it("defaults to Costa Rica for an empty value", () => {
    expect(parseValue("").country.iso2).toBe("CR");
  });

  it("picks the longest matching dial code, not the shortest prefix", () => {
    // +1 (US/CA/etc.) is a prefix of no other code here, but this guards the
    // sort-by-length logic in case a future short code becomes a prefix of a
    // longer one (e.g. a hypothetical +50 vs +506).
    const result = parseValue("+506 88887777");
    expect(result.country.dial).toBe("+506");
    expect(result.number).toBe("88887777");
  });

  it("falls back to Costa Rica when the value has no recognized dial code", () => {
    const result = parseValue("88887777");
    expect(result.country.iso2).toBe("CR");
    expect(result.number).toBe("88887777");
  });
});
