"use client";

import React, { useMemo } from "react";
import { AlertCircle, CheckCircle2, Activity, Info } from "lucide-react";

export default function DiagnosticoAvancado({ stats }: { stats: any }) {
  if (!stats) return null;

  const perBase = stats?.perBase ?? {};
  const totalInconsistencias = Number(stats?.notIdentified ?? 0);
  const breakdown = stats?.notIdentifiedBreakdown ?? {};

  /* ======================================================
     TABELA — BASES (MEMORIZADO)
  ====================================================== */
  const basesTable = useMemo(() => {
    return ["af", "lcm", "produto acabado", "pth"].map((k) => {
      const b = perBase?.[k] ?? {};
      const pct = Number(b?.percentIdentified ?? 0);

      return {
        key: k,
        total: b.total ?? 0,
        identified: b.identified ?? 0,
        notIdentified: b.notIdentified ?? 0,
        pct,
      };
    });
  }, [perBase]);

  /* ======================================================
     INSIGHTS OPERACIONAIS (MEMORIZADO)
  ====================================================== */
  const insights = useMemo(() => {
    const list: React.ReactNode[] = [];
    let hasIssues = false;

    /* ------------------------------
       1) BASES CRÍTICAS
    ------------------------------ */
    ["af", "lcm", "produto acabado", "pth"].forEach((k) => {
      const b = perBase?.[k] ?? {};
      const pct = Number(b?.percentIdentified ?? 100);
      const notId = Number(b?.notIdentified ?? 0);
      const total = Number(b?.total ?? 0);

      if (total === 0) {
        list.push(
          <div key={`empty-${k}`} className="insight-warn">
            <AlertCircle size={16} />
            A base <strong>{k.toUpperCase()}</strong> está vazia ou não carregou.
          </div>
        );
        hasIssues = true;
      } else if (pct < 99 && notId > 0) {
        list.push(
          <div key={`low-${k}`} className="insight-danger">
            <AlertCircle size={16} />
            Atenção à base <strong>{k.toUpperCase()}</strong>:{" "}
            {pct.toFixed(1)}% de identificação ({notId} erros).
          </div>
        );
        hasIssues = true;
      }
    });

    /* ------------------------------
       2) PARETO DE INCONSISTÊNCIAS
    ------------------------------ */
    if (totalInconsistencias > 0) {
      const maxKey = Object.keys(breakdown).reduce((a, b) =>
        breakdown[a] > breakdown[b] ? a : b
      );

      const maxCount = breakdown[maxKey];
      const impact = (maxCount / totalInconsistencias) * 100;

      if (impact > 50) {
        let label = "";
        let action = "";

        switch (maxKey) {
          case "responsabilidades":
            label = "Responsabilidades / Fornecedores";
            action = "Padronizar códigos de fornecedor.";
            break;
          case "modelos":
            label = "Cadastro de Modelos";
            action = "Cadastrar novos produtos detectados.";
            break;
          case "falhas":
            label = "Códigos de Falha";
            action = "Atualizar dicionário de falhas.";
            break;
          default:
            label = maxKey;
            action = "Revisar regras de negócio.";
        }

        list.push(
          <div key="pareto" className="insight-info">
            <Info size={16} />
            <span>
              <strong>{impact.toFixed(0)}%</strong> das inconsistências são de{" "}
              <strong>{label}</strong>. Sugestão: {action}
            </span>
          </div>
        );

        hasIssues = true;
      }
    }

    /* ------------------------------
       3) EXCELÊNCIA OPERACIONAL
    ------------------------------ */
    if (!hasIssues) {
      return (
        <div className="insight-success">
          <CheckCircle2 size={16} />
          Excelência Operacional: Todas as bases estão acima de 99%.
        </div>
      );
    }

    return list;
  }, [perBase, breakdown, totalInconsistencias]);

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <section className="diag-adv-card fade-in">
      <h4 className="diag-adv-title">
        🩺 Diagnóstico Avançado do Sistema
      </h4>

      {/* ============================ */}
      {/*           TABELA             */}
      {/* ============================ */}
      <div className="diag-adv-scroll">
        <table className="diag-adv-table">
          <thead>
            <tr>
              <th>Base</th>
              <th>Itens</th>
              <th>Identificados</th>
              <th>Não Identificados</th>
              <th>% Identificação</th>
            </tr>
          </thead>

          <tbody>
            {basesTable.map((b) => (
              <tr key={b.key}>
                <td className="bold">{b.key.toUpperCase()}</td>
                <td>{b.total}</td>
                <td className="green">{b.identified}</td>
                <td
                  className={
                    b.notIdentified > 0 ? "red" : "muted"
                  }
                >
                  {b.notIdentified}
                </td>
                <td>{b.pct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================ */}
      {/*     INSIGHTS OPERACIONAIS    */}
      {/* ============================ */}
      <div className="diag-adv-insight">
        <div className="diag-adv-insight-header">
          <Activity size={14} />
          Insights Operacionais
        </div>

        <div className="diag-adv-insight-list">
          {insights}
        </div>
      </div>
    </section>
  );
}