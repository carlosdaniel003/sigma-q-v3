import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { ProductionInputRow } from "./ppmInputTypes";
import { NormalizedProduction } from "./ppmNormalizedTypes";

/* ======================================================
   Utils
====================================================== */
function norm(value: any): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function buildGroupKey(row: ProductionInputRow): string {
  const categoria = norm(row.CATEGORIA);
  const modelo = norm(row.MODELO);
  if (!categoria || !modelo) return "";
  return `${categoria}::${modelo}`;
}

/* ======================================================
   🔥 PARSER ROBUSTO DE DATA (SEM SHIFT DE FUSO)
   - Excel (serial)
   - String
   - Date
   REGRA: data civil → fixar 12:00
====================================================== */
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  let date: Date | null = null;

  // Já é Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    date = new Date(value.getTime());
  }

  // Número serial do Excel
  else if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    date = new Date(excelEpoch.getTime() + value * 86400000);
  }

  // String
  else if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/[\/\-]/);
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      date = new Date(y, m - 1, d);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  }

  if (!date || isNaN(date.getTime())) return null;

  // 🔒 trava no meio do dia (anti UTC/DST)
  date.setHours(12, 0, 0, 0);

  return date;
}

/* ======================================================
   🔥 LOAD RAW — PRODUÇÃO (EXCEL → ProductionInputRow[])
   → USADO PELO DASHBOARD E PPM ENGINE
====================================================== */
export function loadProductionRaw(): ProductionInputRow[] {
  const filePath = path.join(
    process.cwd(),
    "public",
    "productions",
    "producao.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error("Arquivo producao.xlsx não encontrado");
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<ProductionInputRow>(sheet);

  return rows;
}

/* ======================================================
   NORMALIZA PRODUÇÃO (COM DATA CORRETA)
====================================================== */
export function normalizeProductionForPpm(
  rows: ProductionInputRow[]
): NormalizedProduction[] {
  const map = new Map<string, NormalizedProduction>();

  for (const r of rows) {
    const produzido = Number(r.QTY_GERAL) || 0;
    if (produzido <= 0) continue;

    const groupKey = buildGroupKey(r);
    if (!groupKey) continue;

    // 🔥 DATA DA PRODUÇÃO (parser robusto)
    const dataProducao = parseExcelDate((r as any).DATA);

    if (!map.has(groupKey)) {
      map.set(groupKey, {
        groupKey,
        categoria: norm(r.CATEGORIA),
        modelo: norm(r.MODELO),
        produzido: 0,
        datasProducao: [],
      });
    }

    const item = map.get(groupKey)!;
    item.produzido += produzido;

    // 🔥 guarda somente datas válidas
    if (dataProducao) {
      item.datasProducao!.push(dataProducao);
    }
  }

  return Array.from(map.values());
}