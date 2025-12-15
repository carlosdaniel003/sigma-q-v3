"use client";

import React from "react";
import { Lightbulb, Search, AlertTriangle } from "lucide-react";

export default function InsightInteligente({ categoria, stats, diagnostico, overall }: any) {
  if (!stats || !stats.models) return null;

  const naoIdentificados = stats.models.filter(
    (m: any) => m.notIdentifiedRows > 0
  );

  if (naoIdentificados.length === 0) return null;

  const totalSistema = overall?.totalRows ?? 0;

  return (
    <div className="insight-wrapper fade-in">
      
      {/* TÍTULO */}
      <div className="insight-header">
        <Lightbulb size={20} className="icon" />
        <h2>Insight Inteligente — Itens Não Identificados</h2>
      </div>

      <p className="insight-subtitle">
        Análise automática baseada em padrões de erro, inconsistências entre produção e defeitos
        e comportamento real da fábrica.
      </p>

      {/* LISTA */}
      <div className="insight-list">
        {naoIdentificados.map((m: any, i: number) => {
          
          const impactoSistema = totalSistema
            ? ((m.notIdentifiedRows / totalSistema) * 100).toFixed(3) + "%"
            : "—";

          const analise = analisarModelo(m, diagnostico);

          return (
            <div key={i} className="insight-card">
              
              {/* Cabeçalho da linha */}
              <div className="insight-card-header">
                <strong className="model">{m.modelKey}</strong>
                <span className="pct">{impactoSistema}</span>
              </div>

              {/* Quantidade */}
              <div className="insight-qty">
                {m.notIdentifiedRows} itens não identificados • {m.identifiedRows} identificados
              </div>

              {/* Causa provável */}
              <div className="insight-row">
                <Search size={16} className="icon cause" />
                <p className="insight-text">
                  <strong>Causa provável:</strong> {analise.causa}
                </p>
              </div>

              {/* Sugestão */}
              <div className="insight-row">
                <AlertTriangle size={16} className="icon warn" />
                <p className="insight-text">
                  <strong>Sugestão:</strong> {analise.sugestao}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   INTELIGÊNCIA REAL — produção x defeitos x histórico
============================================================ */

function analisarModelo(m: any, diagnostico: any) {
  const nome = m.modelKey;

  const diverg = diagnostico?.divergencias?.find((d: any) => d.modelo === nome);
  const defeitosApontados = diverg?.defeitosApontados ?? 0;
  const produzido = diverg?.produzido ?? (m.identifiedRows + m.notIdentifiedRows);

  if (defeitosApontados > produzido && defeitosApontados > 0) {
    return {
      tipo: "defeitos",
      causa: `Os defeitos apontados (${defeitosApontados}) excedem a produção real (${produzido}). 
Isso indica erro de apontamento ou defeitos lançados no modelo errado.`,
      sugestao:
        "Revisar a planilha de defeitos. Verifique se o modelo foi apontado corretamente ou se houve lançamentos duplicados."
    };
  }

  if (produzido < 20) {
    return {
      tipo: "producao",
      causa:
        "Pouca referência histórica na produção. A IA não possui amostra suficiente para classificar este modelo.",
      sugestao:
        "Aumentar a base histórica deste modelo na produção ou confirmar se este modelo é novo na linha."
    };
  }

  if (m.identifyPct < 60 && defeitosApontados > 0) {
    return {
      tipo: "divergencia",
      causa:
        "Há inconsistência entre produção real e os defeitos apontados, afetando o match da IA.",
      sugestao:
        "Revisar se houve mudança no processo, troca de código, novo fornecedor ou preenchimento incorreto na produção/defeitos."
    };
  }

  return {
    tipo: "geral",
    causa:
      "Os padrões disponíveis não foram suficientes para identificar estes itens com segurança.",
    sugestao:
      "Revisar amostras deste modelo, garantir consistência dos apontamentos e observar se houve variação recente no processo."
  };
}