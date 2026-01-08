"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Layers, Info, CheckCircle2, FlaskConical, Component } from "lucide-react";

type Props = {
  data: any; // Mantido para compatibilidade, mas vamos focar no diagnostico
  diagnostico: any;
};

export default function DiagnosticoGeral({ data, diagnostico }: Props) {
  if (!diagnostico) return null;

  const categorias = data?.perCategory ?? [];

  // 1) CATEGORIAS CRÍTICAS (< 90%)
  const categoriasCriticas = useMemo(() => {
    return categorias
      .filter((c: any) => Number(c.identifiedPct) < 90)
      .sort((a: any, b: any) => a.identifiedPct - b.identifiedPct);
  }, [categorias]);

  // 2) GRUPOS DA NOVA TAXONOMIA
  // Estes nomes devem bater EXATAMENTE com o retorno do route.ts
  const { 
    defeitosSemProducao = [], // GRUPO A (Crítico - TV-xxx)
    preProducao = [],         // GRUPO B1 (Atenção - Evaporadores)
    producaoParcial = [],     // GRUPO B2 (Atenção - Placas)
    producaoComDefeitos = [], // GRUPO C (Normal - TM-1200)
    producaoSemDefeitos = []  // NORMAL (Sem Defeitos)
  } = diagnostico;

  return (
    <div className="glass-card fade-in" style={{ marginTop: 20, padding: 24 }}>

      <h2 className="section-title">
        <Layers size={20} style={{ marginRight: 8 }} />
        Diagnóstico Inteligente • Visão Geral
      </h2>
      <p className="muted small" style={{ marginBottom: 30 }}>
        Análises automáticas sobre falhas estruturais, discrepâncias de produção e categorias que exigem revisão.
      </p>

      {/* ============================================================
          1) TABELA — Categorias Críticas
      ============================================================ */}
      {categoriasCriticas.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h3 className="section-title-small">
            <Layers size={14} style={{ marginRight: 6 }} />
            Categorias Críticas — Detalhamento
          </h3>
          <div className="glass-table-container" style={{ marginTop: 12 }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Volume Total</th>
                  <th>Identificados</th>
                  <th>Não Identificados</th>
                  <th>% Precisão</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categoriasCriticas.map((c: any, i: number) => {
                  const pct = Number(c.identifiedPct);
                  return (
                    <tr key={i}>
                      <td><strong>{c.categoria}</strong></td>
                      <td>{c.volume.toLocaleString()}</td>
                      <td style={{ color: "#4ade80" }}>{c.identifiedRows}</td>
                      <td style={{ color: "#ef4444" }}>{c.notIdentifiedRows}</td>
                      <td>{pct.toFixed(1)}%</td>
                      <td><span className="status-tag bad">Revisar</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          🔴 GRUPO A: ERROS PROPOSITAIS (CRÍTICO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--danger)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          🔴 Erros de Validação (Críticos)
        </h3>
        <p className="muted small" style={{ marginBottom: 10 }}>
          Modelos com defeitos registrados mas sem produção (TV-xxx). <strong>Impactam o KPI.</strong>
        </p>

        {defeitosSemProducao.length === 0 ? (
          <div className="empty-state">Nenhum erro crítico detectado.</div>
        ) : (
          <div className="grid-list">
            {defeitosSemProducao.map((d: any, i: number) => (
              <div key={i} className="diag-item danger">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge danger">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">Motivo: {d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟡 GRUPO B1: PRÉ-PRODUÇÃO (ATENÇÃO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--warn)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={16} />
          🟡 Produtos em Engenharia / Pré-Produção
        </h3>
        <p className="muted small" style={{ marginBottom: 10 }}>
          Itens em cadastro ou teste inicial. <strong>Não impactam KPI global.</strong>
        </p>

        {preProducao.length === 0 ? (
          <div className="empty-state">Nenhum item em pré-produção.</div>
        ) : (
          <div className="grid-list">
            {preProducao.map((d: any, i: number) => (
              <div key={i} className="diag-item warn">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge warn">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">{d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟡 GRUPO B2: PRODUÇÃO PARCIAL (ATENÇÃO)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "#f59e0b", display: 'flex', alignItems: 'center', gap: 8 }}>
          <Component size={16} />
          🟡 Produção Parcial
        </h3>
        <p className="muted small" style={{ marginBottom: 10 }}>
          Produção incompleta (ex: placa ok, produto não). <strong>Monitoramento necessário.</strong>
        </p>

        {producaoParcial.length === 0 ? (
          <div className="empty-state">Nenhum caso de produção parcial.</div>
        ) : (
          <div className="grid-list">
            {producaoParcial.map((d: any, i: number) => (
              <div key={i} className="diag-item warn-orange">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge warn-orange">{d.ocorrenciasDefeitos} Defeitos</span>
                </div>
                <div className="diag-reason">{d.motivo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟢 GRUPO C: PRODUÇÃO COM DEFEITOS (NORMAL)
      ============================================================ */}
      <div style={{ marginBottom: 30 }}>
        <h3 className="section-title-small" style={{ color: "var(--success)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          🟢 Produção com Defeitos (Fluxo Normal)
        </h3>
        <p className="muted small" style={{ marginBottom: 10 }}>
          Itens produzidos e identificados corretamente no fluxo.
        </p>

        {producaoComDefeitos.length === 0 ? (
          <div className="empty-state">Nenhum fluxo normal com defeitos detectado.</div>
        ) : (
          <div className="grid-list">
            {producaoComDefeitos.map((d: any, i: number) => (
              <div key={i} className="diag-item success">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge success">{d.ocorrencias} Defeitos</span>
                </div>
                <div className="diag-reason">Produção Identificada • Match OK</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          🟢 PRODUÇÃO SEM DEFEITOS (NORMAL - SEM DEFEITO)
      ============================================================ */}
      <div>
        <h3 className="section-title-small" style={{ color: "var(--success)", display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          🟢 Produção sem Defeitos (Ideal)
        </h3>
        <p className="muted small" style={{ marginBottom: 10 }}>
          Modelos produzidos com zero apontamentos de falha.
        </p>

        {producaoSemDefeitos.length === 0 ? (
          <div className="empty-state">Nenhum modelo sem defeitos.</div>
        ) : (
          <div className="grid-list">
            {producaoSemDefeitos.map((d: any, i: number) => (
              <div key={i} className="diag-item success-light">
                <div className="diag-header">
                  <strong>{d.modelo}</strong>
                  <span className="badge success-light">{Number(d.produzido).toLocaleString()} UN</span>
                </div>
                <div className="diag-reason">Zero defeitos registrados</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ESTILOS LOCAIS */}
      <style jsx>{`
        .grid-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .empty-state {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          font-style: italic;
          padding: 10px;
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .diag-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          transition: transform 0.2s;
        }
        .diag-item:hover {
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }
        .diag-item.danger { border-left: 3px solid var(--danger); }
        .diag-item.warn { border-left: 3px solid var(--warn); }
        .diag-item.warn-orange { border-left: 3px solid #f59e0b; }
        .diag-item.success { border-left: 3px solid var(--success); }
        .diag-item.success-light { border-left: 3px solid #86efac; }

        .diag-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .diag-header strong {
          font-size: 0.95rem;
          color: var(--text-strong);
        }
        .diag-reason {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
        }
        .badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .badge.danger { background: rgba(239,68,68,0.15); color: var(--danger); }
        .badge.warn { background: rgba(250,204,21,0.15); color: var(--warn); }
        .badge.warn-orange { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge.success { background: rgba(34,197,94,0.15); color: var(--success); }
        .badge.success-light { background: rgba(134,239,172,0.15); color: #86efac; }
      `}</style>
    </div>
  );
}