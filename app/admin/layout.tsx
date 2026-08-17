"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Mail, UserCog, LogOut, Menu, X, Handshake, Tag, Bot } from "lucide-react";
import Logo from "@/components/site/Logo";

type NavRole = "super_admin" | "admin" | "viewer" | "affiliate";
const STAFF_ROLES: NavRole[] = ["super_admin", "admin", "viewer"];

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: STAFF_ROLES },
  { href: "/admin/customers", label: "Leads & Customers", icon: Users, roles: STAFF_ROLES },
  { href: "/admin/agent", label: "Chat Agent", icon: Bot, roles: STAFF_ROLES },
  { href: "/admin/emails", label: "Emails", icon: Mail, roles: STAFF_ROLES },
  { href: "/admin/affiliates", label: "Affiliates", icon: Handshake, roles: [...STAFF_ROLES, "affiliate"] as NavRole[] },
  { href: "/admin/discount-codes", label: "Discount Codes", icon: Tag, roles: STAFF_ROLES },
  { href: "/admin/users", label: "Users", icon: UserCog, roles: ["super_admin"] as NavRole[] },
];

const roleLabels: Record<string, string> = { super_admin: "Super Admin", admin: "Admin", viewer: "Viewer", affiliate: "Affiliate" };

function NavLink({ href, label, Icon, active, onClick }: { href: string; label: string; Icon: React.ElementType; active: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 2, background: active ? "rgba(255,255,255,0.14)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.62)", cursor: "pointer", transition: "all .15s" }}>
        <Icon size={18} />
        <span style={{ fontWeight: active ? 700 : 500, fontSize: "0.875rem" }}>{label}</span>
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Depend on pathname, not just mount: this layout persists across the
    // client-side router.push from /admin/login to /admin after a successful
    // login, so a mount-only effect would leave `role` stuck at its
    // pre-login null value (hiding the Users nav item and role badge) until
    // the admin manually reloads the page.
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.role) setRole(d.role); }).catch(() => {});
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") return <>{children}</>;

  const navItems = allNavItems.filter((item) => role && (item.roles as string[]).includes(role));
  const sidebarBg = "var(--ink)";

  const sidebarContent = (
    <>
      <div style={{ padding: "22px 20px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <Logo size={26} dark />
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 12 }}>Backoffice</div>
        {role && <div style={{ marginTop: 8, display: "inline-block", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", borderRadius: 999, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{roleLabels[role] ?? role}</div>}
      </div>
      <nav style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={pathname === item.href} onClick={() => setMenuOpen(false)} />)}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "inherit" }}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--mist)" }}>
      {/* `display` stays in the class, not the inline style — an inline
          display:flex outranks Tailwind's md:hidden and would leave the
          mobile bar visible on desktop. */}
      <div className="flex md:hidden" style={{ position: "sticky", top: 0, zIndex: 50, background: sidebarBg, alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <Logo size={22} dark />
        <button onClick={() => setMenuOpen((v) => !v)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && <div className="flex md:hidden" style={{ background: sidebarBg, flexDirection: "column" }}>{sidebarContent}</div>}

      <div style={{ display: "flex" }}>
        <aside className="hidden md:flex" style={{ width: 232, background: sidebarBg, minHeight: "100vh", flexDirection: "column", position: "sticky", top: 0 }}>
          {sidebarContent}
        </aside>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </div>
  );
}
