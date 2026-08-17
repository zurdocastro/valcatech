export type Role = "super_admin" | "admin" | "viewer" | "affiliate";

export function canManageUsers(role: string) { return role === "super_admin"; }
export function canManageSettings(role: string) { return role === "super_admin"; }
export function canWrite(role: string) { return role === "super_admin" || role === "admin"; }
export function canRead(role: string) { return true; }
// Affiliates are a referral partner, not staff — they can only ever see their
// own restricted /admin/affiliates view, never the rest of the backoffice.
export function isStaff(role: string) { return role !== "affiliate"; }
