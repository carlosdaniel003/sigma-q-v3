"use client";

import React from "react";
import {
  Brain,
  Layers,
  AlertTriangle,
  CheckCircle,
  Factory,
  PackageSearch,
  PackageX,
} from "lucide-react";

type KPIsGeraisProps = {
  overall: any;
  categories: any[];
  categoriasSaudaveis: number;
  modelosCriticos: number;

  modelosSemDefeitos: number;
  defeitosSemProducao: number;
};

export default function KPIsGerais({
  overall,
  categories,
  categoriasSaudaveis,
  modelosCriticos,
  modelosSemDefeitos,
  defeitosSemProducao,
}: KPIsGeraisProps) {
  return (
    <div className="kpi-wrapper" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ======================================================
          LINHA 1 — IA (QUALIDADE)
      ======================================================= */}
      <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        
        {/* Precisão da IA */}
        <KPI
          icon={<Brain size={20} />}
          title="Precisão da IA (Match Geral)"
          value={`${overall.matchRateByRows?.toFixed(2)}%`}
          subtitle="qualidade da identificação"
          color={overall.matchRateByRows >= 90 ? "var(--success)" : "var(--danger)"}
        />

        {/* Confiabilidade por Volume */}
        <KPI
          icon={<Layers size={20} />}
          title="Confiabilidade por Volume"
          value={`${overall.matchRateByVolume?.toFixed(2)}%`}
          subtitle="ponderado pelo peso da produção"
          color={overall.matchRateByVolume >= 90 ? "var(--success)" : "var(--danger)"}
        />
      </div>


      {/* ======================================================
          LINHA 2 — PRODUÇÃO
      ======================================================= */}
      <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>

        <KPI
          icon={<Factory size={20} />}
          title="Volume Produzido"
          value={overall.totalVolume?.toLocaleString()}
          subtitle="unidades analisadas"
        />

        <KPI
          icon={<CheckCircle size={20} />}
          title="Modelos Sem Defeitos"
          value={modelosSemDefeitos}
          subtitle="produção sem falhas"
          color="var(--success)"
        />

        <KPI
          icon={<PackageX size={20} />}
          title="Defeitos Sem Produção"
          value={defeitosSemProducao}
          subtitle="apontamentos não encontrados"
          color="var(--danger)"
        />
      </div>


      {/* ======================================================
          LINHA 3 — CATEGORIAS
      ======================================================= */}
      <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>

        <KPI
          icon={<PackageSearch size={20} />}
          title="Categorias Identificadas"
          value={categories.length}
          subtitle="total de categorias"
        />

        <KPI
          icon={<CheckCircle size={20} />}
          title="Categorias Saudáveis"
          value={`${categoriasSaudaveis}/${categories.length}`}
          subtitle="≥ 99% de precisão"
          color="var(--success)"
        />

        <KPI
          icon={<AlertTriangle size={20} />}
          title="Categorias Críticas"
          value={modelosCriticos}
          subtitle="< 90% de match"
          color={modelosCriticos === 0 ? "var(--success)" : "var(--danger)"}
        />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE DO CARD
============================================================ */
function KPI({ icon, title, value, subtitle, color }: any) {
  return (
    <div className="stat-card glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)" }}>
        {icon}
        <span className="stat-label">{title}</span>
      </div>

      <div className="stat-value" style={{ color: color ?? "var(--text-strong)" }}>
        {value}
      </div>

      <div className="stat-sub">{subtitle}</div>
    </div>
  );
}