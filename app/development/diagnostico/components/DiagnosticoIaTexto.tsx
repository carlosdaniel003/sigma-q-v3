"use client";

import React from "react";

/* ======================================================
   PARSER DE TEXTO PARA NEGRITO
   Transforma: "Olá **Mundo**" em <span>Olá <strong>Mundo</strong></span>
====================================================== */
function renderHighlightedText(text: string) {
  // Divide o texto onde encontrar **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Remove os asteriscos e renderiza com estilo
      const content = part.slice(2, -2);
      return (
        <strong
          key={index}
          style={{
            color: "#ffffff",
            fontWeight: 700,
            background: "rgba(255,255,255,0.1)", // Fundo sutil para destacar
            padding: "0 4px",
            borderRadius: 4,
          }}
        >
          {content}
        </strong>
      );
    }
    // Retorna texto normal
    return <span key={index}>{part}</span>;
  });
}

export default function DiagnosticoIaTexto({
  data,
}: {
  data?: {
    titulo: string;
    texto: string;
    // Tipagem atualizada
    tendencia?: "melhora" | "piora" | "estavel" | "indefinido";
    indicadoresChave: string[];
  };
}) {
  // ✅ SAFETY CHECK
  if (!data) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 18,
          padding: 28,
          color: "#94a3b8",
          textAlign: "center",
          border: "1px dashed rgba(255,255,255,0.1)",
        }}
      >
        Aguardando dados para gerar o diagnóstico...
      </div>
    );
  }

  // ✅ DEFINIÇÃO VISUAL BASEADA NA TENDÊNCIA
  const config = {
    melhora: {
      color: "#22c55e", // Verde (Bom)
      bg: "rgba(34, 197, 94, 0.08)",
      border: "rgba(34, 197, 94, 0.2)",
      label: "CENÁRIO POSITIVO",
      icon: "📉", // Gráfico descendo (menos defeitos)
    },
    piora: {
      color: "#ef4444", // Vermelho (Ruim)
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.2)",
      label: "CENÁRIO NEGATIVO",
      icon: "📈", // Gráfico subindo (mais defeitos)
    },
    estavel: {
      color: "#3b82f6", // Azul (Neutro)
      bg: "rgba(59, 130, 246, 0.08)",
      border: "rgba(59, 130, 246, 0.2)",
      label: "ESTÁVEL",
      icon: "", // ✅ REMOVIDO: Emoji de seta azul retirado conforme solicitado
    },
    indefinido: {
      color: "#94a3b8",
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.1)",
      label: "ANÁLISE DE PERÍODO",
      icon: "📊",
    },
  }[data.tendencia || "indefinido"];

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BARRA LATERAL COLORIDA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: config.color,
        }}
      />

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Só renderiza o span se houver ícone, para não ficar buraco vazio */}
          {config.icon && <span style={{ fontSize: 24 }}>{config.icon}</span>}
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: -0.5,
            }}
          >
            {data.titulo}
          </h2>
        </div>

        <span
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            background: config.color,
            color: "#0f172a", // Contraste preto no fundo colorido
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {config.label}
        </span>
      </div>

      {/* TEXTO PRINCIPAL (COM PARSER) */}
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "#cbd5e1",
          display: "flex",
          flexDirection: "column",
          gap: 12, // Espaço entre parágrafos
        }}
      >
        {data.texto.split("\n\n").map((paragrafo, idx) => (
          <p key={idx}>{renderHighlightedText(paragrafo)}</p>
        ))}
      </div>

      {/* RODAPÉ (INDICADORES) */}
      {data.indicadoresChave && data.indicadoresChave.length > 0 && (
        <div
          style={{
            marginTop: 4,
            paddingTop: 16,
            borderTop: `1px solid ${config.border}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {data.indicadoresChave.map((ind, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 12,
                color: "#e2e8f0",
                background: "rgba(0,0,0,0.2)",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              • {ind}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}