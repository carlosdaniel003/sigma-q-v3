import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

// 🔹 Motor PPM
import { runPpmEngine } from "@/core/ppm/ppmEngine";

// ======================================================
// Utils
// ======================================================

async function readXlsx<T = any>(filePath: string): Promise<T[]> {
  const buffer = await fs.readFile(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet) as T[];
}

console.log("🚨 API PPM VALIDATE CARREGADA");

// ======================================================
// GET /api/ppm/validate
// ======================================================

export async function GET() {
  try {
    console.log("🟢 [PPM-API] Iniciando validação de PPM");

    // --------------------------------------------------
    // 1️⃣ PRODUÇÃO
    // --------------------------------------------------
    const productionPath = path.join(
      process.cwd(),
      "public",
      "productions",
      "producao.xlsx"
    );

    const productionRaw = await readXlsx(productionPath);

    console.log(
      "📦 [PPM-API] Produção carregada:",
      productionRaw.length
    );

    // --------------------------------------------------
    // 2️⃣ DEFEITOS — SOMENTE PRODUTO ACABADO (REGRA NOVA)
    // --------------------------------------------------
    const defectsPath = path.join(
      process.cwd(),
      "public",
      "defeitos",
      "defeitos_produto_acabado.xlsx"
    );

    const defectsRaw = await readXlsx(defectsPath);

    console.log(
      "📦 [PPM-API] Defeitos PRODUTO ACABADO carregados:",
      defectsRaw.length
    );

    // --------------------------------------------------
    // 3️⃣ MOTOR PPM
    // --------------------------------------------------
    const result = runPpmEngine(
      productionRaw,
      defectsRaw
    );

    console.log("✅ [PPM-API] Motor PPM executado");

    // --------------------------------------------------
    // 4️⃣ RESPONSE
    // --------------------------------------------------
    return NextResponse.json({
      ok: true,

      meta: result.meta,
      diagnostics: result.globalDiagnostics,

      // ⚠️ PARA A TELA DE VALIDAÇÃO
      rows: result.allRows,

      // ⚠️ FUTURO: categorias, dashboards, etc
      byCategory: result.byCategory,
    });
  } catch (error: any) {
    console.error("❌ [PPM-API] Erro crítico:", error);

    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}