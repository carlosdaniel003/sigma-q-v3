import { NextResponse } from "next/server";
import { loadCatalogo } from "@/core/catalogo/catalogoLoader";

export async function GET() {
  try {
    const catalogo = await loadCatalogo();

    return NextResponse.json({
      ok: true,
      arquivos: {
        codigos: catalogo.codigos.length,
        falhas: catalogo.falhas.length,
        responsabilidades: catalogo.responsabilidades.length
      },
      sample: {
        codigos: catalogo.codigos.slice(0, 3),
        falhas: catalogo.falhas.slice(0, 3),
        responsabilidades: catalogo.responsabilidades.slice(0, 3),
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: String(err)
    });
  }
}