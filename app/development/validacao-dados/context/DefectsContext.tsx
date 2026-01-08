"use client";

import React, {
  createContext,
  useContext,
  useState,
} from "react";

/* ======================================================
   TIPAGEM DO CONTEXTO DE DEFEITOS
====================================================== */

export interface DefectsContextType {
  /* 🔹 Dados brutos (RAW da API) */
  raw: any[];

  /* 🔹 Dados enriquecidos */
  stats: any | null;
  diag: any[];

  /* 🔹 Setters (controlados pelo SigmaValidationProvider) */
  setRaw: React.Dispatch<React.SetStateAction<any[]>>;
  setStats: React.Dispatch<React.SetStateAction<any | null>>;
  setDiag: React.Dispatch<React.SetStateAction<any[]>>;
}

/* ======================================================
   CONTEXTO
====================================================== */

const DefectsContext = createContext<DefectsContextType | undefined>(undefined);

/* ======================================================
   PROVIDER
====================================================== */

export function DefectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [raw, setRaw] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [diag, setDiag] = useState<any[]>([]);

  return (
    <DefectsContext.Provider
      value={{
        raw,
        stats,
        diag,
        setRaw,
        setStats,
        setDiag,
      }}
    >
      {children}
    </DefectsContext.Provider>
  );
}

/* ======================================================
   HOOK DE CONSUMO
====================================================== */

export function useDefectsData(): DefectsContextType {
  const ctx = useContext(DefectsContext);

  if (!ctx) {
    throw new Error(
      "useDefectsData must be used inside DefectsProvider"
    );
  }

  return ctx;
}