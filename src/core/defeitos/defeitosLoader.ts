/* =====================================================================
   SIGMA-Q V3 — Loader das Bases de Defeitos (procura em múltiplos diretórios
   e usa enrichDefeito com catálogo injetado para performance)
   Ajustado: mantém uso de opts e injeta catálogo para performance.
===================================================================== */

import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { enrichDefeito, EnrichmentOptions } from "./defeitosEnrichment";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";

const POSSIBLE_DIRS = [
  path.resolve(process.cwd(), "src/core/defeitos/data"),
  path.resolve(process.cwd(), "app/development/defeitos/data"),
  path.resolve(process.cwd(), "app/development/catalogo/data"),
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "public/defeitos")
];

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
      return XLSX.utils.sheet_to_json(sheet) as any[];
    }
  }
  // Não encontrou — lança para a rota lidar com erro
  throw new Error(`Arquivo ${filename} não encontrado. Procurado em:\n${POSSIBLE_DIRS.join("\n")}`);
}

export async function loadDefeitosFonte(
  fonte: string,
  opts: EnrichmentOptions,
  catalogo?: { codigos: any[]; falhas: any[]; responsabilidades: any[] }
) {
  const filename = {
    af: "defeitos_af.xlsx",
    lcm: "defeitos_lcm.xlsx",
    produto: "defeitos_produto_acabado.xlsx",
    pth: "defeitos_pth.xlsx"
  }[fonte.toLowerCase()];

  if (!filename) return [];

  const raw = (await readXlsxFromDirs(filename)) as any[];

  // Enriquecer com catálogo injetado para performance:
  const enriched: any[] = [];
  // se não foi passado catálogo, carregamos uma vez aqui (com cache do loader)
  const cat = catalogo ?? (await loadCatalogo());

  for (let i = 0; i < raw.length; i++) {
    // logs periódicos ajudam a ver progresso (útil quando page/api trava)
    if (i % 250 === 0) {
      // eslint-disable-next-line no-console
      console.log(`  ➕ Enriquecendo linha ${i}/${raw.length} (fonte=${fonte})`);
    }
    const r = raw[i];
    const e = await enrichDefeito(r, opts, cat);
    enriched.push(e);
  }

  // eslint-disable-next-line no-console
  console.log(`   ✔ Fonte ${fonte} carregada (${enriched.length} linhas)`);

  return enriched;
}

export async function loadDefeitosAll(opts: EnrichmentOptions) {
  // carrega catálogo uma vez e passa para todas as fontes
  const cat = await loadCatalogo();

  // logs iniciais
  // eslint-disable-next-line no-console
  console.log("🔵 Carregando fontes de defeitos (4 fontes) — usando catálogo em cache");
  const af = await loadDefeitosFonte("af", opts, cat);
  const lcm = await loadDefeitosFonte("lcm", opts, cat);
  const prod = await loadDefeitosFonte("produto", opts, cat);
  const pth = await loadDefeitosFonte("pth", opts, cat);

  return {
    af,
    lcm,
    produto: prod,
    pth,
    todas: [...af, ...lcm, ...prod, ...pth]
  };
}