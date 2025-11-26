// 5. src/app/dev/page.tsx
import { getSession } from "@/lib/auth/session"; // seu getSession server-side
import TabsClient from "@/components/TabsClient";

export default async function DevPage() {
  const session = await getSession(); // server-side
  if (!session || session.role !== "admin") {
    return <div className="p-6">Acesso negado — Admin apenas</div>;
  }

  const tabs = [
    { id: "catalog", label: "Catálogo Oficial SIGMA-Q", content: <div>Catálogo (placeholder)</div> },
    { id: "defeitos", label: "Classificação de Defeitos", content: <div>Defeitos</div> },
    { id: "producao", label: "Classificação de Produção", content: <div>Produção</div> },
    { id: "geral", label: "Classificação Geral", content: <div>Geral</div> },
    { id: "ppm", label: "PPM Engine", content: <div>PPM Engine</div> },
    { id: "access", label: "Gerenciamento de acesso", content: <div>Gerenciamento</div> },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Área de Desenvolvimento</h1>
      {/* TabsClient é um client component - por isso import dinâmico abaixo */}
      {/* Render client-side: */}
      {/* @ts-ignore */}
      <TabsClient tabs={tabs} />
    </main>
  );
}