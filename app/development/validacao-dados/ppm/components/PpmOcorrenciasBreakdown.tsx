"use client";

import React from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

interface Props {
  data: Record<string, number>;
}

/* ======================================================
   NORMALIZAÇÃO LOCAL (IGUAL AO BACKEND)
====================================================== */
function normalizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

/* ======================================================
   MAPA CANÔNICO DE OCORRÊNCIAS
====================================================== */
const CANONICAL_CODES: Record<string, string> = {
  AC: "AC",
  AF: "AF",
  AN: "AN",
  DP: "DP",
  ENG: "ENG",
  F: "F",
  FL: "FL",
  INTMOD: "INT MOD",
  JIG: "JIG",
  LCM: "LCM",
  MA: "MA",
  OC: "OC",
  P: "P",
  PS: "PS",
  RC: "RC",
  REVISAO: "REVISÃO",
  RT: "RT",
  RV: "RV",
  T: "T",
};

export default function PpmOcorrenciasBreakdown({ data }: Props) {
  const aggregated: Record<string, number> = {};

  Object.entries(data).forEach(([rawCode, qtd]) => {
    const normalized = normalizeCode(rawCode);
    const canonical = CANONICAL_CODES[normalized];

    if (!canonical) return;

    aggregated[canonical] = (aggregated[canonical] || 0) + qtd;
  });

  const sorted = Object.entries(aggregated).sort(
    ([, a], [, b]) => b - a
  );

  if (sorted.length === 0) return null;

  return (
    <div className="section-container fade-in">
      <div className="section-header">
        <div className="section-title-wrapper">
          <Squares2X2Icon width={20} className="text-gray-400" />
          <h2 className="section-title">
            Detalhamento de Ocorrências
          </h2>
        </div>
      </div>

      <div className="glass-panel">
        <div className="grid-list">
          {sorted.map(([code, qtd]) => (
            <div key={code} className="breakdown-item">
              <span className="breakdown-code">{code}</span>
              <span className="breakdown-value">
                {qtd.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}