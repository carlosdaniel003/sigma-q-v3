"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Layers, Search, Info } from "lucide-react";

type Props = {
  data: any;
  diagnostico: any;
};

export default function DiagnosticoGeral({ data, diagnostico }: Props) {
  if (!data || !diagnostico) return null;

  const categorias = data.perCategory ?? [];

  /* ============================================================
     1) CATEGORIAS CRÍTICAS (< 90%)
  ============================================================ */
  const categoriasCriticas = useMemo(() => {
    return categorias
      .filter((c: any) => Number(c.identifiedPct) < 90)
      .sort((a: any, b: any) => a.identifiedPct - b.identifiedPct);
  }, [categorias]);

  /* ============================================================
     2) SEM PRODUÇÃO + DEFEITOS (Afeta KPI)
  ============================================================ */
  const semProducao = useMemo(() => {
    const arr = diagnostico.defeitosSemProducao ?? [];
    const uniq = new Map();
    arr.forEach((d: any) => {
      if (!uniq.has(d.modelo)) uniq.set(d.modelo, d);
    });
    return Array.from(uniq.values());
  }, [diagnostico.defeitosSemProducao]);

  /* ============================================================
     3) COM PRODUÇÃO + SEM DEFEITOS (Correção oficial)
  ============================================================ */
  const producaoSemDefeitos = useMemo(() => {
    const arr =
      diagnostico.producaoSemDefeitos ??
      diagnostico.semDefeitos ??        // fallback antigo
      diagnostico.modelosSemDefeitos ?? // fallback alternativo
      [];

    const uniq = new Map();
    arr.forEach((d: any) => {
      if (!uniq.has(d.modelo)) uniq.set(d.modelo, d);
    });

    return Array.from(uniq.values());
  }, [diagnostico.producaoSemDefeitos]);

  return (
    <div className="glass-card fade-in" style={{ marginTop: 20, padding: 20 }}>

      <h2 className="section-title">
        <AlertTriangle size={18} style={{ marginRight: 6 }} />
        Diagnóstico Inteligente • Visão Geral
      </h2>

      <p className="muted small" style={{ marginBottom: 20 }}>
        Análises automáticas sobre falhas estruturais, discrepâncias de produção
        e categorias que exigem revisão.
      </p>

      {/* ============================================================
          1) TABELA — Categorias Críticas
      ============================================================ */}
      <h3 className="section-title-small" style={{ marginTop: 10 }}>
        <Layers size={14} style={{ marginRight: 6 }} />
        Categorias Críticas — Detalhamento
      </h3>

      {categoriasCriticas.length === 0 ? (
        <p className="muted small">Nenhuma categoria crítica encontrada.</p>
      ) : (
        <div className="glass-table-container" style={{ marginTop: 12 }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Volume Total</th>
                <th>Itens Totais</th>
                <th>Identificados</th>
                <th>Não Identificados</th>
                <th>% Precisão</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {categoriasCriticas.map((c: any, i: number) => {
                const totalVolume = c.volume;
                const identificados = c.identifiedRows;
                const naoIdent = c.notIdentifiedRows;
                const itensTotais = identificados + naoIdent;
                const pct = Number(c.identifiedPct);

                return (
                  <tr key={i}>
                    <td><strong>{c.categoria}</strong></td>
                    <td>{totalVolume.toLocaleString()}</td>
                    <td>{itensTotais.toLocaleString()}</td>
                    <td style={{ color: "#4ade80" }}>{identificados}</td>
                    <td style={{ color: "#ef4444" }}>{naoIdent}</td>
                    <td>{pct.toFixed(1)}%</td>
                    <td>
                      <span className={`status-tag ${pct >= 90 ? "ok" : "bad"}`}>
                        {pct >= 90 ? "OK" : "Revisar"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================
          2) SEM PRODUÇÃO + DEFEITOS — DESIGN IGUAL AO PRINT
      ============================================================ */}
      <h3 className="section-title-small" style={{ marginTop: 32 }}>
        ⚠ Modelos com Defeitos mas Sem Produção (Impactam o KPI)
      </h3>

      {semProducao.length === 0 ? (
        <p className="muted small">Nenhum caso encontrado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {semProducao.map((d: any, i: number) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--glass-border)",
                overflow: "hidden",
              }}
            >
              {/* BARRA VERMELHA LATERAL */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: "var(--danger)",
                }}
              />

              <div style={{ padding: 16, paddingLeft: 20 }}>

                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "rgba(255,255,255,0.12)",
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}
                    >
                      LCM
                    </span>

                    <strong style={{ fontSize: "1rem" }}>
                      {d.modelo}
                    </strong>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--danger)",
                      background: "rgba(239,68,68,0.12)",
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {d.ocorrenciasDefeitos} CASOS
                  </span>
                </div>

                {/* CONTEXTO */}
                <div
                  className="muted"
                  style={{
                    fontSize: "0.8rem",
                    marginBottom: 10,
                  }}
                >
                  Apenas defeitos registrados • Nenhuma produção encontrada
                </div>

                {/* ERROS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--danger)" }}>×</span>
                    <span>Modelo não possui produção registrada.</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--danger)" }}>×</span>
                    <span>Defeitos impactam diretamente o KPI global.</span>
                  </div>
                </div>

                {/* SUGESTÕES */}
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, color: "var(--success)", fontSize: "0.85rem" }}>
                    <span>💡</span>
                    <span>Verificar se o modelo está corretamente cadastrado.</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, color: "var(--success)", fontSize: "0.85rem" }}>
                    <span>💡</span>
                    <span>Revisar origem do apontamento de defeitos.</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          3) COM PRODUÇÃO + SEM DEFEITOS — MESMO DESIGN (VERDE)
      ============================================================ */}
      <h3 className="section-title-small" style={{ marginTop: 32 }}>
        🟢 Produção sem Defeitos (Fluxo Normal)
      </h3>

      {producaoSemDefeitos.length === 0 ? (
        <p className="muted small">Nenhum caso encontrado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {producaoSemDefeitos.map((d: any, i: number) => {
            const produzido = Number(d.produzido ?? d.volume ?? 0);

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--glass-border)",
                  overflow: "hidden",
                }}
              >
                {/* BARRA VERDE LATERAL */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: "var(--success)",
                  }}
                />

                <div style={{ padding: 16, paddingLeft: 20 }}>

                  {/* HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: "rgba(255,255,255,0.12)",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        LCM
                      </span>

                      <strong style={{ fontSize: "1rem" }}>
                        {d.modelo}
                      </strong>
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--success)",
                        background: "rgba(34,197,94,0.12)",
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      {produzido.toLocaleString()} UN.
                    </span>
                  </div>

                  {/* CONTEXTO */}
                  <div
                    className="muted"
                    style={{
                      fontSize: "0.8rem",
                      marginBottom: 10,
                    }}
                  >
                    Produção registrada • Nenhum defeito encontrado
                  </div>

                  {/* STATUS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--success)" }}>✔</span>
                      <span>Produção ocorreu normalmente.</span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--success)" }}>✔</span>
                      <span>Nenhuma falha registrada para este modelo.</span>
                    </div>
                  </div>

                  {/* BLOCO INFORMATIVO */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        color: "var(--success)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span>ℹ️</span>
                      <span>Fluxo normal de produção — nenhuma ação necessária.</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}