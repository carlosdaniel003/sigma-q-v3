import { NormalizedProduction, NormalizedDefect } from "./ppmNormalizedTypes";
import { MergedPpmRow } from "./ppmMergedTypes";

/* ======================================================
   MERGE PRODUÇÃO + DEFEITOS (COM DATA)
====================================================== */
export function mergeProductionAndDefects(
  production: NormalizedProduction[],
  defects: NormalizedDefect[]
): MergedPpmRow[] {
  const map = new Map<string, MergedPpmRow>();

  /* ======================================================
     1️⃣ PRODUÇÃO
     - Cria a base do merge
     - Inicializa datas de produção
  ====================================================== */
  for (const p of production) {
    map.set(p.groupKey, {
      groupKey: p.groupKey,
      categoria: p.categoria,
      modelo: p.modelo,
      produzido: p.produzido,
      defeitos: 0,

      // 🔥 DATAS
      datasProducao: p.datasProducao ?? [],
      datasDefeito: [],

      // 🔑 flags padrão
      flags: {
        hasProduction: true,
        hasDefect: false,
        fixedBySemiFinished: false,
      },

      // 🔑 defaults de ocorrência
      naoMostrarIndice: false,
      tipoRegistro: "NORMAL",
    });
  }

  /* ======================================================
     2️⃣ DEFEITOS
     - Soma defeitos
     - Propaga ocorrência
     - Acumula datas de defeito
  ====================================================== */
  for (const d of defects) {
    if (!map.has(d.groupKey)) {
      map.set(d.groupKey, {
        groupKey: d.groupKey,
        categoria: d.groupKey.split("::")[0],
        modelo: d.groupKey.split("::")[1],
        produzido: 0,
        defeitos: d.defeitos,

        // 🔥 DATAS
        datasProducao: [],
        datasDefeito: d.datasDefeito ?? [],

        // ✅ PROPAGA OCORRÊNCIA
        naoMostrarIndice: d.naoMostrarIndice === true,
        tipoRegistro: d.tipoRegistro,

        flags: {
          hasProduction: false,
          hasDefect: true,
          fixedBySemiFinished: false,
        },
      });
    } else {
      const item = map.get(d.groupKey)!;

      item.defeitos += d.defeitos;
      item.flags.hasDefect = true;

      // 🔥 acumula datas de defeito
      if (d.datasDefeito?.length) {
        item.datasDefeito.push(...d.datasDefeito);
      }

      // 🔥 REGRA CRÍTICA DE OCORRÊNCIA
      if (d.naoMostrarIndice === true) {
        item.naoMostrarIndice = true;
        item.tipoRegistro = "OCORRENCIA";
      }
    }
  }

  /* ======================================================
     3️⃣ SAÍDA FINAL
  ====================================================== */
  return Array.from(map.values());
}