"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, UserPlus, BarChart3, CalendarDays,
  Settings, ChevronLeft, ChevronRight, LogOut, Sparkles
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const NAV_ITEMS = [
  { href: "/dashboard",         icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/clients", icon: Users,           label: "Clients" },
  { href: "/dashboard/add-client", icon: UserPlus,     label: "Ajouter Client" },
  { href: "/dashboard/analytics",  icon: BarChart3,    label: "Analytiques" },
  { href: "/dashboard/foires",     icon: CalendarDays,  label: "Foires" },
  { href: "/dashboard/settings",   icon: Settings,     label: "Paramètres" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={styles.sidebar}
    >
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <Sparkles size={20} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={styles.logoText}
            >
              Foire<span style={{ color: "var(--accent-cyan)" }}>CRM</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} style={{ flexShrink: 0, color: active ? "var(--accent-primary)" : "var(--text-secondary)" }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)", fontSize: 14, fontWeight: active ? 600 : 400 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div layoutId="activeIndicator" style={styles.activeBar}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <button onClick={handleLogout} style={styles.navItem} title="Déconnexion">
          <LogOut size={20} style={{ color: "var(--accent-rose)" }} />
          {!collapsed && <span style={{ color: "var(--accent-rose)", fontSize: 14 }}>Déconnexion</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}

const styles = {
  sidebar: {
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "rgba(10,14,26,0.95)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid var(--border-glass)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    overflow: "hidden",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 16px",
    borderBottom: "1px solid var(--border-glass)",
    minHeight: 64,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" },
  nav: {
    flex: 1,
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
    width: "100%",
  },
  navItemActive: {
    background: "rgba(99,102,241,0.1)",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 20,
    borderRadius: 3,
    background: "var(--accent-gradient)",
  },
  bottom: {
    padding: "12px 8px",
    borderTop: "1px solid var(--border-glass)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  collapseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    border: "1px solid var(--border-glass)",
    background: "transparent",
    color: "var(--text-muted)",
    cursor: "pointer",
  },
};
