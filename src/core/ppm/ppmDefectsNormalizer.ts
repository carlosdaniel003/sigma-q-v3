import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { DefectInputRow } from "./ppmInputTypes";
import { NormalizedDefect } from "./ppmNormalizedTypes";

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

function buildGroupKey(row: DefectInputRow): string {
  const categoria = norm(row.CATEGORIA);
  const modelo = norm(row.MODELO);
  if (!categoria || !modelo) return "";
  return `${categoria}::${modelo}`;
}

/* ======================================================
   🔥 PARSER ROBUSTO DE DATA (SEM SHIFT DE FUSO)
====================================================== */
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  let date: Date | null = null;

  // Date nativo
  if (value instanceof Date && !isNaN(value.getTime())) {
    date = new Date(value.getTime());
  }

  // Número serial Excel
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

  // 🔒 trava no meio do dia (evita problema de fuso/DST)
  date.setHours(12, 0, 0, 0);
  return date;
}

/* ======================================================
   CATÁLOGO — NÃO MOSTRAR NO ÍNDICE
====================================================== */
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
    "⚠️ [PPM] Erro ao carregar catálogo 'não mostrar índice'.",
    err
  );
}

/* ======================================================
   🔥 LOAD RAW — DEFEITOS (EXCEL → DefectInputRow[])
   → FONTE ÚNICA PARA DASHBOARD E PPM ENGINE
====================================================== */
export function loadDefectsRaw(): DefectInputRow[] {
  const filePath = path.join(
    process.cwd(),
    "public",
    "defeitos",
    "defeitos_produto_acabado.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      "Arquivo defeitos_produto_acabado.xlsx não encontrado"
    );
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json<DefectInputRow>(sheet);
}

/* ======================================================
   NORMALIZA DEFEITOS (COM DATA REAL)
   - Exclui ocorrências administrativas
   - Acumula defeitos produtivos
   - Preserva datas → base do PPM mensal
====================================================== */
export function normalizeDefectsForPpm(
  rows: DefectInputRow[]
): {
  normalized: NormalizedDefect[];
  totalOccurrences: number;
  occurrencesByCode: Record<string, number>;
  occurrencesByCategory: Record<string, number>;
} {
  const map = new Map<
    string,
    { defeitos: number; datasDefeito: Date[] }
  >();

  let totalOccurrences = 0;
  const occurrencesByCode: Record<string, number> = {};
  const occurrencesByCategory: Record<string, number> = {};

  rows.forEach((r) => {
    const qtd = Number(r.QUANTIDADE) || 0;
    if (qtd <= 0) return;

    const categoria = norm(r.CATEGORIA);
    const codigoFornecedor = norm(
      (r as any)["CÓDIGO DO FORNECEDOR"]
    );

    // 🔥 DATA DO DEFEITO — robusta
    const dataDefeito = parseExcelDate(
      (r as any).DATA ??
      (r as any).DATA_DEFEITO ??
      (r as any).data ??
      (r as any).data_defeito
    );

    /* ======================================================
       OCORRÊNCIA (IGNORADA NO PPM)
    ====================================================== */
    if (catalogoSet.has(codigoFornecedor)) {
      totalOccurrences += 1;

      occurrencesByCode[codigoFornecedor] =
        (occurrencesByCode[codigoFornecedor] || 0) + 1;

      occurrencesByCategory[categoria] =
        (occurrencesByCategory[categoria] || 0) + 1;

      return;
    }

    /* ======================================================
       DEFEITO REAL (PRODUTIVO)
    ====================================================== */
    const groupKey = buildGroupKey(r);
    if (!groupKey) return;

    if (!map.has(groupKey)) {
      map.set(groupKey, {
        defeitos: 0,
        datasDefeito: [],
      });
    }

    const item = map.get(groupKey)!;
    item.defeitos += qtd;

    if (dataDefeito) {
      item.datasDefeito.push(dataDefeito);
    }
  });

  const normalized: NormalizedDefect[] = Array.from(
    map.entries()
  ).map(([groupKey, info]) => ({
    groupKey,
    defeitos: info.defeitos,
    datasDefeito: info.datasDefeito,
    naoMostrarIndice: false,
    tipoRegistro: "NORMAL",
  }));

  return {
    normalized,
    totalOccurrences,
    occurrencesByCode,
    occurrencesByCategory,
  };
}