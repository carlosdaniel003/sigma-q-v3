"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";

import { DefectsProvider, useDefectsData } from "./DefectsContext";
import { ProductionProvider, useProductionData } from "./ProductionContext";
import { PpmProvider, usePpmData } from "./PpmContext";

/* ======================================================
   TIPOS
====================================================== */

type ValidationTask = "defeitos" | "producao" | "ppm" | null;

type SigmaValidationState = {
  loading: boolean;
  progress: number;
  ready: boolean;
  currentTask: ValidationTask;

  loadDefeitos: () => Promise<void>;
  loadProducao: () => Promise<void>;
  loadPpm: () => Promise<void>;
  reload: () => Promise<void>;
};

/* ======================================================
   CONTEXTO
====================================================== */

const SigmaValidationContext =
  createContext<SigmaValidationState | null>(null);

export function useSigmaValidation() {
  const ctx = useContext(SigmaValidationContext);
  if (!ctx) {
    throw new Error(
      "useSigmaValidation must be used inside SigmaValidationProvider"
    );
  }
  return ctx;
}

/* ======================================================
   PROVIDER INTERNO
====================================================== */

function SigmaValidationInner({ children }: { children: React.ReactNode }) {
  /* CONTEXTOS DE DADOS */
  const { setRaw, setStats, setDiag } = useDefectsData();
  const {
    setProductionData,
    setProductionMeta,
    setProductionLoading,
    setProductionError,
  } = useProductionData();
  const { setPpmData, setPpmLoading, setPpmError } = usePpmData();

  /* ESTADO GLOBAL */
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [currentTask, setCurrentTask] =
    useState<ValidationTask>(null);

  /* CACHE POR ABA */
  const loadedRef = useRef({
    defeitos: false,
    producao: false,
    ppm: false,
  });

  /* ÚLTIMO LOADER */
  const lastLoaderRef = useRef<null | (() => Promise<void>)>(null);

  /* ======================================================
     UTIL — CONTROLE DE PROGRESSO REAL
  ====================================================== */
  function resetProgress(task: ValidationTask) {
    setCurrentTask(task);
    setProgress(0);
    setLoading(true);
    setReady(false);
  }

  function step(value: number) {
    setProgress((prev) => Math.min(100, prev + value));
  }

  function finish() {
    setProgress(100);
    setLoading(false);
    setReady(true);
    setCurrentTask(null);
  }

  /* ======================================================
     LOAD — DEFEITOS (PROGRESSO REAL)
  ====================================================== */
  const loadDefeitos = useCallback(async () => {
    if (loadedRef.current.defeitos) return;

    resetProgress("defeitos");
    lastLoaderRef.current = loadDefeitos;

    try {
      step(5); // init

      const validateRes = await fetch("/api/defeitos/validate");
      const validateJson = await validateRes.json();
      step(35); // leitura + enriquecimento

      const defects =
        validateJson.defects ||
        validateJson.items ||
        validateJson.data ||
        validateJson.rows ||
        validateJson.enriched ||
        [];

      if (!validateJson.ok || !Array.isArray(defects)) {
        throw new Error("Falha ao carregar defeitos");
      }

      setRaw(defects);
      step(20); // aplicação no estado

      const [statsRes, diagRes] = await Promise.all([
        fetch(
          "/api/defeitos/stats?" +
            new URLSearchParams({
              fonte: "todas",
              catalogos: "modelos,falhas,responsabilidades",
            })
        ),
        fetch(
          "/api/defeitos/diagnose?" +
            new URLSearchParams({
              fonte: "todas",
              limit: "30",
            })
        ),
      ]);

      const statsJson = await statsRes.json();
      const diagJson = await diagRes.json();
      step(30); // análises

      setStats(statsJson);
      setDiag(Array.isArray(diagJson.items) ? diagJson.items : []);

      loadedRef.current.defeitos = true;
      finish();
    } catch {
      setLoading(false);
    }
  }, [setRaw, setStats, setDiag]);

  /* ======================================================
     LOAD — PRODUÇÃO
  ====================================================== */
  const loadProducao = useCallback(async () => {
    if (loadedRef.current.producao) return;

    resetProgress("producao");
    lastLoaderRef.current = loadProducao;

    try {
      setProductionLoading(true);
      step(10);

      const res = await fetch("/api/producao/validate");
      const json = await res.json();
      step(50);

      if (!json.ok || !Array.isArray(json.production)) {
        throw new Error("Falha ao carregar produção");
      }

      setProductionData(json.production);
      step(20);

      setProductionMeta({
        totals: json.totals,
        perCategory: json.perCategory,
        topProblemModels: json.topProblemModels,
        diagnostico: json.diagnostico,
      });

      loadedRef.current.producao = true;
      finish();
    } catch (err: any) {
      setProductionError(String(err?.message ?? err));
      setLoading(false);
    } finally {
      setProductionLoading(false);
    }
  }, [
    setProductionData,
    setProductionMeta,
    setProductionLoading,
    setProductionError,
  ]);

  /* ======================================================
     LOAD — PPM
  ====================================================== */
  const loadPpm = useCallback(async () => {
    if (loadedRef.current.ppm) return;

    resetProgress("ppm");
    lastLoaderRef.current = loadPpm;

    try {
      setPpmLoading(true);
      step(10);

      const res = await fetch("/api/ppm/validate");
      const json = await res.json();
      step(60);

      if (!json.ok) {
        throw new Error("Falha ao carregar PPM");
      }

      setPpmData({
        meta: json.meta,
        globalDiagnostics: json.diagnostics,
        allRows: json.rows,
        byCategory: json.byCategory,
      });

      loadedRef.current.ppm = true;
      finish();
    } catch (err: any) {
      setPpmError(String(err?.message ?? err));
      setLoading(false);
    } finally {
      setPpmLoading(false);
    }
  }, [setPpmData, setPpmLoading, setPpmError]);

  /* ======================================================
     RELOAD — ABA ATUAL
  ====================================================== */
  const reload = useCallback(async () => {
    if (!lastLoaderRef.current) return;

    if (lastLoaderRef.current === loadDefeitos)
      loadedRef.current.defeitos = false;
    if (lastLoaderRef.current === loadProducao)
      loadedRef.current.producao = false;
    if (lastLoaderRef.current === loadPpm)
      loadedRef.current.ppm = false;

    await lastLoaderRef.current();
  }, [loadDefeitos, loadProducao, loadPpm]);

  return (
    <SigmaValidationContext.Provider
      value={{
        loading,
        progress,
        ready,
        currentTask,
        loadDefeitos,
        loadProducao,
        loadPpm,
        reload,
      }}
    >
      {children}
    </SigmaValidationContext.Provider>
  );
}

/* ======================================================
   PROVIDER FINAL
====================================================== */

export function SigmaValidationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DefectsProvider>
      <ProductionProvider>
        <PpmProvider>
          <SigmaValidationInner>{children}</SigmaValidationInner>
        </PpmProvider>
      </ProductionProvider>
    </DefectsProvider>
  );
}