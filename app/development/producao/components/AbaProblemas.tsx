"use client";

import React from "react";
import { Box, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AbaProblemas({
  currentProblems,
  showTop,
  selectedCategory,
  currentStats,
}: any) {
  return (
    <>
      {currentProblems.length > 0 ? (
        <div className="problems-grid">
          {currentProblems.slice(0, showTop).map((p: any, i: number) => (
            <div key={i} className="problem-card">
              <div className="prob-title">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Box size={16} /> {p.modelo}
                </span>
                <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {p.count} erros
                </span>
              </div>

              <div className="prob-code" style={{ marginTop: 8 }}>
                {p.samples && p.samples[0] ? (
                  <>
                    <div>
                      <strong>Amostra:</strong>
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      Cat: {p.samples[0].CATEGORIA}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      Qtd: {p.samples[0].QTY_GERAL}
                    </div>
                  </>
                ) : (
                  "Sem amostra disponível"
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#4ade80",
          }}
        >
          <CheckCircle2
            size={40}
            style={{
              marginBottom: 10,
              margin: "0 auto",
              display: "block",
            }}
          />
          <p>Nenhum problema crítico de identificação encontrado aqui.</p>
        </div>
      )}

      {selectedCategory && currentStats && (
        <div className="defeitos-panel" style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3>Detalhamento por Modelo ({selectedCategory})</h3>

            <div
              className={`status-tag ${
                currentStats.identifiedPct >= 90 ? "ok" : "bad"
              }`}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {currentStats.identifiedPct >= 90 ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {currentStats.identifiedPct >= 90
                ? "Categoria Saudável"
                : "Atenção Requerida"}
            </div>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Total Produzido</th>
                  <th>Identificados</th>
                  <th>% Match</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {currentStats.models
                  .sort(
                    (a: any, b: any) =>
                      b.identifiedRows +
                      b.notIdentifiedRows -
                      (a.identifiedRows + a.notIdentifiedRows)
                  )
                  .slice(0, 20)
                  .map((m: any) => {
                    const total = m.identifiedRows + m.notIdentifiedRows;
                    const isOk = m.identifyPct >= 90;

                    return (
                      <tr key={m.modelKey}>
                        <td>
                          <strong>{m.modelKey}</strong>
                        </td>
                        <td>{total}</td>
                        <td style={{ color: "#4ade80" }}>{m.identifiedRows}</td>
                        <td>{m.identifyPct.toFixed(1)}%</td>
                        <td>
                          <span
                            className={`status-tag ${
                              isOk ? "ok" : "bad"
                            }`}
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
      )}
    </>
  );
}