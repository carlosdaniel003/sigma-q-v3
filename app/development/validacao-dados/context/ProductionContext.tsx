"use client";

import React, { createContext, useContext, useState } from "react";

/* ======================================================
   TYPES
====================================================== */

/**
 * Metadados da validação de produção
 * (resultado do /api/producao/validate)
 */
export interface ProductionMeta {
  totals?: {
    totalVolume?: number;
    notIdentifiedVolume?: number;
    notIdentifiedRows?: number;
  };

  perCategory?: {
    categoria?: string;
    identifiedPct?: number;
    volume?: number;
    rows?: number;
  }[];

  topProblemModels?: {
    modelo?: string;
    count?: number;
    samples?: any[];
  }[];

  diagnostico?: {
    divergencias?: any[];
  };
}

interface ProductionContextType {
  /* 🔑 BASE NORMALIZADA */
  productionData: any[];

  /* 📊 RESULTADO DA VALIDAÇÃO */
  productionMeta: ProductionMeta | null;

  /* STATUS */
  loading: boolean;
  error: string | null;

  /* SETTERS */
  setProductionData: (data: any[]) => void;
  setProductionMeta: (meta: ProductionMeta | null) => void;
  setProductionLoading: (v: boolean) => void;
  setProductionError: (e: string | null) => void;
}

/* ======================================================
   CONTEXT
====================================================== */

const ProductionContext = createContext<ProductionContextType | null>(null);

/* ======================================================
   PROVIDER (PASSIVO)
====================================================== */

export function ProductionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productionData, setProductionData] = useState<any[]>([]);
  const [productionMeta, setProductionMeta] =
    useState<ProductionMeta | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ProductionContext.Provider
      value={{
        productionData,
        productionMeta,

        loading,
        error,

        setProductionData,
        setProductionMeta,
        setProductionLoading: setLoading,
        setProductionError: setError,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

/* ======================================================
   HOOK
====================================================== */

export function useProductionData() {
  const ctx = useContext(ProductionContext);
  if (!ctx) {
    throw new Error(
      "useProductionData must be used inside ProductionProvider"
    );
  }
  return ctx;
}