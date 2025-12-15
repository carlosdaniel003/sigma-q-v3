"use client";

import { useEffect, useMemo, useState } from "react";

export function useValidacao() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "problemas" | "divergencias" | "diagnostico"
  >("problemas");
  const [showTop, setShowTop] = useState(10);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/producao/validate");
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || "Erro desconhecido.");

      setData(json);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // Dados principais
  // ============================================================
  const overall = data?.totals ?? {};
  const categories = data?.perCategory ?? [];
  const topProblems = data?.topProblemModels ?? [];
  const diagnostico = data?.diagnostico ?? null;

  // ============================================================
  // KPIs — Categorias Saudáveis
  // ============================================================
  const categoriasSaudaveis = useMemo(() => {
    return categories.filter(
      (c: any) => Number(c.identifiedPct ?? 0) >= 99
    ).length;
  }, [categories]);

  // ============================================================
  // KPIs — Categorias Críticas (< 90%)
  // ============================================================
  const modelosCriticos = useMemo(() => {
    return categories.filter(
      (c: any) => Number(c.identifiedPct ?? 0) < 90
    ).length;
  }, [categories]);

  // ============================================================
  // KPI — Divergência Global (% de volume não identificado)
  // ============================================================
  const divergenciaGlobal = useMemo(() => {
    const total = Number(overall.totalVolume ?? 0);
    const notIdent = Number(overall.notIdentifiedVolume ?? 0);
    return total > 0 ? (notIdent / total) * 100 : 0;
  }, [overall]);

  // ============================================================
  // Problemas filtrados por categoria
  // ============================================================
  const currentProblems = useMemo(() => {
    if (!data) return [];

    // Sem filtro: mostrar top X
    if (!selectedCategory) return topProblems.slice(0, showTop);

    // Filtrar dentro da categoria selecionada
    return topProblems.filter((p: any) => {
      const cat = String(p.samples?.[0]?.CATEGORIA ?? "").toUpperCase();
      return cat === String(selectedCategory).toUpperCase();
    });
  }, [selectedCategory, topProblems, data, showTop]);

  // ============================================================
  // Estatísticas da categoria selecionada
  // ============================================================
  const currentStats = useMemo(() => {
    if (!selectedCategory) return null;

    return (
      categories.find(
        (c: any) =>
          String(c.categoria).toUpperCase() ===
          String(selectedCategory).toUpperCase()
      ) ?? null
    );
  }, [selectedCategory, categories]);

  // ============================================================
  // Divergências filtradas por categoria
  // ============================================================
  const divergenciasByCategory = useMemo(() => {
    const all = diagnostico?.divergencias ?? [];
    if (!selectedCategory) return [];

    return all.filter((d: any) => {
      const cat = String(d.categoria ?? d.CATEGORIA ?? "").toUpperCase();
      return cat === String(selectedCategory).toUpperCase();
    });
  }, [diagnostico, selectedCategory]);

  // ============================================================
  // Retorno público do hook
  // ============================================================
  return {
    loading,
    error,
    data,
    diagnostico,

    overall,
    categories,

    selectedCategory,
    setSelectedCategory,

    activeTab,
    setActiveTab,

    showTop,
    setShowTop,

    currentProblems,
    currentStats,
    divergenciasByCategory,

    load,

    // KPIs calculados
    categoriasSaudaveis,
    modelosCriticos,
    divergenciaGlobal,
  };
}