"use client";

import { useEffect, useState } from "react";
import "./dev.css";

// Heroicons Outline
import {
  BookOpenIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  BeakerIcon,
  LockClosedIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Bars3BottomLeftIcon
} from "@heroicons/react/24/outline";

export default function DevelopmentLayout({ children }: any) {
  const [allowed, setAllowed] = useState(false);

  // controla se a sidebar está colapsada
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sigma_user");

    if (!saved) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(saved);
    if (user.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    setAllowed(true);
  }, []);

  if (!allowed) return null;

  return (
    <div className={`dev-container ${collapsed ? "collapsed" : ""}`}>
      
      {/* ==== SIDEBAR ==== */}
      <aside className="dev-sidebar">

        {/* Botão mostrar/ocultar */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <Bars3Icon className="collapse-icon" />
          ) : (
            <Bars3BottomLeftIcon className="collapse-icon" />
          )}
        </button>

        {/* Logo */}
        <div className="dev-logo">SIGMA-Q</div>

        {/* Nav Items */}
        <div className="nav-section">

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/catalogo")}
          >
            <BookOpenIcon className="nav-icon" />
            <span className="text">Catálogo Oficial</span>
          </div>

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/defeitos")}
          >
            <Cog6ToothIcon className="nav-icon" />
            <span className="text">Classificação de Defeitos</span>
          </div>

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/producao")}
          >
            <BuildingOffice2Icon className="nav-icon" />
            <span className="text">Classificação de Produção</span>
          </div>

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/geral")}
          >
            <ChartBarIcon className="nav-icon" />
            <span className="text">Classificação Geral</span>
          </div>

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/ppm")}
          >
            <BeakerIcon className="nav-icon" />
            <span className="text">PPM Engine</span>
          </div>

          <div
            className="nav-item"
            onClick={() => (window.location.href = "/development/acesso")}
          >
            <LockClosedIcon className="nav-icon" />
            <span className="text">Gerenciamento de Acesso</span>
          </div>

        </div>

        {/* Logout */}
        <div
          className="logout-item"
          onClick={() => {
            localStorage.removeItem("sigma_user");
            window.location.href = "/login";
          }}
        >
          <ArrowRightStartOnRectangleIcon className="nav-icon" />
          <span className="text">Sair</span>
        </div>
      </aside>

      {/* ==== CONTEÚDO ==== */}
      <main className="dev-content">{children}</main>
    </div>
  );
}