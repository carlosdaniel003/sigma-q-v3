"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import "./defeitos.css";
import { Terminal, CheckCircle2, AlertCircle, Cpu, Activity, Info } from "lucide-react";

// -----------------------------------------------------------------
// 1. COMPONENTE VISUAL: TERMINAL DE SISTEMA
// -----------------------------------------------------------------
interface LogEntry {
  ts: string;
  msg: string;
  type: "info" | "success" | "error" | "process";
}

function SystemTerminal({ logs, progress, loading }: { logs: LogEntry[], progress: number, loading: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length, loading]);

  return (
    <section className="defeitos-panel" style={{ padding: 0, overflow: "hidden", display: 'flex', flexDirection: 'column' }}>
      {/* HEADER DO TERMINAL */}
      <div style={{ 
        padding: "12px 16px", 
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(0,0,0,0.2)",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8rem", color: "var(--text)", fontWeight: 700, letterSpacing: "0.05em" }}>
          <Terminal size={14} style={{ color: "var(--brand)" }} />
          <span>SIGMA-Q CONSOLE</span>
          <span style={{ opacity: 0.2 }}>|</span>
          <span style={{ fontFamily: "monospace", opacity: 0.6 }}>v4.0.2-build</span>
        </div>
        
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "var(--brand)", fontWeight: 600 }}>
            <Activity size={14} className="animate-pulse" />
            <span>PROCESSANDO... {progress}%</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--success)" }}>
            <CheckCircle2 size={14} />
            <span>ONLINE</span>
          </div>
        )}
      </div>

      {/* BARRA DE PROGRESSO */}
      <div style={{ width: "100%", height: "2px", background: "rgba(255,255,255,0.05)", position: "relative" }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            height: "100%", 
            background: "var(--brand)",
            boxShadow: "0 0 10px var(--brand)",
            transition: "width 0.4s ease-out"
          }} 
        />
      </div>

      {/* ÁREA DE LOGS */}
      <div className="log-box" ref={containerRef}>
        {logs.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontStyle: "italic" }}>
            Aguardando inicialização dos subsistemas...
          </div>
        )}

        {logs.map((l, i) => (
          <div key={i} className="log-line" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ color: "var(--muted)", minWidth: "65px", fontSize: "0.7rem", fontFamily: "monospace" }}>{l.ts}</span>
            <span style={{ display: "flex", alignItems: "center" }}>
              {l.type === "success" && <CheckCircle2 size={13} color="var(--success)" />}
              {l.type === "error" && <AlertCircle size={13} color="var(--danger)" />}
              {l.type === "process" && <Cpu size={13} color="var(--brand)" />}
              {l.type === "info" && <Info size={13} color="var(--muted)" />} 
            </span>
            <span style={{ 
              color: l.type === "error" ? "var(--danger)" : l.type === "success" ? "var(--success)" : l.type === "process" ? "var(--text-strong)" : "var(--text)",
              fontWeight: l.type === "process" ? 600 : 400
            }}>
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------
// 2. PAGE PRINCIPAL (COM KILL SWITCH)
// -----------------------------------------------------------------

type Fonte = "todas" | "af" | "lcm" | "produto acabado" | "pth";

export default function DefeitosValidationPage() {

  // STATE GERAL
  const [fonte, setFonte] = useState<Fonte>("todas");
  const [limit] = useState(30); 
  const [offset] = useState(0);

  // DADOS
  const [stats, setStats] = useState<any>(null);
  const [diag, setDiag] = useState<any[]>([]);
  
  // STATE DE CONTROLE VISUAL (TERMINAL)
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [diagFilter, setDiagFilter] = useState("todos");

  // 🛡️ KILL SWITCH: Referência para saber se o componente ainda está na tela
  const mounted = useRef(true);

  // Configuração de Catálogos
  const [catalogos, setCatalogos] = useState({
    modelos: true,
    falhas: true,
    responsabilidades: true,
    naoMostrar: true,
    todos: true
  });

  // Helper de Log (Protegido)
  const addLog = (msg: string, type: "info" | "success" | "error" | "process" = "info") => {
    if (!mounted.current) return; // Se saiu da tela, ignora o log
    const ts = new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [...prev, { ts, msg, type }]);
  };

  const catalogosQuery = useMemo(() => {
    return Object.entries(catalogos)
      .filter(([k, v]) => k !== "todos" && v)
      .map(([k]) => k)
      .join(",");
  }, [catalogos]);

  // ---------------------------------------------------------
  // 🚀 ENGINE DE CARREGAMENTO (Atualizada)
  // ---------------------------------------------------------
  
  // Agora aceita um 'signal' para cancelar a requisição de rede
  async function runFullAnalysis(targetFonte: Fonte, abortSignal: AbortSignal) {
    if (!mounted.current) return;

    setLoading(true);
    setProgress(0);
    setLogs([]);
    
    addLog(`INICIANDO SISTEMA SIGMA-Q V4`, "process");
    addLog(`Conectando ao Data Lake (Fonte: ${targetFonte.toUpperCase()})...`, "info");

    const t0 = performance.now();
    let progressValue = 0;

    // Intervalo visual (Fake progress)
    const interval = setInterval(() => {
      if (!mounted.current) { clearInterval(interval); return; } // Mata o intervalo se sair
      progressValue += Math.random() * 2.5;
      if (progressValue > 92) progressValue = 92;
      setProgress(Math.round(progressValue));

      const p = Math.round(progressValue);
      // Logs aleatórios para dar feedback visual
      if (p > 10 && p < 15 && Math.random() > 0.8) addLog(`Carregando cache de definições...`, "info");
      if (p > 25 && p < 30 && Math.random() > 0.8) addLog(`Enriquecimento em ${p}% - Analisando strings...`, "info");
    }, 600);

    try {
      addLog("Solicitando pacotes de análise (Stats + Diagnose)...", "process");
      
      // Passamos o 'signal' para o fetch. Se o usuário sair, o fetch é cancelado pelo browser.
      const [resStats, resDiag] = await Promise.all([
        fetch(`/api/defeitos/stats?fonte=${targetFonte}&catalogos=${catalogosQuery}`, { signal: abortSignal }),
        fetch(`/api/defeitos/diagnose?fonte=${targetFonte}&limit=30&catalogos=${catalogosQuery}&filter=${diagFilter}`, { signal: abortSignal })
      ]);

      if (!mounted.current) return; // Validação dupla pós-fetch

      addLog("Pacotes recebidos. Processando JSON...", "process");

      const dataStats = await resStats.json();
      const dataDiag = await resDiag.json();

      if (!mounted.current) return;

      setStats(dataStats);
      
      if (dataDiag.ok && Array.isArray(dataDiag.items)) {
        setDiag(dataDiag.items);
      } else {
        setDiag([]);
      }

      clearInterval(interval);
      setProgress(100);
      const totalTime = ((performance.now() - t0) / 1000).toFixed(2);
      
      addLog(`✓ Carga completa em ${totalTime}s`, "success");
      addLog(`Itens Processados: ${dataStats.totalItems?.toLocaleString() ?? 0}`, "success");
      
      if (dataStats.notIdentified > 0) {
         addLog(`⚠️ Inconsistências Detectadas: ${dataStats.notIdentified?.toLocaleString()}`, "error");
      } else {
         addLog(`✓ Base 100% consistente.`, "success");
      }

    } catch (err: any) {
      clearInterval(interval);
      // Se o erro for de cancelamento (usuário saiu), não faz nada
      if (err.name === 'AbortError') {
        console.log("Processo abortado pelo usuário.");
        return;
      }
      if (mounted.current) {
        setProgress(100);
        addLog(`ERRO CRÍTICO: ${String(err)}`, "error");
        console.error(err);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // AUTO-START & CLEANUP (O Segredo está aqui)
  // ---------------------------------------------------------
  useEffect(() => {
    // 1. Marca como montado
    mounted.current = true;
    
    // 2. Cria o controlador de aborto
    const controller = new AbortController();

    // 3. ⏳ DELAY DE SEGURANÇA (800ms)
    // Se o usuário sair da página antes de 800ms, o request pesado nem começa.
    const timer = setTimeout(() => {
      if (mounted.current) {
        runFullAnalysis(fonte, controller.signal);
      }
    }, 800);

    // 4. FUNÇÃO DE LIMPEZA (Roda quando você sai da página)
    return () => {
      mounted.current = false; // "Desliga" as atualizações de estado
      clearTimeout(timer);     // Cancela o início se for rápido
      controller.abort();      // Cancela as requisições de rede pendentes
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonte, catalogosQuery]); 

  // Effect separado para o filtro de diagnóstico (também protegido)
  useEffect(() => {
    // Não roda se estiver carregando a página inteira ainda
    if (!loading) {
       const controller = new AbortController();
       
       const fetchDiagOnly = async () => {
         if (!mounted.current) return;
         addLog(`Atualizando filtro de diagnóstico: ${diagFilter.toUpperCase()}...`, "process");
         try {
            const res = await fetch(
                `/api/defeitos/diagnose?fonte=${fonte}&limit=30&catalogos=${catalogosQuery}&filter=${diagFilter}`,
                { signal: controller.signal }
            );
            if (!mounted.current) return;
            const j = await res.json();
            if (j.ok) setDiag(j.items);
            addLog("Filtro aplicado.", "success");
         } catch (e: any) {
            if (e.name !== 'AbortError' && mounted.current) {
                addLog("Erro ao filtrar diagnósticos.", "error");
            }
         }
       };
       fetchDiagOnly();

       return () => {
         controller.abort();
       };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagFilter]);


  // ----------------------
  // HELPERS (Sem mudanças de lógica, apenas proteção visual)
  // ----------------------
  const total = Number(stats?.totalItems ?? 0);
  const notIdentified = Number(stats?.notIdentified ?? 0);
  const aiOverall = Number(stats?.percentIdentified ?? 0);
  const totalDefeitos = Number(stats?.totalDefeitos ?? 0);
  const breakdown = stats?.notIdentifiedBreakdown ?? { modelos: 0, falhas: 0, responsabilidades: 0, naoMostrar: 0 };
  const perBase = stats?.perBase ?? {};

  const toggleCatalogo = (key: string) => {
    setCatalogos(prev => {
      if (key === "todos") {
        const val = !prev.todos;
        return { modelos: val, falhas: val, responsabilidades: val, naoMostrar: val, todos: val };
      }
      const novo = { ...prev, [key]: !prev[key] };
      novo.todos = novo.modelos && novo.falhas && novo.responsabilidades && novo.naoMostrar;
      return novo;
    });
  };

  return (
    <div className="defeitos-container">

      {/* SIDEBAR */}
      <aside className="defeitos-sidebar">
        <div className="sidebar-title" style={{ color: "var(--brand)" }}>SIGMA-Q</div>
        
        <div className="sidebar-group">
          <div className="sidebar-title">Bases de Dados</div>
          {(["todas", "af", "lcm", "produto acabado", "pth"] as Fonte[]).map(f => (
            <button
              key={f}
              className={`sidebar-btn ${fonte === f ? "active" : ""}`}
              onClick={() => setFonte(f)} 
            >
              {f === "todas" ? "TODAS" : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="sidebar-group">
          <div className="sidebar-title">Catálogos Ativos</div>
          <div className="catalogo-chips">
            {[
              ["modelos", "Modelos"],
              ["falhas", "Códigos de Falha"],
              ["responsabilidades", "Responsabilidades"],
              ["naoMostrar", "Índice (Ocultos)"],
              ["todos", "Selecionar Todos"]
            ].map(([k, label]) => (
              <div
                key={k}
                className={`chip ${catalogos[k as keyof typeof catalogos] ? "chip-on" : "chip-off"}`}
                onClick={() => toggleCatalogo(k)}
              >
                <span>{label}</span>
                <span style={{fontSize: 10}}>{catalogos[k as keyof typeof catalogos] ? "●" : "○"}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sidebar-group muted" style={{ marginTop: 'auto', fontSize: '0.75rem', lineHeight: '1.4' }}>
           Vercel Enterprise<br/>Turso DB<br/>v4.0.2
        </div>
      </aside>


      {/* MAIN CONTENT */}
      <main className="defeitos-main">

        <header className="defeitos-header" style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>Validação de Defeitos</h2>
          <div className="muted">Motor de Validação & Enriquecimento de Dados</div>
        </header>

        {/* 1. KPIs */}
        <section className="top-stats">
          <div className="stat-card">
            <div className="stat-title">Registros Processados</div>
            <div className="stat-value">{total.toLocaleString()}</div>
            <div className="stat-sub">linhas brutas</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Volume de Defeitos</div>
            <div className="stat-value">{totalDefeitos.toLocaleString()}</div>
            <div className="stat-sub">somatória (qty)</div>
          </div>

          <div className="stat-card" style={{ border: notIdentified > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '' }}>
            <div className="stat-title">Não Identificados</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>{notIdentified.toLocaleString()}</div>
            <div className="stat-sub">inconsistências</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Precisão da IA</div>
            <div className="kpi-value">{aiOverall.toFixed(2)}%</div>
            <div className="stat-sub">match rate</div>
          </div>
        </section>

        {/* 2. BREAKDOWN & KPIs POR BASE */}
        <section className="breakdown-grid">
          <div className="defeitos-panel">
            <h4 style={{ marginBottom: 16 }}>Detalhamento de Inconsistências</h4>
            <div className="breakdown-list">
              <div className="break-item"><div>Modelos Desconhecidos</div><div>{breakdown.modelos}</div></div>
              <div className="break-item"><div>Códigos de Falha Inválidos</div><div>{breakdown.falhas}</div></div>
              <div className="break-item"><div>Resp. / Fornecedor Inválido</div><div>{breakdown.responsabilidades}</div></div>
              <div className="break-item"><div>Itens Ocultos (Índice)</div><div>{breakdown.naoMostrar}</div></div>
            </div>
          </div>

          <div className="defeitos-panel">
            <h4 style={{ marginBottom: 16 }}>Performance por Base de Dados</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["af", "lcm", "produto acabado", "pth"].map(key => (
                <div className="per-base-item" key={key}>
                  <div style={{fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-strong)'}}>{key.toUpperCase()}</div>
                  <div className="value" style={{ color: Number(perBase?.[key]?.percentIdentified) < 99 ? 'var(--warn)' : 'var(--success)' }}>
                    {Number(perBase?.[key]?.percentIdentified ?? 0).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. DIAGNÓSTICO INTELIGENTE (Cards com IA) */}
        <section className="defeitos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <div>
              <h4 style={{ margin: 0 }}>🧠 Diagnóstico Inteligente</h4>
              <div className="muted" style={{ fontSize: "0.85rem" }}>Análise semântica das falhas mais críticas.</div>
            </div>
            
            {/* Filtros de Diagnóstico */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "todos", label: "GERAL" },
                { id: "modelos", label: "MODELOS" },
                { id: "falhas", label: "FALHAS" },
                { id: "responsabilidades", label: "RESPONSABILIDADES" },
                { id: "naoMostrar", label: "ÍNDICE" }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setDiagFilter(item.id)}
                  style={{ 
                    opacity: diagFilter === item.id ? 1 : 0.5, 
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: diagFilter === item.id ? 'var(--brand)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid transparent',
                    color: diagFilter === item.id ? '#000' : 'var(--text)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {!loading && diag.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--glass-border)", borderRadius: 12, color: "var(--muted)" }}>
              Nenhuma inconsistência encontrada para este filtro.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {diag.map((item, idx) => (
              <div key={idx} className="diag-card" style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", position: "relative", overflow: "hidden" }}>
                {/* Indicador Lateral */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: item.severity === 'high' ? 'var(--danger)' : 'var(--warn)' }} />
                
                <div style={{ paddingLeft: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "var(--text-strong)", padding: "2px 6px", borderRadius: 4 }}>
                        {item.fonte}
                      </span>
                      <strong style={{ fontSize: "1rem", color: "var(--text-strong)" }}>{item.modelo || item.fornecedor || "Item Desconhecido"}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                      {item.count} CASOS
                    </div>
                  </div>

                  {/* Contexto Rápido */}
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 10, display: "flex", gap: 16 }}>
                    {item.falha && item.falha !== "N/A" && <span>Falha: <span style={{color: "var(--text)"}}>{item.falha}</span></span>}
                    {item.resp && item.resp !== "N/A" && <span>Resp: <span style={{color: "var(--text)"}}>{item.resp}</span></span>}
                  </div>

                  {/* Explicações */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {item.explicacao && item.explicacao.map((exp: string, i: number) => (
                      <div key={i} style={{ color: "var(--text)", fontSize: "0.9rem", display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: "var(--danger)", fontSize: "1rem", lineHeight: 1 }}>×</span> 
                        <span>{exp}</span>
                      </div>
                    ))}
                    
                    {item.sugestao && item.sugestao.length > 0 && (
                      <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: 6, padding: "8px 12px", marginTop: 6 }}>
                        {item.sugestao.map((sug: string, i: number) => (
                          <div key={i} style={{ color: "var(--success)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                            <span>💡</span> 
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DIAGNÓSTICO AVANÇADO (METADADOS) */}
        <section className="defeitos-panel">
          <h4 style={{ marginBottom: 12 }}>🩺 Diagnóstico Avançado do Sistema</h4>

          {/* Status das Bases */}
          <div className="defeitos-scroll">
            <table className="defeitos-table">
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
                {["af", "lcm", "produto acabado", "pth"].map((k) => {
                  const b = stats?.perBase?.[k];
                  return (
                    <tr key={k}>
                      <td style={{ fontWeight: 600 }}>{k.toUpperCase()}</td>
                      <td>{b?.total ?? 0}</td>
                      <td style={{ color: "var(--success)" }}>{b?.identified ?? 0}</td>
                      <td style={{ color: (b?.notIdentified ?? 0) > 0 ? "var(--danger)" : "var(--muted)" }}>{b?.notIdentified ?? 0}</td>
                      <td>{Number(b?.percentIdentified ?? 0).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detecção Automática de Problemas (REMASTERIZADA) */}
          <div style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--glass-border)" }}>
            <div style={{ marginBottom: 10, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} />
              Insights Operacionais
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(() => {
                const problems: React.ReactNode[] = [];
                let hasIssues = false;

                // 1. ANÁLISE DE BASES CRÍTICAS (Performance < 99%)
                // Identifica qual base está "puxando a média para baixo"
                ["af", "lcm", "produto acabado", "pth"].forEach((k) => {
                  const baseStats = stats?.perBase?.[k];
                  const total = baseStats?.total ?? 0;
                  const pct = Number(baseStats?.percentIdentified ?? 100);
                  const notId = baseStats?.notIdentified ?? 0;

                  if (total === 0) {
                     problems.push(
                        <div key={`empty-${k}`} style={{ color: "var(--warn)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                           <AlertCircle size={16} />
                           <span>A base <strong>{k.toUpperCase()}</strong> está vazia ou não foi carregada.</span>
                        </div>
                     );
                     hasIssues = true;
                  } else if (pct < 99 && notId > 0) {
                     problems.push(
                        <div key={`low-${k}`} style={{ color: "var(--danger)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                           <AlertCircle size={16} />
                           <span>
                              Atenção à base <strong>{k.toUpperCase()}</strong>: {pct.toFixed(1)}% de qualidade. Responsável por {notId} erros.
                           </span>
                        </div>
                     );
                     hasIssues = true;
                  }
                });

                // 2. ANÁLISE DE PARETO (Qual o tipo de erro dominante?)
                // Se um tipo de erro for responsável por mais de 50% dos problemas, sugerimos ação focada.
                const totalInconsistencias = Number(stats?.notIdentified ?? 0);
                if (totalInconsistencias > 0) {
                    const breakdown = stats?.notIdentifiedBreakdown || {};
                    const maxType = Object.keys(breakdown).reduce((a, b) => breakdown[a] > breakdown[b] ? a : b);
                    const maxCount = breakdown[maxType];
                    const impact = (maxCount / totalInconsistencias) * 100;

                    if (impact > 50) {
                        let label = "";
                        let action = "";
                        
                        switch(maxType) {
                            case "responsabilidades": 
                                label = "Responsabilidades / Fornecedores"; 
                                action = "Padronizar códigos de fornecedor.";
                                break;
                            case "modelos": 
                                label = "Cadastro de Modelos"; 
                                action = "Verificar novos produtos sem cadastro.";
                                break;
                            case "falhas": 
                                label = "Códigos de Falha"; 
                                action = "Atualizar catálogo de falhas.";
                                break;
                            default: 
                                label = maxType;
                                action = "Verificar regras de negócio.";
                        }

                        problems.push(
                            <div key="action-focus" style={{ color: "var(--brand)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                               <Info size={16} />
                               <span>
                                  <strong>Sugestão de Foco:</strong> {impact.toFixed(0)}% dos erros são de '{label}'. Ação recomendada: {action}
                               </span>
                            </div>
                        );
                        hasIssues = true;
                    }
                }

                // 3. STATUS POSITIVO (Só aparece se realmente estiver tudo perfeito)
                if (!hasIssues) {
                  return (
                    <div style={{ color: "var(--success)", display:'flex', alignItems:'center', gap: 8, fontSize: "0.9rem" }}>
                        <CheckCircle2 size={16}/> 
                        <span>Excelência Operacional: Todas as bases estão acima de 99% de integridade.</span>
                    </div>
                  );
                }

                return problems;
              })()}
            </div>
          </div>
        </section>

        {/* 5. TERMINAL DE SISTEMA (Consolidado) */}
        <SystemTerminal logs={logs} progress={progress} loading={loading} />

      </main>
    </div>
  );
}