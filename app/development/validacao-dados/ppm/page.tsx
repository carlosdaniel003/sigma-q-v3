"use client";

import { useState, useMemo } from "react";
import "./ppm.css";
import { usePpmValidation } from "./hooks/usePpmValidation";

import PpmSidebar from "./components/PpmSidebar";
import PpmKpis from "./components/PpmKpis";
import PpmCategoriasStatus from "./components/PpmCategoriasStatus";
import PpmDiagnosticoInteligente from "./components/PpmDiagnosticoInteligente";
import PpmTabelaDetalhada from "./components/PpmTabelaDetalhada";
import PpmOcorrenciasBreakdown from "./components/PpmOcorrenciasBreakdown";

/* ======================================================
   TIPOS
====================================================== */
type DiagnosticoReason =
  | "OK"
  | "DADOS_INCOMPLETOS"
  | "SEM_PRODUCAO"
  | "PPM_ZERADO";

export default function PpmPage() {
  const { data, error } = usePpmValidation();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  /* ======================================================
     BASE GLOBAL
  ====================================================== */
  const allRows = useMemo(() => data?.allRows ?? [], [data]);

  /* ======================================================
     BASE FILTRADA POR CATEGORIA
  ====================================================== */
  const rowsBase = useMemo(() => {
    return categoriaAtiva
      ? allRows.filter((r) => r.categoria === categoriaAtiva)
      : allRows;
  }, [allRows, categoriaAtiva]);

  /* ======================================================
     PRECISÃO GLOBAL
  ====================================================== */
  const precisaoGlobal = useMemo(() => {
    const total = allRows.length;
    if (total === 0) return 0;

    const validos = allRows.filter(
      (r) => r.validationStatus === "VALID"
    ).length;

    return Math.round((validos / total) * 100);
  }, [allRows]);

  /* ======================================================
     OCORRÊNCIAS — FONTE DINÂMICA
  ====================================================== */
  const ocorrenciasBreakdown = useMemo(() => {
    if (!categoriaAtiva) {
      return data?.meta?.occurrencesByCode ?? {};
    }

    return (
      data?.meta?.occurrencesByCategory?.[categoriaAtiva]
        ? { [categoriaAtiva]: data.meta.occurrencesByCategory[categoriaAtiva] }
        : {}
    );
  }, [data, categoriaAtiva]);

  /* ======================================================
     KPIs
  ====================================================== */
  const metaDinamico = useMemo(() => {
    const totalVolume = rowsBase.reduce(
      (s, r) => s + (r.produzido || 0),
      0
    );

    const totalDefeitos = rowsBase.reduce(
      (s, r) => s + (r.defeitos || 0),
      0
    );

    const ppmGeral =
  totalVolume > 0
    ? Number(
        ((totalDefeitos / totalVolume) * 1_000_000).toFixed(2)
      )
    : null;

    const validos = rowsBase.filter(
      (r) => r.validationStatus === "VALID"
    ).length;

    const aiPrecision =
      rowsBase.length > 0
        ? Math.round((validos / rowsBase.length) * 100)
        : 0;

    const ocorrencias = categoriaAtiva
      ? data?.meta?.occurrencesByCategory?.[categoriaAtiva] ?? 0
      : data?.meta?.totalOccurrences ?? 0;

    return {
      totalVolume,
      totalDefeitos,
      ppmGeral,
      aiPrecision,
      itensSemProducao: rowsBase.filter(
        (r) => r.produzido === 0 && r.defeitos > 0
      ).length,
      itensSemDefeitos: rowsBase.filter(
        (r) => r.produzido > 0 && r.defeitos === 0
      ).length,
      ocorrencias,
    };
  }, [rowsBase, categoriaAtiva, data]);

  /* ======================================================
     SIDEBAR
  ====================================================== */
  const metaSidebar = useMemo(
    () => ({
      totalVolume: data?.meta?.totalProduction ?? 0,
      totalDefeitos: data?.meta?.totalDefects ?? 0,
      ppmGeral: data?.meta?.ppmGeral ?? null,
      aiPrecision: precisaoGlobal,
    }),
    [data, precisaoGlobal]
  );

  /* ======================================================
     DIAGNÓSTICO
  ====================================================== */
  const diagnosticoItems = useMemo(() => {
    return rowsBase
      .map((r) => {
        let reason: DiagnosticoReason | null = null;

        if (r.produzido === 0 && r.defeitos > 0) {
          reason = "SEM_PRODUCAO";
        } else if (r.produzido === 0 && r.defeitos === 0) {
          reason = "DADOS_INCOMPLETOS";
        } else if (r.ppm === 0 && r.defeitos > 0) {
          reason = "PPM_ZERADO";
        }

        if (!reason) return null;

        return {
          groupKey: r.groupKey,
          modelo: r.modelo,
          categoria: r.categoria,
          produzido: r.produzido,
          defeitos: r.defeitos,
          ppm: r.ppm ?? 0,
          precision:
            data?.byCategory?.[r.categoria]?.aiPrecision ?? 0,
          dataProducao: r.datasProducao?.[0],
          dataDefeito: r.datasDefeito?.[0],
          reason,
        };
      })
      .filter(Boolean) as any[];
  }, [rowsBase, data]);

  if (error) return <div className="ppm-error">{error}</div>;

  return (
    <div className="ppm-layout">
      <PpmSidebar
        byCategory={data?.byCategory ?? {}}
        meta={metaSidebar}
        categoriaAtiva={categoriaAtiva}
        onSelectCategory={setCategoriaAtiva}
      />

      {/* 🔥 animação ao trocar categoria */}
      <main
        className="ppm-main ppm-fade-slide"
        key={categoriaAtiva ?? "geral"}
      >
        <PpmKpis meta={metaDinamico} />

        {/* 🔥 AGORA SEMPRE APARECE */}
        <PpmOcorrenciasBreakdown data={ocorrenciasBreakdown} />

        <PpmCategoriasStatus
          byCategory={Object.fromEntries(
            Object.entries(data?.byCategory ?? {}).map(([k, v]) => [
              k,
              { precision: v.aiPrecision },
            ])
          )}
        />

        <PpmDiagnosticoInteligente items={diagnosticoItems} />
        <PpmTabelaDetalhada items={diagnosticoItems} />
      </main>
    </div>
  );
}