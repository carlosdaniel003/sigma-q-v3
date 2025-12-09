// [BLOCO 1] app/divergencias/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity, Download, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Dashboard de Divergências - SIGMA-Q
 * - Consome /api/producao/validate
 * - Exibe KPIs, tabela, recomendações e export CSV
 *
 * Colocar em: app/divergencias/page.tsx
 */

type Diagnostico = {
  producaoSemDefeitos: Array<{ modelo: string; categoria: string; produzido: number }>;
  defeitosSemProducao: Array<{ modelo: string; ocorrenciasDefeitos: number }>;
  divergencias: Array<{ modelo: string; categoria: string; produzido: number; defeitosApontados: number; diferenca: number }>;
};

export default function DivergenciasDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"diferenca" | "produzido" | "defeitos" | "modelo">("diferenca");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [minDiferenca, setMinDiferenca] = useState<number>(0);

  // load
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/producao/validate");
      const j = await res.json();
      if (!j?.ok && !j.totals) {
        // accept both shapes (some payloads might not include ok)
        throw new Error(j?.error || "Resposta inválida da API");
      }
      setData(j);
      setDiagnostico(j.diagnostico || {
        producaoSemDefeitos: [],
        defeitosSemProducao: [],
        divergencias: [],
      });
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // derived lists
  const divergenciasFiltered = useMemo(() => {
    if (!diagnostico) return [];
    const q = query.trim().toUpperCase();
    const list = diagnostico.divergencias
      .filter((d) => Math.abs(d.diferenca) >= minDiferenca)
      .filter((d) => (!q ? true : d.modelo.toUpperCase().includes(q) || d.categoria.toUpperCase().includes(q)));

    const sorted = list.sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortBy === "diferenca") return dir * (Math.abs(b.diferenca) - Math.abs(a.diferenca));
      if (sortBy === "produzido") return dir * (b.produzido - a.produzido);
      if (sortBy === "defeitos") return dir * (b.defeitosApontados - a.defeitosApontados);
      return dir * a.modelo.localeCompare(b.modelo);
    });
    return sorted;
  }, [diagnostico, query, sortBy, sortDir, minDiferenca]);

  const totalDivergenciaVolume = useMemo(() => {
    if (!diagnostico) return 0;
    return diagnostico.divergencias.reduce((s, d) => s + Math.abs(d.diferenca), 0);
  }, [diagnostico]);

  // quick recommendations (front rules)
  function recommendAction(item: any) {
    // heuristics
    if (item.defeitosApontados === 0) {
      return { action: "Verificar registro de defeitos", reason: "Produzido sem defeitos registrados" };
    }
    if (item.produzido === 0) {
      return { action: "Conferir lançamento de produção", reason: "Defeitos existem, mas sem produção" };
    }
    const ratio = item.defeitosApontados / (item.produzido || 1);
    if (ratio > 1.1) {
      return { action: "Revisar planilha de defeitos", reason: "Mais defeitos que produção — possível duplicidade" };
    }
    if (Math.abs(item.diferenca) / (item.produzido || 1) > 0.2) {
      return { action: "Investigar (categoria / nome)", reason: "Diferença > 20% do volume produzido" };
    }
    return { action: "Validar manualmente", reason: "Diferença pequena — pode ser sazonal" };
  }

  // CSV export
  function exportCsv(list: any[]) {
    const header = ["modelo","categoria","produzido","defeitosApontados","diferenca","recomendacao","motivo"];
    const rows = list.map((r) => {
      const rec = recommendAction(r);
      return [
        r.modelo,
        r.categoria,
        String(r.produzido),
        String(r.defeitosApontados),
        String(r.diferenca),
        rec.action,
        rec.reason
      ].map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `divergencias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // UI
  if (loading) return (
    <div className="producao-container loader-container">
      <Activity className="animate-spin" size={40} style={{color: "var(--brand)"}}/>
      <p>Carregando dados de divergência...</p>
    </div>
  );

  if (error) return (
    <div className="producao-container loader-container">
      <AlertTriangle size={40} color="#ef4444" />
      <p className="error-text">{error}</p>
      <button onClick={load} className="sidebar-btn" style={{marginTop: 20}}>Tentar Novamente</button>
    </div>
  );

  return (
    <div className="producao-container fade-in">
      <header className="page-header">
        <h1>🔬 Dashboard de Divergências</h1>
        <div className="muted small">Automático • {data?.totals?.totalRows?.toLocaleString() || 0} registros analisados</div>
      </header>

      {/* KPIs */}
      <section className="kpi-row" style={{ marginBottom: 14 }}>
        <div className="stat-card">
          <div className="stat-label">Modelos com Divergência</div>
          <div className="stat-value">{diagnostico?.divergencias.length ?? 0}</div>
          <div className="stat-sub">itens com diferença numérica</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Produção sem Defeitos</div>
          <div className="stat-value">{diagnostico?.producaoSemDefeitos.length ?? 0}</div>
          <div className="stat-sub">modelos sem registro</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Defeitos sem Produção</div>
          <div className="stat-value">{diagnostico?.defeitosSemProducao.length ?? 0}</div>
          <div className="stat-sub">modelos órfãos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Volume Divergente Total</div>
          <div className="stat-value">{totalDivergenciaVolume.toLocaleString()}</div>
          <div className="stat-sub">unidades em disputa</div>
        </div>
      </section>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} />
          <input
            placeholder="Buscar modelo ou categoria..."
            className="select-dark"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", color: "white", border: "none" }}
          />
        </div>

        <div>
          <label className="muted small">Min. diferença</label>
          <input type="number" value={minDiferenca} onChange={(e)=> setMinDiferenca(Number(e.target.value || 0))} style={{ width: 100, marginLeft: 8, padding: 6, borderRadius: 6 }} />
        </div>

        <div>
          <label className="muted small">Ordenar por</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="select-dark" style={{ marginLeft: 8, padding: 6, borderRadius: 6 }}>
            <option value="diferenca">Diferença (abs)</option>
            <option value="produzido">Produzido</option>
            <option value="defeitos">Defeitos</option>
            <option value="modelo">Modelo</option>
          </select>
        </div>

        <div>
          <label className="muted small">Direção</label>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="select-dark" style={{ marginLeft: 8, padding: 6, borderRadius: 6 }}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <button className="sidebar-btn" onClick={() => exportCsv(divergenciasFiltered)} style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 18 }}>
        {/* Left: tabela */}
        <div>
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Categoria</th>
                  <th style={{ textAlign: "right" }}>Produzido</th>
                  <th style={{ textAlign: "right" }}>Defeitos</th>
                  <th style={{ textAlign: "right" }}>Diferença</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {divergenciasFiltered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }}>Nenhuma divergência encontrada com os filtros aplicados.</td></tr>
                ) : divergenciasFiltered.map((d, i) => {
                  const rec = recommendAction(d);
                  const isCritical = Math.abs(d.diferenca) / (d.produzido || 1) > 0.2 || Math.abs(d.diferenca) > 100;
                  return (
                    <tr key={d.modelo + i}>
                      <td><strong>{d.modelo}</strong></td>
                      <td className="muted small">{d.categoria}</td>
                      <td style={{ textAlign: "right" }}>{d.produzido.toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>{d.defeitosApontados.toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>{d.diferenca.toLocaleString()}</td>
                      <td>
                        <span className={`status-tag ${isCritical ? "bad" : "ok"}`}>{isCritical ? "Revisar" : "OK"}</span>
                        <div className="muted small" style={{ marginTop: 6 }}>{rec.action}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: painel de recomendações e listas */}
        <aside>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ marginBottom: 6 }}>Recomendações Rápidas</h3>
            <p className="muted small">Sugestões automáticas baseadas em regras simples — use como ponto de partida.</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="diag-card warn">
              <div style={{ fontWeight: 600 }}>Top ações sugeridas</div>
              <ol style={{ marginTop: 8 }}>
                {divergenciasFiltered.slice(0,5).map((d,i)=> {
                  const r = recommendAction(d);
                  return <li key={i} style={{ marginBottom: 6 }}>
                    <strong>{d.modelo}</strong> — {r.action} <div className="muted small">{r.reason}</div>
                  </li>
                })}
              </ol>
            </div>

            <div className="diag-card">
              <div style={{ fontWeight: 600 }}>Produção sem Defeitos (top 6)</div>
              <div style={{ marginTop: 8 }}>
                {diagnostico?.producaoSemDefeitos.slice(0,6).map((p,i)=>(
                  <div key={i} style={{ marginBottom: 8 }}>
                    <strong>{p.modelo}</strong> <div className="muted small">Produzido: {p.produzido.toLocaleString()} • {p.categoria}</div>
                  </div>
                ))}
                {diagnostico?.producaoSemDefeitos.length === 0 && <div className="muted small">Nenhum</div>}
              </div>
            </div>

            <div className="diag-card danger">
              <div style={{ fontWeight: 600 }}>Defeitos sem Produção (top 6)</div>
              <div style={{ marginTop: 8 }}>
                {diagnostico?.defeitosSemProducao.slice(0,6).map((p,i)=>(
                  <div key={i} style={{ marginBottom: 8 }}>
                    <strong>{p.modelo}</strong> <div className="muted small">Ocorrências: {p.ocorrenciasDefeitos}</div>
                  </div>
                ))}
                {diagnostico?.defeitosSemProducao.length === 0 && <div className="muted small">Nenhum</div>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="muted small" style={{ marginTop: 18 }}>
        Dica: clique em Exportar CSV para compartilhar com time de fábrica. Use filtros para priorizar modelos de maior impacto.
      </div>
    </div>
  );
}