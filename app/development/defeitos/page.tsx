"use client";

import React, { useEffect, useMemo, useState } from "react";
import "./defeitos.css";

type Fonte = "todas" | "af" | "lcm" | "produto" | "pth";

export default function DefeitosValidationPage() {

  // ----------------------
  // STATE
  // ----------------------
  const [fonte, setFonte] = useState<Fonte>("todas");
  const [limit, setLimit] = useState(30);
  const [offset, setOffset] = useState(0);

  const [stats, setStats] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [sample, setSample] = useState<any[]>([]);

  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev]);
  };

  const [catalogos, setCatalogos] = useState({
    modelos: true,
    falhas: true,
    responsabilidades: true,
    naoMostrar: true,
    todos: true
  });

  // ----------------------
  // TOGGLES
  // ----------------------
  const toggleCatalogo = (key: string) => {
    setCatalogos(prev => {
      if (key === "todos") {
        const val = !prev.todos;
        return {
          modelos: val,
          falhas: val,
          responsabilidades: val,
          naoMostrar: val,
          todos: val
        };
      }
      const novo = { ...prev, [key]: !prev[key] };
      novo.todos =
        novo.modelos &&
        novo.falhas &&
        novo.responsabilidades &&
        novo.naoMostrar;
      return novo;
    });
  };

  const catalogosQuery = useMemo(() => {
    return Object.entries(catalogos)
      .filter(([k, v]) => k !== "todos" && v)
      .map(([k]) => k)
      .join(",");
  }, [catalogos]);

  // ----------------------
  // FETCH
  // ----------------------
  async function fetchStats(f: Fonte) {
    log(`Iniciando carregamento de stats (${f})...`);
    const t0 = performance.now();
    try {
      const res = await fetch(`/api/defeitos/stats?fonte=${f}&catalogos=${catalogosQuery}`);
      const j = await res.json();
      setStats(j);
      log(`✓ Stats carregados em ${Math.round(performance.now() - t0)}ms — TotalItems: ${j.totalItems}`);
    } catch (err) {
      console.error("fetchStats error", err);
      log(`❌ Erro ao carregar stats`);
      setStats(null);
    }
  }

  async function fetchPreview(f: Fonte, lim = 30, off = 0) {
    log(`Carregando preview (limit=${lim})...`);
    const t0 = performance.now();

    try {
      const res = await fetch(`/api/defeitos/preview?fonte=${f}&limit=${lim}&offset=${off}&catalogos=${catalogosQuery}`);
      const j = await res.json();
      setPreview(j);
      setSample(j?.sample ?? []);
      log(`✓ Preview carregado em ${Math.round(performance.now() - t0)}ms — Amostra: ${j?.sample?.length ?? 0}`);
    } catch (err) {
      console.error("fetchPreview error", err);
      log("❌ Erro ao carregar preview");
      setPreview(null);
      setSample([]);
    }
  }

  useEffect(() => {
    fetchStats(fonte);
    fetchPreview(fonte, limit, offset);
  }, [fonte, limit, offset, catalogosQuery]);

  // ----------------------
  // KPIs CORRETOS
  // ----------------------

  const total = Number(stats?.totalItems ?? 0);
  const identified = Number(stats?.identified ?? 0);
  const notIdentified = Number(stats?.notIdentified ?? (total - identified));
  const aiOverall = Number(stats?.percentIdentified ?? 0);

  const totalDefeitos = Number(stats?.totalDefeitos ?? 0);

  const breakdown = stats?.notIdentifiedBreakdown ?? {
    modelos: 0,
    falhas: 0,
    responsabilidades: 0,
    naoMostrar: 0
  };

  const breakdownExamples = stats?.issuesSummary ?? {};

  const perBase = stats?.perBase ?? {};

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="defeitos-container">

      {/* SIDEBAR */}
      <aside className="defeitos-sidebar">

        <div className="sidebar-title">SIGMA-Q</div>

        {/* Fontes */}
        <div className="sidebar-group">
          <div className="sidebar-title">Fontes</div>
          {(["todas", "af", "lcm", "produto", "pth"] as Fonte[]).map(f => (
            <button
              key={f}
              className={`sidebar-btn ${fonte === f ? "active" : ""}`}
              onClick={() => { setFonte(f); setOffset(0); }}
            >
              {f === "todas" ? "Todas" : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Catálogos */}
        <div className="sidebar-group">
          <div className="sidebar-title">Catálogos</div>
          <div className="catalogo-chips">
            {[
              ["modelos", "Modelos"],
              ["falhas", "Códigos de Falha"],
              ["responsabilidades", "Responsabilidades"],
              ["naoMostrar", "Não Mostrar Índice"],
              ["todos", "Todos"]
            ].map(([k, label]) => (
              <div
                key={k}
                className={`chip ${catalogos[k as keyof typeof catalogos] ? "chip-on" : "chip-off"}`}
                onClick={() => toggleCatalogo(k)}
              >
                <span>{label}</span>
                <span>{catalogos[k as keyof typeof catalogos] ? "ON" : ""}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amostra */}
        <div className="sidebar-group">
          <div className="sidebar-title">Amostra / Preview</div>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              className="select-dark"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={100}>100</option>
            </select>

            <button
              className="sidebar-btn"
              onClick={() => {
                setOffset(0);
                fetchPreview(fonte, limit, 0);
                fetchStats(fonte);
              }}
            >
              Atualizar
            </button>
          </div>

          <div className="muted" style={{ marginTop: 8 }}>
            Amostra: {sample.length}
          </div>
        </div>

        <div className="sidebar-group muted">Vercel · Turso SQL · Dark-Clear</div>
      </aside>


      {/* MAIN */}
      <main className="defeitos-main">

        {/* HEADER */}
        <header className="defeitos-header">
          <h2>Classificação de Defeitos</h2>
          <div className="muted">Validação entre bases de defeitos e catálogos oficiais</div>
        </header>


        {/* KPIs */}
        <section className="top-stats">
          <div className="stat-card">
            <div className="stat-title">Itens na base</div>
            <div className="stat-value">{total.toLocaleString()}</div>
            <div className="stat-sub">linhas carregadas</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Total de Defeitos</div>
            <div className="stat-value">{totalDefeitos.toLocaleString()}</div>
            <div className="stat-sub">soma QUANTIDADE</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Não identificados</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>{notIdentified.toLocaleString()}</div>
            <div className="stat-sub">sem correspondência</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Entendimento Geral da IA</div>
            <div className="kpi-value">{aiOverall.toFixed(2)}%</div>
            <div className="stat-sub">percentual identificado</div>
          </div>
        </section>


        {/* BREAKDOWN */}
        <section className="breakdown-grid">
          <div className="defeitos-panel">
            <h4>Detalhe dos Não Identificados</h4>
            <div className="breakdown-list">
              <div className="break-item"><div>Modelos</div><div>{breakdown.modelos}</div></div>
              <div className="break-item"><div>Códigos de Falha</div><div>{breakdown.falhas}</div></div>
              <div className="break-item"><div>Responsabilidades</div><div>{breakdown.responsabilidades}</div></div>
              <div className="break-item"><div>Não Mostrar Índice</div><div>{breakdown.naoMostrar}</div></div>
            </div>
          </div>

          <div className="defeitos-panel">
            <h4>KPI por Base</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              {["af", "lcm", "produto", "pth"].map(key => (
                <div className="per-base-item" key={key}>
                  <div>{key.toUpperCase()}</div>
                  <div className="value">
                    {Number(perBase?.[key]?.percentIdentified ?? 0).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* NOVO PAINEL — RASTREAMENTO */}
        <section className="defeitos-panel">
          <h4>Rastreamento de Inconsistências (Top 10)</h4>

          {Object.entries(breakdownExamples).map(([categoria, dados]: any) =>
            dados?.examples?.length ? (
              <div key={categoria} style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {categoria.toUpperCase()} — {dados.examples.length} exemplos
                </div>

                {dados.examples.slice(0, 10).map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--glass-border)",
                      marginBottom: 8
                    }}
                  >
                    <div><strong>Fonte:</strong> {ex.fonte}</div>
                    <div><strong>Modelo:</strong> {ex.MODELO ?? "-"}</div>
                    <div><strong>Código:</strong> {ex.CODIGO_DA_FALHA ?? "-"}</div>
                    <div><strong>Issues:</strong> {(ex._issues || []).join(", ")}</div>
                    <div><strong>Confiança:</strong> {(ex._confidence ?? 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : null
          )}
        </section>


        {/* LOG DO SISTEMA */}
        <section className="defeitos-panel">
          <h4>Log do Sistema (debug)</h4>

          <div className="log-box">
            {logs.map((l, idx) => (
              <div className="log-line" key={idx}>{l}</div>
            ))}
          </div>
        </section>


        {/* TABELA */}
        <section className="defeitos-panel defeitos-scroll">

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="muted">Amostra</div>
            <div className="muted">Total mostrados: {sample.length}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="defeitos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fonte</th>
                  <th>Data</th>
                  <th>Modelo</th>
                  <th>Código Falha</th>
                  <th>Conf.</th>
                  <th>Issues</th>
                </tr>
              </thead>

              <tbody>
                {sample.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1 + offset}</td>
                    <td>{r.fonte ?? "-"}</td>
                    <td>{r.DATA ?? r.date ?? "-"}</td>
                    <td>{r._model?.descricao ?? r.MODELO ?? "-"}</td>
                    <td>{r._codigoFalha?.codigo ?? r["CÓDIGO DA FALHA"] ?? "-"}</td>
                    <td>{Number(r._confidence ?? 0).toFixed(2)}</td>
                    <td>
                      {(r._issues || []).slice(0, 6).map((iss: string, idx) => (
                        <span className="issue-chip" key={idx}>{iss}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </section>
        {/* ============================================================
    🩺 PAINEL DE DIAGNÓSTICO AVANÇADO — SIGMA-Q V3
============================================================ */}
<section className="defeitos-panel" style={{ marginTop: 20 }}>
  <h4>🩺 Diagnóstico Avançado do Sistema</h4>

  {/* 1. Status das Bases */}
  <div style={{ marginTop: 12, marginBottom: 12, fontWeight: 600 }}>
    Status das Bases Carregadas
  </div>

  <table className="defeitos-table" style={{ marginBottom: 20 }}>
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
      {["af", "lcm", "produto", "pth"].map((k) => {
        const b = stats?.perBase?.[k];
        return (
          <tr key={k}>
            <td>{k.toUpperCase()}</td>
            <td>{b?.total ?? 0}</td>
            <td>{b?.identified ?? 0}</td>
            <td>{b?.notIdentified ?? 0}</td>
            <td>{Number(b?.percentIdentified ?? 0).toFixed(2)}%</td>
          </tr>
        );
      })}
    </tbody>
  </table>

  {/* 2. Diagnóstico dos Catálogos */}
  <div style={{ marginTop: 12, marginBottom: 12, fontWeight: 600 }}>
    Diagnóstico dos Catálogos
  </div>

  <div className="breakdown-list">
    <div className="break-item">
      <div>Modelos ativos</div>
      <div>{catalogos.modelos ? "✔️ ON" : "❌ OFF"}</div>
    </div>
    <div className="break-item">
      <div>Códigos de falha ativos</div>
      <div>{catalogos.falhas ? "✔️ ON" : "❌ OFF"}</div>
    </div>
    <div className="break-item">
      <div>Responsabilidades ativas</div>
      <div>{catalogos.responsabilidades ? "✔️ ON" : "❌ OFF"}</div>
    </div>
    <div className="break-item">
      <div>Não Mostrar Índice ativo</div>
      <div>{catalogos.naoMostrar ? "✔️ ON" : "❌ OFF"}</div>
    </div>
  </div>

  {/* 3. Detecção Automática de Problemas */}
  <div style={{ marginTop: 20, marginBottom: 8, fontWeight: 600 }}>
    Detectado pelo Sistema
  </div>

  <div style={{ paddingLeft: 10 }}>
    {(() => {
      const problems: string[] = [];

      // Base com zero itens
      ["af", "lcm", "produto", "pth"].forEach((k) => {
        if ((stats?.perBase?.[k]?.total ?? 0) === 0)
          problems.push(`⚠️ Base ${k.toUpperCase()} está vazia (0 itens).`);
      });

      // Total global zero
      if ((stats?.totalItems ?? 0) === 0)
        problems.push("🚨 Nenhuma base retornou dados — totalItems = 0.");

      // Catálogos desativados
      if (!catalogos.modelos) problems.push("⚠️ Catálogo de Modelos está DESATIVADO.");
      if (!catalogos.falhas) problems.push("⚠️ Catálogo de Falhas está DESATIVADO.");
      if (!catalogos.responsabilidades) problems.push("⚠️ Catálogo de Responsabilidades DESATIVADO.");

      if (problems.length === 0)
        return <div style={{ color: "var(--success)" }}>✔️ Nenhum problema detectado.</div>;

      return problems.map((p, i) => (
        <div key={i} style={{ color: "var(--danger)", marginBottom: 4 }}>
          {p}
        </div>
      ));
    })()}
  </div>

  {/* 4. Métricas Brutas */}
  <div style={{ marginTop: 20, marginBottom: 8, fontWeight: 600 }}>
    Métricas Brutas (para debug técnico)
  </div>

  <pre
    style={{
      background: "rgba(255,255,255,0.04)",
      padding: 12,
      borderRadius: 10,
      border: "1px solid var(--glass-border)",
      whiteSpace: "pre-wrap",
      fontSize: 12,
      maxHeight: 280,
      overflowY: "auto",
    }}
  >
    {JSON.stringify(stats, null, 2)}
  </pre>
</section>
      </main>
    </div>
  );
}