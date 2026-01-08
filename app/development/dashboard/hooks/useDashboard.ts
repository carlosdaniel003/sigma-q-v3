"use client";

import { useEffect, useState } from "react";

/* ======================================================
   TIPOS — SÉRIES TEMPORAIS
====================================================== */
interface PpmMonthlyTrendItem {
  month: string;        // YYYY-MM
  production: number;
  defects: number;
  ppm: number | null;
}

/* ======================================================
   RESPONSABILIDADE POR MÊS
====================================================== */
export interface ResponsabilidadeMensalItem {
  month: string;            // YYYY-MM
  production: number;       // Produção do mês
  totalDefects: number;     // Defeitos totais do mês

  "FORN. IMPORTADO": number;
  "FORN. LOCAL": number;
  "PROCESSO": number;
  "PROJETO": number;
}

/* ======================================================
   CATEGORIA POR MÊS
====================================================== */
export interface CategoriaMensalItem {
  month: string;        // YYYY-MM
  production: number;   // Produção do mês
  totalDefects: number; // Defeitos totais do mês

  [categoria: string]: number | string;
}

/* ======================================================
   ESTRUTURA PRINCIPAL DO DASHBOARD
====================================================== */
interface DashboardData {
  meta: {
    totalProduction: number;
    totalDefects: number;
    ppmGeral: number | null;
    aiPrecision: number;
  };

  // Séries temporais
  ppmMonthlyTrend: PpmMonthlyTrendItem[];
  responsabilidadeMensal: ResponsabilidadeMensalItem[];
  categoriaMensal: CategoriaMensalItem[];

  // Consolidações
  byCategory: any[];
  byModel: any[];
}

/* ======================================================
   HOOK — DASHBOARD
====================================================== */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) {
          throw new Error("Erro ao carregar dashboard");
        }

        const json: DashboardData = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    data,
    loading,
    error,
  };
}