import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // Caminho EXATO baseado no que você me passou
    const filePath = path.join(
      process.cwd(),
      "app",
      "development",
      "catalogo",
      "data",
      "fmea.json"
    );

    const content = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(content);

    return NextResponse.json(json, { status: 200 });

  } catch (error) {
    console.error("Erro ao carregar FMEA:", error);
    return NextResponse.json([], { status: 200 });
  }
}