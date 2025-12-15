"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Session
import { isGuestUser } from "@/core/session/userSession";

// Heroicons
import {
  BookOpenIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function MainSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [guest, setGuest] = useState(true);

  // 🔒 Checagem segura de sessão (client-only)
  useEffect(() => {
    setGuest(isGuestUser());
    setMounted(true);
  }, []);

  // ⛔ Evita hydration mismatch
  if (!mounted) return null;

  // 🚫 Convidado NÃO vê sidebar
  if (guest) return null;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
    { name: "Catálogo Oficial", path: "/development/catalogo", icon: BookOpenIcon },
    { name: "Validação de Dados", path: "/development/validacao-dados", icon: TableCellsIcon },
    { name: "Gerenciamento de Acesso", path: "/development/acesso", icon: ShieldCheckIcon },
  ];

  return (
    <aside
      className="dev-sidebar"
      style={{
        width: collapsed ? "80px" : "270px",
        transition: "width 0.3s ease",
      }}
    >
      {/* Botão de Colapso */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        {collapsed ? (
          <Bars3Icon className="collapse-icon" />
        ) : (
          <Bars3BottomLeftIcon className="collapse-icon" />
        )}
      </button>

      {/* Logo */}
      {!collapsed && (
        <div className="dev-logo fade-in" style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
          SIGMA-Q
        </div>
      )}

      {/* Navegação */}
      <div className="nav-section">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== "/dashboard" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                minHeight: "48px",
              }}
              title={collapsed ? item.name : ""}
            >
              <div style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>
                <Icon className="nav-icon" style={{ width: "24px", height: "24px" }} />
              </div>

              {!collapsed && (
                <span
                  className="text fade-in"
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: "1.2",
                    marginLeft: "12px",
                    display: "block",
                  }}
                >
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div
        className="logout-item"
        onClick={() => {
          localStorage.removeItem("sigma_user");
          document.cookie = "sigma_auth=; path=/; max-age=0";
          window.location.href = "/login";
        }}
        title={collapsed ? "Sair" : ""}
        style={{ display: "flex", alignItems: "center" }}
      >
        <div style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>
          <ArrowRightStartOnRectangleIcon className="nav-icon" style={{ width: "24px" }} />
        </div>

        {!collapsed && (
          <span className="text fade-in" style={{ marginLeft: "12px" }}>
            Sair
          </span>
        )}
      </div>
    </aside>
  );
}