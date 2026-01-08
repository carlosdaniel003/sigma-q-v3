"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function SidebarCategorias({
  categories,
  selectedCategory,
  setSelectedCategory,
}: {
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
}) {

  // ✅ CORREÇÃO: Parser robusto para garantir que não quebre com strings "98%"
  const parsePct = (val: any): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace("%", "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  function getColor(pct: number) {
    // Ajustado para 99.9 para pegar casos de arredondamento
    if (pct >= 99.9) return "var(--success)";
    if (pct >= 60) return "var(--warn)";
    return "var(--danger)";
  }

  return (
    <aside className="defeitos-sidebar">
      
      {/* TÍTULO */}
      <div className="sidebar-title" style={{ color: "var(--brand)" }}>
        SIGMA-Q
      </div>

      {/* ============================================================
          CATEGORIAS
      ============================================================ */}
      <div className="sidebar-group">
        <div className="sidebar-title">Categorias</div>

        {/* VISÃO GERAL */}
        <div
          className={`base-card ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          <div className="base-header">
            <span className="base-name">VISÃO GERAL</span>
            <BarChart3 size={16} />
          </div>

          <div className="base-subinfo">
            Resumo geral da produção
          </div>

          <div className="progress-wrapper">
            <div
              className="progress-bar"
              style={{
                width: "100%",
                background: "var(--brand)",
              }}
            />
          </div>
        </div>

        {/* LISTA DE CATEGORIAS */}
        {categories.map((c) => {
          // ✅ Usa o parser seguro aqui
          const pct = parsePct(c.identifiedPct);
          const color = getColor(pct);

          return (
            <div
              key={c.categoria}
              className={`base-card ${
                selectedCategory === c.categoria ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(c.categoria)}
            >
              <div className="base-header">
                <span className="base-name">{c.categoria}</span>

                <span
                  className="base-percent"
                  style={{ color }}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>

              <div className="base-subinfo">
                <strong>{c.volume?.toLocaleString() ?? 0}</strong> un. •{" "}
                {c.rows?.toLocaleString() ?? 0} linhas
              </div>

              <div className="progress-wrapper">
                <div
                  className="progress-bar"
                  style={{
                    width: `${pct}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}