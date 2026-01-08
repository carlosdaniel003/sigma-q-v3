// app/api/diagnostico/summary/route.ts
import { NextResponse } from "next/server";

import { loadDefeitos } from "@/core/data/loadDefeitos";
import { loadAgrupamento } from "@/core/data/loadAgrupamento";
import { loadFmea, FmeaRow } from "@/core/data/loadFmea"; 
import { loadOcorrencias } from "@/core/data/loadOcorrencias";
import { loadProducao, ProducaoRaw } from "@/core/data/loadProducao"; 

import {
  filtrarDefeitosDiagnostico,
  DiagnosticoFiltros,
  DefeitoFiltrado
} from "@/core/diagnostico/diagnosticoFilterEngine";

import { agruparDiagnostico } from "@/core/diagnostico/diagnosticoAggregation";
import { calcularStatusGeral, norm } from "@/core/diagnostico/diagnosticoUtils";
import { gerarDiagnosticoAutomatico } from "@/core/diagnostico/diagnosticoAiEngine";
import { calcularTendenciaPpm } from "@/core/diagnostico/diagnosticoTrendEngine";

/* ======================================================
   UTIL — PARSER DE DATA (EXCEL SERIAL VS JS)
====================================================== */
function parseDataProducao(valor: any): Date | null {
    if (!valor) return null;
    if (typeof valor === 'number') {
        const date = new Date(Math.round((valor - 25569) * 86400 * 1000));
        date.setHours(date.getHours() + 12);
        return date;
    }
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
}

