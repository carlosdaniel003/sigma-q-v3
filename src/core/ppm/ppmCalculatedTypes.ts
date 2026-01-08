/* ======================================================
   PPM — Tipos Calculados
====================================================== */

export type PpmCalculationStatus =
  | "OK"
  | "NO_PRODUCTION"
  | "NO_DEFECT"
  | "ZERO_PRODUCTION";

export interface PpmCalculatedRow {
  groupKey: string;
  categoria: string;
  modelo: string;

  produzido: number;
  defeitos: number;

  ppm: number | null;
  calculationStatus: PpmCalculationStatus;

  // 🔥 DATAS DE ORIGEM (NOVO)
  datasProducao?: Date[];
  datasDefeito?: Date[];

  naoMostrarIndice?: boolean;
  tipoRegistro?: "OCORRENCIA" | "NORMAL";
}