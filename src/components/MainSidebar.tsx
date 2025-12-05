"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Importando os Heroicons
import {
  BookOpenIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function MainSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
    { name: "Catálogo Oficial", path: "/development/catalogo", icon: BookOpenIcon },
    { name: "Validação de Defeitos", path: "/development/defeitos", icon: Cog6ToothIcon },
    { name: "Validação de Produção", path: "/development/producao", icon: BuildingOffice2Icon },
    { name: "Validação Geral", path: "/development/geral", icon: ChartBarIcon },
    { name: "PPM Engine", path: "/development/ppm", icon: BeakerIcon },
    { name: "Gerenciamento de Acesso", path: "/development/acesso", icon: ShieldCheckIcon },
  ];

  return (
    // Aumentei um pouco a largura base para 270px para dar mais respiro
    <aside className="dev-sidebar" style={{ width: collapsed ? "80px" : "270px", transition: "width 0.3s ease" }}>
      
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

      {/* Itens de Navegação */}
      <div className="nav-section">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{ 
                textDecoration: "none", 
                // Garante layout flexível para ícone e texto
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                minHeight: "48px" // Garante altura mínima confortável
              }}
              title={collapsed ? item.name : ""}
            >
              {/* Ícone fixo - não encolhe */}
              <div style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>
                <Icon className="nav-icon" style={{ width: "24px", height: "24px", margin: 0 }} />
              </div>
              
              {/* Texto com Quebra de Linha Permitida */}
              {!collapsed && (
                <span className="text fade-in" style={{ 
                  whiteSpace: "normal", // PERMITE QUEBRA DE LINHA
                  fontSize: "0.85rem",  // Fonte ligeiramente menor para caber melhor
                  lineHeight: "1.2",    // Altura da linha compacta
                  marginLeft: "12px",   // Espaço entre ícone e texto
                  display: "block",
                  wordBreak: "break-word" // Quebra palavras muito longas se necessário
                }}>
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