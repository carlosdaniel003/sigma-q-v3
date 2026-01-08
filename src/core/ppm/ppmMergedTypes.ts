/* ======================================================
   PPM — Tipos Após Merge
====================================================== */

export interface MergedPpmRow {
  groupKey: string;
  categoria: string;
  modelo: string;

  produzido: number;
  defeitos: number;

  /* ======================================================
     🔥 DATAS DE ORIGEM (PROPAGADAS)
     - datasProducao → vindas da planilha de produção
     - datasDefeito  → vindas da planilha de defeitos
  ====================================================== */
  datasProducao?: Date[];
  datasDefeito?: Date[];

  /* ======================================================
     🔶 OCORRÊNCIAS / CONTROLE DE ÍNDICE
  ====================================================== */
  naoMostrarIndice?: boolean;
  tipoRegistro?: "OCORRENCIA" | "NORMAL";

  /* ======================================================
     FLAGS DE CONTROLE INTERNO
  ====================================================== */
  flags: {
    hasProduction: boolean;
    hasDefect: boolean;
    fixedBySemiFinished: boolean;
  };
}