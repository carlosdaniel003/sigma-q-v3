"use client";

import { useMemo, useState } from "react";
import { useProductionData } from "../../context/ProductionContext";
import { useSigmaValidation } from "../../context/SigmaValidationProvider";

/* ============================================================
   TIPOS AUXILIARES
============================================================ */

type Categoria = {
  categoria?: string;
  identifiedPct?: number;
  volume?: number;
  rows?: number;
};

type TopProblem = {
  modelo?: string;
  count?: number;
  samples?: any[];
};

/**
 * 🔑 DIAGNÓSTICO — TIPAGEM REAL DO BACKEND
 * (route.ts → diagnostico)
 */
type Diagnostico = {
  producaoSemDefeitos?: any[];
  defeitosSemProducao?: any[];
  divergencias?: any[];
  semiMapped?: any[];
  semiInfo?: any[];
};

type ProducaoValidationPayload = {
  totals?: {
    totalVolume?: number;
    notIdentifiedVolume?: number;
    notIdentifiedRows?: number;
  };
  perCategory?: Categoria[];
  topProblemModels?: TopProblem[];
  diagnostico?: Diagnostico;
};

/* ============================================================
   HOOK PRINCIPAL — CONSUMO PURO
============================================================ */

export function useValidacao() {
  /* 🔑 CONTEXTOS (FONTE ÚNICA DA VERDADE) */
  const {
    productionData,
    productionMeta,
    loading: productionLoading,
    error,
  } = useProductionData();

  const sigma = useSigmaValidation();

  /* ============================================================
     ESTADO DE UI
  ============================================================ */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "problemas" | "divergencias" | "diagnostico"
  >("problemas");
  const [showTop, setShowTop] = useState(10);

  /* ============================================================
     BASE REAL DE PRODUÇÃO (LINHAS)
  ============================================================ */
  const baseProducao = useMemo(() => {
    return Array.isArray(productionData) ? productionData : [];
  }, [productionData]);

  /* ============================================================
     METADADOS DE VALIDAÇÃO (VINDOS DO SIGMA)
  ============================================================ */
  const overall = productionMeta?.totals ?? {};
  const categories = productionMeta?.perCategory ?? [];
  const topProblems = productionMeta?.topProblemModels ?? [];
  const diagnostico: Diagnostico | null =
    productionMeta?.diagnostico ?? null;

  /* ============================================================
     KPIs
  ============================================================ */
  const categoriasSaudaveis = useMemo(
    () =>
      categories.filter(
        (c) => Number(c.identifiedPct ?? 0) === 100
      ).length,
    [categories]
  );

  const categoriasAtencao = useMemo(
    () =>
      categories.filter((c) => {
        const pct = Number(c.identifiedPct ?? 0);
        return pct >= 60 && pct < 100;
      }).length,
    [categories]
  );

  const modelosCriticos = useMemo(
    () =>
      categories.filter(
        (c) => Number(c.identifiedPct ?? 0) < 60
      ).length,
    [categories]
  );

  const categoriasCriticas = modelosCriticos;

  const itensAfetados = Number(overall.notIdentifiedRows ?? 0);

  const divergenciaGlobal = useMemo(() => {
    const total = Number(overall.totalVolume ?? 0);
    const notIdent = Number(overall.notIdentifiedVolume ?? 0);
    return total > 0 ? (notIdent / total) * 100 : 0;
  }, [overall]);

  /* ============================================================
     FILTROS DE VISUALIZAÇÃO
  ============================================================ */
  const currentProblems = useMemo(() => {
    if (!selectedCategory) return topProblems.slice(0, showTop);

    return topProblems.filter((p) => {
      const cat = String(
        p.samples?.[0]?.CATEGORIA ?? ""
      ).toUpperCase();

      return cat === selectedCategory.toUpperCase();
    });
  }, [selectedCategory, topProblems, showTop]);

  const currentStats = useMemo(() => {
    if (!selectedCategory) return null;

    return (
      categories.find(
        (c) =>
          String(c.categoria ?? "").toUpperCase() ===
          selectedCategory.toUpperCase()
      ) ?? null
    );
  }, [selectedCategory, categories]);

  const divergenciasByCategory = useMemo(() => {
    if (!selectedCategory) return [];

    return (
      diagnostico?.divergencias ?? []
    ).filter((d: any) => {
      const cat = String(d.categoria ?? d.CATEGORIA ?? "").toUpperCase();
      return cat === selectedCategory.toUpperCase();
    });
  }, [diagnostico, selectedCategory]);

  /* ============================================================
     STATUS FINAL UNIFICADO
  ============================================================ */
  const loading = sigma.loading || productionLoading;

  /* ============================================================
     RETORNO
  ============================================================ */
  return {
    loading,
    error,

    // base
    baseProducao,

    // agregados
    diagnostico,
    overall,
    categories,

    // UI
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
    showTop,
    setShowTop,

    // derivados
    currentProblems,
    currentStats,
    divergenciasByCategory,

    // KPIs
    categoriasSaudaveis,
    categoriasAtencao,
    modelosCriticos,
    categoriasCriticas,
    divergenciaGlobal,
    itensAfetados,
  };
}