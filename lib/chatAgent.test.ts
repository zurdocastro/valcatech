import { describe, it, expect } from "vitest";
import { detectLocale } from "./chatAgent";

describe("detectLocale", () => {
  it("detects Spanish from accented characters and punctuation", () => {
    expect(detectLocale("¿Cuánto cuesta el BPC-157?", "en")).toBe("es");
  });

  it("detects Spanish from common stopwords even without accents", () => {
    expect(detectLocale("hola quiero comprar dos", "en")).toBe("es");
  });

  it("detects English from common words, overriding a Spanish-site fallback", () => {
    expect(detectLocale("hi, how much does this cost?", "es")).toBe("en");
  });

  it("detects English from an informal/typo message", () => {
    expect(detectLocale("I wanto to buy a Ipamorelin, but can you explain how should I use it", "es")).toBe("en");
  });

  it("falls back to the site locale when the message has no clear language signal", () => {
    expect(detectLocale("Ipamorelin", "en")).toBe("en");
    expect(detectLocale("Ipamorelin", "es")).toBe("es");
  });

  it("falls back to the site locale when signals for both languages are present", () => {
    expect(detectLocale("hola, how much es?", "en")).toBe("en");
  });

  it("detects English from a short question using only common function words", () => {
    // Regression: "who"/"is" weren't in the original word list, so this fell
    // through to the (Spanish) site-locale fallback mid-conversation.
    expect(detectLocale("who is Alpha Aesthetics and Health?", "es")).toBe("en");
  });

  it("detects Spanish from common function words without any content words", () => {
    expect(detectLocale("¿quién es este?", "en")).toBe("es");
  });
});
