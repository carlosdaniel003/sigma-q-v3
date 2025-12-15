"use client";

import React from "react";

export default function PerformancePorBase({ perBase }: { perBase: any }) {
  return (
    <div className="per-base-card fade-in">
      <h4 className="inconsistencias-title">Performance por Base de Dados</h4>

      <div className="per-base-grid">
        {["af", "lcm", "produto acabado", "pth"].map((key) => {
          const base = perBase?.[key];

          const percent = Number(base?.percentIdentified ?? 0);
          const pctString = percent.toFixed(1) + "%";

          // cor automática
          const barColor =
            percent < 90
              ? "var(--danger)"
              : percent < 99
              ? "var(--warn)"
              : "var(--success)";

          return (
            <div className="per-base-item" key={key}>
              
              {/* Nome da base */}
              <div className="per-base-label">{key.toUpperCase()}</div>

              {/* Valor percentual */}
              <div className="per-base-percent" style={{ color: barColor }}>
                {pctString}
              </div>

              {/* Barra de performance */}
              <div className="per-base-bar">
                <div
                  className="per-base-fill"
                  style={{
                    width: `${percent}%`,
                    background: barColor,
                  }}
                />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}