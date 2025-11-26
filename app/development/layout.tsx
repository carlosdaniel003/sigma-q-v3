"use client";

import { useEffect, useState } from "react";
import "./dev.css"; // CSS do layout

export default function DevelopmentLayout({ children }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sigma_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="dev-denied">
        <h1>🚫 Acesso Negado</h1>
        <p>Apenas administradores podem acessar esta área.</p>
      </div>
    );
  }

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
      <main className="dev-content">
        {children}
      </main>

    </div>
  );
}