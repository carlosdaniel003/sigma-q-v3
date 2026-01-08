import { NextResponse } from "next/server";

import { loadProductionRaw } from "@/core/ppm/ppmProductionNormalizer";
import { loadDefectsRaw } from "@/core/ppm/ppmDefectsNormalizer";

import { runPpmEngine } from "@/core/ppm/ppmEngine";
import { calculatePpmMonthlyTrend } from "@/core/ppm/ppmMonthlyTrend";
import { calculateResponsabilidadeMensal } from "@/core/ppm/ppmResponsabilidadeMensal";
import { calculateCategoriaMensal } from "@/core/ppm/ppmCategoriaMensal";

export async function GET() {
  try {
    /* ======================================================
       1️⃣ LOAD RAW — FONTE ÚNICA DA VERDADE
    ====================================================== */
    const productionRaw = loadProductionRaw();
    const defectsRaw = loadDefectsRaw();

    /* ======================================================
       2️⃣ MOTOR PPM GLOBAL
    ====================================================== */
    const ppmResult = runPpmEngine(
      productionRaw,
      defectsRaw
    );

    const { meta, byCategory, allRows } = ppmResult;

    /* ======================================================
       3️⃣ TENDÊNCIA DE PPM (MENSAL — OFICIAL)
    ====================================================== */
    const ppmMonthlyTrend = calculatePpmMonthlyTrend(
      productionRaw,
      defectsRaw
    );

    /* ======================================================
       4️⃣ RESPONSABILIDADE POR MÊS
       → PRODUÇÃO + DEFEITOS ABSOLUTOS (SEM OCORRÊNCIA)
    ====================================================== */
    const responsabilidadeMensal =
      calculateResponsabilidadeMensal(
        productionRaw,
        defectsRaw
      );

    /* ======================================================
       5️⃣ CATEGORIA POR MÊS
       → PRODUÇÃO + DEFEITOS ABSOLUTOS (SEM PPM AQUI)
    ====================================================== */
    const categoriaMensal =
      calculateCategoriaMensal(
        productionRaw,
        defectsRaw
      );

    /* ======================================================
       6️⃣ RETORNO FINAL — API DASHBOARD
    ====================================================== */
    return NextResponse.json({
      meta: {
        totalProduction: meta.totalProduction,
        totalDefects: meta.totalDefects,
        ppmGeral: meta.ppmGeral,
        aiPrecision: meta.aiPrecision,
      },

      // Séries temporais oficiais
      ppmMonthlyTrend,
      responsabilidadeMensal,
      categoriaMensal,

      // Consolidações
      byCategory: Object.entries(byCategory).map(
        ([categoria, v]) => ({
          categoria,
          produzido: v.production,
          defeitos: v.defects,
          ppm: v.ppm,
          aiPrecision: v.aiPrecision,
          status: v.status,
        })
      ),

      byModel: allRows.map((r) => ({
        categoria: r.categoria,
        modelo: r.modelo,
        produzido: r.produzido,
        defeitos: r.defeitos,
        ppm: r.ppm,
        status: r.validationStatus,
      })),
    });
  } catch (err: any) {
    console.error("❌ Dashboard summary error:", err);

    return NextResponse.json(
      {
        error: "Erro ao gerar dashboard",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}