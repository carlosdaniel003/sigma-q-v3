"use client";

import React, { createContext, useContext, useState } from "react";
import { PpmEngineResult } from "@/core/ppm/ppmEngineResultTypes";

/* ======================================================
   TYPES
====================================================== */
interface PpmContextType {
  data: PpmEngineResult | null;
  loading: boolean;
  error: string | null;

  setPpmData: (data: PpmEngineResult) => void;
  setPpmLoading: (v: boolean) => void;
  setPpmError: (e: string | null) => void;
}

/* ======================================================
   CONTEXT
====================================================== */
const PpmContext = createContext<PpmContextType | null>(null);

/* ======================================================
   PROVIDER (PASSIVO)
====================================================== */
export function PpmProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PpmEngineResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <PpmContext.Provider
      value={{
        data,
        loading,
        error,
        setPpmData: setData,
        setPpmLoading: setLoading,
        setPpmError: setError,
      }}
    >
      {children}
    </PpmContext.Provider>
  );
}

/* ======================================================
   HOOK
====================================================== */
export function usePpmData() {
  const ctx = useContext(PpmContext);
  if (!ctx) {
    throw new Error("usePpmData must be used inside PpmProvider");
  }
  return ctx;
}