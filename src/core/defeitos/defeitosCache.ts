/* =====================================================================
   SIGMA-Q V3 — Cache Inteligente com Garantia de Enriquecimento
   ✔ Cache só é válido se refletir as flags
   ✔ Nunca mascara erro
   ✔ Nunca gera KPI falso
===================================================================== */

import { loadDefeitosAll } from "./defeitosLoader";
import { enrichDefeito } from "./defeitosEnrichment";

type CacheStateData = {
  enriched: any[];
  af: any[];
  lcm: any[];
  produto: any[];
  pth: any[];
};

type CacheState = {
  carregado: boolean;
  carregando: boolean;
  dados: null | CacheStateData;
  optsKey?: string;
};

const cache: CacheState = {
  carregado: false,
  carregando: false,
  dados: null,
  optsKey: undefined,
};

// --------------------------------------------------
// 🔒 Validação dura de enrichment
// --------------------------------------------------
function isEnriched(item: any): boolean {
  return (
    item &&
    Array.isArray(item._issues) &&
    typeof item._confidence === "number"
  );
}

export async function getDefeitosCache(catalogos: any = {}) {
  const flags = {
    usarCodigos: !!catalogos.usarCodigos,
    usarFalhas: !!catalogos.usarFalhas,
    usarResponsabilidades: !!catalogos.usarResponsabilidades,
  };

  const optsKey = JSON.stringify(flags);

  // ==================================================
  // CACHE VÁLIDO → somente se flags e enrichment baterem
  // ==================================================
  if (cache.carregado && cache.dados && cache.optsKey === optsKey) {
    const sample = cache.dados.enriched[0];
    if (isEnriched(sample)) {
      console.log("✅ Usando cache existente (válido e enriquecido).");
      return cache.dados;
    } else {
      console.warn("⚠️ Cache inválido — registros não enriquecidos.");
    }
  }

  // ==================================================
  // CACHE EM CONSTRUÇÃO (mesmas flags)
  // ==================================================
  if (cache.carregando && cache.optsKey === optsKey) {
    console.log("🔄 Aguardando cache carregar (mesmas flags) …");
    await waitForCache();
    return cache.dados!;
  }

  // ==================================================
  // RECONSTRUÇÃO FORÇADA
  // ==================================================
  cache.carregando = true;
  cache.carregado = false;
  cache.dados = null;
  cache.optsKey = optsKey;

  console.log("🔥 Criando cache → flags:", optsKey);

  // Loader bruto
  const bases = await loadDefeitosAll(flags);

  console.log("🔥 Enriquecendo registros (forçado e consistente)…");

  const enriched: any[] = [];

  async function push(arr: any[], fonte: string) {
    for (let i = 0; i < arr.length; i++) {
      const enrichedItem = await enrichDefeito(
        { ...arr[i], fonte },
        flags
      );
      enriched.push(enrichedItem);

      if (i % 2000 === 0) {
        console.log(`   ➕ Enriquecidos ${i}/${arr.length} (${fonte})`);
      }
    }
  }

  await push(bases.af || [], "AF");
  await push(bases.lcm || [], "LCM");
  await push(bases.produto || [], "PRODUTO");
  await push(bases.pth || [], "PTH");

  const dados: CacheStateData = {
    enriched,
    af: enriched.filter(r => r.fonte === "AF"),
    lcm: enriched.filter(r => r.fonte === "LCM"),
    produto: enriched.filter(r => r.fonte === "PRODUTO"),
    pth: enriched.filter(r => r.fonte === "PTH"),
  };

  cache.dados = dados;
  cache.carregando = false;
  cache.carregado = true;

  console.log("✅ Cache criado com sucesso (enriquecimento garantido).");

  return cache.dados;
}

// --------------------------------------------------
function waitForCache(): Promise<void> {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (!cache.carregando && cache.carregado && cache.dados) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });
}