"use client";

import React, { useMemo } from "react";

/* ======================================================
   TIPOS
====================================================== */

interface Row {
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;
  validationStatus: "VALID" | "PARTIAL" | "INVALID";
}

interface Props {
  rows: Row[];
  meta: {
    totalVolume: number;
    totalDefeitos: number;
    ppmGeral: number | null;
    aiPrecision: number;
    itensSemProducao: number;
    itensSemDefeitos: number;
  };
}

/* ======================================================
   COMPONENTE
====================================================== */

export default function PpmResumoGeral({ rows, meta }: Props) {
  const resumo = useMemo(() => {
    const totalGrupos = rows.length;

    const invalidos = rows.filter(
      (r) => r.validationStatus === "INVALID"
    ).length;

    const parciais = rows.filter(
      (r) => r.validationStatus === "PARTIAL"
    ).length;

    const validos = totalGrupos - invalidos - parciais;

    const categoriasCriticas = Array.from(
      new Set(
        rows
          .filter((r) => r.validationStatus !== "VALID")
          .map((r) => r.categoria)
      )
    );

    const topProblemas = rows
      .filter((r) => r.validationStatus !== "VALID")
      .sort((a, b) => {
        if (a.validationStatus !== b.validationStatus) {
          return a.validationStatus === "INVALID" ? -1 : 1;
        }
        return b.defeitos - a.defeitos;
      })
      .slice(0, 5);

    return {
      totalGrupos,
      validos,
      invalidos,
      parciais,
      categoriasCriticas,
      topProblemas,
    };
  }, [rows]);

  return (
    <div className="ppm-resumo glass-card">
      <h2 className="ppm-resumo-title">
        Resumo Geral do Sistema
      </h2>

      {/* =========================
          PROCESSAMENTO
      ========================= */}
      <section className="ppm-resumo-section">
        <div className="ppm-resumo-header">
          <span className="icon">📊</span>
          <h3>Processamento</h3>
        </div>

        <p>
          O motor de PPM processou{" "}
          <strong>{resumo.totalGrupos}</strong>{" "}
          grupos distintos, totalizando{" "}
          <strong>
            {meta.totalVolume.toLocaleString()}
          </strong>{" "}
          unidades produzidas e{" "}
          <strong>
            {meta.totalDefeitos.toLocaleString()}
          </strong>{" "}
          defeitos registrados.
        </p>
      </section>

      {/* =========================
          QUALIDADE DA VALIDAÇÃO
      ========================= */}
      <section className="ppm-resumo-section">
        <div className="ppm-resumo-header">
          <span className="icon">🧠</span>
          <h3>Qualidade da Validação</h3>
        </div>

        <p>
          A precisão global da IA foi de{" "}
          <strong
            className={
              meta.aiPrecision >= 90
                ? "ok"
                : meta.aiPrecision >= 50
                ? "warn"
                : "bad"
            }
          >
            {meta.aiPrecision}%
          </strong>
          , indicando que{" "}
          <strong>{resumo.validos}</strong>{" "}
          grupos foram totalmente validados.
        </p>
      </section>

      {/* =========================
          ALERTAS
      ========================= */}
      {(meta.itensSemProducao > 0 ||
        meta.itensSemDefeitos > 0 ||
        resumo.categoriasCriticas.length > 0) && (
        <section className="ppm-resumo-section alert">
          <div className="ppm-resumo-header">
            <span className="icon">⚠️</span>
            <h3>Alertas Detectados</h3>
          </div>

          <ul>
            {meta.itensSemProducao > 0 && (
              <li>
                <strong>{meta.itensSemProducao}</strong>{" "}
                itens com defeitos sem produção associada
              </li>
            )}
            {meta.itensSemDefeitos > 0 && (
              <li>
                <strong>{meta.itensSemDefeitos}</strong>{" "}
                itens com produção sem defeitos registrados
              </li>
            )}
            {resumo.categoriasCriticas.length > 0 && (
              <li>
                Categorias que exigem maior atenção:{" "}
                <strong>
                  {resumo.categoriasCriticas.join(", ")}
                </strong>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* =========================
          MODELOS CRÍTICOS
      ========================= */}
      {resumo.topProblemas.length > 0 && (
        <section className="ppm-resumo-section danger">
          <div className="ppm-resumo-header">
            <span className="icon">🚨</span>
            <h3>
              Modelos com Maior Incidência de Divergências
            </h3>
          </div>

          <ul className="ppm-resumo-list">
            {resumo.topProblemas.map((r, i) => (
              <li key={`${r.modelo}-${i}`}>
                <strong>{r.modelo}</strong>{" "}
                <span className="muted">
                  ({r.categoria})
                </span>{" "}
                —{" "}
                <span
                  className={`badge ${r.validationStatus.toLowerCase()}`}
                >
                  {r.validationStatus}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}