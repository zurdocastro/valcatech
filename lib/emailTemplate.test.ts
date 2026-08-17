import { describe, it, expect } from "vitest";
import { renderEmailTemplate } from "./emailTemplate";

describe("renderEmailTemplate", () => {
  const customer = { firstName: "Jane", lastName: "Doe" };

  it("substitutes {{first_name}}", () => {
    expect(renderEmailTemplate("Hi {{first_name}},", customer)).toBe("Hi Jane,");
  });

  it("substitutes {{last_name}}", () => {
    expect(renderEmailTemplate("Dear {{last_name}} family,", customer)).toBe("Dear Doe family,");
  });

  it("substitutes {{full_name}}", () => {
    expect(renderEmailTemplate("Welcome, {{full_name}}!", customer)).toBe("Welcome, Jane Doe!");
  });

  it("substitutes multiple occurrences of the same tag", () => {
    expect(renderEmailTemplate("{{first_name}} {{first_name}}", customer)).toBe("Jane Jane");
  });

  it("substitutes multiple different tags in one string", () => {
    expect(renderEmailTemplate("{{first_name}} {{last_name}} a.k.a {{full_name}}", customer)).toBe("Jane Doe a.k.a Jane Doe");
  });

  it("leaves text without tags unchanged", () => {
    expect(renderEmailTemplate("<p>No tags here.</p>", customer)).toBe("<p>No tags here.</p>");
  });

  it("trims a trailing space when last name is empty", () => {
    expect(renderEmailTemplate("{{full_name}}", { firstName: "Jane", lastName: "" })).toBe("Jane");
  });
});
