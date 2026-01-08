"use client";

import React from "react";

type DiagnosticoReason =
  | "OK"
  | "SEM_DEFEITOS"
  | "DADOS_INCOMPLETOS"
  | "SEM_PRODUCAO"
  | "PPM_ZERADO";

interface Item {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;
  precision: number; // mantido no tipo (pode ser usado em outros lugares)
  reason: DiagnosticoReason;

  // 🔥 DATAS DE ORIGEM
  dataProducao?: string | Date;
  dataDefeito?: string | Date;
}

interface Props {
  items: Item[];
}

/* ======================================================
   UTIL — FORMATA DATA
====================================================== */
function formatDate(value?: string | Date): string {
  if (!value) return "—";

  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR");
}

export default function PpmTabelaDetalhada({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="ppm-panel">
        <h3>Detalhamento Técnico de PPM</h3>
        <p>Nenhum registro encontrado para os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="ppm-panel">
      <h3>Detalhamento Técnico de PPM</h3>

      <div className="ppm-table-wrapper">
        <table className="ppm-table">
          <thead>
            <tr>
              {/* 🔥 DATA PRIMEIRO */}
              <th>Data</th>
              <th>Modelo</th>
              <th>Categoria</th>
              <th>Produzido</th>
              <th>Defeitos</th>
              <th>PPM</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => {
              const isFromProducao = r.produzido > 0;
              const dataExibida = isFromProducao
                ? r.dataProducao
                : r.dataDefeito;

              const origem = isFromProducao
                ? "Produção"
                : "Defeito";

              return (
                <tr key={r.groupKey}>
                  {/* 🔥 DATA COM ORIGEM */}
                  <td>
                    {formatDate(dataExibida)}
                    <span className="ppm-date-origin">
                      {" "}
                      ({origem})
                    </span>
                  </td>

                  <td>{r.modelo}</td>
                  <td>{r.categoria}</td>

                  <td>{r.produzido.toLocaleString()}</td>
                  <td>{r.defeitos.toLocaleString()}</td>

                  <td className="ppm-value">
                    {r.ppm.toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`ppm-badge ${r.reason.toLowerCase()}`}
                    >
                      {r.reason.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}