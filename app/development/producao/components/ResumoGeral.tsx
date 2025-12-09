"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, BarChart3, Box } from "lucide-react";

/**
 * Componente de Visão Geral da Validação de Produção
 * Mostrado somente quando selectedCategory === null
 */
export default function ResumoGeral({ data, diagnostico }: any) {
  
  // ================================
  // 1) Coleta de dados principais
  // ================================

  const categorias = data?.perCategory ?? [];
  const problemas = data?.topProblemModels ?? [];
  const totals = data?.totals ?? {};

  const divergencias = diagnostico?.divergencias ?? [];
  const prodSemDef = diagnostico?.producaoSemDefeitos ?? [];
  const defeitosSemProd = diagnostico?.defeitosSemProducao ?? [];

  // ================================
  // 2) CATEGORIAS SAUDÁVEIS E CRÍTICAS
  // ================================
  const saudaveis = categorias.filter((c: any) => c.identifiedPct >= 99);
  const criticas = categorias.filter((c: any) => c.identifiedPct < 99);

  // ================================
  // 3) MODELO MAIS CRÍTICO
  // ================================
  const modeloCritico = problemas[0];

  // ================================
  // 4) Insight Automático
  // ================================
  const insight = useMemo(() => {
    let txt = "";

    txt += `${saudaveis.length} de ${categorias.length} categorias estão saudáveis (≥99%). `;
    if (criticas.length > 0) {
      txt += `Categoria com menor match: ${criticas[0].categoria} (${criticas[0].identifiedPct}%). `;
    }
    if (modeloCritico) {
      txt += `Modelo mais crítico: ${modeloCritico.modelo} (${modeloCritico.count} erros).`;
    }

    return txt;
  }, [categorias, saudaveis, criticas, modeloCritico]);

  // ================================
  // 5) Renderização
  // ================================
  return (
    <div className="fade-in" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ============================
          INSIGHT GLOBAL
      ============================ */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ marginBottom: 6, fontSize: "1.3rem" }}>
          <BarChart3 size={20} style={{ marginRight: 8 }} />
          Resumo Geral do Sistema
        </h2>

        <p style={{ opacity: 0.8 }}>{insight}</p>
      </div>

      {/* ============================
          CATEGORIAS SAUDÁVEIS
      ============================ */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: "1.2rem" }}>✔ Categorias Saudáveis</h3>

        {saudaveis.length === 0 ? (
          <p className="muted small">Nenhuma categoria está 100% ainda.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {saudaveis.map((c: any) => (
              <div
                key={c.categoria}
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  minWidth: 180,
                }}
              >
                <strong style={{ color: "#4ade80" }}>{c.categoria}</strong>
                <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  {c.volume.toLocaleString()} un. • {c.identifiedPct}% match
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================
          CATEGORIAS COM PROBLEMAS
      ============================ */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: "1.2rem" }}>⚠ Categorias com Atenção Necessária</h3>

        {criticas.length === 0 ? (
          <p className="muted small">Nenhuma categoria crítica no momento.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {criticas.map((c: any) => (
              <div
                key={c.categoria}
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  minWidth: 200,
                }}
              >
                <strong style={{ color: "#fca5a5" }}>{c.categoria}</strong>
                <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  Match: {c.identifiedPct}% <br />
                  Volume: {c.volume.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================
          PROBLEMAS GLOBAIS
      ============================ */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: "1.2rem" }}>🔴 Principais Problemas Globais</h3>

        <div className="problems-grid">
          {problemas.slice(0, 6).map((p: any, i: number) => (
            <div key={i} className="problem-card">
              <div className="prob-title">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Box size={16} /> {p.modelo}
                </span>
                <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>{p.count} erros</span>
              </div>

              <div className="prob-code" style={{ marginTop: 8 }}>
                <div><strong>Cat:</strong> {p.samples?.[0]?.CATEGORIA}</div>
                <div><strong>Qtd:</strong> {p.samples?.[0]?.QTY_GERAL}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================
          DIVERGÊNCIAS GLOBAIS
      ============================ */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: "1.2rem" }}>📉 Divergências de Volume (Geral)</h3>

        {divergencias.length === 0 ? (
          <p className="muted small">Nenhuma divergência registrada.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {divergencias.slice(0, 5).map((d: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <strong>{d.categoria ?? d.CATEGORIA}</strong>  
                — Diferença: <span style={{ color: "#fca5a5" }}>{d.diferenca}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================
          DIAGNÓSTICO GLOBAL
      ============================ */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: "1.2rem" }}>🧠 Diagnóstico Inteligente (Geral)</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>📦 Modelos sem registro de defeitos: <strong>{prodSemDef.length}</strong></div>
          <div>⚠ Modelos com defeitos sem produção: <strong>{defeitosSemProd.length}</strong></div>
          <div>🔴 Divergências críticas encontradas: <strong>{divergencias.length}</strong></div>
        </div>
      </div>

    </div>
  );
}