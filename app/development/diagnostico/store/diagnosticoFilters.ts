"use client";

import { create } from "zustand";

/* ======================================================
   TIPOS DE FILTRO — CONTRATO ÚNICO
====================================================== */
export interface DiagnosticoFilters {
  periodo: {
    tipo: "semana" | "mes";
    valor: number | null;
    ano: number | null;
  };

  modelo?: string;
  categoria?: string;
  responsabilidade?: string;
  turno?: string;
}

/* ======================================================
   STORE
====================================================== */
interface DiagnosticoFilterStore {
  filters: DiagnosticoFilters;
  draftFilters: DiagnosticoFilters;

  setDraftFilter: <K extends keyof DiagnosticoFilters>(
    key: K,
    value: DiagnosticoFilters[K]
  ) => void;

  applyFilters: () => void;
  resetFilters: () => void;
}

/* ======================================================
   IMPLEMENTAÇÃO
====================================================== */
export const useDiagnosticoFilters = create<DiagnosticoFilterStore>(
  (set, get) => ({
    filters: {
      periodo: {
        tipo: "semana",
        valor: null,
        ano: null,
      },
    },

    draftFilters: {
      periodo: {
        tipo: "semana",
        valor: null,
        ano: null,
      },
    },

    setDraftFilter: (key, value) =>
      set((state) => ({
        draftFilters: {
          ...state.draftFilters,
          [key]: value,
        },
      })),

    applyFilters: () =>
      set(() => ({
        filters: { ...get().draftFilters },
      })),

    resetFilters: () =>
      set(() => ({
        filters: {
          periodo: {
            tipo: "semana",
            valor: null,
            ano: null,
          },
        },
        draftFilters: {
          periodo: {
            tipo: "semana",
            valor: null,
            ano: null,
          },
        },
      })),
  })
);