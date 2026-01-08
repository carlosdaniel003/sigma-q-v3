"use client";

export default function DefeitosCriticosNpr({
  data,
}: {
  data?: { // ⚠️ Tornamos opcional para evitar quebra
    codigo: string;
    descricao: string;
    severidade: number;
    ocorrencia: number;
    deteccao: number;
    npr: number;
  }[];
}) {
  // ✅ SAFETY CHECK: Garante que 'lista' seja sempre um array válido
  const lista = data || [];

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
      }}
    >
      {/* TÍTULO */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "#e5e7eb",
        }}
      >
        Defeitos Críticos (Top 5 NPR)
      </h3>

      {/* ESTADO VAZIO */}
      {lista.length === 0 && (
        <span
          style={{
            fontSize: 13,
            color: "#94a3b8",
            opacity: 0.85,
          }}
        >
          Nenhum defeito crítico identificado para os filtros aplicados.
        </span>
      )}

      {/* LISTA TOP 5 */}
      {lista.map((d, i) => {
        const corNpr =
          d.npr >= 40
            ? "#ef4444"
            : d.npr >= 25
            ? "#f59e0b"
            : "#22c55e";

        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr repeat(4, 1fr)",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              borderLeft: `5px solid ${corNpr}`,
              alignItems: "center",
            }}
          >
            {/* DESCRIÇÃO */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong
                style={{
                  fontSize: 14,
                  color: "#f8fafc",
                }}
              >
                {d.descricao}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  opacity: 0.8,
                }}
              >
                Código: {d.codigo}
              </span>
            </div>

            {/* SEVERIDADE */}
            <span style={metricStyle}>
              S <strong>{d.severidade}</strong>
            </span>

            {/* OCORRÊNCIA */}
            <span style={metricStyle}>
              O <strong>{d.ocorrencia}</strong>
            </span>

            {/* DETECÇÃO */}
            <span style={metricStyle}>
              D <strong>{d.deteccao}</strong>
            </span>

            {/* NPR */}
            <span
              style={{
                ...metricStyle,
                fontWeight: 700,
                color: corNpr,
              }}
            >
              NPR {d.npr}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ======================================================
   ESTILO PADRÃO DAS MÉTRICAS
====================================================== */
const metricStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#e5e7eb",
  display: "flex",
  gap: 4,
  justifyContent: "center",
  alignItems: "center", // Garante alinhamento vertical
};