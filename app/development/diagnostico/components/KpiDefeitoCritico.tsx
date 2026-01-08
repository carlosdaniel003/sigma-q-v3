"use client";

export default function KpiDefeitoCritico({
  data,
}: {
  data?: {
    codigo: string;
    descricao: string;
    npr: number;
  };
}) {
  // ✅ SAFETY CHECK: Impede o erro de leitura de 'npr'
  if (!data) {
    return (
      <div
        className="kpi-card"
        style={{
          padding: "18px 20px",
          borderRadius: 16,
          border: "1px dashed rgba(255,255,255,0.1)",
          minHeight: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Sem dados críticos
      </div>
    );
  }

  /* ======================================================
     COR DINÂMICA PELO NPR
  ====================================================== */
  const nprValue = data.npr || 0;
  
  const nivel =
    nprValue >= 40 ? "critico" : nprValue >= 25 ? "alerta" : "ok";

  const color =
    nivel === "critico"
      ? "#ef4444"
      : nivel === "alerta"
      ? "#f59e0b"
      : "#22c55e";

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
        borderLeft: `6px solid ${color}`,
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
        Defeito Crítico (NPR)
      </span>

      {/* DESCRIÇÃO DO DEFEITO */}
      <strong
        style={{
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#ffffff",
          wordBreak: "break-word",
        }}
      >
        {data.descricao || "-"}
      </strong>

      {/* NPR */}
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color,
          opacity: 0.95,
        }}
      >
        NPR {nprValue}
      </span>
    </div>
  );
}