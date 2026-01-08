"use client";

import SidebarFiltros from "./components/SidebarFiltros";
import KpiPrincipalCausa from "./components/KpiPrincipalCausa";
import KpiPrincipalDefeito from "./components/KpiPrincipalDefeito";
import KpiDefeitoCritico from "./components/KpiDefeitoCritico";
import KpiStatusGeral from "./components/KpiStatusGeral";
import DefeitosCriticosNpr from "./components/DefeitosCriticosNpr";
import PrincipaisCausas from "./components/PrincipaisCausas";
import DiagnosticoIaTexto from "./components/DiagnosticoIaTexto";
import DiagnosticoLoading from "./components/DiagnosticoLoading";

import { useDiagnosticoIa } from "./hooks/useDiagnosticoIa";

export default function DiagnosticoIaPage() {
  const { data, loading, error } = useDiagnosticoIa();

  /* ======================================================
     ✅ LÓGICA DE ESTADO VAZIO (SEM PRODUÇÃO)
     Detecta o sinal que criamos no backend (diagnosticoAiEngine)
  ====================================================== */
  const isSemProducao = data?.diagnosticoIa?.titulo === "Sem Produção Registrada";

  /* ======================================================
     LAYOUT BASE (COM SIDEBAR)
  ====================================================== */
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 24,
        color: "#fff",
        minHeight: "100vh",
        alignItems: "start",
      }}
    >
      {/* SIDEBAR FIXA A ESQUERDA */}
      <SidebarFiltros />

      {/* ÁREA DE CONTEÚDO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* CABEÇALHO */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Diagnóstico de IA</h1>
          <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>
            Análise inteligente de falhas e riscos baseada em FMEA e histórico.
          </p>
        </div>

        {/* ESTADOS DE CARREGAMENTO / ERRO / VAZIO */}
        
        {loading && (
            <div style={{ marginTop: 40 }}>
                <DiagnosticoLoading />
            </div>
        )}
        
        {error && <div style={{ padding: 20, color: "#ef4444" }}>Erro: {error}</div>}

        {!loading && !error && !data && (
          <div
            style={{
              padding: 40,
              border: "1px dashed rgba(255,255,255,0.15)",
              borderRadius: 16,
              textAlign: "center",
              color: "#94a3b8",
              marginTop: 20
            }}
          >
            Selecione os filtros na barra lateral para gerar o diagnóstico.
          </div>
        )}

        {/* DASHBOARD RENDERIZADO */}
        {!loading && data && (
          <>
            {/* ✅ SE NÃO TIVER PRODUÇÃO, MOSTRA O AVISO AMIGÁVEL */}
            {isSemProducao ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "60px 20px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 24,
                        textAlign: "center",
                        marginTop: 20,
                    }}
                >
                    {/* Ícone ilustrativo */}
                    <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.8 }}>📊</div>
                    
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>
                        Não houve produção neste período
                    </h2>
                    
                    <p style={{ maxWidth: 500, color: "#94a3b8", lineHeight: 1.6 }}>
                        O sistema não encontrou registros de produção para os filtros selecionados (Categoria/Modelo/Data). 
                        Sem produção, não é possível calcular indicadores de qualidade (PPM) ou risco.
                    </p>
                    
                    <div 
                        style={{ 
                            marginTop: 24, 
                            padding: "8px 16px", 
                            background: "rgba(59, 130, 246, 0.1)", 
                            color: "#60a5fa", 
                            borderRadius: 8,
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            border: "1px solid rgba(59, 130, 246, 0.2)"
                        }}
                    >
                        💡 Dica: Tente selecionar um período anterior ou outro modelo.
                    </div>
                </div>
            ) : (
                /* ✅ SE TIVER DADOS, MOSTRA O DASHBOARD NORMAL */
                <>
                    {/* LINHA 1: KPIS SUPERIORES */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 16,
                      }}
                    >
                      <KpiPrincipalCausa data={data.principalCausa} />
                      <KpiPrincipalDefeito data={data.principalDefeito} />
                      <KpiDefeitoCritico data={data.defeitoCritico} />
                      <KpiStatusGeral data={data.statusGeral} />
                    </div>

                    {/* LINHA 2: BLOCOS CENTRAIS (Listas) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 24,
                      }}
                    >
                      <DefeitosCriticosNpr data={data.defeitosCriticos} />
                      <PrincipaisCausas data={data.principaisCausas} />
                    </div>

                    {/* LINHA 3: DIAGNÓSTICO IA (Texto) */}
                    <DiagnosticoIaTexto data={data.diagnosticoIa} />
                </>
            )}
          </>
        )}
      </div>
    </div>
  );
}