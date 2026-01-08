"use client";

import React from "react";
import "../../tabs.css";

import { useSigmaValidation } from "../context/SigmaValidationProvider";

/* ======================================================
   TEXTO DO LOADER POR TIPO DE VALIDAÇÃO
====================================================== */

function getTaskMessage(
  task: "defeitos" | "producao" | "ppm" | null
): string {
  switch (task) {
    case "defeitos":
      return "Carregando bases de defeitos…";

    case "producao":
      return "Carregando bases de produção…";

    case "ppm":
      return "Calculando indicadores PPM…";

    default:
      return "Preparando validação…";
  }
}

/* ======================================================
   LOADER GLOBAL
====================================================== */

export default function LoaderGlobal({
  progress,
}: {
  progress: number;
}) {
  const { currentTask } = useSigmaValidation();

  const safeProgress = Math.min(100, Math.max(0, progress));
  const text = getTaskMessage(currentTask);

  return (
    <div className="sigma-loader-overlay">
      <div className="sigma-loader-card">
        {/* ÍCONE CENTRAL */}
        <div className="sigma-loader-icon">
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>

        {/* TEXTO DINÂMICO */}
        <div className="sigma-loader-text">{text}</div>

        {/* BARRA DE PROGRESSO */}
        <div className="sigma-loader-bar">
          <div
            className="sigma-loader-bar-fill"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        {/* PORCENTAGEM */}
        <div className="sigma-loader-percent">
          {Math.floor(safeProgress)}%
        </div>
      </div>
    </div>
  );
}