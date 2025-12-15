"use client";

import React from "react";
import "./defeitos-premium.css";

// Hook central
import useValidacaoDefeitos from "./hooks/useValidacaoDefeitos";

// Componentes modulares
import SidebarDefeitos from "./components/SidebarDefeitos";
import KPIsDefeitos from "./components/KPIsDefeitos";
import PainelInconsistencias from "./components/PainelInconsistencias";
import PerformancePorBase from "./components/PerformancePorBase";
import DiagnosticoInteligente from "./components/DiagnosticoInteligente";
import DiagnosticoAvancado from "./components/DiagnosticoAvancado";

// 🔥 Loader Premium (igual ao da Produção)
import LoaderPremium from "./components/LoaderPremium";

export default function DefeitosPage({ embedded = false }: { embedded?: boolean }) {
  
  const {
    // estados principais
    fonte,
    setFonte,

    catalogos,
    toggleCatalogo,

    diagFilter,
    setDiagFilter,

    stats,
    diag,

    // carregamento e progresso
    loading,
    progress,
    loaderMessage,

    // KPIs
    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  } = useValidacaoDefeitos();

  /* ============================================================
      🔥 SE ESTÁ CARREGANDO → EXIBE O LOADER PREMIUM
  ============================================================ */
  if (loading || progress < 100) {
    return (
      <LoaderPremium
        progress={progress}
        message={loaderMessage}
      />
    );
  }

  /* ============================================================
      🔥 APÓS 100% → EXIBE A PÁGINA NORMAL
  ============================================================ */

  return (
    <div className="defeitos-container">

      {/* SIDEBAR */}
      <SidebarDefeitos
        fonte={fonte}
        setFonte={setFonte}
        catalogos={catalogos}
        toggleCatalogo={toggleCatalogo}
        perBase={perBase}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="defeitos-main">

        {/* TÍTULO */}
        <header className="defeitos-header" style={{ marginBottom: 10 }}>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-strong)",
            }}
          >
            Validação de Defeitos
          </h2>
          <div className="muted">Motor de Validação & Enriquecimento de Dados</div>
        </header>

        {/* KPIs */}
        <KPIsDefeitos
          total={total}
          totalDefeitos={totalDefeitos}
          notIdentified={notIdentified}
          aiOverall={aiOverall}
        />

        {/* INCONSISTÊNCIAS + PERFORMANCE */}
        <section className="breakdown-grid">
          <PainelInconsistencias breakdown={breakdown} />
          <PerformancePorBase perBase={perBase} />
        </section>

        {/* DIAGNÓSTICO INTELIGENTE */}
        <DiagnosticoInteligente
          diag={diag}
          loading={loading}
          diagFilter={diagFilter}
          setDiagFilter={setDiagFilter}
        />

        {/* DIAGNÓSTICO AVANÇADO */}
        <DiagnosticoAvancado stats={stats} />

      </main>
    </div>
  );
}