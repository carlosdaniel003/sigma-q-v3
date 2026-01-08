"use client";

import React from "react";
import "./defeitos-premium.css";

// Hook
import useValidacaoDefeitos from "./hooks/useValidacaoDefeitos";

// Componentes
import SidebarDefeitos from "./components/SidebarDefeitos";
import KPIsDefeitos from "./components/KPIsDefeitos";
import PainelInconsistencias from "./components/PainelInconsistencias";
import PerformancePorBase from "./components/PerformancePorBase";
import DiagnosticoInteligente from "./components/DiagnosticoInteligente";
import DiagnosticoAvancado from "./components/DiagnosticoAvancado";

export default function DefeitosPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const {
    fonte,
    setFonte,

    diagFilter,
    setDiagFilter,

    stats,
    diag,

    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  } = useValidacaoDefeitos();

  /* ======================================================
     REGRAS DE VISUALIZAÇÃO
  ====================================================== */

  const showKPIs = fonte === "todas";

  const baseInfo = fonte !== "todas" ? perBase?.[fonte] : null;
  const isBase100 =
    fonte !== "todas" &&
    baseInfo &&
    Number(baseInfo.percentIdentified) === 100;

  return (
    <div className="defeitos-container">
      {/* SIDEBAR */}
      <SidebarDefeitos
        fonte={fonte}
        setFonte={setFonte}
        perBase={perBase}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="defeitos-main">
        {/* HEADER */}
        <header className="defeitos-header">
          <h2 className="defeitos-title">
            Validação de Defeitos
          </h2>
          <div className="defeitos-subtitle">
            Motor de Validação & Enriquecimento de Dados
          </div>
        </header>

        {/* =========================
            BASE 100% → MENSAGEM AMIGÁVEL
        ========================= */}
        {isBase100 && (
          <section className="friendly-box fade-in">
            <div className="friendly-icon">✅</div>
            <h3 className="friendly-title">
              Qualidade Máxima Atingida
            </h3>
            <p className="friendly-text">
              A base <strong>{fonte.toUpperCase()}</strong> não possui
              nenhuma inconsistência.
            </p>
            <p className="friendly-subtext">
              Todos os registros foram identificados corretamente pelo
              motor SIGMA-Q.
            </p>
          </section>
        )}

        {/* =========================
            VISUALIZAÇÃO NORMAL
        ========================= */}
        {!isBase100 && (
          <>
            {/* KPIs (somente TODAS) */}
            {showKPIs && (
              <>
                <KPIsDefeitos
                  total={total}
                  totalDefeitos={totalDefeitos}
                  notIdentified={notIdentified}
                  aiOverall={aiOverall}
                />

                <section className="breakdown-grid">
                  <PainelInconsistencias breakdown={breakdown} />
                  <PerformancePorBase perBase={perBase} />
                </section>
              </>
            )}

            {/* Diagnóstico Inteligente */}
            <DiagnosticoInteligente
              diag={diag}
              diagFilter={diagFilter}
              setDiagFilter={setDiagFilter}
            />

            {/* Diagnóstico Avançado */}
            {!showKPIs && <DiagnosticoAvancado stats={stats} />}
          </>
        )}
      </main>
    </div>
  );
}