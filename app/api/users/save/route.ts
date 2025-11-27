import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const users = await req.json();

    const filePath = path.join(process.cwd(), "src/lib/db/users.json");

    // sobrescreve o arquivo com os novos usuários
    await writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao salvar usuários:", err);
    return NextResponse.json({ ok: false, error: "Falha ao salvar usuários" }, { status: 500 });
  }
}