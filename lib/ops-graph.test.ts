import { describe, expect, it } from "vitest";
import { CORE, NODE, POS, VB, edgePath, ports } from "./ops-graph";

describe("ops graph geometry", () => {
  it("leaves a left node from its right face and enters the core's left face", () => {
    const p = ports(88, 84);
    expect(p.fromRight).toBe(false);
    expect(p.sx).toBe(88 + NODE.w / 2);
    expect(p.ex).toBe(CORE.x - CORE.w / 2);
  });

  it("mirrors the faces for a node on the right", () => {
    const p = ports(512, 84);
    expect(p.fromRight).toBe(true);
    expect(p.sx).toBe(512 - NODE.w / 2);
    expect(p.ex).toBe(CORE.x + CORE.w / 2);
  });

  it("emits a cubic whose control points are horizontal to their endpoints", () => {
    // Horizontal control points are what make the curve read as wiring; if they
    // ever pick up vertical offset the diagram turns back into a flower.
    const m = edgePath(88, 84).match(/^M (\S+) (\S+) C (\S+) (\S+), (\S+) (\S+), (\S+) (\S+)$/);
    expect(m).not.toBeNull();
    const [, , sy, , c1y, , c2y, , ey] = m!.map(Number) as unknown as number[];
    expect(c1y).toBe(sy);
    expect(c2y).toBe(ey);
  });

  it("keeps every node box inside the viewBox", () => {
    for (const p of POS) {
      expect(p.x - NODE.w / 2).toBeGreaterThanOrEqual(VB.x);
      expect(p.x + NODE.w / 2).toBeLessThanOrEqual(VB.x + VB.w);
      expect(p.y - NODE.h / 2).toBeGreaterThanOrEqual(VB.y);
      expect(p.y + NODE.h / 2).toBeLessThanOrEqual(VB.y + VB.h);
    }
  });

  it("never overlaps a node box with the core box", () => {
    for (const p of POS) {
      const gap = Math.abs(p.x - CORE.x) - (NODE.w / 2 + CORE.w / 2);
      expect(gap).toBeGreaterThan(0);
    }
  });
});
