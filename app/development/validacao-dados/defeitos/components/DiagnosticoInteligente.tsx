"use client";

import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";

/* ======================================================
   TIPAGEM OFICIAL
====================================================== */
type FonteFiltro = "todas" | "af" | "lcm" | "produto" | "pth";

interface Props {
  // ⚠️ LISTA COMPLETA (SEM FILTRO DO PAI)
  diag: any[];
  diagFilter: FonteFiltro;
  setDiagFilter: (v: FonteFiltro) => void;
}

/* ======================================================
   COMPONENTE
====================================================== */
export default function DiagnosticoInteligente({
  diag,
  diagFilter,
  setDiagFilter,
}: Props) {

  /* ======================================================
     NORMALIZAÇÃO DA LISTA (UMA ÚNICA VEZ)
  ====================================================== */
  const normalized = useMemo(() => {
    if (!Array.isArray(diag)) return [];

    return diag.map((item) => ({
      ...item,
      _fonteNorm: String(item.fonte || "").toLowerCase() as FonteFiltro,
    }));
  }, [diag]);

  /* ======================================================
     CONTADORES (BASEADOS NA LISTA COMPLETA)
  ====================================================== */
  const counters = useMemo(() => {
    const base: Record<FonteFiltro, number> = {
      todas: 0,
      af: 0,
      lcm: 0,
      produto: 0,
      pth: 0,
    };

    if (normalized.length === 0) return base;

    base.todas = normalized.length;

    for (const item of normalized) {
      if (item._fonteNorm in base) {
        base[item._fonteNorm]++;
      }
    }

    return base;
  }, [normalized]);

  /* ======================================================
     FILTRO VISUAL (APENAS EXIBIÇÃO)
  ====================================================== */
  const filtered = useMemo(() => {
    if (normalized.length === 0) return [];

    if (diagFilter === "todas") return normalized;

    return normalized.filter(
      (item) => item._fonteNorm === diagFilter
    );
  }, [normalized, diagFilter]);

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="diag-intel-card fade-in">
      {/* HEADER */}
      <div className="diag-intel-header">
        <div>
          <h4 className="diag-intel-title">🧠 Diagnóstico Inteligente</h4>
          <div className="diag-intel-sub">
            Análise automática das divergências detectadas pelo motor SIGMA-Q.
          </div>
        </div>

        {/* ============================
            BARRA DE FILTROS
        ============================ */}
        <div className="diag-filter-bar">
          {/* GERAL */}
          <button
            className={`diag-btn ${
              diagFilter === "todas" ? "diag-btn-main active" : ""
            }`}
            onClick={() => setDiagFilter("todas")}
          >
            <span className="label">GERAL</span>
            <span
              className={`count ${
                counters.todas > 0 ? "danger" : "ok"
              }`}
            >
              {counters.todas}
            </span>
          </button>

          {/* BASES */}
          <div className="diag-filter-bases">
            {([
              ["af", "AF"],
              ["lcm", "LCM"],
              ["produto", "PRODUTO"],
              ["pth", "PTH"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                className={`diag-btn ${
                  diagFilter === id ? "active" : ""
                }`}
                onClick={() => setDiagFilter(id)}
              >
                <span className="label">{label}</span>
                <span
                  className={`count ${
                    counters[id] > 0 ? "danger" : "ok"
                  }`}
                >
                  {counters[id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================
          LISTA VAZIA
      ============================ */}
      {filtered.length === 0 && (
        <div className="diag-empty">
          <AlertCircle size={22} />
          {diagFilter === "todas"
            ? "Nenhuma divergência encontrada no total."
            : `Nenhuma inconsistência encontrada para o filtro ${diagFilter.toUpperCase()}.`}
        </div>
      )}

      {/* ============================
          LISTA DE ITENS
      ============================ */}
      <div className="diag-intel-list">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className={`diag-intel-item ${
              item.severity === "high" ? "danger" : "warn"
            }`}
          >
            <div className="diag-item-header">
              <div className="diag-item-title">
                <span className="diag-item-tag">
                  {String(item.fonte).toUpperCase()}
                </span>
                <strong>{item.modelo || "Divergência"}</strong>
              </div>

              <div className="diag-item-count">
                {item.count} CASOS
              </div>
            </div>

            <div className="diag-item-explicacoes">
              {(item.explicacao || item.issues || []).map(
                (msg: string, i: number) => (
                  <div key={i} className="diag-item-exp">
                    <span className="diag-exp-x">×</span>
                    <span>{msg}</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}