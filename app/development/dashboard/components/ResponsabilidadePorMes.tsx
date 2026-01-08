"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Label,
} from "recharts";

/* ======================================================
   CORES FIXAS — SIGMA-Q
====================================================== */
const COLORS: Record<string, string> = {
  "FORN. IMPORTADO": "#60A5FA", // Azul Claro
  "FORN. LOCAL": "#2563EB",     // Azul Escuro
  "PROCESSO": "#F59E0B",        // Laranja
  "PROJETO": "#8B5CF6",         // Roxo
};

/* ======================================================
   META DE NEGÓCIO
====================================================== */
const META_PPM = 6200;

/* ======================================================
   TIPOS
====================================================== */
interface ResponsabilidadeMesItem {
  month: string;
  production: number;
  totalDefects: number;

  "FORN. IMPORTADO": number;
  "FORN. LOCAL": number;
  "PROCESSO": number;
  "PROJETO": number;
}

interface PpmMonthlyTrendItem {
  month: string;
  ppm: number | null;
}

interface Props {
  data?: ResponsabilidadeMesItem[];
  ppmMonthlyTrend?: PpmMonthlyTrendItem[];
}

/* ======================================================
   UTILS
====================================================== */
function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", { month: "long" })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());
}

function calcPpm(defects: number, production: number): number {
  if (!production || production <= 0) return 0;
  return (defects / production) * 1_000_000;
}

/* ======================================================
   CUSTOM LABEL (DENTRO DA BARRA)
   Mostra valor DO SEGMENTO se a barra for alta o suficiente
====================================================== */
const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  // Só mostra se a altura da barra for maior que 25px e o valor > 0
  if (height < 25 || !value) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      style={{ fontSize: 11, fontWeight: "bold", pointerEvents: "none" }}
    >
      {value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   CUSTOM LABEL (TOPO DA BARRA)
   Mostra o PPM Total do Mês
====================================================== */
const renderTotalLabel = (props: any, chartData: any[]) => {
  const { x, y, width, index } = props;
  const item = chartData[index];
  
  // Calcula o total somando as partes visíveis no gráfico
  const totalPpm = 
    (item["FORN. IMPORTADO"] || 0) + 
    (item["FORN. LOCAL"] || 0) + 
    (item["PROCESSO"] || 0) + 
    (item["PROJETO"] || 0);

  if (!totalPpm) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 10} // Um pouco acima da barra
      fill="#cbd5e1"
      textAnchor="middle"
      style={{ fontSize: 11, fontWeight: "bold" }}
    >
      {totalPpm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </text>
  );
};

/* ======================================================
   COMPONENTE
====================================================== */
export default function ResponsabilidadePorMes({
  data,
  ppmMonthlyTrend,
}: Props) {
  /* ===============================
     GUARD MÍNIMO
  =============================== */
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
          height: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        Nenhum dado de responsabilidade disponível
      </div>
    );
  }

  /* ===============================
     DADOS PARA O GRÁFICO
  =============================== */
  const chartData = data
    .filter((m) => m.production > 0)
    .map((m) => ({
      month: m.month,
      production: m.production,
      totalDefects: m.totalDefects,

      "FORN. IMPORTADO": calcPpm(m["FORN. IMPORTADO"], m.production),
      "FORN. LOCAL": calcPpm(m["FORN. LOCAL"], m.production),
      "PROCESSO": calcPpm(m["PROCESSO"], m.production),
      "PROJETO": calcPpm(m["PROJETO"], m.production),
    }));

  const maxPpm =
    Math.max(
      ...chartData.map(
        (m) =>
          m["FORN. IMPORTADO"] +
          m["FORN. LOCAL"] +
          m["PROCESSO"] +
          m["PROJETO"]
      ),
      META_PPM
    ) * 1.2;

  /* ===============================
     RENDER
  =============================== */
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 24,
        height: 380,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ fontSize: "1.1rem" }}>
        📊 Responsabilidade por Mês (PPM)
      </h2>

      {/* LEGENDA */}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 13,
          opacity: 0.85,
          flexWrap: "wrap",
        }}
      >
        {Object.keys(COLORS).map((key) => (
          <div key={key} style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: COLORS[key],
              }}
            />
            {key}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />

            <YAxis
              domain={[0, maxPpm]}
              tickFormatter={(v) =>
                `${Math.round(v).toLocaleString("pt-BR")} PPM`
              }
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
            />

            {/* 🔴 LINHA DE META (COM RÓTULO CUSTOMIZADO) */}
            <ReferenceLine
              y={META_PPM}
              stroke="#EF4444"
              strokeDasharray="6 6"
              strokeWidth={2}
            >
              <Label 
                value={`Meta ${META_PPM.toLocaleString("pt-BR")} PPM`} 
                position="insideTopRight" 
                fill="#EF4444" 
                fontSize={12} 
                fontWeight={600}
                offset={10}
              />
            </ReferenceLine>

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              labelFormatter={(label) => {
                const raw = data.find((d) => d.month === label);
                const trend = ppmMonthlyTrend?.find(
                  (t) => t.month === label
                );
                return (
                  `${formatMonth(label)}\n` +
                  `Produção: ${raw?.production.toLocaleString("pt-BR")}\n` +
                  `PPM Total: ${
                    trend?.ppm !== null && trend?.ppm !== undefined
                      ? trend.ppm.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "-"
                  }`
                );
              }}
              formatter={(value: number, name: string, props: any) => {
                const raw = data.find(
                  (d) => d.month === props.payload.month
                );
                const defeitos = raw?.[name] ?? 0;

                return [
                  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PPM • ${defeitos} defeitos`,
                  name,
                ];
              }}
              contentStyle={{
                whiteSpace: "pre-line",
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                fontSize: 13,
              }}
            />

            {/* BARRAS EMPILHADAS */}
            {Object.keys(COLORS).map((key, index, arr) => {
              const isLast = index === arr.length - 1; 

              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={COLORS[key]}
                >
                  {/* ✅ Label Interno: Mostra apenas o valor do segmento */}
                  <LabelList 
                    dataKey={key} 
                    content={renderCustomBarLabel} 
                  />

                  {/* ✅ Label de Total no Topo: Apenas na última barra */}
                  {isLast && (
                     <LabelList
                       dataKey={key} // Chave base apenas para posição
                       position="top"
                       content={(props) => renderTotalLabel(props, chartData)}
                     />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}