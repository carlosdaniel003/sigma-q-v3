// src/core/ppm/ppmMonthlyTrend.ts

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { ProductionInputRow, DefectInputRow } from "./ppmInputTypes";

export interface PpmMonthlyTrend {
  month: string; // YYYY-MM
  production: number;
  defects: number;
  ppm: number | null;
}

/* ======================================================
   CATÁLOGO — NÃO MOSTRAR NO ÍNDICE (OCORRÊNCIAS)
====================================================== */
function norm(value: any): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

let catalogoSet = new Set<string>();

try {
  const catalogoPath = path.join(
    process.cwd(),
    "app",
    "development",
    "catalogo",
    "data",
    "catalogo_nao_mostrar_indice.xlsx"
  );

  if (fs.existsSync(catalogoPath)) {
    const buffer = fs.readFileSync(catalogoPath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    catalogoSet = new Set(
      rows
        .map((r) => norm(r["CÓDIGO"] || r["CODIGO"]))
        .filter(Boolean)
    );
  }
} catch (err) {
  console.warn(
    "⚠️ [PPM Monthly] Erro ao carregar catálogo de ocorrências",
    err
  );
}

/* ======================================================
   PARSER DE DATA (ROBUSTO)
====================================================== */
function parseDate(value: any): Date | null {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    const d = new Date(value);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + value * 86400000);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return null;

    const parts = t.split(/[\/\-]/);
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        date.setHours(12, 0, 0, 0);
        return date;
      }
    }

    const parsed = new Date(t);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(12, 0, 0, 0);
      return parsed;
    }
  }

  return null;
}

/* ======================================================
   PPM MENSAL — RAW + SEM OCORRÊNCIAS (CORRETO)
====================================================== */
export function calculatePpmMonthlyTrend(
  productionRows: ProductionInputRow[],
  defectRows: DefectInputRow[]
): PpmMonthlyTrend[] {
  const productionByMonth = new Map<string, number>();
  const defectsByMonth = new Map<string, number>();

  /* ==============================
     PRODUÇÃO
  ============================== */
  for (const r of productionRows) {
    const qty = Number(r.QTY_GERAL) || 0;
    if (qty <= 0) continue;

    const d = parseDate((r as any).DATA);
    if (!d) continue;

    const month = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;

    productionByMonth.set(
      month,
      (productionByMonth.get(month) || 0) + qty
    );
  }

  /* ==============================
     DEFEITOS (❌ EXCLUINDO OCORRÊNCIAS)
  ============================== */
  for (const r of defectRows) {
    const qty = Number(r.QUANTIDADE) || 0;
    if (qty <= 0) continue;

    const codigoFornecedor = norm(
      (r as any)["CÓDIGO DO FORNECEDOR"]
    );

    // 🔥 OCORRÊNCIA → NÃO CONTA
    if (catalogoSet.has(codigoFornecedor)) {
      continue;
    }

    const d = parseDate((r as any).DATA);
    if (!d) continue;

    const month = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;

    defectsByMonth.set(
      month,
      (defectsByMonth.get(month) || 0) + qty
    );
  }

  /* ==============================
     CONSOLIDAÇÃO FINAL
  ============================== */
  const months = Array.from(
    new Set([
      ...productionByMonth.keys(),
      ...defectsByMonth.keys(),
    ])
  ).sort();

  return months.map((month) => {
    const production = productionByMonth.get(month) || 0;
    const defects = defectsByMonth.get(month) || 0;

    return {
      month,
      production,
      defects,
      ppm:
        production > 0
          ? Number(
              ((defects / production) * 1_000_000).toFixed(2)
            )
          : null,
    };
  });
}