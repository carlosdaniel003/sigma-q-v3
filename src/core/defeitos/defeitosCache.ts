/* =====================================================================
   SIGMA-Q V3 — Cache Inteligente com Lazy Load Automático
   Agora respeita flags de catálogo (usarCodigos/usarFalhas/usarResponsabilidades)
   e reconstrói se as flags mudarem.
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
  optsKey: undefined
};

export async function getDefeitosCache(catalogos: any = {}) {
  // normaliza chave das flags (determinística)
  const optsKey = JSON.stringify({
    usarCodigos: !!catalogos.usarCodigos,
    usarFalhas: !!catalogos.usarFalhas,
    usarResponsabilidades: !!catalogos.usarResponsabilidades
  });

  // Se já carregou com MESMAS flags → retorna imediatamente
  if (cache.carregado && cache.dados && cache.optsKey === optsKey) {
    console.log("✅ Usando cache existente (mesmas flags).");
    return cache.dados;
  }

  // Se estiver carregando com MESMAS flags → espera terminar
  if (cache.carregando && cache.optsKey === optsKey) {
    console.log("🔄 Aguardando cache carregar (mesmas flags) …");
    await waitForCache();
    return cache.dados!;
  }

  // Se carregando com flags diferentes → aguarda término, depois recarrega
  if (cache.carregando && cache.optsKey !== optsKey) {
    console.log("🔁 Cache carregando com flags diferentes — aguardando e atualizando em seguida...");
    await waitForCache();
    // cairemos no fluxo de criação abaixo
  }

  // Primeira execução (ou flags diferentes) → construir cache novo
  cache.carregando = true;
  cache.carregado = false;
  cache.dados = null;
  cache.optsKey = optsKey;

  console.log("🔥 Criando cache → carregando bases com flags:", optsKey);

  // Passa as flags para o loader para que enriquecimento use as mesmas flags
  const flags = {
    usarCodigos: !!catalogos.usarCodigos,
    usarFalhas: !!catalogos.usarFalhas,
    usarResponsabilidades: !!catalogos.usarResponsabilidades
  };

  const bases = await loadDefeitosAll(flags);

  console.log("🔥 Enriquecendo registros (aplicando flags) — isso pode demorar um pouco…");

  const enriched: any[] = [];

  // como loadDefeitosAll já chama enrichDefeito (com opts) por fonte,
  // aqui mantemos uma garantia: se por acaso loadDefeitosAll retornou dados "raw",
  // aplicamos enrichment final com as mesmas flags. (idempotente)
  const push = (arr: any[], fonte: string) => {
    for (const item of arr) {
      enriched.push({ ...item, fonte });
    }
  };

  push(bases.af, "AF");
  push(bases.lcm, "LCM");
  push(bases.produto, "PRODUTO");
  push(bases.pth, "PTH");

  // Enriquecimento adicional (caso necessário). Usamos opts flags.
  for (let i = 0; i < enriched.length; i++) {
    // chamamos enrichDefeito com as flags para garantir consistência
    enriched[i] = await enrichDefeito(enriched[i], flags);
    if (i % 2000 === 0) {
      console.log(`   ➕ Enriquecidos ${i}/${enriched.length}`);
    }
  }

  const dados: CacheStateData = {
    enriched,
    af: enriched.filter(r => r.fonte === "AF"),
    lcm: enriched.filter(r => r.fonte === "LCM"),
    produto: enriched.filter(r => r.fonte === "PRODUTO"),
    pth: enriched.filter(r => r.fonte === "PTH")
  };

  cache.dados = dados;
  cache.carregando = false;
  cache.carregado = true;

  console.log("✅ Cache criado com sucesso (flags: " + optsKey + ").");

  return cache.dados;
}

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