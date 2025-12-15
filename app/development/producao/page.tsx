"use client";

import React from "react";
import { Factory, Activity, AlertTriangle } from "lucide-react";

import "./producao-premium.css";
import { useValidacao } from "./hooks/useValidacao";

import KPIsGerais from "./components/KPIsGerais";
import SidebarCategorias from "./components/SidebarCategorias";

import ResumoGeral from "./components/ResumoGeral";
import DiagnosticoGeral from "./components/DiagnosticoGeral";

// 🔥 NOVOS COMPONENTES
import DetalhamentoPorModelo from "./components/DetalhamentoPorModelo";
import InsightInteligente from "./components/InsightInteligente";

export default function ProducaoPage({ embedded = false }: { embedded?: boolean }) {

  const {
    loading,
    error,
    overall,
    categories,

    categoriasSaudaveis,
    modelosCriticos,
    divergenciaGlobal,

    selectedCategory,
    setSelectedCategory,

    currentStats,
    diagnostico,
    data,

    load,
  } = useValidacao();

  /* ============================================================
      LOADING PREMIUM + PROGRESSO SUAVE
  ============================================================ */

  const [progress, setProgress] = React.useState(0);
  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (loading) {
      setProgress(0);
      intervalRef.current = window.setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 7, 90));
      }, 180);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading]);

  React.useEffect(() => {
    if (!loading) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      let rafId: number | null = null;
      const start = performance.now();
      const duration = 500;

      function animate(now: number) {
        const t = Math.min(1, (now - start) / duration);
        setProgress(prev => prev + (100 - prev) * t);
        if (t < 1) rafId = requestAnimationFrame(animate);
      }

      rafId = requestAnimationFrame(animate);
      return () => rafId && cancelAnimationFrame(rafId);
    }
  }, [loading]);

  const showLoader = loading || progress < 100;

  if (showLoader)
    return (
      <div className="loading-premium-wrapper fade-in">
        <div className="loading-card">
          <Activity size={42} className="pulse" style={{ color: "var(--brand)" }} />
          <p className="loading-title">Processando Validação…</p>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <span className="progress-percent">{Math.floor(progress)}%</span>
        </div>
      </div>
    );

  /* ============================================================
        ERRO
  ============================================================ */

  if (error)
    return (
      <div className="producao-wrapper fade-in">
        <AlertTriangle size={40} color="#ef4444" />
        <p className="error-text">{error}</p>

        <button onClick={load} className="reload-btn">
          Tentar Novamente
        </button>
      </div>
    );

  /* ============================================================
        PÁGINA CARREGADA
  ============================================================ */

  return (
    <div className="producao-wrapper fade-in">

      {/* HEADER */}
      <header className="page-header">
        <h1>
          <Factory size={28} style={{ color: "var(--brand)" }} />
          Validação de Produção
        </h1>

        <div className="muted small">
          Automático • {overall.totalRows?.toLocaleString()} registros analisados
        </div>
      </header>

      {/* LAYOUT */}
      <div className="split-view">

        {/* SIDEBAR */}
        <SidebarCategorias
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* MAIN PAINEL (corrigido: KPIs dentro aqui) */}
        <main className="right-panel custom-scroll">

          {/* KPIs (AGORA ALINHADOS CORRETAMENTE) */}
          <div className="kpis-wrapper">
            <KPIsGerais
              overall={overall}
              categories={categories}
              categoriasSaudaveis={categoriasSaudaveis}
              modelosCriticos={modelosCriticos}
              modelosSemDefeitos={diagnostico?.producaoSemDefeitos?.length ?? 0}
              defeitosSemProducao={diagnostico?.defeitosSemProducao?.length ?? 0}
            />
          </div>

          {/* VISÃO GERAL */}
          {!selectedCategory && (
            <>
              <ResumoGeral
                data={data}
                diagnostico={diagnostico}
                categoriasSaudaveis={categoriasSaudaveis}
                modelosCriticos={modelosCriticos}
                divergenciaGlobal={divergenciaGlobal}
              />

              {diagnostico && (
                <DiagnosticoGeral
                  data={data}
                  diagnostico={diagnostico}
                />
              )}
            </>
          )}

          {/* CATEGORIA SELECIONADA */}
          {selectedCategory && currentStats && (
            <div className="glass-card fade-in" style={{ padding: 20, marginTop: 20 }}>

              <DetalhamentoPorModelo categoria={selectedCategory} stats={currentStats} />

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  margin: "25px 0"
                }}
              />

              <InsightInteligente
  categoria={selectedCategory}
  stats={currentStats}
  diagnostico={diagnostico}
  overall={overall}
/>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}