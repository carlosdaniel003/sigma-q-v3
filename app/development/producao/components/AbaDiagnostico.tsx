"use client";

import React from "react";

export default function AbaDiagnostico({
  diagnostico,
  selectedCategory,
  divergenciasByCategory,
  data,
}: any) {
  if (!selectedCategory || !diagnostico)
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p className="muted small">
          Selecione uma categoria com diagnóstico disponível.
        </p>
      </div>
    );

  const prodSemDef = (diagnostico.producaoSemDefeitos ?? []).filter(
    (it: any) =>
      (it.categoria ?? it.CATEGORIA ?? "")
        .toString()
        .toUpperCase() === selectedCategory.toUpperCase()
  );

  const defeitosSemProd = (diagnostico.defeitosSemProducao ?? []).filter(
    (it: any) =>
      (it.categoria ?? it.CATEGORIA ?? "")
        .toString()
        .toUpperCase() === selectedCategory.toUpperCase()
  );

  return (
    <div style={{ marginTop: 8 }}>
      {/* 1) Produção sem defeitos */}
      <div className="diag-block">
        <h3 style={{ marginBottom: 10 }}>📦 Modelos Produzidos Sem Defeitos</h3>

        {prodSemDef.length === 0 ? (
          <p className="muted small">
            Tudo certo — todos os modelos têm defeitos registrados.
          </p>
        ) : (
          <div className="diag-table">
            {prodSemDef.map((item: any, i: number) => (
              <div key={i} className="diag-card warn">
                <div className="diag-title">{item.modelo}</div>
                <div className="diag-body">
                  <p>
                    <strong>Produzido:</strong> {item.produzido}
                  </p>
                  <p className="muted small">
                    Nenhum defeito registrado para este modelo.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2) Defeitos sem produção */}
      <div className="diag-block" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>⚠️ Defeitos Sem Produção</h3>

        {defeitosSemProd.length === 0 ? (
          <p className="muted small">
            Nenhum defeito encontrado sem produção correspondente.
          </p>
        ) : (
          <div className="diag-table">
            {defeitosSemProd.map((item: any, i: number) => (
              <div key={i} className="diag-card danger">
                <div className="diag-title">{item.modelo}</div>
                <div className="diag-body">
                  <p>
                    <strong>Ocorrências:</strong> {item.ocorrenciasDefeitos}
                  </p>
                  <p className="muted small">
                    Existe defeito apontado mas não há produção registrada.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3) Divergências */}
      <div className="diag-block" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>🔴 Divergências de Volume</h3>

        {divergenciasByCategory.length === 0 ? (
          <p className="muted small">Nenhuma divergência de volume.</p>
        ) : (
          <div className="diag-table">
            {divergenciasByCategory.map((item: any, i: number) => (
              <div key={i} className="diag-card danger">
                <div className="diag-title">{item.modelo}</div>
                <div className="diag-body">
                  <p>
                    <strong>Produzido:</strong> {item.produzido}
                  </p>
                  <p>
                    <strong>Defeitos:</strong> {item.defeitosApontados}
                  </p>
                  <p>
                    <strong>Diferença:</strong> {item.diferenca}
                  </p>

                  <hr style={{ opacity: 0.2, margin: "8px 0" }} />

                  {(item.explicacoes ?? []).length ? (
                    item.explicacoes.map((e: any, idx: number) => (
                      <p key={idx} className="muted small">
                        🔎 <strong>{e.motivo}:</strong> {e.explicacao}
                      </p>
                    ))
                  ) : (
                    <p className="muted small">
                      Sem explicação técnica adicional.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}