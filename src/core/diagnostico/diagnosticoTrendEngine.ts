import { ProducaoRaw } from "@/core/data/loadProducao";
import { DefeitoFiltrado } from "./diagnosticoFilterEngine";
import { parseDateSafe } from "@/core/ppm/ppmDateUtils";
import { norm } from "./diagnosticoUtils";

export interface TrendAlert {
  agrupamento: string;
  ppmAtual: number;
  
  // ✅ Novos campos para o Diagnóstico de IA detalhado
  ppmInicial: number;
  ppmFinal: number;
  
  // ✅ NOVOS CAMPOS: Quantidades absolutas (para mostrar na IA)
  qtdInicial: number;
  qtdFinal: number;

  crescimentoPercentual: number; // Quanto cresceu do mês 1 para o 3
  mesesCrescimento: number; // 3 meses consecutivos
}

export function calcularTendenciaPpm(
  defeitos: DefeitoFiltrado[], // Defeitos já filtrados pelo range histórico
  producaoRaw: ProducaoRaw[],
  agrupamentoAnalise: { ANALISE: string; AGRUPAMENTO: string }[],
  filtrosAtivos: { modelo?: string[]; categoria?: string[] }
): TrendAlert[] {
  console.log("📈 [TREND ENGINE] Calculando tendências de PPM (Régua > 200 PPM)...");

  // 1. Mapeamento de Agrupamento
  const mapAgrupamento = new Map<string, string>();
  agrupamentoAnalise.forEach((r) => {
    mapAgrupamento.set(norm(r.ANALISE), norm(r.AGRUPAMENTO));
  });

  // 2. Preparar Dados por Mês (Chave: "ANO-MES")
  // Estrutura: Map<"2025-1", { producao: 1000, defeitosPorGrupo: Map<Grupo, Qtd> }>
  const timeline = new Map<string, { producao: number; defeitos: Map<string, number> }>();

  // Helper para chave de data
  const getKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;

  // --- PROCESSAR PRODUÇÃO ---
  producaoRaw.forEach((p) => {
    // Aplica filtros de modelo/categoria na produção também (para o PPM ser justo)
    if (filtrosAtivos.modelo && !filtrosAtivos.modelo.includes(norm(p.MODELO))) return;
    if (filtrosAtivos.categoria && !filtrosAtivos.categoria.includes(norm(p.CATEGORIA))) return;

    const date = parseDateSafe(p.DATA);
    if (!date) return;

    const key = getKey(date);
    if (!timeline.has(key)) timeline.set(key, { producao: 0, defeitos: new Map() });
    
    timeline.get(key)!.producao += p.QTY_GERAL;
  });

  // --- PROCESSAR DEFEITOS ---
  defeitos.forEach((d) => {
    const key = getKey(d.DATA);
    // Se não tem produção nesse mês, cria a entrada zerada para registrar defeito
    if (!timeline.has(key)) timeline.set(key, { producao: 0, defeitos: new Map() });

    const ref = timeline.get(key)!;
    const grupo = mapAgrupamento.get(d.ANALISE) ?? "NÃO CLASSIFICADO";
    
    ref.defeitos.set(grupo, (ref.defeitos.get(grupo) || 0) + d.QUANTIDADE);
  });

  // 3. Identificar os 3 meses mais recentes presentes nos dados
  // Ordena chaves: ["2024-11", "2024-12", "2025-1"]
  const chavesOrdenadas = [...timeline.keys()].sort((a, b) => {
    const [yA, mA] = a.split("-").map(Number);
    const [yB, mB] = b.split("-").map(Number);
    return yA - yB || mA - mB;
  });

  // Precisamos de pelo menos 3 meses de histórico para ver tendência de 3 meses
  if (chavesOrdenadas.length < 3) {
    console.log("   ⚠️ Histórico insuficiente para tendência (min 3 meses).");
    return [];
  }

  const ultimos3Meses = chavesOrdenadas.slice(-3); // Pega os 3 últimos
  const [mes1, mes2, mes3] = ultimos3Meses;

  // 4. Calcular PPM e Verificar Tendência
  const alertas: TrendAlert[] = [];
  const gruposDisponiveis = new Set<string>();
  
  // Coleta todos os grupos possíveis que apareceram nesses meses
  ultimos3Meses.forEach(m => {
      timeline.get(m)?.defeitos.forEach((_, grupo) => gruposDisponiveis.add(grupo));
  });

  gruposDisponiveis.forEach(grupo => {
      const dadosM1 = timeline.get(mes1)!;
      const dadosM2 = timeline.get(mes2)!;
      const dadosM3 = timeline.get(mes3)!;

      // Captura Quantidades Absolutas
      const qtd1 = dadosM1.defeitos.get(grupo) || 0;
      const qtd2 = dadosM2.defeitos.get(grupo) || 0;
      const qtd3 = dadosM3.defeitos.get(grupo) || 0;

      // PPM = (Defeitos / Produção) * 1.000.000
      const ppm1 = dadosM1.producao > 0 ? (qtd1 / dadosM1.producao) * 1000000 : 0;
      const ppm2 = dadosM2.producao > 0 ? (qtd2 / dadosM2.producao) * 1000000 : 0;
      const ppm3 = dadosM3.producao > 0 ? (qtd3 / dadosM3.producao) * 1000000 : 0;

      // 🛑 REGRA DE OURO ATUALIZADA:
      // 1. Aumento consecutivo por 3 meses (ppm1 < ppm2 < ppm3)
      if (ppm3 > ppm2 && ppm2 > ppm1) {
          
          const deltaAbsoluto = ppm3 - ppm1;

          // 2. Régua de 200 PPM: O aumento real deve ser maior que 200
          if (deltaAbsoluto > 200) {
              
              // Calcula porcentagem apenas para exibição/ordenação secundária
              const crescimentoTotal = ppm1 > 0 
                ? ((ppm3 - ppm1) / ppm1) * 100 
                : 100; // Se partiu de 0, considera 100%

              alertas.push({
                  agrupamento: grupo,
                  // ⚠️ REMOVIDO Math.round() para manter a precisão (ex: 261.16)
                  ppmAtual: ppm3, 
                  
                  // ✅ Valores reais para a IA
                  ppmInicial: ppm1,
                  ppmFinal: ppm3,

                  // ✅ Valores de quantidade
                  qtdInicial: qtd1,
                  qtdFinal: qtd3,
                  
                  crescimentoPercentual: crescimentoTotal,
                  mesesCrescimento: 3
              });
          }
      }
  });

  // Retorna ordenado pelo MAIOR DELTA ABSOLUTO (Quantidade real de aumento)
  // Isso garante que quem subiu 1000 PPM apareça antes de quem subiu 201 PPM
  return alertas.sort((a, b) => (b.ppmFinal - b.ppmInicial) - (a.ppmFinal - a.ppmInicial));
}