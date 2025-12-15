"use client";

import { useCatalogo } from "./hooks/useCatalogo";
import { CatalogoHeader } from "./components/CatalogoHeader";
import { CatalogoSearch } from "./components/CatalogoSearch";
import { CatalogoCards } from "./components/CatalogoCards";
import { CatalogoTable } from "./components/CatalogoTable";

export default function CatalogoOficialPage() {
  const {
    buscaGlobal,
    setBuscaGlobal,
    catalogo,
    dados,
    resultadosBusca,
    temBusca,
    carregarCatalogo,
  } = useCatalogo();

  return (
    <div className="catalogo-container">

      {/* Input de busca */}
      <CatalogoSearch value={buscaGlobal} onChange={setBuscaGlobal} />

      {/* Se está buscando → título "Resultados" */}
      {temBusca && <CatalogoHeader title="Resultados da Pesquisa" />}

      {/* Cards principais quando NÃO está buscando */}
      {!temBusca && <CatalogoCards onSelect={carregarCatalogo} />}

      {/* Renderização dos resultados da busca */}
      {temBusca &&
        Object.entries(resultadosBusca).map(([nome, lista]) =>
          lista.length > 0 ? (
            <CatalogoTable key={nome} title={nome} dados={lista} />
          ) : null
        )}

      {/* Tabela da navegação (quando não está buscando) */}
      {!temBusca && catalogo && (
        <CatalogoTable title={catalogo.toUpperCase()} dados={dados} />
      )}
    </div>
  );
}