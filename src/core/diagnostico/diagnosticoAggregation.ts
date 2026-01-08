import { norm } from "./diagnosticoUtils";
import { DefeitoFiltrado } from "./diagnosticoFilterEngine";

/* ======================================================
   TIPOS DE SAÍDA
====================================================== */
export interface PrincipalCausaResult {
  nome: string;
  ocorrencias: number;
}

export interface PrincipalDefeitoResult {
  nome: string;
  ocorrencias: number;
}

export interface DefeitoCriticoNprResult {
  codigo: string;
  descricao: string;
  severidade: number;
  ocorrencia: number;
  deteccao: number;
  npr: number;
}

export interface TopCausasAgrupamentoResult {
  nome: string;
  ocorrencias: number;
  scoreRisco: number;
  nprMedio: number;
  // ✅ Lista detalhada dos defeitos deste grupo (Drill-down)
  detalhes: {
    nome: string;
    ocorrencias: number;
    // ✅ Lista de modelos com quantidade (para o Tooltip)
    modelos: {
        nome: string;
        ocorrencias: number;
    }[]; 
  }[];
}

/* ======================================================
   MOTOR DE AGREGAÇÃO — MODO AUDITORIA COMPLETO + DRILL-DOWN
====================================================== */
export function agruparDiagnostico(
  defeitos: DefeitoFiltrado[],
  agrupamentoAnalise: { ANALISE: string; AGRUPAMENTO: string }[],
  fmea: {
    CÓDIGO: string;
    DESCRIÇÃO: string;
    SEVERIDADE: number;
    OCORRÊNCIA: number;
    DETECÇÃO: number;
    NPR: number;
  }[]
) {
  console.log("🟦 [AGREGAÇÃO] INICIANDO CRUZAMENTO DE DADOS...");

  /* ==============================
      1. MAPAS (Agrupamento e FMEA)
  ================================ */
  const mapAgrupamento = new Map<string, string>();
  agrupamentoAnalise.forEach((r) => {
    const key = norm(r.ANALISE);
    const value = norm(r.AGRUPAMENTO);
    if (key) mapAgrupamento.set(key, value);
  });

  const mapFmea = new Map<string, any>();
  fmea.forEach((r) => {
    if (r.CÓDIGO) mapFmea.set(norm(r.CÓDIGO), r);
    if (r.DESCRIÇÃO) mapFmea.set(norm(r.DESCRIÇÃO), r);
  });

  /* ==============================
      2. CONTAGEM E CLASSIFICAÇÃO
  ================================ */
  const agrupamentoCount = new Map<string, number>();
  const defeitoCount = new Map<string, number>();
  
  // ✅ ESTRUTURA COMPLEXA:
  // Agrupamento -> Mapa de Análises -> { Qtd Total, Mapa de Modelos { Modelo -> Qtd } }
  const detalhesPorAgrupamento = new Map<string, Map<string, { qtd: number; modelos: Map<string, number> }>>();

  const defeitosCriticosMap = new Map<string, DefeitoCriticoNprResult>();
  const riscoPorAgrupamento = new Map<string, { ocorrencias: number; scoreRisco: number }>();

  let totalSomado = 0;

  defeitos.forEach((d) => {
    // A. Agrupamento
    const chaveAnalise = d.ANALISE; // Já vem normalizado
    let agrupamento = mapAgrupamento.get(chaveAnalise);

    if (!agrupamento) {
      agrupamento = "NÃO CLASSIFICADO";
    }

    // B. Contadores
    const qtd = d.QUANTIDADE;
    totalSomado += qtd;

    // Soma por Grupo (TOTAL REAL)
    agrupamentoCount.set(
      agrupamento,
      (agrupamentoCount.get(agrupamento) || 0) + qtd
    );

    // Soma por Análise (Item Específico)
    defeitoCount.set(
      chaveAnalise,
      (defeitoCount.get(chaveAnalise) || 0) + qtd
    );

    // ✅ C. Preenche Detalhes (Drill-down com Modelos e Quantidades)
    if (!detalhesPorAgrupamento.has(agrupamento)) {
        detalhesPorAgrupamento.set(agrupamento, new Map());
    }
    const mapaDetalhes = detalhesPorAgrupamento.get(agrupamento)!;
    
    // Inicializa se não existir
    if (!mapaDetalhes.has(chaveAnalise)) {
        mapaDetalhes.set(chaveAnalise, { qtd: 0, modelos: new Map() });
    }
    
    const item = mapaDetalhes.get(chaveAnalise)!;
    item.qtd += qtd;
    
    // Contagem específica por modelo
    const countModelo = item.modelos.get(d.MODELO) || 0;
    item.modelos.set(d.MODELO, countModelo + qtd);


    // D. FMEA Match (Score e Críticos)
    const fmeaItem = mapFmea.get(d.CODIGO_FALHA) || mapFmea.get(d.DESCRICAO_FALHA);

    if (fmeaItem && fmeaItem.NPR > 0) {
        const key = `${fmeaItem.CÓDIGO}|${fmeaItem.DESCRIÇÃO}`;
        
        // Salva para lista de críticos (únicos)
        if (!defeitosCriticosMap.has(key)) {
          defeitosCriticosMap.set(key, {
            codigo: fmeaItem.CÓDIGO,
            descricao: fmeaItem.DESCRIÇÃO,
            severidade: fmeaItem.SEVERIDADE,
            ocorrencia: fmeaItem.OCORRÊNCIA,
            deteccao: fmeaItem.DETECÇÃO,
            npr: fmeaItem.NPR,
          });
        }

        // Calcula Risco Ponderado do Agrupamento
        if (!riscoPorAgrupamento.has(agrupamento)) {
            riscoPorAgrupamento.set(agrupamento, { ocorrencias: 0, scoreRisco: 0 });
        }
        const ref = riscoPorAgrupamento.get(agrupamento)!;
        ref.ocorrencias += qtd;
        ref.scoreRisco += qtd * fmeaItem.NPR;
    }
  });

  /* ==============================================================
      LOGS DE AUDITORIA — LISTA COMPLETA PARA VALIDAÇÃO
  ============================================================== */
  console.log(`\n✅ TOTAL GERAL CALCULADO: ${totalSomado} defeitos`);
  
  console.log("\n📊 [AUDITORIA] DETALHE POR AGRUPAMENTO:");
  const gruposOrdenados = [...agrupamentoCount.entries()].sort((a, b) => b[1] - a[1]);
  gruposOrdenados.forEach(([nome, qtd]) => {
      console.log(`   👉 ${nome}: ${qtd}`);
  });

  console.log("\n📊 [AUDITORIA] DETALHE POR ANÁLISE (LISTA COMPLETA):");
  const defeitosOrdenados = [...defeitoCount.entries()].sort((a, b) => b[1] - a[1]);
  
  defeitosOrdenados.forEach(([nome, qtd]) => {
      console.log(`   🔎 ${nome}: ${qtd}`);
  });
  
  console.log("========================================\n");

  /* ==============================
      3. MONTAGEM DOS RESULTADOS
  ================================ */
  
  // Defaults
  const emptyCausa = { nome: "-", ocorrencias: 0 };
  const emptyDefeito = { nome: "-", ocorrencias: 0 };
  const emptyCritico = { codigo: "-", descricao: "-", npr: 0, severidade: 0, ocorrencia: 0, deteccao: 0 };

  // Principal Causa
  const principalCausa: PrincipalCausaResult = gruposOrdenados.length > 0 
    ? { nome: gruposOrdenados[0][0], ocorrencias: gruposOrdenados[0][1] }
    : emptyCausa;

  // Principal Defeito (do grupo vencedor)
  const defeitosDoAgrupamento = defeitos.filter((d) => {
      const grupo = mapAgrupamento.get(d.ANALISE) ?? "NÃO CLASSIFICADO";
      return grupo === principalCausa.nome;
  });
  
  const countDefeitosGrupo = new Map<string, number>();
  defeitosDoAgrupamento.forEach(d => {
      countDefeitosGrupo.set(d.ANALISE, (countDefeitosGrupo.get(d.ANALISE) || 0) + d.QUANTIDADE);
  });

  const sortedDefeitosGrupo = [...countDefeitosGrupo.entries()].sort((a, b) => b[1] - a[1]);

  const principalDefeito: PrincipalDefeitoResult = sortedDefeitosGrupo.length > 0 
      ? { nome: sortedDefeitosGrupo[0][0], ocorrencias: sortedDefeitosGrupo[0][1] }
      : emptyDefeito;

  // ✅ Defeitos Críticos (TOP 5)
  const defeitosCriticos = [...defeitosCriticosMap.values()]
    .sort((a, b) => b.npr - a.npr)
    .slice(0, 5); 

  const defeitoCritico = defeitosCriticos.length > 0 ? defeitosCriticos[0] : emptyCritico;

  // Top Causas (Por Risco Ponderado)
  const topCausas: TopCausasAgrupamentoResult[] = [...riscoPorAgrupamento.entries()]
    .map(([nome, v]) => {
      // ✅ FIX: Usa a contagem real total do agrupamento, e não apenas a parcial do risco
      const totalRealDoGrupo = agrupamentoCount.get(nome) || 0;

      // ✅ Recupera e ordena os detalhes deste grupo para o Drill-down
      const mapaDetalhes = detalhesPorAgrupamento.get(nome);
      const listaDetalhes = mapaDetalhes 
        ? [...mapaDetalhes.entries()]
            .map(([dNome, dDados]) => ({ 
                nome: dNome, 
                ocorrencias: dDados.qtd,
                // ✅ Converte Map de modelos para Array [{nome, qtd}] e ordena
                modelos: [...dDados.modelos.entries()]
                    .map(([mNome, mQtd]) => ({ nome: mNome, ocorrencias: mQtd }))
                    .sort((a, b) => b.ocorrencias - a.ocorrencias)
            }))
            .sort((a, b) => b.ocorrencias - a.ocorrencias)
        : [];

      return {
        nome,
        ocorrencias: totalRealDoGrupo, // Usa o valor corrigido (ex: 527)
        scoreRisco: v.scoreRisco,
        // Recalcula média baseada no total real (risco diluído)
        nprMedio: totalRealDoGrupo > 0 ? Number((v.scoreRisco / totalRealDoGrupo).toFixed(1)) : 0,
        detalhes: listaDetalhes
      };
    })
    .sort((a, b) => b.scoreRisco - a.scoreRisco)
    .slice(0, 3); // Mantém apenas Top 3 Cards

  return {
    principalCausa,
    principalDefeito,
    defeitoCritico,
    defeitosCriticos,
    topCausas,
  };
}