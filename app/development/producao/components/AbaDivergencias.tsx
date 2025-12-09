"use client";

import React from "react";

export default function AbaDivergencias({
  divergenciasByCategory,
  selectedCategory,
  data,
}: any) {
  if (!selectedCategory)
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p className="muted small">
          Selecione uma categoria no painel esquerdo para ver divergências.
        </p>
      </div>
    );

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Divergências — {selectedCategory}</h3>
        <div className="muted small">
          Modelos com diferença entre produzido e defeitos apontados
        </div>
      </div>

      {divergenciasByCategory.length === 0 ? (
        <div style={{ padding: 20 }} className="muted small">
          Nenhuma divergência encontrada nesta categoria.
        </div>
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
                  <strong>Defeitos Apontados:</strong> {item.defeitosApontados}
                </p>
                <p>
                  <strong>Diferença:</strong> {item.diferenca}
                </p>

                <hr style={{ opacity: 0.2, margin: "8px 0" }} />

                {item.explicacoes?.length ? (
                  item.explicacoes.map((e: any, idx: number) => (
                    <p key={idx} className="muted small" style={{ marginTop: 6 }}>
                      🔎 <strong>{e.motivo}:</strong> {e.explicacao}
                    </p>
                  ))
                ) : (
                  <p className="muted small">Sem explicações adicionais.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}