import { DefectInputRow, ProductionInputRow } from "./ppmInputTypes";
import { parseDateSafe } from "./ppmDateUtils";

/* ======================================================
   TIPOS DE SAÍDA — FONTE ÚNICA
====================================================== */
export interface ResponsabilidadeMensal {
  month: string;            // YYYY-MM
  production: number;       // Produção total do mês
  totalDefects: number;     // Total de defeitos do mês

  "FORN. IMPORTADO": number;
  "FORN. LOCAL": number;
  "PROCESSO": number;
  "PROJETO": number;
}

/* ======================================================
   NORMALIZA TEXTO
====================================================== */
function norm(value: any): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/* ======================================================
   MOTOR — RESPONSABILIDADE POR MÊS (ABSOLUTO + PRODUÇÃO)
====================================================== */
export function calculateResponsabilidadeMensal(
  production: ProductionInputRow[],
  defects: DefectInputRow[]
): ResponsabilidadeMensal[] {
  const map = new Map<string, ResponsabilidadeMensal>();

  /* ==============================
     PRODUÇÃO POR MÊS
  ============================== */
  for (const r of production) {
    const qty = Number(r.QTY_GERAL) || 0;
    if (qty <= 0) continue;

    const date = parseDateSafe((r as any).DATA);
    if (!date) continue;

    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!map.has(month)) {
      map.set(month, {
        month,
        production: 0,
        totalDefects: 0,
        "FORN. IMPORTADO": 0,
        "FORN. LOCAL": 0,
        "PROCESSO": 0,
        "PROJETO": 0,
      });
    }

    map.get(month)!.production += qty;
  }

  /* ==============================
     DEFEITOS POR MÊS / RESPONS.
  ============================== */
  for (const r of defects) {
    const qty = Number(r.QUANTIDADE) || 0;
    if (qty <= 0) continue;

    const date = parseDateSafe((r as any).DATA);
    if (!date) continue;

    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const resp = norm(r.RESPONSABILIDADE);

    if (!map.has(month)) {
      map.set(month, {
        month,
        production: 0,
        totalDefects: 0,
        "FORN. IMPORTADO": 0,
        "FORN. LOCAL": 0,
        "PROCESSO": 0,
        "PROJETO": 0,
      });
    }

    const item = map.get(month)!;
    item.totalDefects += qty;

    if (resp in item) {
      (item as any)[resp] += qty;
    }
  }

  /* ==============================
     SAÍDA FINAL ORDENADA
  ============================== */
  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}