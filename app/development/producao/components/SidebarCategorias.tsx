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

  function getColor(pct: number) {
    if (pct >= 100) return "var(--success)";
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
          CATEGORIAS — VISUAL IGUAL AO SIDEBAR DE DEFEITOS
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
          const pct = Number(c.identifiedPct ?? 0);
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
                <strong>{c.volume.toLocaleString()}</strong> un. •{" "}
                {c.rows.toLocaleString()} linhas
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