import { NextResponse } from "next/server";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";

export async function GET() {
  try {
    const catalogo = await loadCatalogo();

    return NextResponse.json({
      ok: true,
      codigos: catalogo.codigos.length,
      falhas: catalogo.falhas.length,
      responsabilidades: catalogo.responsabilidades.length,
      sampleCodigos: catalogo.codigos.slice(0, 3),
      sampleFalhas: catalogo.falhas.slice(0, 3),
      sampleResp: catalogo.responsabilidades.slice(0, 3)
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      stack: err.stack
    });
  }
}