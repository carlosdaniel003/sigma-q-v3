"use client";

import React from "react";
import { Factory, Activity, AlertTriangle } from "lucide-react";

import "./producao.css";

import { useValidacao } from "./hooks/useValidacao";

import KPIsGerais from "./components/KPIsGerais";
import SidebarCategorias from "./components/SidebarCategorias";
import TabsNavegacao from "./components/TabsNavegacao";

import AbaProblemas from "./components/AbaProblemas";
import AbaDivergencias from "./components/AbaDivergencias";
import AbaDiagnostico from "./components/AbaDiagnostico";

import ResumoGeral from "./components/ResumoGeral"; // Visão Geral Inteligente

export default function ProducaoPage() {
  const {
    loading,
    error,
    overall,
    categories,

    // novos KPIs
    categoriasSaudaveis,
    modelosCriticos,
    divergenciaGlobal,

    // estado da página
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
    showTop,
    currentProblems,
    currentStats,
    divergenciasByCategory,
    diagnostico,
    data,

    load,
  } = useValidacao();

  // ===============================
  // LOADING
  // ===============================
  if (loading)
    return (
      <div className="producao-container loader-container">
        <Activity className="animate-spin" size={40} style={{ color: "var(--brand)" }} />
        <p>Processando Validação...</p>
      </div>
    );

  // ===============================
  // ERRO
  // ===============================
  if (error)
    return (
      <div className="producao-container loader-container">
        <AlertTriangle size={40} color="#ef4444" />
        <p className="error-text">{error}</p>
        <button onClick={load} className="sidebar-btn" style={{ marginTop: 20 }}>
          Tentar Novamente
        </button>
      </div>
    );

  // ===============================
  // PAGE RENDER
  // ===============================
  return (
    <div className="producao-container fade-in">
      
      {/* HEADER */}
      <header className="page-header">
        <h1>
          <Factory size={28} style={{ color: "var(--brand)" }} /> Validação de Produção
        </h1>
        <div className="muted small">
          Automático • {overall.totalRows?.toLocaleString()} registros analisados
        </div>
      </header>

      {/* KPIs NOVOS + ANTIGOS */}
      <KPIsGerais
        overall={overall}
        categories={categories}
        categoriasSaudaveis={categoriasSaudaveis}
        modelosCriticos={modelosCriticos}
      />

      <div className="split-view">

        {/* SIDEBAR */}
        <SidebarCategorias
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setActiveTab={setActiveTab}
        />

        {/* MAIN CONTENT */}
        <main className="right-panel custom-scroll">

          {/* ===============================
              VISÃO GERAL (NENHUMA CATEGORIA)
          =============================== */}
          {!selectedCategory && (
            <ResumoGeral 
              data={data} 
              diagnostico={diagnostico}
              categoriasSaudaveis={categoriasSaudaveis}
              modelosCriticos={modelosCriticos}
              divergenciaGlobal={divergenciaGlobal}
            />
          )}

          {/* ===============================
              CATEGORIA SELECIONADA → TABS
          =============================== */}
          {selectedCategory && (
            <>
              <TabsNavegacao
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedCategory={selectedCategory}
              />

              {activeTab === "problemas" && (
                <AbaProblemas
                  currentProblems={currentProblems}
                  selectedCategory={selectedCategory}
                  currentStats={currentStats}
                  showTop={showTop}
                />
              )}

              {activeTab === "divergencias" && (
                <AbaDivergencias
                  divergenciasByCategory={divergenciasByCategory}
                  selectedCategory={selectedCategory}
                  data={data}
                />
              )}

              {activeTab === "diagnostico" && (
                <AbaDiagnostico
                  diagnostico={diagnostico}
                  selectedCategory={selectedCategory}
                  divergenciasByCategory={divergenciasByCategory}
                  data={data}
                />
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}