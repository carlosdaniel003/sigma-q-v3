// =============================================================
// TERMINAL DO SISTEMA — SIGMA-Q (EXTRAÍDO DO PAGE.TSX)
// =============================================================

"use client";

import React, { useEffect, useRef } from "react";
import { Terminal, CheckCircle2, AlertCircle, Cpu, Activity, Info } from "lucide-react";

interface LogEntry {
  ts: string;
  msg: string;
  type: "info" | "success" | "error" | "process";
}

interface TerminalSistemaProps {
  logs: LogEntry[];
  progress: number;
  loading: boolean;
}

export default function TerminalSistema({ logs, progress, loading }: TerminalSistemaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length, loading]);

  return (
    <section
      className="defeitos-panel"
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* =============================================================
          HEADER DO TERMINAL
      ============================================================= */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--glass-border)",
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Título */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.8rem",
            color: "var(--text)",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          <Terminal size={14} style={{ color: "var(--brand)" }} />
          <span>SIGMA-Q CONSOLE</span>
          <span style={{ opacity: 0.2 }}>|</span>
          <span style={{ fontFamily: "monospace", opacity: 0.6 }}>
            v4.0.2-build
          </span>
        </div>

        {/* Status */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.75rem",
              color: "var(--brand)",
              fontWeight: 600,
            }}
          >
            <Activity size={14} className="animate-pulse" />
            <span>PROCESSANDO... {progress}%</span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "var(--success)",
            }}
          >
            <CheckCircle2 size={14} />
            <span>ONLINE</span>
          </div>
        )}
      </div>

      {/* =============================================================
          BARRA DE PROGRESSO
      ============================================================= */}
      <div
        style={{
          width: "100%",
          height: "2px",
          background: "rgba(255,255,255,0.05)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--brand)",
            boxShadow: "0 0 10px var(--brand)",
            transition: "width 0.4s ease-out",
          }}
        />
      </div>

      {/* =============================================================
          LOGS
      ============================================================= */}
      <div className="log-box" ref={containerRef}>
        {logs.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "var(--muted)",
              fontStyle: "italic",
            }}
          >
            Aguardando inicialização dos subsistemas...
          </div>
        )}

        {logs.map((l, i) => (
          <div
            key={i}
            className="log-line"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* Timestamp */}
            <span
              style={{
                color: "var(--muted)",
                minWidth: "65px",
                fontSize: "0.7rem",
                fontFamily: "monospace",
              }}
            >
              {l.ts}
            </span>

            {/* Ícone */}
            <span style={{ display: "flex", alignItems: "center" }}>
              {l.type === "success" && (
                <CheckCircle2 size={13} color="var(--success)" />
              )}
              {l.type === "error" && (
                <AlertCircle size={13} color="var(--danger)" />
              )}
              {l.type === "process" && (
                <Cpu size={13} color="var(--brand)" />
              )}
              {l.type === "info" && <Info size={13} color="var(--muted)" />}
            </span>

            {/* Mensagem */}
            <span
              style={{
                color:
                  l.type === "error"
                    ? "var(--danger)"
                    : l.type === "success"
                    ? "var(--success)"
                    : l.type === "process"
                    ? "var(--text-strong)"
                    : "var(--text)",
                fontWeight: l.type === "process" ? 600 : 400,
              }}
            >
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}