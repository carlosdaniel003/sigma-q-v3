/* ======================================================
   PPM — Resultado Final do Motor (Atualizado)
====================================================== */

import { PpmCalculatedRow } from "./ppmCalculatedTypes";

export interface ValidatedPpmRow extends PpmCalculatedRow {
  validationStatus: "VALID" | "INVALID" | "PARTIAL";
  validationReason?: string;
  naoMostrarIndice?: boolean;
}

export interface PpmEngineResult {
  meta: {
    totalGroups: number;
    totalProduction: number;
    totalDefects: number;
    ppmGeral: number | null;
    aiPrecision: number;
    naoMostrarIndiceCount: number;
    totalOccurrences: number;

    // ✅ NOVO CAMPO: Detalhamento por código (AC, AF, etc.)
    occurrencesByCode: Record<string, number>; 
    occurrencesByCategory: Record<string, number>;
  };

  globalDiagnostics: {
    defectsWithoutProduction: number;
    productionWithoutDefect: number;
    zeroPpmItems: number;
    naoMostrarIndice: ValidatedPpmRow[];
  };

  byCategory: Record<
    string,
    {
      production: number;
      defects: number;
      ppm: number | null;
      aiPrecision: number;
      status: "SAUDAVEL" | "CRITICO";
      models: ValidatedPpmRow[];
    }
  >;

  allRows: ValidatedPpmRow[];
}