"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------
   Tipos
------------------------------------------------------- */
type Fonte = "todas" | "af" | "lcm" | "produto acabado" | "pth";

interface LogEntry {
  ts: string;
  msg: string;
  type: "info" | "success" | "error" | "process";
}

/* -------------------------------------------------------
   HOOK PRINCIPAL
------------------------------------------------------- */
export default function useValidacaoDefeitos() {
  /* -----------------------------------------
     ESTADOS
  ----------------------------------------- */
  const [fonte, setFonte] = useState<Fonte>("todas");
  const [catalogos, setCatalogos] = useState({
    modelos: true,
    falhas: true,
    responsabilidades: true,
    naoMostrar: true,
    todos: true,
  });

  const [diagFilter, setDiagFilter] = useState("todos");

  const [stats, setStats] = useState<any>(null);
  const [diag, setDiag] = useState<any[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // NOVO → mensagem para o Loader Premium
  const [loaderMessage, setLoaderMessage] = useState("Iniciando Validação…");

  // kill-switch
  const mounted = useRef(true);

  /* -----------------------------------------
     HELPERS
  ----------------------------------------- */

  const addLog = (
    msg: string,
    type: "info" | "success" | "error" | "process" = "info"
  ) => {
    if (!mounted.current) return;
    
    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // grava log
    setLogs((prev) => [...prev, { ts, msg, type }]);

    // atualiza mensagem do loader
    setLoaderMessage(msg);
  };

  const catalogosQuery = useMemo(() => {
    return Object.entries(catalogos)
      .filter(([k, v]) => k !== "todos" && v)
      .map(([k]) => k)
      .join(",");
  }, [catalogos]);

  /* -----------------------------------------
     ENGINE DE ANÁLISE
  ----------------------------------------- */

  async function runFullAnalysis(targetFonte: Fonte, abortSignal: AbortSignal) {
    if (!mounted.current) return;

    setLoading(true);
    setProgress(0);
    setLogs([]);
    setLoaderMessage("Iniciando Sistema…");

    addLog("INICIANDO SISTEMA SIGMA-Q V4", "process");
    addLog(
      `Conectando ao Data Lake (Fonte: ${targetFonte.toUpperCase()})...`,
      "info"
    );

    let progressValue = 0;
    const t0 = performance.now();

    // progresso visual
    const interval = setInterval(() => {
      if (!mounted.current) {
        clearInterval(interval);
        return;
      }
      progressValue += Math.random() * 2.2;
      if (progressValue > 92) progressValue = 92;
      setProgress(Math.round(progressValue));
    }, 550);

    try {
      addLog("Solicitando pacotes de análise (Stats + Diagnose)...", "process");

      const [resStats, resDiag] = await Promise.all([
        fetch(
          `/api/defeitos/stats?fonte=${targetFonte}&catalogos=${catalogosQuery}`,
          { signal: abortSignal }
        ),
        fetch(
          `/api/defeitos/diagnose?fonte=${targetFonte}&limit=30&catalogos=${catalogosQuery}&filter=${diagFilter}`,
          { signal: abortSignal }
        ),
      ]);

      if (!mounted.current) return;

      addLog("Pacotes recebidos. Processando JSON...", "process");

      const dataStats = await resStats.json();
      const dataDiag = await resDiag.json();

      if (!mounted.current) return;

      setStats(dataStats);
      setDiag(Array.isArray(dataDiag.items) ? dataDiag.items : []);

      clearInterval(interval);
      setProgress(100);

      const totalTime = ((performance.now() - t0) / 1000).toFixed(2);
      addLog(`✓ Carga completa em ${totalTime}s`, "success");
      addLog(
        `Itens Processados: ${
          dataStats.totalItems?.toLocaleString() ?? 0
        }`,
        "success"
      );

      if (dataStats.notIdentified > 0) {
        addLog(
          `⚠️ Inconsistências Detectadas: ${dataStats.notIdentified.toLocaleString()}`,
          "error"
        );
      } else {
        addLog("✓ Base 100% consistente.", "success");
      }
    } catch (e: any) {
      clearInterval(interval);
      if (e.name === "AbortError") return;

      if (mounted.current) {
        setProgress(100);
        addLog(`ERRO CRÍTICO: ${String(e)}`, "error");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  /* -----------------------------------------
     AUTO-START + CLEANUP
  ----------------------------------------- */

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();

    const timer = setTimeout(() => {
      if (mounted.current) {
        runFullAnalysis(fonte, controller.signal);
      }
    }, 800);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [fonte, catalogosQuery]);

  /* -----------------------------------------
     Filtro de Diagnóstico
  ----------------------------------------- */

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();

    const run = async () => {
      addLog(`Atualizando filtro de diagnóstico: ${diagFilter}`, "process");
      try {
        const res = await fetch(
          `/api/defeitos/diagnose?fonte=${fonte}&limit=30&catalogos=${catalogosQuery}&filter=${diagFilter}`,
          { signal: controller.signal }
        );
        const j = await res.json();
        if (mounted.current) setDiag(j.items ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError")
          addLog("Erro ao filtrar diagnósticos", "error");
      }
    };

    run();
    return () => controller.abort();
  }, [diagFilter]);

  /* -----------------------------------------
     TOGGLE CATÁLOGOS
  ----------------------------------------- */

  const toggleCatalogo = (key: string) => {
    setCatalogos((prev) => {
      if (key === "todos") {
        const val = !prev.todos;
        return {
          modelos: val,
          falhas: val,
          responsabilidades: val,
          naoMostrar: val,
          todos: val,
        };
      }
      const novo = { ...prev, [key]: !prev[key] };
      novo.todos =
        novo.modelos &&
        novo.falhas &&
        novo.responsabilidades &&
        novo.naoMostrar;
      return novo;
    });
  };

  /* -----------------------------------------
     KPIs Derivadas
  ----------------------------------------- */

  const total = Number(stats?.totalItems ?? 0);
  const totalDefeitos = Number(stats?.totalDefeitos ?? 0);
  const notIdentified = Number(stats?.notIdentified ?? 0);
  const aiOverall = Number(stats?.percentIdentified ?? 0);
  const perBase = stats?.perBase ?? {};
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* -----------------------------------------
     EXPORTAÇÃO
  ----------------------------------------- */

  return {
    // estados
    fonte,
    setFonte,

    catalogos,
    toggleCatalogo,

    diagFilter,
    setDiagFilter,

    stats,
    diag,

    logs,
    progress,
    loading,
    loaderMessage,    // 🔥 NECESSÁRIO PARA O LOADER PREMIUM

    // KPIs derivadas
    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  };
}