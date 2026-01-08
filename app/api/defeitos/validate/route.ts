import { NextResponse } from "next/server";

/**
 * ⚠️ IMPORTANTE
 * Estamos usando o MESMO motor que já funciona
 * e já aparece nos logs:
 *
 *  🚀 [validate] Rota chamada
 *  ✅ Usando cache existente
 *  📦 Defeitos carregados
 */
import { getDefeitosCache } from "@/core/defeitos/defeitosCache";

export async function GET() {
  try {
    console.log("🚀 [DEFEITOS-VALIDATE] Iniciando validação completa");

    /**
     * ⚙️ Flags de enriquecimento
     * Mantidas explícitas para:
     * - forçar enriquecimento
     * - impedir retorno RAW
     */
    const catalogos = {
      usarCodigos: true,
      usarFalhas: true,
      usarResponsabilidades: true,
    };

    /**
     * 🔥 AQUI ESTÁ O CORAÇÃO
     * Esse método:
     * - carrega xlsx
     * - normaliza
     * - enriquece
     * - aplica IA
     * - gera _issues e _confidence
     */
    const cache = await getDefeitosCache(catalogos);

    /**
     * cache.enriched é o mesmo array que:
     * - stats usa
     * - diagnose usa
     * - ppm usa
     */
    const enriched = cache.enriched;

    if (!Array.isArray(enriched) || enriched.length === 0) {
      throw new Error("Cache de defeitos vazio ou inválido");
    }

    console.log(
      `🧠 [DEFEITOS-VALIDATE] Enriquecimento concluído (${enriched.length} registros)`
    );

    // LOG DE SANIDADE (opcional, mas poderoso)
    const sampleWithIssues = enriched.find(
      (r: any) => (r._issues || []).length > 0
    );

    console.log("🔎 [DEFEITOS-VALIDATE] Exemplo enriquecido:", {
      modelo: sampleWithIssues?.MODELO,
      issues: sampleWithIssues?._issues,
      confidence: sampleWithIssues?._confidence,
    });

    return NextResponse.json({
      ok: true,
      total: enriched.length,
      enriched,
    });
  } catch (err: any) {
    console.error("❌ [DEFEITOS-VALIDATE] erro crítico:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}