import React from "react";

type KPIsGeraisProps = {
  overall: any;
  categories: any[];

  // Novos KPIs calculados pelo hook
  categoriasSaudaveis: number;
  modelosCriticos: number;
};

export default function KPIsGerais({
  overall,
  categories,
  categoriasSaudaveis,
  modelosCriticos,
}: KPIsGeraisProps) {

  return (
    <section className="kpi-row">

      {/* Precisão Global */}
      <div className="stat-card">
        <div className="stat-label">Precisão da IA (Match Geral)</div>
        <div className={`stat-value ${overall.matchRateByRows >= 99 ? "ok" : "highlight"}`}>
          {overall.matchRateByRows?.toFixed(2)}%
        </div>
        <div className="stat-sub">qualidade da identificação</div>
      </div>

      {/* Confiabilidade por Volume */}
      <div className="stat-card">
        <div className="stat-label">Confiabilidade por Volume</div>
        <div className={`stat-value ${overall.matchRateByVolume >= 99 ? "ok" : "highlight"}`}>
          {overall.matchRateByVolume?.toFixed(2)}%
        </div>
        <div className="stat-sub">ponderado pelo peso da produção</div>
      </div>

      {/* Volume Produzido */}
      <div className="stat-card">
        <div className="stat-label">Volume Produzido</div>
        <div className="stat-value">
          {overall.totalVolume?.toLocaleString()}
        </div>
        <div className="stat-sub">unidades analisadas</div>
      </div>

      {/* Categorias Identificadas (Novo nome) */}
      <div className="stat-card">
        <div className="stat-label">Categorias Identificadas</div>
        <div className="stat-value">{categories.length}</div>
        <div className="stat-sub">total de categorias</div>
      </div>

      {/* Categorias Saudáveis */}
      <div className="stat-card">
        <div className="stat-label">Categorias Saudáveis</div>
        <div className="stat-value">
          {categoriasSaudaveis}/{categories.length}
        </div>
        <div className="stat-sub">≥ 99% de precisão</div>
      </div>

      {/* Modelos Críticos */}
      <div className="stat-card">
        <div className="stat-label">Modelos Críticos</div>
        <div className="stat-value highlight">
          {modelosCriticos}
        </div>
        <div className="stat-sub">abaixo de 90% de match</div>
      </div>

    </section>
  );
}