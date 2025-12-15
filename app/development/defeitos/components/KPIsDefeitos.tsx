"use client";

import React from "react";
import { FileText, Wrench, AlertTriangle, Brain } from "lucide-react";

export default function KPIsDefeitos({
  total,
  totalDefeitos,
  notIdentified,
  aiOverall,
}: {
  total: number;
  totalDefeitos: number;
  notIdentified: number;
  aiOverall: number;
}) {

  // ================================
  // 🎨 Cor dinâmica da precisão da IA
  // ================================
  const aiColor =
    aiOverall >= 95
      ? "var(--success)"  // verde
      : aiOverall >= 50
      ? "var(--warn)"     // amarelo
      : "var(--danger)";  // vermelho

  const notIdColor = notIdentified === 0 ? "var(--success)" : "var(--danger)";

  return (
    <section className="kpi-defeitos-row fade-in">

      {/* Registros Processados */}
      <div className="kpi-card">
        <div className="kpi-label">
          <FileText size={16} style={{ marginRight: 6, opacity: 0.8 }} />
          Registros Processados
        </div>

        <div className="kpi-value">{total.toLocaleString()}</div>

        <div className="stat-sub">linhas brutas</div>
      </div>

      {/* Volume de Defeitos */}
      <div className="kpi-card">
        <div className="kpi-label">
          <Wrench size={16} style={{ marginRight: 6, opacity: 0.8 }} />
          Volume de Defeitos
        </div>

        <div className="kpi-value">{totalDefeitos.toLocaleString()}</div>

        <div className="stat-sub">somatória (qty)</div>
      </div>

      {/* Não Identificados */}
<div className="kpi-card">
  <div className="kpi-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <AlertTriangle
      size={16}
      style={{
        opacity: 0.7,
        color: "var(--muted)", // ÍCONE NEUTRO
      }}
    />
    Não Identificados
  </div>

  <div
    className="kpi-value"
    style={{
      color: notIdentified === 0 ? "var(--success)" : "var(--danger)", // SOMENTE O NÚMERO MUDA
    }}
  >
    {notIdentified.toLocaleString()}
  </div>

  <div className="stat-sub">inconsistências</div>
</div>
      {/* Precisão da IA */}
      <div className="kpi-card">
        <div className="kpi-label">
          <Brain size={16} style={{ marginRight: 6, opacity: 0.8 }} />
          Precisão da IA
        </div>

        <div
          className="kpi-value"
          style={{
            color: aiColor,
            textShadow:
              aiColor === "var(--success)"
                ? "0 0 6px rgba(74,222,128,0.25)"
                : aiColor === "var(--warn)"
                ? "0 0 6px rgba(250,204,21,0.25)"
                : "0 0 6px rgba(248,113,113,0.3)",
          }}
        >
          {aiOverall.toFixed(2)}%
        </div>

        <div className="stat-sub">qualidade da identificação</div>
      </div>

    </section>
  );
}