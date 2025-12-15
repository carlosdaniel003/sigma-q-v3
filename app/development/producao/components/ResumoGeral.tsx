"use client";

import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";

export default function ResumoGeral({ data, diagnostico }: any) {
  const categorias = data?.perCategory ?? [];
  const problemas = data?.topProblemModels ?? [];
  const totals = data?.totals ?? {};

  /* ============================================================
     DIAGNÓSTICO PADRONIZADO
  ============================================================ */
  const prodSemDef =
    diagnostico?.producaoSemDefeitos ??
    diagnostico?.semDefeitos ??
    diagnostico?.modelosSemDefeitos ??
    [];

  const defeitosSemProd =
    diagnostico?.defeitosSemProducao ??
    diagnostico?.semProducao ??
    [];

  /* ============================================================
     REGRAS NOVAS DE CLASSIFICAÇÃO
  ============================================================ */
  const saudaveis = categorias.filter((c: any) => Number(c.identifiedPct) >= 99);

  const atencao = categorias.filter(
    (c: any) =>
      Number(c.identifiedPct) >= 60 && Number(c.identifiedPct) < 99
  );

  const criticas = categorias.filter(
    (c: any) => Number(c.identifiedPct) < 60
  );

  const divergenciasCriticas = criticas.length;
  const modeloCritico = problemas[0];

  /* ============================================================
     INSIGHT GLOBAL
  ============================================================ */
  const insight = useMemo(() => {
    let txt = `${saudaveis.length} de ${categorias.length} categorias estão saudáveis (≥99%). `;

    if (criticas.length > 0) {
      const worst = [...criticas].sort(
        (a: any, b: any) => a.identifiedPct - b.identifiedPct
      )[0];
      txt += `Categoria mais crítica: ${worst.categoria} (${worst.identifiedPct}%). `;
    }

    if (modeloCritico) {
      txt += `Modelo mais difícil de identificar: ${modeloCritico.modelo} (${modeloCritico.count} ocorrências). `;
    }

    txt += `Modelos sem defeitos: ${prodSemDef.length}. `;
    txt += `Defeitos sem produção: ${defeitosSemProd.length}. `;
    txt += `Divergências críticas (< 60%): ${divergenciasCriticas}.`;

    return txt;
  }, [
    categorias,
    saudaveis.length,
    criticas,
    modeloCritico,
    prodSemDef.length,
    defeitosSemProd.length,
    divergenciasCriticas
  ]);

  const corDiagnostico =
    (totals.matchRateByRows ?? 0) >= 90 ? "var(--success)" : "var(--danger)";

  /* ============================================================
     RENDER — 🔥 ALINHAMENTO CORRIGIDO
  ============================================================ */
  return (
    <div
      className="fade-in"
      style={{
        padding: 0,      // 👈 REMOVIDO padding que criava desalinhamento
        margin: 0,
        width: "100%",  // 👈 garante alinhamento total
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxSizing: "border-box"
      }}
    >

      {/* INSIGHT GLOBAL */}
      <div
        className="glass-card"
        style={{
          padding: 20,
          margin: 0,          // 👈 remove margem extra
          width: "100%"       // 👈 alinha com a borda do painel
        }}
      >
        <h2
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BarChart3 size={20} /> Resumo Geral do Sistema
        </h2>
        <p className="muted small" style={{ marginTop: 4 }}>{insight}</p>
      </div>

      {/* KPIs */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          margin: 0,
          width: "100%"
        }}
      >
        <KPI
          title="🧠 Diagnóstico Inteligente"
          value={`${(totals.matchRateByRows ?? 0).toFixed(2)}%`}
          color={corDiagnostico}
          subtitle="precisão média da IA"
        />

        <KPI
          title="📦 Modelos sem defeitos"
          value={prodSemDef.length}
          color="var(--success)"
          subtitle="produção sem falhas"
        />

        <KPI
          title="⚠ Defeitos sem produção"
          value={defeitosSemProd.length}
          color="var(--danger)"
          subtitle="apontamentos sem correspondência"
        />

        <KPI
          title="🔴 Divergências Críticas"
          value={divergenciasCriticas}
          color="var(--danger)"
          subtitle="categorias < 60% de match"
        />
      </div>

      {/* MAPA COMPLETO */}
      <div
        className="glass-card"
        style={{
          padding: 22,
          margin: 0,        // 👈 remove espaço sobrando
          width: "100%"      // 👈 alinhado pixel-perfect
        }}
      >
        <h3
          className="section-title-small"
          style={{ fontSize: 18, marginBottom: 14 }}
        >
          📊 Mapa de Integridade das Categorias
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <CategoryGroup
            titulo="🟢 Categorias Saudáveis"
            descricao="≥ 99% de precisão — operação estável"
            cor="var(--success)"
            className="ok"
            items={saudaveis}
          />

          <CategoryGroup
            titulo="🟡 Categorias em Atenção"
            descricao="≥ 60% e < 99% — variações moderadas"
            cor="var(--warn)"
            className="warn"
            items={atencao}
          />

          <CategoryGroup
            titulo="🔴 Categorias Críticas"
            descricao="< 60% — impacto direto no KPI"
            cor="var(--danger)"
            className="bad"
            items={criticas}
          />
        </div>
      </div>

    </div>
  );
}

/* ============================================================
   KPI CARD
============================================================ */
function KPI({ title, value, color, subtitle }: any) {
  return (
    <div className="stat-card glass-card">
      <div className="stat-label">{title}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}

/* ============================================================
   CATEGORY GROUP + PROGRESS BAR
============================================================ */
function CategoryGroup({ titulo, descricao, cor, className, items }: any) {
  return (
    <div>
      <h4 style={{ color: cor, fontWeight: 600 }}>{titulo}</h4>
      <p className="muted small" style={{ marginBottom: 10 }}>{descricao}</p>

      {items.length === 0 ? (
        <p className="muted small">Nenhuma categoria neste grupo.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14
          }}
        >
          {items.map((c: any) => (
            <div
              key={c.categoria}
              className="stat-card"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: 12
              }}
            >
              <div className="cat-title-row">
                <span className="cat-title">{c.categoria}</span>

                <span className={`cat-percent ${className}`}>
                  {c.identifiedPct}%
                </span>
              </div>

              <div className="cat-subinfo">
                {c.volume.toLocaleString()} un.
              </div>

              <div
                style={{
                  height: 6,
                  width: "100%",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 8
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${c.identifiedPct}%`,
                    background: cor,
                    transition: "width .3s"
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}