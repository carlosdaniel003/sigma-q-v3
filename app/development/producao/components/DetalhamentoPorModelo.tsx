"use client";

import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type Props = {
  categoria: string;
  stats: any;
};

export default function DetalhamentoPorModelo({ categoria, stats }: Props) {
  if (!stats || !stats.models) return null;

  const modelos = [...stats.models]
    .sort((a: any, b: any) =>
      (b.identifiedRows + b.notIdentifiedRows) -
      (a.identifiedRows + a.notIdentifiedRows)
    )
    .slice(0, 40); // mais que suficiente para UI

  return (
    <div className="detalhamento-wrapper fade-in" style={{ marginTop: 10 }}>

      {/* ========== HEADER DO PAINEL ========== */}
      <div
        className="detalhamento-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 18,
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "1.2rem", color: "var(--text-strong)" }}>
          Detalhamento por Modelo • {categoria}
        </h3>

        <div
          className={`status-tag ${stats.identifiedPct >= 90 ? "ok" : "bad"}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {stats.identifiedPct >= 90 ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertTriangle size={14} />
          )}

          {stats.identifiedPct >= 90 ? "Categoria Saudável" : "Atenção Necessária"}
        </div>
      </div>

      {/* ========== TABELA PREMIUM ========== */}
      <div className="glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Produção Total</th>
              <th>Identificados</th>
              <th>Não Identificados</th>
              <th>% Precisão</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {modelos.map((m: any) => {
              const total = m.identifiedRows + m.notIdentifiedRows;
              const pct = Number(m.identifyPct.toFixed(1));
              const isOk = pct >= 90;

              return (
                <tr key={m.modelKey}>
                  <td>
                    <strong>{m.modelKey}</strong>
                  </td>

                  <td>{total.toLocaleString()}</td>

                  <td style={{ color: "#4ade80", fontWeight: 600 }}>
                    {m.identifiedRows}
                  </td>

                  <td style={{ color: "#f87171", fontWeight: 600 }}>
                    {m.notIdentifiedRows}
                  </td>

                  <td>{pct}%</td>

                  <td>
                    <span
                      className={`status-tag ${isOk ? "ok" : "bad"}`}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {isOk ? "OK" : "Revisar"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}