/* ======================================================
   TIPOS OFICIAIS — DIAGNÓSTICO DE IA
   (CONTRATO ÚNICO DO SISTEMA)
====================================================== */

/* =========================
   PRINCIPAL CAUSA
========================= */
export interface PrincipalCausa {
  nome: string;
  ocorrencias: number;
}

/* =========================
   PRINCIPAL DEFEITO
========================= */
export interface PrincipalDefeito {
  nome: string;
  ocorrencias: number;
}

/* =========================
   DEFEITO CRÍTICO (NPR)
========================= */
export interface DefeitoCritico {
  codigo: string;
  descricao: string;
  npr: number;
}

/* =========================
   STATUS GERAL
========================= */
export interface StatusGeral {
  nivel: "ok" | "alerta" | "critico";
  mensagem: string;
  nprReferencia: number;
}

/* =========================
   DEFEITOS CRÍTICOS (TOP 5)
========================= */
export interface DefeitoCriticoDetalhado {
  codigo: string;
  descricao: string;
  severidade: number;
  ocorrencia: number;
  deteccao: number;
  npr: number;
}

/* =========================
   PRINCIPAIS CAUSAS (TOP 3)
========================= */
export interface CausaCritica {
  nome: string;
  ocorrencias: number;
  
  // ✅ ADICIONADO: Lista para o Drill-down (detalhes do agrupamento)
  detalhes?: {
    nome: string;
    ocorrencias: number;
    // ✅ ATUALIZADO: Lista de objetos para o tooltip com quantidade
    modelos?: {
        nome: string;
        ocorrencias: number;
    }[];
  }[];
}

/* =========================
   DIAGNÓSTICO AUTOMÁTICO (IA)
========================= */
export interface DiagnosticoIaTexto {
  titulo: string;
  texto: string;
  
  // ✅ ADICIONADO: Campos para o novo visual de Tendência
  tendencia?: "melhora" | "piora" | "estavel" | "indefinido";
  variacaoPercentual?: number;

  // Mantido opcional para retrocompatibilidade
  severidade?: "informativo" | "alerta" | "critico";
  
  indicadoresChave: string[];
}

/* =========================
   RESPONSE FINAL DA API
========================= */
export interface DiagnosticoIaResponse {
  principalCausa: PrincipalCausa;
  principalDefeito: PrincipalDefeito;
  defeitoCritico: DefeitoCritico;
  statusGeral: StatusGeral;

  defeitosCriticos: DefeitoCriticoDetalhado[];
  principaisCausas: CausaCritica[];

  diagnosticoIa: DiagnosticoIaTexto;
}