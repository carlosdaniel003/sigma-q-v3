import { FmeaRow } from "../data/loadFmea";

interface ItemComQuantidade {
  nome: string;      // ou código do defeito
  quantidade: number;
  [key: string]: any; // Outras propriedades que o item tenha
}

/**
 * Aplica a regra de FMEA Dinâmico:
 * 1. Ocorrência (O) é calculada baseada no volume do período (Régua de 5).
 * 2. Severidade (S) e Detecção (D) vêm do Excel estático.
 * 3. NPR = S * O_dinamico * D.
 */
export function aplicarNprDinamico(
  itensDoPeriodo: ItemComQuantidade[],
  fmeaEstatico: FmeaRow[]
) {
  // 1️⃣ Descobre o TETO (Maior quantidade de defeitos encontrada neste período)
  const maxOcorrencia = Math.max(...itensDoPeriodo.map((i) => i.quantidade));

  // 2️⃣ Define o PASSO da régua (Ex: Se max é 40, passo é 8. Se max é 42, passo é 9)
  // Math.ceil garante arredondamento para cima conforme sua regra.
  // O "|| 1" protege contra divisão por zero se não houver defeitos.
  const step = Math.ceil(maxOcorrencia / 5) || 1;

  return itensDoPeriodo.map((item) => {
    // Busca S e D no catálogo (FMEA Excel)
    // Tenta achar pelo nome ou código, normalizando para evitar erros de string
    const refFmea = fmeaEstatico.find(
      (f) =>
        f.DESCRIÇÃO.toLowerCase() === item.nome.toLowerCase() ||
        f.CÓDIGO.toLowerCase() === item.nome.toLowerCase()
    );

    // Valores padrão caso não ache no Excel (Segurança)
    const S = refFmea?.SEVERIDADE || 10; 
    const D = refFmea?.DETECÇÃO || 1;    

    // 3️⃣ CÁLCULO DA OCORRÊNCIA DINÂMICA (A mágica acontece aqui)
    let ocorrenciaDinamica = Math.ceil(item.quantidade / step);

    // Travas de segurança da régua (Mínimo 1, Máximo 5)
    if (ocorrenciaDinamica < 1 && item.quantidade > 0) ocorrenciaDinamica = 1;
    if (ocorrenciaDinamica > 5) ocorrenciaDinamica = 5;
    if (item.quantidade === 0) ocorrenciaDinamica = 0; // Se não tem defeito, risco é zero

    // 4️⃣ NOVO NPR
    const nprDinamico = S * ocorrenciaDinamica * D;

    return {
      ...item,
      // Sobrescrevemos os valores antigos com os reais do momento
      npr: nprDinamico,
      ocorrencia: ocorrenciaDinamica, // Valor de 1 a 5 calculado agora
      severidade: S,
      deteccao: D,
      // Debug visual (opcional, ajuda a entender a conta)
      _debug: `Qtd: ${item.quantidade} | Max: ${maxOcorrencia} | Step: ${step} | Calc: ${item.quantidade}/${step}=${item.quantidade/step}`
    };
  });
}