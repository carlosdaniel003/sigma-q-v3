"use client";

import { useEffect, useState } from "react";
import "./dev.css"; // CSS do layout

export default function DevelopmentLayout({ children }: any) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sigma_user");

    if (!saved) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(saved);

    if (user.role !== "admin") {
      window.location.href = "/dashboard"; // guest é redirecionado
      return;
    }

    // usuário admin → liberar renderização
    setAllowed(true);
  }, []);

  if (!allowed) return null; // evita piscar conteúdo

  return (
    <div className="dev-container">
      {/* ==== SIDEBAR FIXA ==== */}
      <aside className="dev-sidebar">

        <div className="dev-logo">SIGMA-Q</div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/catalogo")}
        >
          📚 Catálogo Oficial
        </div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/defeitos")}
        >
          ⚙️ Classificação de Defeitos
        </div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/producao")}
        >
          🏭 Classificação de Produção
        </div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/geral")}
        >
          📊 Classificação Geral
        </div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/ppm")}
        >
          🧬 PPM Engine
        </div>

        <div
          className="sidebar-link"
          onClick={() => (window.location.href = "/development/acesso")}
        >
          🔐 Gerenciamento de Acesso
        </div>

        <div
          className="sidebar-logout"
          onClick={() => {
            localStorage.removeItem("sigma_user");
            window.location.href = "/login";
          }}
        >
          ↩️ Sair
        </div>

      </aside>

      {/* ==== CONTEÚDO DA PÁGINA ==== */}
      <main className="dev-content">{children}</main>
    </div>
  );
}