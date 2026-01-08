/* ======================================================
   PPM — Diagnóstico Inteligente
   Explica o motivo de divergências no PPM
====================================================== */

export type PpmDiagnosticoReason =
  | "SEM_PRODUCAO"
  | "SEM_DEFEITOS"
  | "PPM_ZERADO"
  | "DADOS_INCOMPLETOS"
  | "OK";

export interface PpmDiagnosticoItem {
  groupKey: string;
  modelo: string;
  categoria: string;

  produzido: number;
  defeitos: number;
  ppm: number;

  precision: number;
  reason: PpmDiagnosticoReason;
}

/* ======================================================
   GERA DIAGNÓSTICO A PARTIR DO RESULTADO DO PPM
====================================================== */
export function generatePpmDiagnostico(
  groups: {
    groupKey: string;
    modelo: string;
    categoria: string;
    totalProduzido: number;
    totalDefeitos: number;
    ppm: number;
    status: "OK" | "ERRO";
  }[]
): PpmDiagnosticoItem[] {
  return groups.map((g) => {
    let reason: PpmDiagnosticoReason = "OK";

    if (g.totalProduzido === 0 && g.totalDefeitos > 0) {
      reason = "SEM_PRODUCAO";
    } else if (g.totalProduzido > 0 && g.totalDefeitos === 0) {
      reason = "SEM_DEFEITOS";
    } else if (g.ppm === 0 && g.totalDefeitos > 0) {
      reason = "PPM_ZERADO";
    } else if (g.status === "ERRO") {
      reason = "DADOS_INCOMPLETOS";
    }

    const precision =
      g.status === "OK" && g.totalProduzido > 0 ? 100 : 0;

    return {
      groupKey: g.groupKey,
      modelo: g.modelo,
      categoria: g.categoria,
      produzido: g.totalProduzido,
      defeitos: g.totalDefeitos,
      ppm: g.ppm,
      precision,
      reason,
    };
  });
}