"use client";

import { ArrowDown, ArrowUp, Minus, Activity } from "lucide-react";

interface KpiStatusProps {
  data?: {
    // ✅ Agora aceita os campos de tendência vindos do diagnósticoIa
    tendencia?: "melhora" | "piora" | "estavel" | "indefinido";
    variacaoPercentual?: number;
    
    // Fallback para manter compatibilidade se necessário
    mensagem?: string;
  };
}

export default function KpiStatusGeral({ data }: KpiStatusProps) {
  // ✅ SAFETY CHECK
  if (!data || !data.tendencia) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "18px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 16,
          minHeight: 120,
          justifyContent: "center",
          opacity: 0.6,
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Tendência Geral</span>
        <strong style={{ fontSize: 20, color: "#cbd5e1" }}>-</strong>
      </div>
    );
  }

  /* ======================================================
     CONFIGURAÇÃO VISUAL (BASEADA EM PPM)
  ====================================================== */
  const config = {
    melhora: {
      label: "CENÁRIO POSITIVO",
      color: "#22c55e", // Verde
      bgGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(255,255,255,0.02))",
      icon: <ArrowDown size={20} strokeWidth={3} />,
      msg: "Redução de PPM",
    },
    piora: {
      label: "ATENÇÃO",
      color: "#ef4444", // Vermelho
      bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255,255,255,0.02))",
      icon: <ArrowUp size={20} strokeWidth={3} />,
      msg: "Aumento de PPM",
    },
    estavel: {
      label: "ESTÁVEL",
      color: "#3b82f6", // Azul
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255,255,255,0.02))",
      icon: <Minus size={20} strokeWidth={3} />,
      msg: "Variação não significativa",
    },
    indefinido: {
      label: "INDEFINIDO",
      color: "#94a3b8", // Cinza
      bgGradient: "rgba(255,255,255,0.03)",
      icon: <Activity size={20} />,
      msg: "Sem histórico suficiente",
    },
  }[data.tendencia] || {
    label: "INDEFINIDO",
    color: "#94a3b8",
    bgGradient: "rgba(255,255,255,0.03)",
    icon: <Activity size={20} />,
    msg: "-",
  };

  // Formatação da porcentagem
  const variacao = data.variacaoPercentual ?? 0;
  const variacaoAbs = Math.abs(variacao).toFixed(1);
  const sinal = variacao > 0 ? "+" : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        background: config.bgGradient,
        border: "1px solid rgba(255,255,255,0.10)",
        borderLeft: `6px solid ${config.color}`,
        borderRadius: 16,
        minHeight: 120,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* TÍTULO */}
      <span
        style={{
          fontSize: 11,
          letterSpacing: 0.8,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "#94a3b8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        Tendência de Qualidade
        {/* Pequeno badge visual */}
        <span style={{ 
            width: 8, height: 8, 
            borderRadius: "50%", 
            backgroundColor: config.color,
            boxShadow: `0 0 8px ${config.color}`
        }}/>
      </span>

      {/* STATUS PRINCIPAL */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <div
          style={{
            color: config.color,
            background: "rgba(0,0,0,0.2)",
            padding: 8,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {config.icon}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1,
            }}
          >
            {config.label}
          </strong>
          <span style={{ fontSize: 13, color: config.color, marginTop: 4, fontWeight: 600 }}>
            {config.msg}
          </span>
        </div>
      </div>

      {/* VARIAÇÃO PERCENTUAL */}
      {data.tendencia !== "indefinido" && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 300, color: "#e2e8f0" }}>
            {sinal}{variacaoAbs}%
          </span>
          <span style={{ fontSize: 12, color: "#64748b", maxWidth: 120, lineHeight: 1.2 }}>
            em relação ao período anterior
          </span>
        </div>
      )}

      {data.tendencia === "indefinido" && (
         <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
            Aguardando mais dados para cálculo de tendência.
         </div>
      )}
    </div>
  );
}