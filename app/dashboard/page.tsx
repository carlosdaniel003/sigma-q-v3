"use client";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("sigma_user") || "{}");

  const isGuest = user.role === "guest";

  return (
    <div className="dashboard-container">

      {!isGuest && (
  <aside className="sidebar">
    <div className="sidebar-title">SIGMA-Q</div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/catalogo")}
    >
      📚 Catálogo Oficial
    </div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/defeitos")}
    >
      ⚙️ Classificação de Defeitos
    </div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/producao")}
    >
      🏭 Classificação de Produção
    </div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/geral")}
    >
      📊 Classificação Geral
    </div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/ppm")}
    >
      🧬 PPM Engine
    </div>

    <div
      className="sidebar-item"
      onClick={() => (window.location.href = "/development/acesso")}
    >
      🔐 Gerenciamento de Acesso
    </div>
  </aside>
)}

      {/* CONTEÚDO */}
      <main className="dashboard-content">

        {/* CARD CENTRAL */}
        <div className="content-card">
          {isGuest ? (
            <>
              <h1 style={{ marginBottom: "10px" }}>Bem-vindo, Convidado!</h1>
              <p>
                Você está acessando a área de visualização.  
                Recursos de desenvolvimento estão disponíveis apenas para administradores.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ marginBottom: "10px" }}>Bem-vindo, {user.username}!</h1>
              <p>Escolha uma área no menu lateral.</p>
            </>
          )}
        </div>
      </main>

    </div>
  );
}