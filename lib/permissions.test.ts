import { describe, it, expect } from "vitest";
import { canManageUsers, canManageSettings, canWrite, canRead } from "./permissions";

describe("permissions", () => {
  it("only super_admin can manage users and settings", () => {
    expect(canManageUsers("super_admin")).toBe(true);
    expect(canManageUsers("admin")).toBe(false);
    expect(canManageUsers("viewer")).toBe(false);

    expect(canManageSettings("super_admin")).toBe(true);
    expect(canManageSettings("admin")).toBe(false);
    expect(canManageSettings("viewer")).toBe(false);
  });

  it("super_admin and admin can write, viewer cannot", () => {
    expect(canWrite("super_admin")).toBe(true);
    expect(canWrite("admin")).toBe(true);
    expect(canWrite("viewer")).toBe(false);
  });

  it("rejects unknown or missing roles for every write-gated check", () => {
    expect(canWrite("")).toBe(false);
    expect(canWrite("bogus-role")).toBe(false);
    expect(canWrite(undefined as unknown as string)).toBe(false);
    expect(canManageUsers(undefined as unknown as string)).toBe(false);
  });

  it("everyone can read regardless of role", () => {
    expect(canRead("viewer")).toBe(true);
    expect(canRead("")).toBe(true);
  });
});
