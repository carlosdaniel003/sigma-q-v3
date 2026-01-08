import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { DefectInputRow, ProductionInputRow } from "./ppmInputTypes";
import { parseDateSafe } from "./ppmDateUtils";

/* ======================================================
   CATÁLOGO — OCORRÊNCIAS (FONTE ÚNICA)
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
  console.warn("⚠️ Erro ao carregar catálogo de ocorrências", err);
}

/* ======================================================
   TIPO
====================================================== */
export interface CategoriaMensal {
  month: string;
  production: number;
  totalDefects: number;
  [categoria: string]: number | string;
}

/* ======================================================
   MOTOR — CATEGORIA POR MÊS (SEM OCORRÊNCIA)
====================================================== */
export function calculateCategoriaMensal(
  production: ProductionInputRow[],
  defects: DefectInputRow[]
): CategoriaMensal[] {
  const map = new Map<string, CategoriaMensal>();

  /* PRODUÇÃO */
  for (const r of production) {
    const qty = Number(r.QTY_GERAL) || 0;
    if (qty <= 0) continue;

    const d = parseDateSafe((r as any).DATA);
    if (!d) continue;

    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!map.has(month)) {
      map.set(month, { month, production: 0, totalDefects: 0 });
    }

    map.get(month)!.production += qty;
  }

  /* DEFEITOS — ❌ EXCLUINDO OCORRÊNCIAS */
  for (const r of defects) {
    const codigoFornecedor = norm(
      (r as any)["CÓDIGO DO FORNECEDOR"]
    );

    if (catalogoSet.has(codigoFornecedor)) continue; // 🔥 AQUI

    const d = parseDateSafe((r as any).DATA);
    if (!d) continue;

    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const categoria = norm(r.CATEGORIA);

    if (!map.has(month)) {
      map.set(month, { month, production: 0, totalDefects: 0 });
    }

    const item = map.get(month)!;

    item.totalDefects += 1;        // 1 linha = 1 defeito
    const atual = Number(item[categoria] ?? 0);
item[categoria] = atual + 1;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}