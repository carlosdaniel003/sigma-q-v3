"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isGuestUser } from "@/core/session/userSession";

import {
  BookOpenIcon,
  ShieldCheckIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChevronDownIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function MainSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [guest, setGuest] = useState(true);
  const [openValidacao, setOpenValidacao] = useState(false);

  useEffect(() => {
    setGuest(isGuestUser());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname.includes("/development/validacao-dados")) {
      setOpenValidacao(true);
    }
  }, [pathname]);

  if (!mounted || guest) return null;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  const isValidacaoActive = isActive("/development/validacao-dados");

  return (
    <aside
      className={`dev-sidebar ${collapsed ? "collapsed" : ""}`}
      style={{ width: collapsed ? "80px" : "260px" }}
    >
      {/* ======================================================
         1️⃣ HEADER — TOGGLE + LOGO
      ====================================================== */}
      <div className="sidebar-header">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Bars3Icon /> : <Bars3BottomLeftIcon />}
        </button>

        {!collapsed && <div className="dev-logo fade-in">SIGMA-Q</div>}
      </div>

      {/* ======================================================
         2️⃣ NAVEGAÇÃO — CARDS
      ====================================================== */}
      <div className="nav-section">
        {/* DASHBOARD */}
        <Link
          href="/dashboard"
          className={`nav-card ${isActive("/dashboard") ? "active" : ""}`}
        >
          <Squares2X2Icon className="nav-icon" />
          {!collapsed && <span className="text">Dashboard</span>}
        </Link>

        {/* 🔍 DIAGNÓSTICO IA */}
        <Link
          href="/development/diagnostico"
          className={`nav-card ${
            isActive("/development/diagnostico") ? "active" : ""
          }`}
        >
          <CpuChipIcon className="nav-icon" />
          {!collapsed && <span className="text">Diagnóstico IA</span>}
        </Link>

        {/* CATÁLOGO */}
        <Link
          href="/development/catalogo"
          className={`nav-card ${
            isActive("/development/catalogo") ? "active" : ""
          }`}
        >
          <BookOpenIcon className="nav-icon" />
          {!collapsed && <span className="text">Catálogo Oficial</span>}
        </Link>

        {/* ======================================================
           VALIDAÇÃO DE DADOS (COM SUBMENU)
        ====================================================== */}
        <div className="nav-group">
          <div
            className={`nav-card ${
              isValidacaoActive ? "active-parent" : ""
            }`}
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setOpenValidacao(!openValidacao);
            }}
          >
            <TableCellsIcon className="nav-icon" />
            {!collapsed && (
              <>
                <span className="text">Validação de Dados</span>
                <ChevronDownIcon
                  className={`chevron-icon ${
                    openValidacao ? "rotate" : ""
                  }`}
                />
              </>
            )}
          </div>

          {!collapsed && openValidacao && (
            <div className="nav-submenu-pills fade-in-fast">
              <Link
                href="/development/validacao-dados/defeitos"
                className={`nav-pill ${
                  isActive("/development/validacao-dados/defeitos")
                    ? "active"
                    : ""
                }`}
              >
                <span className="dot">•</span> Defeitos
              </Link>

              <Link
                href="/development/validacao-dados/producao"
                className={`nav-pill ${
                  isActive("/development/validacao-dados/producao")
                    ? "active"
                    : ""
                }`}
              >
                <span className="dot">•</span> Produção
              </Link>

              <Link
                href="/development/validacao-dados/ppm"
                className={`nav-pill ${
                  isActive("/development/validacao-dados/ppm")
                    ? "active"
                    : ""
                }`}
              >
                <span className="dot">•</span> PPM
              </Link>
            </div>
          )}
        </div>

        {/* GERENCIAMENTO DE ACESSO */}
        <Link
          href="/development/acesso"
          className={`nav-card ${
            isActive("/development/acesso") ? "active" : ""
          }`}
        >
          <ShieldCheckIcon className="nav-icon" />
          {!collapsed && (
            <span className="text">Gerenciamento de Acesso</span>
          )}
        </Link>
      </div>

      {/* ======================================================
         3️⃣ FOOTER — LOGOUT
      ====================================================== */}
      <div className="sidebar-footer">
        <div
          className="logout-card"
          onClick={() => {
            localStorage.removeItem("sigma_user");
            document.cookie = "sigma_auth=; path=/; max-age=0";
            window.location.href = "/login";
          }}
        >
          <div className="logout-icon-wrapper">
            <span className="logout-initial">S</span>
          </div>
          {!collapsed && <span className="text">Sair</span>}
        </div>
      </div>
    </aside>
  );
}