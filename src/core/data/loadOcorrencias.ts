import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

// Função simples de normalização interna para evitar dependência circular
function normalizeKey(value: any): string {
  return String(value ?? "")
    .toUpperCase()
    .trim();
}

export function loadOcorrencias(): Set<string> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "suporte",
      "ocorrencias.xlsx"
    );

    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet) as { "CÓDIGO": string }[];

    // Retorna um Set com os códigos normalizados (ex: "OC", "RNC", etc)
    const ocorrenciasSet = new Set<string>();
    
    json.forEach((row) => {
      if (row["CÓDIGO"]) {
        ocorrenciasSet.add(normalizeKey(row["CÓDIGO"]));
      }
    });

    return ocorrenciasSet;
  } catch (error) {
    console.error("❌ Erro ao carregar ocorrencias.xlsx:", error);
    return new Set(); // Retorna vazio em caso de erro para não quebrar a app
  }
}