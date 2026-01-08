"use client";

import React from "react";

type Fonte = "todas" | "af" | "lcm" | "produto acabado" | "pth";

export default function SidebarDefeitos({
  fonte,
  setFonte,
  perBase,
}: {
  fonte: Fonte;
  setFonte: (f: Fonte) => void;
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
          BASES DE DADOS
      ============================================================ */}
      <div className="sidebar-group">
        <div className="sidebar-title">Bases de Dados</div>

        {(["todas", "af", "lcm", "produto acabado", "pth"] as Fonte[]).map(
          (f) => {
            const b = perBase?.[f];
            const pct = Number(b?.percentIdentified ?? 0);

            const linhas = b?.total ?? 0;
            const defeitos = b?.totalDefeitos ?? 0;

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
                    <span
                      className="base-percent"
                      style={{ color: getColor(pct) }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  )}
                </div>

                {f !== "todas" && (
                  <>
                    <div className="base-subinfo">
                      {linhas.toLocaleString()} linhas •{" "}
                      <strong style={{ color: "var(--text-strong)" }}>
                        {defeitos.toLocaleString()}
                      </strong>{" "}
                      defeitos
                    </div>

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
          }
        )}
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