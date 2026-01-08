"use client";

import { useMemo } from "react";
import { usePpmData } from "../../context/PpmContext";
import { useSigmaValidation } from "../../context/SigmaValidationProvider";

/* ============================================================
   HOOK — CONSUMO PURO (SEM FETCH)
============================================================ */

export function usePpmValidation() {
  const { data, loading, error } = usePpmData();
  const sigma = useSigmaValidation();

  /* ============================================================
     DADOS DERIVADOS (SE NECESSÁRIO)
  ============================================================ */

  const meta = data?.meta ?? null;
  const globalDiagnostics = data?.globalDiagnostics ?? [];
  const allRows = data?.allRows ?? [];
  const byCategory = data?.byCategory ?? {};

  /* ============================================================
     STATUS UNIFICADO
  ============================================================ */

  const isLoading = sigma.loading || loading;

  return {
    data,
    meta,
    globalDiagnostics,
    allRows,
    byCategory,

    loading: isLoading,
    error,
  };
}