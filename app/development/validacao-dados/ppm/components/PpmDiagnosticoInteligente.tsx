"use client";

import React, { useMemo, useState, useEffect } from "react";

interface DiagnosticoItem {
  groupKey: string;
  modelo: string;
  categoria: string;
  produzido: number;
  defeitos: number;
  ppm: number;

  // 🔒 PRECISÃO DA CATEGORIA (não do item)
  precision: number;

  reason: "SEM_PRODUCAO" | "PPM_ZERADO" | "DADOS_INCOMPLETOS";
}

interface Props {
  items: DiagnosticoItem[];
}

export default function PpmDiagnosticoInteligente({ items }: Props) {
  /* ======================================================
     MÉTRICAS POR CATEGORIA (FONTE ÚNICA)
  ====================================================== */
  const metricasPorCategoria = useMemo(() => {
    const map: Record<
      string,
      {
        totalItens: number;
        precision: number;
      }
    > = {};

    items.forEach((i) => {
      if (!map[i.categoria]) {
        map[i.categoria] = {
          totalItens: 0,
          precision: i.precision,
        };
      }
      map[i.categoria].totalItens += 1;
    });

    return map;
  }, [items]);

  const categoriasUnicas = Object.keys(metricasPorCategoria);

  /* ======================================================
     LISTA DE CATEGORIAS (INTELIGENTE)
     - 1 categoria → SEM GERAL
     - >1 categorias → COM GERAL
  ====================================================== */
  const categoriasList = useMemo(() => {
    if (categoriasUnicas.length <= 1) {
      return categoriasUnicas;
    }
    return ["GERAL", ...categoriasUnicas];
  }, [categoriasUnicas]);

  /* ======================================================
     CATEGORIA ATIVA (REAGE AO CONTEXTO)
  ====================================================== */
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  // 🔥 SINCRONIZA SEMPRE QUE OS ITEMS MUDAREM
  useEffect(() => {
    if (categoriasList.length === 1) {
      setCategoriaAtiva(categoriasList[0]);
    } else {
      setCategoriaAtiva("GERAL");
    }
  }, [categoriasList]);

  /* ======================================================
     FILTRO DOS ITENS
  ====================================================== */
  const itensFiltrados = useMemo(() => {
    if (!categoriaAtiva || categoriaAtiva === "GERAL") return items;
    return items.filter((i) => i.categoria === categoriaAtiva);
  }, [items, categoriaAtiva]);

  /* ======================================================
     SEM INCONSISTÊNCIAS
  ====================================================== */
  if (items.length === 0) {
    return (
      <div className="ppm-panel">
        <h3>🧠 Diagnóstico Inteligente</h3>
        <p className="muted">
          Nenhuma inconsistência encontrada. O KPI não está sendo impactado.
        </p>
      </div>
    );
  }

  return (
    <div className="ppm-panel">
      <h3>🧠 Diagnóstico Inteligente — Impacto real no KPI</h3>
      <p className="muted">
        Cada item abaixo representa uma parcela real da perda de precisão da IA
        dentro da sua categoria.
      </p>

      {/* ======================================================
         TABS DE CATEGORIA (SÓ QUANDO FAZ SENTIDO)
      ====================================================== */}
      {categoriasList.length > 1 && (
        <div className="diagnostic-tabs">
          {categoriasList.map((cat) => (
            <button
              key={cat}
              className={`diag-tab ${
                categoriaAtiva === cat ? "active" : ""
              }`}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat}
              <span className="tab-count">
                {cat === "GERAL"
                  ? items.length
                  : metricasPorCategoria[cat]?.totalItens || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ======================================================
         LISTAGEM DOS DIAGNÓSTICOS
      ====================================================== */}
      <div className="diagnostic-list">
        {itensFiltrados.map((i) => {
          const impacto = calcularImpactoItem(
            i.categoria,
            metricasPorCategoria
          );

          return (
            <div key={i.groupKey} className="diagnostic-card">
              <div className="diag-header">
                <div>
                  <span className="diag-category">{i.categoria}</span>
                  <span className="diag-model">{i.modelo}</span>
                </div>

                <span className="impact-badge">
                  −{impacto.toFixed(1)}% KPI
                </span>
              </div>

              <div className="diag-metrics">
                <div>
                  <strong>Produção:</strong>{" "}
                  {i.produzido.toLocaleString()}
                </div>
                <div>
                  <strong>Defeitos:</strong>{" "}
                  {i.defeitos.toLocaleString()}
                </div>
                <div>
                  <strong>PPM:</strong>{" "}
                  <span className="ppm-bad">{i.ppm.toFixed(2)}</span>
                </div>
              </div>

              <div className="diag-description">
                {renderDiagnosticText(i)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================
   CÁLCULO DO IMPACTO REAL POR ITEM
====================================================== */
function calcularImpactoItem(
  categoria: string,
  metricas: Record<
    string,
    { totalItens: number; precision: number }
  >
) {
  const info = metricas[categoria];
  if (!info || info.totalItens === 0) return 0;

  const deficit = 100 - info.precision;
  return deficit / info.totalItens;
}

/* ======================================================
   TEXTO INTELIGENTE DE DIAGNÓSTICO
====================================================== */
function renderDiagnosticText(i: DiagnosticoItem) {
  switch (i.reason) {
    case "SEM_PRODUCAO":
      return (
        <>
          ❌ <strong>Defeitos sem produção registrada.</strong>
          <br />
          Existem defeitos registrados para este modelo, porém nenhuma produção
          correspondente foi encontrada.
          <br />
          <strong>Recomendação:</strong> verificar grafia do modelo e confirmar se
          houve produção.
        </>
      );

    case "PPM_ZERADO":
      return (
        <>
          ❌ <strong>PPM inválido.</strong>
          <br />
          O cálculo foi comprometido por inconsistência entre produção e defeitos.
          <br />
          <strong>Recomendação:</strong> revisar os dados de entrada.
        </>
      );

    case "DADOS_INCOMPLETOS":
      return (
        <>
          ❌ <strong>Dados incompletos.</strong>
          <br />
          Não foi possível validar produção nem defeitos para este item.
          <br />
          <strong>Recomendação:</strong> completar as bases envolvidas.
        </>
      );

    default:
      return null;
  }
}