"use client";

import React from "react";
import { Activity } from "lucide-react";

export default function LoaderPremium({
  progress,
  message
}: {
  progress: number;
  message: string;
}) {
  return (
    <div className="loading-premium-wrapper fade-in">
      <div className="loading-card">

        {/* Ícone animado */}
        <Activity
          size={42}
          className="pulse"
          style={{ color: "var(--brand)" }}
        />

        {/* Mensagem dinâmica do hook */}
        <p className="loading-title">{message}</p>

        {/* Barra de progresso */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentual numérico */}
        <span className="progress-percent">
          {Math.floor(progress)}%
        </span>

      </div>
    </div>
  );
}