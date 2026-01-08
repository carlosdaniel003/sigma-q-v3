"use client";

export default function KpiPrincipalDefeito({
  data,
}: {
  data?: {
    nome: string;
    ocorrencias: number;
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

  return (
    <div
      className="kpi-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "18px 20px",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        minHeight: 110,
        justifyContent: "center",
      }}
    >
      {/* LABEL */}
      <span
        style={{
          fontSize: 12,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        Principal Causa
      </span>

      {/* VALOR PRINCIPAL */}
      <strong
        style={{
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#ffffff",
          wordBreak: "break-word",
        }}
      >
        {data.nome || "-"}
      </strong>

      {/* SUBTEXTO */}
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
  );
}