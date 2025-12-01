import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "app",
    "development",
    "catalogo",
    "data",
    "causas.json"
  );

  const fileData = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(fileData);

  return NextResponse.json(json);
}