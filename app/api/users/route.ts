import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  // Busca direta no banco de dados via SQL
  const result = await db.execute("SELECT * FROM users");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { username, password, role } = await req.json();

  // Validação básica
  if (!username || !password || !role) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  try {
    // 1. Inserção direta via SQL (usando args para evitar SQL Injection)
    await db.execute({
      sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      args: [username, password, role],
    });

    // 2. Busca o usuário recém-criado para retornar o ID e dados completos
    const result = await db.execute(
      "SELECT * FROM users ORDER BY id DESC LIMIT 1"
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição (possível duplicidade)" }, 
      { status: 500 }
    );
  }
}