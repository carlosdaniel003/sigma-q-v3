"use client";

import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/services/userStorage";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getUser();

    if (!stored || !stored.role) {
      window.location.href = "/login";
      return;
    }

    setUser(stored);
    setLoading(false);
  }, []);

  if (loading) return null; // impede flash de convidado

  const isGuest = user.role === "guest";

  return (
    <div className="dashboard-container">

      {!isGuest && (
        <aside className="sidebar">
          <div className="sidebar-title">SIGMA-Q</div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/catalogo")}>
            📚 Catálogo Oficial
          </div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/defeitos")}>
            ⚙️ Classificação de Defeitos
          </div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/producao")}>
            🏭 Classificação de Produção
          </div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/geral")}>
            📊 Classificação Geral
          </div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/ppm")}>
            🧬 PPM Engine
          </div>

          <div className="sidebar-item" onClick={() => (window.location.href = "/development/acesso")}>
            🔐 Gerenciamento de Acesso
          </div>
        </aside>
      )}

      <main className="dashboard-content">
        <div className="content-card">
          {isGuest ? (
            <>
              <h1>Bem-vindo, Convidado!</h1>
              <p>Você está na área de visualização.</p>

              <button
                onClick={() => {
                  clearUser();
                  window.location.href = "/login";
                }}
                className="login-btn"
                style={{ marginTop: "20px" }}
              >
                Fazer Login
              </button>
            </>
          ) : (
            <>
              <h1>Bem-vindo, {user.username}!</h1>
              <p>Escolha uma área no menu lateral.</p>
            </>
          )}
        </div>
      </main>

    </div>
  );
}