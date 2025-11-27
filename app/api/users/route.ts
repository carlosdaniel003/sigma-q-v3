import { NextResponse } from "next/server";
import { userService } from "@/services/userService";

export async function GET() {
  return NextResponse.json(userService.getAll());
}

export async function POST(req: Request) {
  const body = await req.json();
  const { username, passwordHash, role } = body;

  if (!username || !passwordHash || !role) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const exists = userService.getByUsername(username);
  if (exists) {
    return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
  }

  const newUser = userService.createUser(body);
  return NextResponse.json(newUser);
}