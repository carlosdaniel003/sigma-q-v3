// 5. src/app/dev/page.tsx

import TabsClient from "@/components/TabsClient";

export default function DevPage() {
  // Não existe mais getSession() no SIGMA-Q V3.
  // O controle de acesso já é feito no layout (development/layout.tsx).

  const tabs = [
    { id: "catalogo", label: "Catálogo Oficial SIGMA-Q", content: <div>Catálogo (placeholder)</div> },
    { id: "defeitos", label: "Classificação de Defeitos", content: <div>Defeitos</div> },
    { id: "producao", label: "Classificação de Produção", content: <div>Produção</div> },
    { id: "geral", label: "Classificação Geral", content: <div>Geral</div> },
    { id: "ppm", label: "PPM Engine", content: <div>PPM Engine</div> },
    { id: "access", label: "Gerenciamento de acesso", content: <div>Gerenciamento</div> },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Área de Desenvolvimento</h1>
      <TabsClient tabs={tabs} />
    </main>
  );
}