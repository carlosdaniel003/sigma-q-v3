import { NextResponse } from "next/server";
import { loadDefeitosAll } from "@/core/defeitos/defeitosLoader";

export async function GET() {
  console.log("📌 DEBUG: rota /api/debug/defeitos chamada");

  try {

    console.log("➡️ Chamando loadDefeitosAll()…");

    const data = await loadDefeitosAll({
      usarCodigos: false,
      usarFalhas: false,
      usarResponsabilidades: false
    });

    console.log("✅ loadDefeitosAll() finalizou com sucesso");
    console.log("➡️ Quantidades:", {
      af: data.af.length,
      lcm: data.lcm.length,
      produto: data.produto.length,
      pth: data.pth.length,
      todas: data.todas.length
    });

    return NextResponse.json({
      ok: true,
      counts: {
        af: data.af.length,
        lcm: data.lcm.length,
        produto: data.produto.length,
        pth: data.pth.length,
        todas: data.todas.length
      },
      sample: data.todas.slice(0, 5)
    });

  } catch (err: any) {
    console.error("❌ ERRO NA API /api/debug/defeitos:", err);
    return NextResponse.json({
      ok: false,
      error: String(err)
    });
  }
}