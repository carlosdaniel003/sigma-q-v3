"use client";

import { useState } from "react";

export default function PrincipaisCausas({
  data,
}: {
  data?: {
    nome: string;
    ocorrencias: number;
    detalhes?: {
      nome: string;
      ocorrencias: number;
      modelos?: { nome: string; ocorrencias: number }[];
    }[];
  }[];
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredDetail, setHoveredDetail] = useState<string | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const listaCausas = data || [];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "#e5e7eb",
        }}
      >
        Principais Causas
      </h3>

      {listaCausas.length === 0 && (
        <span
          style={{
            fontSize: 13,
            color: "#94a3b8",
            opacity: 0.85,
          }}
        >
          Nenhuma causa crítica identificada para os filtros aplicados.
        </span>
      )}

      {listaCausas.map((c, i) => {
        const isExpanded = expandedIndex === i;
        const rankColor =
          i === 0
            ? "#ef4444"
            : i === 1
            ? "#f59e0b"
            : "#22c55e";

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            
            <div
              onClick={() => toggleExpand(i)}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 12,
                background: isExpanded 
                  ? "rgba(255,255,255,0.08)" 
                  : "rgba(255,255,255,0.03)",
                borderLeft: `5px solid ${rankColor}`,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 14, color: rankColor }}>
                #{i + 1}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column'}}>
                  <strong style={{ fontSize: 14, color: "#f8fafc" }}>
                    {c.nome}
                  </strong>
                  <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                     {isExpanded ? "Clique para fechar" : "Clique para ver detalhes"}
                  </span>
              </div>

              <span
                style={{
                  fontSize: 13,
                  color: "#e5e7eb",
                  fontWeight: isExpanded ? 700 : 400,
                }}
              >
                {c.ocorrencias.toLocaleString("pt-BR")} ocorrências
              </span>
            </div>

            {isExpanded && c.detalhes && (
              <div
                style={{
                  padding: "12px 16px",
                  marginLeft: 12,
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "0 0 8px 8px",
                  borderLeft: `2px solid ${rankColor}`,
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <div style={{ marginBottom: 12, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Composição do Agrupamento:
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.detalhes.map((detalhe, idx) => {
                        const uniqueKey = `${i}-${idx}`;
                        const isHovered = hoveredDetail === uniqueKey;
                        const temModelos = detalhe.modelos && detalhe.modelos.length > 0;

                        return (
                            <div 
                                key={idx}
                                onMouseEnter={() => setHoveredDetail(uniqueKey)}
                                onMouseLeave={() => setHoveredDetail(null)}
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    fontSize: 13, 
                                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                    paddingBottom: 6,
                                    cursor: temModelos ? "help" : "default",
                                    position: "relative"
                                }}
                            >
                                <div style={{display: "flex", alignItems: "center", gap: 6}}>
                                    <span style={{ color: isHovered && temModelos ? "#fff" : '#e2e8f0', transition: "color 0.2s" }}>
                                        {detalhe.nome}
                                    </span>
                                    {temModelos && (
                                        <span style={{ fontSize: 10, color: rankColor, opacity: 0.7 }}></span>
                                    )}
                                </div>
                                
                                <span style={{ color: '#94a3b8' }}>{detalhe.ocorrencias}</span>

                                {/* ✅ TOOLTIP COM SCROLL PARA LISTAS GRANDES */}
                                {isHovered && temModelos && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "100%",
                                            left: "10px",
                                            marginBottom: "8px",
                                            zIndex: 50,
                                            background: "#1e293b",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 8,
                                            padding: "12px",
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                            minWidth: "240px",
                                            maxWidth: "320px",
                                            // ✅ SCROLL: Se a lista for grande, permite rolar
                                            maxHeight: "250px",
                                            overflowY: "auto",
                                            pointerEvents: "auto", 
                                            animation: "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                                        }}
                                        // Garante que o mouse no tooltip não feche ele
                                        onMouseEnter={() => setHoveredDetail(uniqueKey)}
                                        onMouseLeave={() => setHoveredDetail(null)}
                                    >
                                        <div style={{ 
                                            fontSize: 10, 
                                            fontWeight: 700, 
                                            color: "#94a3b8", 
                                            marginBottom: 8, 
                                            textTransform: "uppercase",
                                            borderBottom: "1px solid rgba(255,255,255,0.1)", 
                                            paddingBottom: 6,
                                            display: "flex", 
                                            justifyContent: "space-between",
                                            position: "sticky", 
                                            top: -12, 
                                            background: "#1e293b",
                                            zIndex: 10
                                        }}>
                                            <span>Modelos ({detalhe.modelos!.length})</span>
                                            <span>Qtd</span>
                                        </div>

                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {detalhe.modelos!.map((mod, mi) => (
                                                <div 
                                                    key={mi}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        background: "rgba(255,255,255,0.05)",
                                                        borderRadius: 4,
                                                        padding: "4px 8px",
                                                        border: "1px solid rgba(255,255,255,0.05)",
                                                        // Layout compacto e agradável
                                                    }}
                                                >
                                                    <span style={{ fontSize: 11, color: "#f8fafc", fontWeight: 500 }}>
                                                        {mod.nome}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: rankColor, fontWeight: 700 }}>
                                                        {mod.ocorrencias}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Seta do Tooltip */}
                                        <div style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: "20px",
                                            borderWidth: "6px",
                                            borderStyle: "solid",
                                            borderColor: "#1e293b transparent transparent transparent",
                                        }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {c.detalhes.length === 0 && (
                        <span style={{ fontSize: 12, color: "#64748b" }}>Sem detalhes disponíveis.</span>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Estilos Globais de Animação e Scrollbar */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(4px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Custom Scrollbar for Tooltip */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02); 
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15); 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25); 
        }
      `}</style>
    </div>
  );
}