"use client";

import { useEffect, useRef, useState } from "react";
import { useDefectsData } from "../../context/DefectsContext";

/* -------------------------------------------------------
   TIPOS OFICIAIS
------------------------------------------------------- */
export type Fonte = "todas" | "af" | "lcm" | "produto acabado" | "pth";
export type FonteFiltro = "todas" | "af" | "lcm" | "produto" | "pth";

interface LogEntry {
  ts: string;
  msg: string;
  type: "info" | "success" | "error" | "process";
}

/* -------------------------------------------------------
   HOOK PRINCIPAL — SOMENTE CONSUMO
------------------------------------------------------- */
export default function useValidacaoDefeitos() {
  /* -----------------------------------------
     CONTEXTO — FONTE ÚNICA DA VERDADE
  ----------------------------------------- */
  // diag aqui vem BRUTO do backend (todas as inconsistências)
  const { stats, diag } = useDefectsData();

  /* -----------------------------------------
     ESTADOS DE UI
  ----------------------------------------- */
  const [fonte, setFonte] = useState<Fonte>("todas");
  const [diagFilter, setDiagFilter] = useState<FonteFiltro>("todas");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const mounted = useRef(true);

  /* -----------------------------------------
     LOGGER
  ----------------------------------------- */
  const addLog = (msg: string, type: LogEntry["type"] = "info") => {
    if (!mounted.current) return;

    const ts = new Date().toLocaleTimeString("pt-BR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prev) => [...prev, { ts, msg, type }]);
  };

  /* -----------------------------------------
     STATUS DE CARGA
  ----------------------------------------- */
  useEffect(() => {
    mounted.current = true;

    if (stats && stats.totalItems > 0) {
      addLog(
        `Validação concluída (${stats.totalItems.toLocaleString()} registros analisados)`,
        "success"
      );
    } else {
      addLog("Aguardando dados de validação do backend…", "process");
    }

    return () => {
      mounted.current = false;
    };
  }, [stats]);

  /* -----------------------------------------
     KPIs — 100% BACKEND
  ----------------------------------------- */
  const total = stats?.totalItems ?? 0;
  const totalDefeitos = stats?.totalDefeitos ?? 0;
  const notIdentified = stats?.notIdentified ?? 0;
  const aiOverall = stats?.percentIdentified ?? 0;
  const perBase = stats?.perBase ?? {};
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* -----------------------------------------
     🔑 FILTRO POR BASE (SIDEBAR)
     → Sidebar decide a BASE
     → Diagnóstico decide o detalhe
  ----------------------------------------- */
  const diagByFonte = (() => {
    if (!Array.isArray(diag)) return [];

    // TODAS = sem filtro
    if (fonte === "todas") return diag;

    // Normalização: "produto acabado" → "produto"
    const fonteNormalizada =
      fonte === "produto acabado" ? "produto" : fonte;

    return diag.filter(
      (d: any) =>
        String(d.fonte || "").toLowerCase() === fonteNormalizada
    );
  })();

  /* -----------------------------------------
     EXPORTAÇÃO
  ----------------------------------------- */
  return {
    // filtros
    fonte,
    setFonte,

    diagFilter,
    setDiagFilter,

    // dados OFICIAIS
    stats,

    // ✅ AGORA O DIAGNÓSTICO RECEBE
    // SOMENTE OS DADOS DA BASE SELECIONADA
    diag: diagByFonte,

    // logs
    logs,

    // KPIs
    total,
    totalDefeitos,
    notIdentified,
    aiOverall,
    perBase,
    breakdown,
  };
}