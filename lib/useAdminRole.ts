"use client";
import { useEffect, useState } from "react";

export function useAdminRole() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => setRole(d?.role ?? null)).catch(() => setRole(null));
  }, []);
  const canWrite = role === "super_admin" || role === "admin";
  return { role, canWrite };
}
