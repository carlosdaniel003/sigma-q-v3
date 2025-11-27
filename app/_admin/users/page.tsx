import { getSession } from "@/lib/auth/session";

export default async function AdminUsers() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return <div>Acesso restrito ao administrador</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Gerenciamento de usuários</h1>
      <p>Listar, criar, editar e apagar contas.</p>
    </div>
  );
}