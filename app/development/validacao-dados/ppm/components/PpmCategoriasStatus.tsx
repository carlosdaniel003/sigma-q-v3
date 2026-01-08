"use client";

import React, { useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  byCategory: {
    [categoria: string]: {
      precision: number;
    };
  };
}

export default function PpmCategoriasStatus({ byCategory }: Props) {
  const { saudaveis, criticas } = useMemo(() => {
    const entries = Object.entries(byCategory);

    return {
      saudaveis: entries.filter(([, v]) => v.precision >= 90),
      criticas: entries.filter(([, v]) => v.precision < 90),
    };
  }, [byCategory]);

  return (
    <div className="ppm-category-status-grid">
      {/* =========================
          SAUDÁVEIS
      ========================= */}
      <div className="ppm-category-status ok">
        <div className="ppm-category-status-header">
          <CheckCircleIcon className="icon ok" />
          <span>Categorias Saudáveis</span>
        </div>

        <div className="ppm-category-status-value">
          {saudaveis.length}
        </div>
      </div>

      {/* =========================
          CRÍTICAS
      ========================= */}
      <div className="ppm-category-status alert">
        <div className="ppm-category-status-header">
          <ExclamationTriangleIcon className="icon alert" />
          <span>Categorias Críticas</span>
        </div>

        <div className="ppm-category-status-value">
          {criticas.length}
        </div>
      </div>
    </div>
  );
}