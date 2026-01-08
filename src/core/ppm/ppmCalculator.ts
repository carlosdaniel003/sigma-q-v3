import { MergedPpmRow } from "./ppmMergedTypes";
import {
  PpmCalculatedRow,
  PpmCalculationStatus,
} from "./ppmCalculatedTypes";
import { generatePpmDiagnostico } from "./ppmDiagnostico";

/* ======================================================
   CALCULADOR CENTRAL DE PPM
   - Calcula PPM por groupKey
   - Define status do cálculo
   - PRESERVA TODAS AS PROPRIEDADES DO MERGE
     (inclusive datasProducao / datasDefeito)
====================================================== */

export interface PpmCalculationResult {
  results: PpmCalculatedRow[];
  diagnostico: ReturnType<typeof generatePpmDiagnostico>;
}

export function calculatePpm(
  rows: MergedPpmRow[]
): PpmCalculationResult {
  /* ======================================================
     1️⃣ CÁLCULO DO PPM (SEM PERDER DADOS)
  ====================================================== */
  const results: PpmCalculatedRow[] = rows.map((r) => {
    let calculationStatus: PpmCalculationStatus;
    let ppm: number | null = null;

    // ❌ defeitos sem produção
    if (r.produzido <= 0 && r.defeitos > 0) {
      calculationStatus = "NO_PRODUCTION";
      ppm = 0;
    }
    // ⚠️ produção sem defeitos (cenário ideal)
    else if (r.produzido > 0 && r.defeitos === 0) {
      calculationStatus = "NO_DEFECT";
      ppm = 0;
    }
    // ❌ produção inexistente
    else if (r.produzido <= 0) {
      calculationStatus = "ZERO_PRODUCTION";
      ppm = 0;
    }
    // ✅ cálculo normal
    else {
      calculationStatus = "OK";
      ppm = Number(
  ((r.defeitos / r.produzido) * 1_000_000).toFixed(2)
);
    }

    return {
      ...r, // 🔥 PRESERVA datasProducao, datasDefeito, flags, ocorrências
      ppm,
      calculationStatus,
    };
  });

  /* ======================================================
     2️⃣ DIAGNÓSTICO INTELIGENTE (GLOBAL)
  ====================================================== */
  const diagnostico = generatePpmDiagnostico(
    results.map((r) => ({
      groupKey: r.groupKey,
      modelo: r.modelo,
      categoria: r.categoria,
      totalProduzido: r.produzido,
      totalDefeitos: r.defeitos,
      ppm: r.ppm ?? 0,
      status: r.calculationStatus === "OK" ? "OK" : "ERRO",
    }))
  );

  /* ======================================================
     3️⃣ RETORNO OFICIAL
  ====================================================== */
  return {
    results,
    diagnostico,
  };
}