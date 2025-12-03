import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Caminho do arquivo NO PUBLIC
    const filePath = path.join(process.cwd(), "public", "defeitos_af.xlsx");

    // Ler arquivo
    const buf = await fs.readFile(filePath);

    // Parsear XLSX
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    return NextResponse.json({
      ok: true,
      fileExists: true,
      totalLinhas: rows.length,
      primeiraLinha: rows[0] ?? null,
    });

  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      fileExists: false,
      error: err.message,
      cwd: process.cwd(),
      expectedPath: path.join(process.cwd(), "public", "defeitos_af.xlsx"),
    });
  }
}