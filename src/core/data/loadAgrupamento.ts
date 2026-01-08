import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export interface AgrupamentoRow {
  ANALISE: string;
  AGRUPAMENTO: string;
}

export function loadAgrupamento(): AgrupamentoRow[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "suporte",
      "agrupamento_analise.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    // Carrega como 'any' primeiro para podermos acessar as chaves com acento
    const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

    // Mapeia manualmente para garantir que pegamos a coluna certa
    const mappedData = rawData.map((row) => ({
      // Tenta pegar com acento (padrão do Excel) ou sem (caso mudem a planilha)
      ANALISE: row["ANÁLISE"] || row["ANALISE"] || "",
      AGRUPAMENTO: row["AGRUPAMENTO"] || "NÃO CLASSIFICADO",
    }));

    return mappedData;
  } catch (error) {
    console.error("❌ Erro ao carregar agrupamento_analise.xlsx:", error);
    return [];
  }
}