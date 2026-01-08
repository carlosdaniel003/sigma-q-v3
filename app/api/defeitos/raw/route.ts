import { NextResponse } from "next/server";

// ⚠️ ajuste este import para sua fonte real de dados
import { loadDefeitosBrutos } from "@/core/data/defeitosLoader";

export async function GET() {
  try {
    console.log("🔵 [defeitos/raw] Carregando defeitos brutos");

    const defects = await loadDefeitosBrutos();

    if (!Array.isArray(defects)) {
      console.error(
        "❌ [defeitos/raw] Fonte retornou valor inválido:",
        defects
      );

      return NextResponse.json(
        { ok: false, error: "Defeitos inválidos" },
        { status: 500 }
      );
    }

    console.log(
      "✅ [defeitos/raw] Defeitos carregados:",
      defects.length
    );

    return NextResponse.json({
      ok: true,
      defects,
    });
  } catch (e: any) {
    console.error("❌ [defeitos/raw] Erro crítico:", e);

    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}