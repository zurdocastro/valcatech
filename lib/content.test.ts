import { describe, expect, it } from "vitest";
import { CONTENT, DEFAULT_LOCALE, LOCALES, getContent, isLocale, swapLocalePath } from "./content";

describe("locales", () => {
  it("accepts only known locales", () => {
    expect(isLocale("es")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("admin")).toBe(false);
  });

  it("defaults to a locale it actually ships", () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});

describe("swapLocalePath", () => {
  it("swaps an existing locale segment", () => {
    expect(swapLocalePath("/es", "en")).toBe("/en");
    expect(swapLocalePath("/es/privacy", "en")).toBe("/en/privacy");
  });

  it("prefixes rather than overwriting when there is no locale segment", () => {
    // Overwriting here would turn /privacy into /en and lose the page.
    expect(swapLocalePath("/privacy", "en")).toBe("/en/privacy");
    expect(swapLocalePath("/", "es")).toBe("/es");
  });
});

describe("content parity", () => {
  // A missing key in one language renders as blank on that page, which is easy
  // to ship and hard to notice.
  const shape = (v: unknown): unknown =>
    Array.isArray(v)
      ? [shape(v[0])]
      : v && typeof v === "object"
        ? Object.fromEntries(Object.entries(v as object).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, shape(x)]))
        : typeof v;

  it("has the same keys and array lengths in every locale", () => {
    expect(shape(CONTENT.es)).toEqual(shape(CONTENT.en));
  });

  it("keeps the graph at six systems in both languages", () => {
    for (const l of LOCALES) expect(getContent(l).opsNodes).toHaveLength(6);
  });

  it("never leaves a user-facing string empty", () => {
    const walk = (v: unknown, path: string): void => {
      if (typeof v === "string") expect(v.trim(), path).not.toBe("");
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
      else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    for (const l of LOCALES) walk(getContent(l), l);
  });
});
