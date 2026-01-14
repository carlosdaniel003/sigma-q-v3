// app\development\diagnostico\components\KpiPrincipalCausa.tsx
"use client";

import { AlertTriangle, Repeat } from "lucide-react";

export default function KpiPrincipalCausa({
  data,
}: {
  data?: {
    nome: string;
    ocorrencias: number;
    // ✅ Novo campo opcional injetado pelo backend
    periodosConsecutivos?: number;
  };
}) {
  // ✅ SAFETY CHECK
  if (!data) {
    return (
      <div className="kpi-card" style={{ padding: 20, opacity: 0.5 }}>
        Carregando...
      </div>
    );
  }

  // ✅ LÓGICA DE REINCIDÊNCIA (TOTAL)
  // Agora usamos o valor direto. Se apareceu 2 meses seguidos, mostra "2x".
  const totalPeriodos = data.periodosConsecutivos || 1;
  
  // Só mostra a tag se for uma sequência de 2 ou mais
  const isReincidente = totalPeriodos >= 2; 
  // Fica vermelho (crítico) se for uma sequência de 3 ou mais
  const isCritico = totalPeriodos >= 3;

  return (
    <div
      className="kpi-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // ✅ Centraliza todo o conteúdo verticalmente
        alignItems: "flex-start", // Alinha tudo à esquerda
        padding: "20px 24px",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        minHeight: 140, 
        gap: 12, // Espaçamento uniforme entre os elementos
      }}
    >
      {/* BLOCO: TÍTULO E NOME */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          Principal Agrupamento
        </span>

        <strong
          style={{
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#ffffff",
            wordBreak: "break-word",
          }}
        >
          {data.nome || "-"}
        </strong>
      </div>

      {/* BLOCO: TAG E CONTAGEM */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        
        {/* ✅ TAG AGORA FICA IMEDIATAMENTE ABAIXO DO NOME */}
        {isReincidente && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: isCritico ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
              border: `1px solid ${isCritico ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            }}
          >
            {isCritico ? (
                <AlertTriangle size={12} color="#fca5a5" strokeWidth={2.5} />
            ) : (
                <Repeat size={12} color="#fcd34d" strokeWidth={2.5} />
            )}
            
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: isCritico ? "#fca5a5" : "#fcd34d",
                textTransform: "uppercase",
              }}
            >
              {totalPeriodos}x Seguidas
            </span>
          </div>
        )}

        <span
          style={{
            fontSize: 13,
            color: "#cbd5e1",
            opacity: 0.9,
          }}
        >
          {data.ocorrencias ? data.ocorrencias.toLocaleString("pt-BR") : 0}{" "}
          ocorrências
        </span>
      </div>
    </div>
  );
}