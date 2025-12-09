"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function SidebarCategorias({
  categories,
  selectedCategory,
  setSelectedCategory,
  setActiveTab,
}: any) {
  return (
    <aside className="left-panel">
      <div className="panel-title">Categorias</div>

      <div className="category-list custom-scroll">
        <div
          className={`category-item ${
            selectedCategory === null ? "active" : ""
          }`}
          onClick={() => {
            setSelectedCategory(null);
            setActiveTab("problemas");
          }}
        >
          <div className="cat-header">
            <span>VISÃO GERAL</span>
            <BarChart3 size={16} />
          </div>
          <div className="cat-stats">Resumo geral</div>
        </div>

        {categories.map((c: any) => {
          const isGood = c.identifiedPct >= 99;
          return (
            <div
              key={c.categoria}
              className={`category-item ${
                selectedCategory === c.categoria ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(c.categoria);
                setActiveTab("problemas");
              }}
            >
              <div className="cat-header">
                <span>{c.categoria}</span>
                <span style={{ color: isGood ? "#4ade80" : "#facc15" }}>
                  {c.identifiedPct}%
                </span>
              </div>
              <div className="cat-stats">
                {c.volume.toLocaleString()} un. • {c.rows} linhas
              </div>
              <div className="mini-bar-bg">
                <div
                  className="mini-bar-fill"
                  style={{
                    width: `${c.identifiedPct}%`,
                    background: isGood ? "#22c55e" : "#eab308",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}