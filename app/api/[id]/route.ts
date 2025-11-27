import { NextResponse } from "next/server";
import { userService } from "@/services/userService";

export async function PUT(req: Request, { params }: any) {
  const id = Number(params.id);
  const data = await req.json();

  const user = userService.updateUser(id, data);
  if (!user) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(user);
}

export async function DELETE(req: Request, { params }: any) {
  const id = Number(params.id);

  userService.deleteUser(id);
  return NextResponse.json({ success: true });
}