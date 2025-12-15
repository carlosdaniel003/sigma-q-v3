"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function DiagnosticoInteligente({
  diag,
  diagFilter,
  setDiagFilter,
  loading
}: {
  diag: any[];
  diagFilter: string;
  setDiagFilter: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="diag-intel-card fade-in">

      {/* HEADER */}
      <div className="diag-intel-header">
        <div>
          <h4 className="diag-intel-title">🧠 Diagnóstico Inteligente</h4>
          <div className="diag-intel-sub">Análise semântica das falhas mais críticas.</div>
        </div>

        {/* FILTRO PREMIUM */}
        <div className="diag-filter-bar">
          {[
            { id: "todos", label: "GERAL" },
            { id: "modelos", label: "MODELOS" },
            { id: "falhas", label: "FALHAS" },
            { id: "responsabilidades", label: "RESP." },
            { id: "naoMostrar", label: "ÍNDICE" },
          ].map((item) => (
            <button
              key={item.id}
              className={`diag-btn ${diagFilter === item.id ? "active" : ""}`}
              onClick={() => setDiagFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEM RESULTADOS */}
      {!loading && diag.length === 0 && (
        <div className="diag-empty">
          <AlertCircle size={22} />
          Nenhuma inconsistência encontrada para este filtro.
        </div>
      )}

      {/* LISTA */}
      <div className="diag-intel-list">
        {diag.map((item, idx) => (
          <div
            key={idx}
            className={`diag-intel-item ${item.severity === "high" ? "danger" : "warn"}`}
          >
            {/* HEADER */}
            <div className="diag-item-header">
              <div className="diag-item-title">
                <span className="diag-item-tag">{item.fonte}</span>
                <strong>{item.modelo || item.fornecedor || "Item Desconhecido"}</strong>
              </div>

              <div className="diag-item-count">
                {item.count} CASOS
              </div>
            </div>

            {/* CONTEXTO */}
            <div className="diag-item-context">
              {item.falha && item.falha !== "N/A" && (
                <span>Falha: <b>{item.falha}</b></span>
              )}
              {item.resp && item.resp !== "N/A" && (
                <span>Resp: <b>{item.resp}</b></span>
              )}
            </div>

            {/* EXPLICAÇÕES */}
            <div className="diag-item-explicacoes">
              {item.explicacao?.map((exp: string, i: number) => (
                <div key={i} className="diag-item-exp">
                  <span className="diag-exp-x">×</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>

            {/* SUGESTÕES */}
            {item.sugestao && item.sugestao.length > 0 && (
              <div className="diag-item-sugestoes">
                {item.sugestao.map((s: string, i: number) => (
                  <div key={i} className="diag-sug-item">
                    <span>💡</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}