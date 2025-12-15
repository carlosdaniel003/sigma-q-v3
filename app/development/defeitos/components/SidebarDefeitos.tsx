"use client";

import React from "react";

type Fonte = "todas" | "af" | "lcm" | "produto acabado" | "pth";

export default function SidebarDefeitos({
  fonte,
  setFonte,
  catalogos,
  toggleCatalogo,
  perBase
}: {
  fonte: Fonte;
  setFonte: (f: Fonte) => void;
  catalogos: any;
  toggleCatalogo: (key: string) => void;
  perBase: any;
}) {
  
  function getColor(pct: number) {
    if (pct === 100) return "var(--success)";
    if (pct >= 50) return "var(--warn)";
    return "var(--danger)";
  }

  return (
    <aside className="defeitos-sidebar">
      
      {/* Título */}
      <div className="sidebar-title" style={{ color: "var(--brand)" }}>
        SIGMA-Q
      </div>

      {/* ============================================================
          BASES DE DADOS COM DEFEITOS + PROGRESSO
      ============================================================ */}
      <div className="sidebar-group">
        <div className="sidebar-title">Bases de Dados</div>

        {(["todas", "af", "lcm", "produto acabado", "pth"] as Fonte[]).map((f) => {

          const b = perBase?.[f];
          const pct = Number(b?.percentIdentified ?? 0);

          // 🆕 total de defeitos (identificados + não identificados)
          const defeitos =
            (b?.identified ?? 0) + (b?.notIdentified ?? 0);

          return (
            <div
              key={f}
              className={`base-card ${fonte === f ? "active" : ""}`}
              onClick={() => setFonte(f)}
            >
              <div className="base-header">
                <span className="base-name">
                  {f === "todas" ? "TODAS" : f.toUpperCase()}
                </span>

                {f !== "todas" && (
                  <span className="base-percent" style={{ color: getColor(pct) }}>
                    {pct.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* SUBINFORMAÇÕES DA BASE */}
              {f !== "todas" && (
                <>
                  <div className="base-subinfo">
                    {(b?.total ?? 0).toLocaleString()} linhas •{" "}
                    <strong style={{ color: "var(--text-strong)" }}>
                      {defeitos.toLocaleString()}
                    </strong>{" "}
                    defeitos
                  </div>

                  {/* BARRA DE PROGRESSO */}
                  <div className="progress-wrapper">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${pct}%`,
                        background: getColor(pct),
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================
          CATÁLOGOS
      ============================================================ */}
      <div className="sidebar-group">
        <div className="sidebar-title">Catálogos Ativos</div>

        <div className="catalogo-chips">
          {[
            ["modelos", "Modelos"],
            ["falhas", "Códigos de Falha"],
            ["responsabilidades", "Responsabilidades"],
            ["naoMostrar", "Índice (Ocultos)"],
            ["todos", "Selecionar Todos"],
          ].map(([key, label]) => {
            const ativo = catalogos[key as keyof typeof catalogos];

            return (
              <div
                key={key}
                className={`chip ${ativo ? "chip-on" : "chip-off"}`}
                onClick={() => toggleCatalogo(key)}
              >
                <span>{label}</span>

                <span
                  className="chip-indicator"
                  style={{
                    color: ativo ? "var(--brand)" : "var(--muted)"
                  }}
                >
                  {ativo ? "●" : "○"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="sidebar-group muted"
        style={{ marginTop: "auto", fontSize: "0.75rem", lineHeight: "1.4" }}
      >
        Vercel Enterprise
        <br />
        Turso DB
        <br />
        v4.0.2
      </div>
    </aside>
  );
}