/* ======================================================
   UTIL — GET SEMANA ISO
====================================================== */
function getSemanaIso(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/* ======================================================
   UTIL — GERADOR DE RANGES (DATA EXATA + SEMANAS)
====================================================== */
function getRanges(tipo: "semana" | "mes", valor: number, ano: number) {
  
  const montarRangeMensal = (mes: number, anoRef: number) => {
      const dataInicio = new Date(anoRef, mes - 1, 1);
      const dataFim = new Date(anoRef, mes, 0, 23, 59, 59);
      const semInicio = getSemanaIso(dataInicio);
      const semFim = getSemanaIso(dataFim);
      let finalReal = semFim;
      if (semFim < semInicio && semFim === 1) finalReal = 53; 
      return {
          semanas: [{ semana: semInicio, ano: anoRef }, { semana: finalReal, ano: anoRef }],
          datas: { inicio: dataInicio, fim: dataFim }
      };
  };

  const montarRangeSemanal = (sem: number, anoRef: number) => {
      return {
          semanas: [{ semana: sem, ano: anoRef }, { semana: sem, ano: anoRef }],
          datas: null
      };
  };

  // ✅ LOOKBACK: Histórico de 13 períodos para garantir sequência de reincidência correta
  const LOOKBACK = 13;

  if (tipo === "semana") {
    // T (Atual)
    let semAnt = valor - 1;
    let anoAnt = ano;
    if (semAnt < 1) { semAnt = 52; anoAnt--; }

    // T-2 (Antepenúltimo)
    let semAnt2 = semAnt - 1;
    let anoAnt2 = anoAnt;
    if (semAnt2 < 1) { semAnt2 = 52; anoAnt2--; }

    // Range Tendência
    let semStartTrend = valor - LOOKBACK;
    let anoStartTrend = ano;
    while (semStartTrend < 1) {
        semStartTrend += 52;
        anoStartTrend--;
    }

    return {
      atual: montarRangeSemanal(valor, ano),
      anterior: montarRangeSemanal(semAnt, anoAnt),
      antepenultimo: montarRangeSemanal(semAnt2, anoAnt2),
      rangeTendencia: { semanas: [{ semana: semStartTrend, ano: anoStartTrend }, { semana: valor, ano }] }
    };

  } else {
    // T (Atual)
    let mesAnt = valor - 1;
    let anoAnt = ano;
    if (mesAnt < 1) { mesAnt = 12; anoAnt--; }

    // T-2 (Antepenúltimo)
    let mesAnt2 = mesAnt - 1;
    let anoAnt2 = anoAnt;
    if (mesAnt2 < 1) { mesAnt2 = 12; anoAnt2--; }

    // Range Tendência
    let mesStartTrend = valor - LOOKBACK;
    let anoStartTrend = ano;
    while (mesStartTrend < 1) {
        mesStartTrend += 12;
        anoStartTrend--;
    }
    
    const rangeTendenciaStart = montarRangeMensal(mesStartTrend, anoStartTrend);
    const rangeTendenciaEnd = montarRangeMensal(valor, ano);

    return {
      atual: montarRangeMensal(valor, ano),
      anterior: montarRangeMensal(mesAnt, anoAnt),
      antepenultimo: montarRangeMensal(mesAnt2, anoAnt2),
      rangeTendencia: { 
          semanas: [rangeTendenciaStart.semanas[0], rangeTendenciaEnd.semanas[1]] 
      }
    };
  }
}

/* ======================================================
   HELPER — CÁLCULO DE PRODUÇÃO (FILTRADA)
====================================================== */
function calcularProducaoFiltrada(
    producao: ProducaoRaw[], 
    range: { semanas: { semana: number, ano: number }[], datas: { inicio: Date, fim: Date } | null }, 
    filtros: { modelo?: string[], categoria?: string[] },
    labelDebug: string
) {
    let total = 0;
    const usarDataExata = !!range.datas;
    const [semInicio, semFim] = range.semanas;
    const codeInicio = semInicio.ano * 100 + semInicio.semana;
    const codeFim = semFim.ano * 100 + semFim.semana;

    producao.forEach((p) => {
        const pDate = parseDataProducao(p.DATA);
        if (!pDate || isNaN(pDate.getTime())) return;
        if (filtros.modelo && !filtros.modelo.includes(norm(p.MODELO))) return;
        if (filtros.categoria && !filtros.categoria.includes(norm(p.CATEGORIA))) return;

        let passou = false;
        if (usarDataExata && range.datas) {
            const d = pDate.getTime();
            passou = d >= range.datas.inicio.getTime() && d <= range.datas.fim.getTime();
        } else {
            const sem = getSemanaIso(pDate);
            const ano = pDate.getFullYear();
            const codeP = ano * 100 + sem;
            passou = codeP >= codeInicio && codeP <= codeFim;
        }
        if (passou) total += p.QTY_GERAL;
    });
    return total;
}

/* ======================================================
   HELPER — FILTRAR DEFEITOS (PENTE FINO DE DATA)
====================================================== */
function aplicarPenteFinoDatas(
    defeitos: DefeitoFiltrado[],
    range: { datas: { inicio: Date, fim: Date } | null }
) {
    if (!range.datas) return defeitos;
    return defeitos.filter(d => {
        const defDate = parseDataProducao(d.DATA); 
        if (!defDate) return false;
        const time = defDate.getTime();
        return time >= range.datas!.inicio.getTime() && time <= range.datas!.fim.getTime();
    });
}

/* ======================================================
   ✅ HELPER — RECUPERAR PERÍODO ANTERIOR (KEY)
====================================================== */
function getPreviousKey(currentKey: number, tipo: "semana" | "mes"): number {
    const ano = Math.floor(currentKey / 100);
    const periodo = currentKey % 100; // Mes ou Semana

    if (tipo === "mes") {
        if (periodo === 1) return (ano - 1) * 100 + 12;
        return currentKey - 1;
    } else {
        // Semana
        if (periodo === 1) {
            return (ano - 1) * 100 + 52; 
        }
        return currentKey - 1;
    }
}

/* ======================================================
   ✅ HELPER — REINCIDÊNCIA ESTRITA (SEQUENCIAL)
====================================================== */
function calcularSequenciaReincidencia(
    dadosTendencia: DefeitoFiltrado[],
    agrupamentos: any[],
    principalCausaAtual: string,
    tipo: "semana" | "mes",
    currentPeriodValue: number,
    currentYear: number
) {
    if (!principalCausaAtual) return 0;
    
    // 1. Mapear Agrupamentos
    const mapAgrupamento = new Map<string, string>();
    agrupamentos.forEach((r) => mapAgrupamento.set(norm(r.ANALISE), norm(r.AGRUPAMENTO)));
    
    // 2. Construir Ranking por Período
    const rankingPorPeriodo = new Map<number, Map<string, number>>();
    dadosTendencia.forEach(d => {
        const keyPeriodo = tipo === "mes" ? (d.ANO * 100 + (d.DATA.getMonth() + 1)) : (d.ANO * 100 + d.SEMANA);
        const grupo = mapAgrupamento.get(d.ANALISE) || "OUTROS";
        if (!rankingPorPeriodo.has(keyPeriodo)) rankingPorPeriodo.set(keyPeriodo, new Map());
        const periodoMap = rankingPorPeriodo.get(keyPeriodo)!;
        periodoMap.set(grupo, (periodoMap.get(grupo) || 0) + d.QUANTIDADE);
    });

    let streak = 1; // Começa com o atual
    let iterKey = currentYear * 100 + currentPeriodValue;

    // 3. Iterar para trás estritamente
    const LOOKBACK_LIMIT = 13; 
    
    for (let i = 0; i < LOOKBACK_LIMIT; i++) {
        iterKey = getPreviousKey(iterKey, tipo);
        
        if (!rankingPorPeriodo.has(iterKey)) {
            // 🛑 SE NÃO TEM DADOS (BURACO), A SEQUÊNCIA QUEBRA.
            break;
        }

        const periodoMap = rankingPorPeriodo.get(iterKey)!;
        const topDoPeriodo = [...periodoMap.entries()].sort((a, b) => b[1] - a[1])[0];

        if (topDoPeriodo && topDoPeriodo[0] === principalCausaAtual) {
            streak++; // Continua a sequência
        } else {
            break; // 🛑 Outro líder assumiu, sequência quebra.
        }
    }

    return streak;
}

/* ======================================================
   HELPER — CÁLCULO DE PPM ESPECÍFICO (SINGLE DEFECT)
====================================================== */
function calcularPpmUnico(defeitos: DefeitoFiltrado[], producao: number, nomeDefeito: string) {
    if (producao <= 0) return 0;
    const qtd = defeitos.filter(d => norm(d.DESCRICAO_FALHA) === norm(nomeDefeito)).reduce((acc, curr) => acc + curr.QUANTIDADE, 0);
    return (qtd / producao) * 1000000;
}

/* ======================================================
   HELPER — DETECTAR MAIOR MUDANÇA BRUSCA (SPIKE)
====================================================== */
function detectarMaiorSpike(
    dadosAtual: DefeitoFiltrado[], 
    prodAtual: number,
    dadosAnterior: DefeitoFiltrado[], 
    prodAnterior: number
) {
    const mapAtual = new Map<string, number>();
    const mapAnterior = new Map<string, number>();

    dadosAtual.forEach(d => mapAtual.set(d.ANALISE, (mapAtual.get(d.ANALISE) || 0) + d.QUANTIDADE));
    dadosAnterior.forEach(d => mapAnterior.set(d.ANALISE, (mapAnterior.get(d.ANALISE) || 0) + d.QUANTIDADE));

    const todosDefeitos = new Set([...mapAtual.keys(), ...mapAnterior.keys()]);
    const variacoes: any[] = [];

    todosDefeitos.forEach(nome => {
        const qtdAtual = mapAtual.get(nome) || 0;
        const qtdAnterior = mapAnterior.get(nome) || 0;

        const ppmAtual = prodAtual > 0 ? (qtdAtual / prodAtual) * 1000000 : 0;
        const ppmAnterior = prodAnterior > 0 ? (qtdAnterior / prodAnterior) * 1000000 : 0;
        
        const delta = ppmAtual - ppmAnterior;
        
        variacoes.push({
            nome,
            ppmAtual,
            ppmAnterior,
            delta,
            absDelta: Math.abs(delta)
        });
    });

    variacoes.sort((a, b) => b.absDelta - a.absDelta);
    return variacoes.length > 0 ? variacoes[0] : null;
}

/* ======================================================
   FUNÇÃO: CÁLCULO DINÂMICO DE NPR (RÉGUA DE 5)
====================================================== */
function calcularFmeaDinamico(fmeaEstatico: FmeaRow[], defeitosDoPeriodo: DefeitoFiltrado[]): FmeaRow[] {
    const contagem = new Map<string, number>();
    
    defeitosDoPeriodo.forEach(d => {
        const chave = norm(d.DESCRICAO_FALHA); 
        contagem.set(chave, (contagem.get(chave) || 0) + d.QUANTIDADE);
    });

    let maxQtd = 0;
    for (let qtd of contagem.values()) {
        if (qtd > maxQtd) maxQtd = qtd;
    }

    const step = Math.ceil(maxQtd / 5) || 1; 

    return fmeaEstatico.map(item => {
        const qtdReal = contagem.get(norm(item.DESCRIÇÃO)) || 0;
        let novaOcorrencia = 0;
        
        if (qtdReal > 0) {
            novaOcorrencia = Math.ceil(qtdReal / step);
            if (novaOcorrencia > 5) novaOcorrencia = 5;
            if (novaOcorrencia < 1) novaOcorrencia = 1;
        } else {
            novaOcorrencia = 0; 
        }

        const novoNpr = item.SEVERIDADE * novaOcorrencia * item.DETECÇÃO;

        return {
            ...item,
            OCORRÊNCIA: novaOcorrencia,
            NPR: novoNpr
        };
    });
}

/* ======================================================
   FIX: CORREÇÃO DE SOMA DE AGRUPAMENTO (Versão Corrigida)
====================================================== */
function corrigirInconsistenciaAgregacao(agregacao: any) {
    if (!agregacao || !agregacao.topCausas) return;

    agregacao.topCausas.forEach((grupo: any) => {
        // ✅ FIX: Acessa 'detalhes' (nome correto da propriedade no Agregator)
        const filhos = grupo.detalhes || []; 
        if (Array.isArray(filhos) && filhos.length > 0) {
            // ✅ FIX: Soma 'ocorrencias' (nome correto da propriedade do item)
            const somaReal = filhos.reduce((acc: number, item: any) => acc + (item.ocorrencias || 0), 0);
            
            // Se houver divergência, atualiza o total do grupo
            if (somaReal > 0 && somaReal !== grupo.ocorrencias) {
                grupo.ocorrencias = somaReal;
            }
        }
    });

    // ✅ FIX: Reordena usando 'ocorrencias'
    agregacao.topCausas.sort((a: any, b: any) => (b.ocorrencias || 0) - (a.ocorrencias || 0));

    // Se a Causa Principal mudou devido à correção, atualiza a referência
    if (agregacao.topCausas.length > 0) {
        const top1 = agregacao.topCausas[0];
        agregacao.principalCausa = {
            ...agregacao.principalCausa,
            nome: top1.nome,
            // ✅ FIX: Usa 'ocorrencias' para garantir que não seja undefined
            ocorrencias: top1.ocorrencias || 0
        };
    }
}

/* ======================================================
   ✅ NOVA FUNÇÃO: DETECTAR CURVA EM V (SUSTENTAÇÃO)
   Com suporte a Quantidades Absolutas para o texto
====================================================== */
function detectarCurvaVGlobal(
    dadosT: DefeitoFiltrado[], prodT: number,
    dadosT1: DefeitoFiltrado[], prodT1: number,
    dadosT2: DefeitoFiltrado[], prodT2: number
) {
    // Se não tem produção em algum dos períodos, não dá pra calcular V-Curve
    if (prodT <= 0 || prodT1 <= 0 || prodT2 <= 0) return null;

    // Mapas de contagem
    const mapT = new Map<string, number>();
    const mapT1 = new Map<string, number>();
    const mapT2 = new Map<string, number>();

    dadosT.forEach(d => mapT.set(d.ANALISE, (mapT.get(d.ANALISE) || 0) + d.QUANTIDADE));
    dadosT1.forEach(d => mapT1.set(d.ANALISE, (mapT1.get(d.ANALISE) || 0) + d.QUANTIDADE));
    dadosT2.forEach(d => mapT2.set(d.ANALISE, (mapT2.get(d.ANALISE) || 0) + d.QUANTIDADE));

    // Universo de defeitos (União de todos)
    const todos = new Set([...mapT.keys(), ...mapT1.keys(), ...mapT2.keys()]);
    
    const candidatos: any[] = [];

    todos.forEach(nome => {
        const qtdT = mapT.get(nome) || 0;
        const qtdT1 = mapT1.get(nome) || 0;
        const qtdT2 = mapT2.get(nome) || 0;

        const ppmT = (qtdT / prodT) * 1000000;
        const ppmT1 = (qtdT1 / prodT1) * 1000000;
        const ppmT2 = (qtdT2 / prodT2) * 1000000;

        // Regra do V:
        // 1. T-2 era relevante (> 50 PPM) e teve ocorrências (>0)
        // 2. T-1 caiu significativamente ( < 70% de T-2)
        // 3. T subiu significativamente ( > 130% de T-1)
        
        const relevante = ppmT2 > 50 && qtdT2 > 0; 
        const caiu = ppmT1 < (ppmT2 * 0.7); 
        const subiu = ppmT > (ppmT1 * 1.3);

        if (relevante && caiu && subiu) {
            candidatos.push({
                nome,
                ppmT, ppmT1, ppmT2,
                qtdT, qtdT1, qtdT2, // ✅ Adicionado Quantidades para o texto
                score: ppmT - ppmT1 // Quanto maior o rebote, mais grave
            });
        }
    });

    // Retorna o pior caso (maior rebote)
    candidatos.sort((a, b) => b.score - a.score);
    return candidatos.length > 0 ? candidatos[0] : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("periodoTipo") as "semana" | "mes";
    const valor = Number(searchParams.get("periodoValor"));
    const ano = Number(searchParams.get("ano"));

    if (!valor || !ano) return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });

    const ranges = getRanges(tipo, valor, ano);

    const filtrosBase = {
      modelo: searchParams.get("modelo") ? [searchParams.get("modelo")!] : undefined,
      categoria: searchParams.get("categoria") ? [searchParams.get("categoria")!] : undefined,
      responsabilidade: searchParams.get("responsabilidade") ? [searchParams.get("responsabilidade")!] : undefined,
      turno: searchParams.get("turno") ? [searchParams.get("turno")!] : undefined,
    };

    // 1. Carregar Bases
    const defeitosRaw = loadDefeitos();
    const producaoRaw = loadProducao(); 
    const agrupamentos = loadAgrupamento();
    const fmeaEstatico = loadFmea(); 
    const ocorrenciasIgnorar = loadOcorrencias();

    /* ------------------------------------------------------
        2. DADOS ATUAIS (T)
    ------------------------------------------------------ */
    let dadosAtual = filtrarDefeitosDiagnostico(defeitosRaw, { ...filtrosBase, periodo: { semanas: ranges.atual.semanas } }, ocorrenciasIgnorar);
    dadosAtual = aplicarPenteFinoDatas(dadosAtual, ranges.atual);

    // FMEA Dinâmico
    const fmeaDinamico = calcularFmeaDinamico(fmeaEstatico, dadosAtual);

    // Agregação Inicial
    const agregacaoAtual = agruparDiagnostico(dadosAtual, agrupamentos, fmeaDinamico);

    // FIX INCONSISTÊNCIA (Soma Real)
    corrigirInconsistenciaAgregacao(agregacaoAtual);

    const totalDefeitosAtual = dadosAtual.reduce((acc, d) => acc + d.QUANTIDADE, 0);
    const totalProducaoAtual = calcularProducaoFiltrada(producaoRaw, ranges.atual, filtrosBase, "ATUAL");
    const ppmAtual = totalProducaoAtual > 0 ? (totalDefeitosAtual / totalProducaoAtual) * 1000000 : 0;

    /* ------------------------------------------------------
        3. DADOS ANTERIORES (T-1)
    ------------------------------------------------------ */
    let dadosAnterior = filtrarDefeitosDiagnostico(defeitosRaw, { ...filtrosBase, periodo: { semanas: ranges.anterior.semanas } }, ocorrenciasIgnorar);
    dadosAnterior = aplicarPenteFinoDatas(dadosAnterior, ranges.anterior);
    
    const agregacaoAnterior = agruparDiagnostico(dadosAnterior, agrupamentos, fmeaEstatico); 

    const totalDefeitosAnterior = dadosAnterior.reduce((acc, d) => acc + d.QUANTIDADE, 0);
    const totalProducaoAnterior = calcularProducaoFiltrada(producaoRaw, ranges.anterior, filtrosBase, "ANTERIOR");
    const ppmAnterior = totalProducaoAnterior > 0 ? (totalDefeitosAnterior / totalProducaoAnterior) * 1000000 : 0;

    /* ------------------------------------------------------
        4. DADOS ANTEPENÚLTIMOS (T-2)
    ------------------------------------------------------ */
    let dadosAnt2 = filtrarDefeitosDiagnostico(defeitosRaw, { ...filtrosBase, periodo: { semanas: ranges.antepenultimo.semanas } }, ocorrenciasIgnorar);
    dadosAnt2 = aplicarPenteFinoDatas(dadosAnt2, ranges.antepenultimo);
    const totalProducaoAnt2 = calcularProducaoFiltrada(producaoRaw, ranges.antepenultimo, filtrosBase, "ANTEPENULTIMO");

    /* ------------------------------------------------------
        5. ANÁLISE DE SUSTENTAÇÃO
    ------------------------------------------------------ */
    const nomeDefeitoFoco = agregacaoAtual.principalDefeito.nome;
    const ppmDefeitoT = calcularPpmUnico(dadosAtual, totalProducaoAtual, nomeDefeitoFoco);
    const ppmDefeitoT1 = calcularPpmUnico(dadosAnterior, totalProducaoAnterior, nomeDefeitoFoco);
    const ppmDefeitoT2 = calcularPpmUnico(dadosAnt2, totalProducaoAnt2, nomeDefeitoFoco);

    /* ------------------------------------------------------
        6. DETECÇÃO DE MUDANÇA BRUSCA & CURVA V
    ------------------------------------------------------ */
    const maiorSpike = detectarMaiorSpike(dadosAtual, totalProducaoAtual, dadosAnterior, totalProducaoAnterior);
    
    // ✅ NOVA ANÁLISE: Busca o padrão em V e retorna qtds e ppm
    const padraoCurvaV = detectarCurvaVGlobal(dadosAtual, totalProducaoAtual, dadosAnterior, totalProducaoAnterior, dadosAnt2, totalProducaoAnt2);

    /* ------------------------------------------------------
        7. TENDÊNCIAS & REINCIDÊNCIA (HISTÓRICO EXPANDIDO)
    ------------------------------------------------------ */
    const dadosParaTendencia = filtrarDefeitosDiagnostico(defeitosRaw, { ...filtrosBase, periodo: { semanas: ranges.rangeTendencia.semanas } }, ocorrenciasIgnorar);
    
    // ✅ REINCIDÊNCIA ESTRITA
    const streakReincidencia = calcularSequenciaReincidencia(
        dadosParaTendencia, 
        agrupamentos, 
        agregacaoAtual.principalCausa.nome, 
        tipo,
        valor, 
        ano    
    );
    
    const alertasTendencia = calcularTendenciaPpm(dadosParaTendencia, producaoRaw, agrupamentos, { modelo: filtrosBase.modelo, categoria: filtrosBase.categoria });

    /* ------------------------------------------------------
        8. IA
    ------------------------------------------------------ */
    const semanaInicioDisplay = tipo === 'semana' ? ranges.anterior.semanas[0].semana : ranges.atual.semanas[0].semana;

    const diagnosticoIa = gerarDiagnosticoAutomatico({
      periodoAtual: {
        semanaInicio: semanaInicioDisplay, 
        semanaFim: ranges.atual.semanas[1].semana,
        principalCausa: agregacaoAtual.principalCausa,
        principalDefeito: agregacaoAtual.principalDefeito,
        defeitoCritico: agregacaoAtual.defeitoCritico,
      },
      ppmContext: {
          atual: ppmAtual,
          anterior: ppmAnterior,
          producaoAtual: totalProducaoAtual
      },
      // ✅ Passamos o objeto completo do V-Curve (Nome, PPMs e QTDs)
      analiseSustentacao: padraoCurvaV ? {
          nome: padraoCurvaV.nome,
          ppmT: padraoCurvaV.ppmT,
          ppmT1: padraoCurvaV.ppmT1,
          ppmT2: padraoCurvaV.ppmT2,
          qtdT: padraoCurvaV.qtdT,
          qtdT1: padraoCurvaV.qtdT1,
          qtdT2: padraoCurvaV.qtdT2
      } : undefined,
      mudancaBrusca: maiorSpike ? {
          nome: maiorSpike.nome,
          ppmAtual: maiorSpike.ppmAtual,
          ppmAnterior: maiorSpike.ppmAnterior,
          delta: maiorSpike.delta
      } : null,
      reincidencia: {
          isReincidente: streakReincidencia > 2, 
          periodosConsecutivos: streakReincidencia,
          principalCausaAnterior: agregacaoAnterior.principalCausa.nome
      },
      contexto: {
        turnoMaisAfetado: filtrosBase.turno ? filtrosBase.turno[0] : undefined,
        modeloMaisAfetado: filtrosBase.modelo ? filtrosBase.modelo[0] : undefined,
        tendenciasAlertas: alertasTendencia.map(a => ({
            agrupamento: a.agrupamento,
            crescimento: a.crescimentoPercentual,
            ppmInicial: a.ppmInicial || 0,
            ppmFinal: a.ppmFinal || 0,
            qtdInicial: a.qtdInicial || 0,
            qtdFinal: a.qtdFinal || 0
        }))
      },
    });

    const statusGeral = calcularStatusGeral(agregacaoAtual.defeitoCritico.npr);

    return NextResponse.json({
      principalCausa: {
        ...agregacaoAtual.principalCausa,
        periodosConsecutivos: streakReincidencia 
      },
      principalDefeito: agregacaoAtual.principalDefeito,
      defeitoCritico: {
        codigo: agregacaoAtual.defeitoCritico.codigo,
        descricao: agregacaoAtual.defeitoCritico.descricao,
        npr: agregacaoAtual.defeitoCritico.npr,
      },
      statusGeral: {
        ...statusGeral,
        tendencia: diagnosticoIa.tendencia,
        variacaoPercentual: diagnosticoIa.variacaoPercentual
      },
      defeitosCriticos: agregacaoAtual.defeitosCriticos,
      principaisCausas: agregacaoAtual.topCausas,
      diagnosticoIa,
    });

  } catch (err: any) {
    console.error("❌ Erro route summary:", err);
    return NextResponse.json({ error: "Erro interno", details: err?.message }, { status: 500 });
  }
}