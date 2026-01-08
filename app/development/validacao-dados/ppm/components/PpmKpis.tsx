"use client";

import {
  CpuChipIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

interface Props {
  meta: {
    totalVolume: number;
    totalDefeitos: number;
    ppmGeral: number | null;
    aiPrecision: number;
    itensSemProducao: number;
    itensSemDefeitos: number;

    // ✅ NOVO KPI
    ocorrencias: number;
  };
}

/* ======================================================
   🎨 REGRAS VISUAIS — PRECISÃO IA
====================================================== */
function getPrecisionClass(value: number) {
  if (value < 50) return "bad";
  if (value < 90) return "warn";
  return "ok";
}

export default function PpmKpis({ meta }: Props) {
  const precisionClass = getPrecisionClass(meta.aiPrecision);

  return (
    <div className="kpis-wrapper">
      <div className="kpi-row">
        {/* PRECISÃO DA IA */}
        <div className="stat-card">
          <div className="stat-label">
            <CpuChipIcon width={18} /> PRECISÃO DA IA
          </div>
          <div className={`stat-value ${precisionClass}`}>
            {meta.aiPrecision.toFixed(2)}%
          </div>
          <div className="stat-sub">qualidade da identificação</div>
        </div>

        {/* VOLUME PRODUZIDO */}
        <div className="stat-card">
          <div className="stat-label">
            <CubeIcon width={18} /> VOLUME PRODUZIDO
          </div>
          <div className="stat-value">
            {meta.totalVolume.toLocaleString()}
          </div>
          <div className="stat-sub">unidades analisadas</div>
        </div>

        {/* DEFEITOS */}
        <div className="stat-card">
          <div className="stat-label">
            <ExclamationTriangleIcon width={18} /> DEFEITOS
          </div>
          <div className="stat-value">
            {meta.totalDefeitos.toLocaleString()}
          </div>
          <div className="stat-sub">defeitos registrados</div>
        </div>
      </div>

      <div className="kpi-row">
        {/* PPM GERAL */}
        <div className="stat-card">
          <div className="stat-label">
            <ChartBarIcon width={18} /> PPM GERAL
          </div>
          <div className="stat-value highlight">
            {meta.ppmGeral !== null
              ? meta.ppmGeral.toFixed(2)
              : "—"}
          </div>
          <div className="stat-sub">defeitos por milhão</div>
        </div>

        {/* ITENS SEM PRODUÇÃO */}
        <div className="stat-card">
          <div className="stat-label">
            <ExclamationTriangleIcon width={18} /> ITENS SEM PRODUÇÃO
          </div>
          <div className="stat-value bad">
            {meta.itensSemProducao}
          </div>
          <div className="stat-sub">apontamentos não encontrados</div>
        </div>

        {/* ITENS SEM DEFEITOS */}
        <div className="stat-card">
          <div className="stat-label">
            <CheckCircleIcon width={18} /> ITENS SEM DEFEITOS
          </div>
          <div className="stat-value ok">
            {meta.itensSemDefeitos}
          </div>
          <div className="stat-sub">produção sem falhas</div>
        </div>
      </div>

      {/* ======================================================
          🔶 KPI — OCORRÊNCIAS (NÃO MOSTRAR NO ÍNDICE)
      ======================================================= */}
      <div className="kpi-row">
        <div className="stat-card">
          <div className="stat-label">
            <Squares2X2Icon width={18} /> OCORRÊNCIAS
          </div>
          <div className="stat-value highlight">
            {meta.ocorrencias}
          </div>
          <div className="stat-sub">
            não influenciam PPM nem indicadores
          </div>
        </div>
      </div>
    </div>
  );
}