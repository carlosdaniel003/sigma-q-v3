/* =====================================================================
   SIGMA-Q V3 — Loader dos Catálogos (com cache e diretórios alternativos)
===================================================================== */

import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

const POSSIBLE_DIRS = [
  path.resolve(process.cwd(), "src/core/catalogo/data"),
  path.resolve(process.cwd(), "app/development/catalogo/data"),
  path.resolve(process.cwd(), "app/development/defeitos/data"),
  path.resolve(process.cwd(), "app/development/catalogo/data"),
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "public/defeitos"),
];

let CACHED_CATALOG: null | {
  codigos: any[];
  falhas: any[];
  responsabilidades: any[];
} = null;

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readXlsxFromDirs(filename: string) {
  for (const base of POSSIBLE_DIRS) {
    const filePath = path.join(base, filename);
    if (await fileExists(filePath)) {
      const buf = await fs.readFile(filePath);
      const wb = XLSX.read(buf, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet);
    }
  }

  throw new Error(
    `Catálogo ${filename} não encontrado. Procurei em:\n${POSSIBLE_DIRS.join("\n")}`
  );
}

/**
 * Carrega o catálogo (com cache). Chame com forceReload=true para forçar re-leitura.
 */
export async function loadCatalogo(forceReload = false) {
  if (CACHED_CATALOG && !forceReload) {
    return CACHED_CATALOG;
  }

  const codigos = (await readXlsxFromDirs("catalogo_codigos.xlsx")) as any[];
  const falhas = (await readXlsxFromDirs("catalogo_codigos_defeitos.xlsx")) as any[];
  const responsabilidades = (await readXlsxFromDirs("catalogo_responsabilidades.xlsx")) as any[];

  CACHED_CATALOG = {
    codigos: codigos ?? [],
    falhas: falhas ?? [],
    responsabilidades: responsabilidades ?? []
  };

  return CACHED_CATALOG;
}

/** util debug — lista onde procuramos (útil nas rotas de debug) */
export function getCatalogoSearchPaths() {
  return POSSIBLE_DIRS.slice();
}

/** limpa cache (para desenvolvimento) */
export function clearCatalogoCache() {
  CACHED_CATALOG = null;
}