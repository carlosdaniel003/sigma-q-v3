"use client";

import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";

/**
 * RESUMO GERAL — PRODUÇÃO
 *
 * 🔑 REGRA DE OURO (CORREÇÃO):
 * - Aceita tanto:
 *    • props.categories            (novo padrão / KPI)
 *    • props.data.perCategory      (padrão antigo)
 * - Nunca depende de ajuste externo
 */
export default function ResumoGeral(props: any) {
  /* ============================================================
     🔁 ADAPTAÇÃO AUTOMÁTICA DE FONTE (CHAVE DA SOLUÇÃO)
  ============================================================ */
  const rawCategories =
    props.categories ??
    props.data?.perCategory ??
    [];

  const rawTopProblems =
    props.topProblems ??
    props.data?.topProblemModels ??
    [];

  const diagnostico =
    props.diagnostico ??
    props.data?.diagnostico ??
    {};

  const listaCategorias = Array.isArray(rawCategories) ? rawCategories : [];
  const listaProblemas = Array.isArray(rawTopProblems) ? rawTopProblems : [];

  /* ============================================================
     NORMALIZAÇÃO ROBUSTA
     - number | "98.5%" | "98.5" | null
  ============================================================ */
  const categoriasNorm = useMemo(() => {
    return listaCategorias.map((c: any) => {
      let pct = 0;

      if (typeof c.identifiedPct === "number") {
        pct = c.identifiedPct;
      } else if (typeof c.identifiedPct === "string") {
        pct = parseFloat(c.identifiedPct.replace("%", "").trim());
      }

      if (!Number.isFinite(pct)) pct = 0;

      return {
        ...c,
        identifiedPctNum: pct,
      };
    });
  }, [listaCategorias]);

  /* ============================================================
     DIAGNÓSTICO
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
     CLASSIFICAÇÃO (MESMA REGRA DO KPI)
  ============================================================ */
  const saudaveis = categoriasNorm.filter((c) => c.identifiedPctNum >= 99.9);
  const atencao = categoriasNorm.filter(
    (c) => c.identifiedPctNum >= 60 && c.identifiedPctNum < 99.9
  );
  const criticas = categoriasNorm.filter((c) => c.identifiedPctNum < 60);

  const modeloCritico = listaProblemas[0];

  /* ============================================================
     STATUS EXECUTIVO
  ============================================================ */
  const statusSistema = useMemo(() => {
    if (categoriasNorm.length === 0) {
      return {
        label: "⏳ Aguardando dados...",
        cor: "var(--muted)",
        desc: "Carregando análise de categorias",
      };
    }

    if (criticas.length > 0) {
      return {
        label: "🔴 Sistema em Estado Crítico",
        cor: "var(--danger)",
        desc: "Existem categorias com impacto direto nos indicadores",
      };
    }

    if (atencao.length > 0) {
      return {
        label: "🟡 Sistema em Atenção",
        cor: "var(--warn)",
        desc: "Algumas categorias exigem monitoramento",
      };
    }

    return {
      label: "🟢 Sistema Estável",
      cor: "var(--success)",
      desc: "Categorias operando dentro do esperado",
    };
  }, [categoriasNorm.length, criticas.length, atencao.length]);

  /* ============================================================
     INSIGHTS
  ============================================================ */
  const insight = useMemo(() => {
    if (categoriasNorm.length === 0) {
      return ["Nenhuma categoria encontrada."];
    }

    const linhas: string[] = [];

    linhas.push(
      `${saudaveis.length} de ${categoriasNorm.length} categorias estão totalmente saudáveis (100%).`
    );

    if (atencao.length > 0) {
      linhas.push(
        `${atencao.length} categoria(s) operam em zona de atenção (60%–99%).`
      );
    }

    if (criticas.length > 0) {
      const worst = [...criticas].sort(
        (a, b) => a.identifiedPctNum - b.identifiedPctNum
      )[0];

      linhas.push(
        `Categoria mais crítica: ${worst.categoria} (${worst.identifiedPctNum.toFixed(
          1
        )}%).`
      );
    }

    if (modeloCritico) {
      linhas.push(
        `Modelo mais difícil: ${modeloCritico.modelo} (${modeloCritico.count} ocorrências).`
      );
    }

    linhas.push(`Modelos sem defeitos: ${prodSemDef.length}.`);
    linhas.push(`Defeitos sem produção: ${defeitosSemProd.length}.`);

    return linhas;
  }, [
    categoriasNorm.length,
    saudaveis.length,
    atencao.length,
    criticas,
    modeloCritico,
    prodSemDef.length,
    defeitosSemProd.length,
  ]);

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div
      className="fade-in"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* RESUMO EXECUTIVO */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h2
          className="section-title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <BarChart3 size={20} /> Resumo Geral do Sistema
        </h2>

        <div
          style={{
            marginTop: 10,
            marginBottom: 14,
            fontWeight: 600,
            color: statusSistema.cor,
          }}
        >
          {statusSistema.label}
          <div className="muted small" style={{ marginTop: 2 }}>
            {statusSistema.desc}
          </div>
        </div>

        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {insight.map((txt, idx) => (
            <li key={idx} className="muted small">
              {txt}
            </li>
          ))}
        </ul>
      </div>

      {/* MAPA DE INTEGRIDADE */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h3 className="section-title-small" style={{ marginBottom: 14 }}>
          📊 Mapa de Integridade das Categorias
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <CategoryGroup
            titulo="🟢 Categorias Saudáveis"
            descricao="≥ 99.9% de precisão"
            cor="var(--success)"
            className="ok"
            items={saudaveis}
          />

          <CategoryGroup
            titulo="🟡 Categorias em Atenção"
            descricao="60% a 99%"
            cor="var(--warn)"
            className="warn"
            items={atencao}
          />

          <CategoryGroup
            titulo="🔴 Categorias Críticas"
            descricao="< 60%"
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
   CATEGORY GROUP
============================================================ */
function CategoryGroup({ titulo, descricao, cor, className, items }: any) {
  return (
    <div>
      <h4 style={{ color: cor, fontWeight: 600, marginBottom: 4 }}>
        {titulo}
      </h4>
      <p className="muted small" style={{ marginBottom: 12 }}>
        {descricao}
      </p>

      {items.length === 0 ? (
        <p
          className="muted small"
          style={{ fontStyle: "italic", opacity: 0.6 }}
        >
          Nenhuma categoria neste grupo.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
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
                padding: 14,
              }}
            >
              <div
                className="cat-title-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="cat-title"
                  style={{ fontWeight: 600, fontSize: "0.9rem" }}
                >
                  {c.categoria}
                </span>

                <span
                  className={`cat-percent ${className}`}
                  style={{ color: cor, fontWeight: 700 }}
                >
                  {c.identifiedPctNum.toFixed(1)}%
                </span>
              </div>

              <div
                className="cat-subinfo"
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                {c.volume?.toLocaleString() ?? 0} un.
              </div>

              <div
                style={{
                  height: 6,
                  width: "100%",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(c.identifiedPctNum, 5)}%`,
                    background: cor,
                    transition: "width .3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}