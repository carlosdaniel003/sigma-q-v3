"use client";

import React from "react";

export default function PainelInconsistencias({ breakdown }: { breakdown: any }) {
  const items = [
    { key: "modelos", label: "Modelos Desconhecidos" },
    { key: "responsabilidades", label: "Resp. / Fornecedor Inválido" },
    { key: "falhas", label: "Códigos de Falha Inválidos" },
    { key: "naoMostrar", label: "Itens Ocultos (Índice)" },
  ].map((i) => ({
    ...i,
    value: breakdown?.[i.key] ?? 0,
  }));

  // Soma total de inconsistências
  const total = items.reduce((s, i) => s + i.value, 0);

  const enriched = items.map((i, index) => {
    // Percentual relativo ao total (usado tanto para o texto quanto para a barra agora)
    const pctReal = total > 0 ? (i.value / total) * 100 : 0;

    // Lógica de Cor:
    // 1. Se for o PRIMEIRO item (index 0) e tiver valor > 0, é VERMELHO (#ef4444).
    // 2. Se for 0, é VERDE (#4ade80) (ou cinza escuro se preferir neutro).
    // 3. Os outros itens seguem a lógica de severidade (Amarelo se > 20%, senão Verde).
    let color = "#4ade80"; 
    
    if (index === 0) {
        color = i.value > 0 ? "#ef4444" : "#4ade80";
    } else {
        color = pctReal > 20 ? "#facc15" : "#4ade80";
    }

    return {
      ...i,
      pct: pctReal, // Usaremos este valor para a largura da barra também
      color
    };
  });

  return (
    <div 
      className="inconsistencias-card fade-in"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "20px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <h4 style={{ 
        color: "#fff", 
        fontSize: "1rem", 
        marginBottom: "20px", 
        fontWeight: 600 
      }}>
        Detalhamento de Inconsistências
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {enriched.map((item) => (
          <div 
            key={item.key} 
            className="incons-item-hover"
            style={{
              display: "grid",
              gridTemplateColumns: "200px 40px 1fr 60px", 
              alignItems: "center",
              gap: "16px",
              background: "rgba(255,255,255,0.02)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.05)",
              cursor: "default",
              transition: "transform 0.2s ease, background-color 0.2s ease"
            }}
            // Animação inline simples (hover effect)
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* 1. Nome do Item */}
            <span style={{ 
              color: "rgba(255,255,255,0.8)", 
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {item.label}
            </span>

            {/* 2. Quantidade */}
            <span style={{ 
              color: item.color, 
              fontWeight: 700, 
              fontSize: "1rem",
              textAlign: "right"
            }}>
              {item.value}
            </span>

            {/* 3. Barra de Progresso (Agora proporcional ao total) */}
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${item.pct}%`, // AGORA USA A PORCENTAGEM REAL DO TOTAL
                height: "100%",
                background: item.color,
                borderRadius: "10px",
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }} />
            </div>

            {/* 4. Porcentagem */}
            <span style={{ 
              color: item.color, 
              fontWeight: 600, 
              fontSize: "0.85rem",
              textAlign: "right"
            }}>
              {item.pct.toFixed(1)}%
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}