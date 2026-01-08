"use client";

import React, { useState } from "react";

interface TendenciaPpmProps {
  anterior: number;
  atual: number;
  labelAnterior: string; // ex: 2025-09
  labelAtual: string;    // ex: 2025-10
}

export default function TendenciaPpm({
  anterior,
  atual,
  labelAnterior,
  labelAtual,
}: TendenciaPpmProps) {
  const [flipped, setFlipped] = useState(false);

  /* ======================================================
     UTIL — FORMATA MÊS (YYYY-MM → Setembro)
  ====================================================== */
  function formatMonthLabel(label: string): string {
    const parts = label.split("-");
    if (parts.length !== 2) return label;

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    if (!year || !month) return label;

    const date = new Date(year, month - 1, 1);

    const monthName = date.toLocaleDateString("pt-BR", {
      month: "long",
    });

    // Capitaliza primeira letra
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }

  /* ======================================================
     CÁLCULOS
  ====================================================== */
  const diff = atual - anterior;
  const percent = anterior > 0 ? (diff / anterior) * 100 : 0;

  const melhorou = diff < 0;
  const piorou = diff > 0;

  const cor = melhorou
    ? "#6bffb0"
    : piorou
    ? "#ff6b6b"
    : "#cccccc";

  const seta = melhorou ? "↓" : piorou ? "↑" : "→";

  const formatPpm = (v: number) =>
    v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPercent = (v: number) =>
    Math.abs(v).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ======================================================
     STYLES — SIGMA-Q FLIP (ANTI-OVERFLOW)
  ====================================================== */
  const containerStyle: React.CSSProperties = {
    perspective: "1200px",
    height: 180,
  };

  const cardStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
    cursor: "pointer",
  };

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    borderRadius: 16,
    padding: 20,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${cor}66`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  };

  const backStyle: React.CSSProperties = {
    ...faceStyle,
    transform: "rotateY(180deg)",
    justifyContent: "space-between",
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div style={containerStyle}>
      <div
        style={cardStyle}
        onClick={() => setFlipped(!flipped)}
        title="Clique para ver detalhes"
      >
        {/* =======================
            FRENTE — RESUMO
        ======================= */}
        <div style={faceStyle}>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Tendência de PPM
          </div>

          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              color: cor,
              marginTop: 6,
              lineHeight: 1.1,
            }}
          >
            {seta} {formatPercent(percent)}%
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              opacity: 0.75,
            }}
          >
            {melhorou
              ? "Redução no índice de defeitos"
              : piorou
              ? "Aumento no índice de defeitos"
              : "Sem variação significativa"}
          </div>
        </div>

        {/* =======================
            VERSO — DETALHE
        ======================= */}
        <div style={backStyle}>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Comparativo mensal
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {/* ANTERIOR */}
            <div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>
                {formatMonthLabel(labelAnterior)}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {formatPpm(anterior)}
              </div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>
                PPM
              </div>
            </div>

            {/* ATUAL */}
            <div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>
                {formatMonthLabel(labelAtual)}
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {formatPpm(atual)}
              </div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>
                PPM
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: cor,
            }}
          >
            {seta} {formatPpm(Math.abs(diff))}{" "}
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              PPM
            </span>
          </div>

          <div style={{ fontSize: 12, opacity: 0.65 }}>
            Diferença absoluta entre os períodos
          </div>
        </div>
      </div>
    </div>
  );
}