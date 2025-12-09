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
      const j = await res.json();

      if (!j.ok) throw new Error(j.error || "Erro desconhecido.");

      setData(j);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const overall = data?.totals ?? {};
  const categories = data?.perCategory ?? [];
  const topProblems = data?.topProblemModels ?? [];

  // === KPIs NOVOS ===
  const categoriasSaudaveis = useMemo(
    () => categories.filter((c: any) => c.identifiedPct >= 99).length,
    [categories]
  );

  // Categorias abaixo de 90% = críticas
const modelosCriticos = useMemo(() => {
  return categories.filter(c => c.identifiedPct < 90).length;
}, [categories]);

  const divergenciaGlobal = useMemo(() => {
    if (!overall) return 0;
    const total = overall.totalVolume || 0;
    const diff = (overall.totalVolume ?? 0) - (overall.volumeMatched ?? 0);
    return total > 0 ? (diff / total) * 100 : 0;
  }, [overall]);

  // === Problemas filtrados por categoria ===
  const currentProblems = useMemo(() => {
    if (!data) return [];
    if (!selectedCategory) return topProblems.slice(0, showTop);

    return topProblems.filter(
      (p: any) => p.samples?.[0]?.CATEGORIA === selectedCategory
    );
  }, [selectedCategory, topProblems, data, showTop]);

  // === Estatísticas da categoria ===
  const currentStats = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c: any) => c.categoria === selectedCategory) ?? null;
  }, [selectedCategory, categories]);

  // === Divergências por categoria ===
  const divergenciasByCategory = useMemo(() => {
    const all = data?.diagnostico?.divergencias ?? [];
    if (!selectedCategory) return [];
    return all.filter(
      (d: any) =>
        String(d.categoria ?? d.CATEGORIA).toUpperCase() ===
        String(selectedCategory).toUpperCase()
    );
  }, [data, selectedCategory]);

  const diagnostico = data?.diagnostico ?? null;

  return {
    loading,
    error,
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
    diagnostico,
    data,
    load,

    // novos KPIs
    categoriasSaudaveis,
    modelosCriticos,
    divergenciaGlobal,
  };
}