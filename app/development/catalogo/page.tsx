"use client";
import { useState, useEffect } from "react";

export default function CatalogoOficialPage() {
  // --- 🔵 PASSO 1: Estados para as 6 bases ---
  const [todosModelos, setTodosModelos] = useState([]);
  const [todasCausas, setTodasCausas] = useState([]);
  const [todasResp, setTodasResp] = useState([]);
  const [todosDefeitos, setTodosDefeitos] = useState([]);
  const [todosCodigos, setTodosCodigos] = useState([]);
  const [todasExcessoes, setTodasExcessoes] = useState([]);

  const [buscaGlobal, setBuscaGlobal] = useState("");

  // --- Estados de Navegação ---
  const [catalogo, setCatalogo] = useState("");
  const [dados, setDados] = useState([]);

  // --- 🔵 PASSO 2: Carregar tudo com SEGURANÇA ---
  useEffect(() => {
    const fetchSeguro = (url: string) =>
      fetch(url)
        .then((res) => (res.ok ? res.json() : []))
        .catch((err) => {
          console.error(`Erro ao carregar ${url}:`, err);
          return [];
        });

    async function carregarTudo() {
      const [m, c, r, d, cod, exc] = await Promise.all([
        fetchSeguro("/api/catalogo/modelos"),
        fetchSeguro("/api/catalogo/causas"),
        fetchSeguro("/api/catalogo/responsabilidades"),
        fetchSeguro("/api/catalogo/defeitos"),
        fetchSeguro("/api/catalogo/codigos"),
        fetchSeguro("/api/catalogo/excecoes"),
      ]);

      setTodosModelos(m);
      setTodasCausas(c);
      setTodasResp(r);
      setTodosDefeitos(d);
      setTodosCodigos(cod);
      setTodasExcessoes(exc);
    }

    carregarTudo();
  }, []);

  // --- 🔵 Função OTIMIZADA: Carrega da memória ---
  function carregar(tipo: string) {
    setCatalogo(tipo);
    setBuscaGlobal("");
    
    if (tipo === "modelos") setDados(todosModelos);
    else if (tipo === "causas") setDados(todasCausas);
    else if (tipo === "responsabilidades") setDados(todasResp);
    else if (tipo === "defeitos") setDados(todosDefeitos);
    else if (tipo === "codigos") setDados(todosCodigos);
    else if (tipo === "excecoes") setDados(todasExcessoes);
  }

  // --- 🔵 PASSO 3: Lógica de Busca Global ---
  function filtrar(base: any[]) {
    if (!buscaGlobal.trim()) return [];

    return base.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(buscaGlobal.toLowerCase())
    );
  }

  const achadosModelos = filtrar(todosModelos);
  const achadosCausas = filtrar(todasCausas);
  const achadosResp = filtrar(todasResp);
  const achadosDefeitos = filtrar(todosDefeitos);
  const achadosCodigos = filtrar(todosCodigos);
  const achadosExcessoes = filtrar(todasExcessoes);

  const temBusca = buscaGlobal.trim().length > 0;

  // --- 🔵 PASSO 7: Função Helper (COM SCROLL DARK CORRIGIDO) ---
  function renderTabela(lista: any[]) {
    if (lista.length === 0) return null;
    const colunas = Object.keys(lista[0]);

    return (
      // Wrapper para garantir scroll horizontal suave e escuro
      <div className="custom-scroll" style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <table className="tabela-catalogo" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)" }}>
            <tr>
              {colunas.map((c, idx) => (
                <th key={idx} style={{ padding: "12px", textAlign: "left", fontSize: "0.85rem", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {c.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {Object.values(item).map((v, j) => (
                  <td key={j} style={{ padding: "10px 12px", fontSize: "0.85rem", color: "#e2e8f0" }}>
                    {String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="catalogo-container">
      {/* 🎨 ESTILOS INJETADOS PARA SCROLLBAR DARK 
         Isso força a barra de rolagem a seguir o tema escuro
      */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        /* Ajuste fino para inputs não vazarem */
        .input-busca-global:focus {
           outline: none;
           border-color: var(--brand);
           box-shadow: 0 0 0 2px rgba(95, 180, 255, 0.2);
        }
      `}</style>

      <h1 style={{ marginBottom: "20px" }}>Catálogo Oficial</h1>

      {/* --- Input de Busca Global (CORRIGIDO) --- */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Pesquisar em todos os catálogos..."
          className="input-busca-global"
          value={buscaGlobal}
          onChange={(e) => setBuscaGlobal(e.target.value)}
          // Estilos inline para garantir que não vaze
          style={{
            width: "100%",
            boxSizing: "border-box", // O segredo para não vazar
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "white",
            fontSize: "0.95rem"
          }}
        />
      </div>

      {/* --- Resultados da Busca Global --- */}
      {temBusca && (
        <div className="resultados-global" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--brand)" }}>Resultados da Pesquisa</h2>

          {achadosDefeitos.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Códigos de Defeitos</h3>
              {renderTabela(achadosDefeitos)}
            </div>
          )}

          {achadosCodigos.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Modelos — Categorias — Códigos</h3>
              {renderTabela(achadosCodigos)}
            </div>
          )}

          {achadosExcessoes.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Exceções</h3>
              {renderTabela(achadosExcessoes)}
            </div>
          )}

          {achadosModelos.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Modelos</h3>
              {renderTabela(achadosModelos)}
            </div>
          )}

          {achadosCausas.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Causas</h3>
              {renderTabela(achadosCausas)}
            </div>
          )}

          {achadosResp.length > 0 && (
            <div className="fade-in">
              <h3 style={{ marginBottom: 10, color: "#cbd5e1" }}>Responsabilidades</h3>
              {renderTabela(achadosResp)}
            </div>
          )}

          {/* Mensagem se não encontrar nada */}
          {achadosDefeitos.length === 0 &&
            achadosModelos.length === 0 &&
            achadosCausas.length === 0 &&
            achadosResp.length === 0 &&
            achadosCodigos.length === 0 &&
            achadosExcessoes.length === 0 && 
            <div style={{ padding: 20, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b" }}>
              Nenhum resultado encontrado para "{buscaGlobal}".
            </div>
          }
        </div>
      )}

      {/* ---- CARDS DE NAVEGAÇÃO ---- */}
      {!temBusca && (
        <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div className="card-btn" onClick={() => carregar("modelos")}>Ver Informações de Modelos</div>
          <div className="card-btn" onClick={() => carregar("causas")}>Ver Informações de Causas</div>
          <div className="card-btn" onClick={() => carregar("responsabilidades")}>Ver Informações de Responsabilidades</div>
          <div className="card-btn" onClick={() => carregar("defeitos")}>Ver Informações de Defeitos</div>
          <div className="card-btn" onClick={() => carregar("codigos")}>Ver Informações de Modelos — Categorias — Códigos</div>
          <div className="card-btn" onClick={() => carregar("excecoes")}>Ver Informações de Exceções</div>
        </div>
      )}

      {/* ---- TABELA DE NAVEGAÇÃO ---- */}
      {catalogo && !temBusca && (
        <div className="tabela-area fade-in" key={catalogo} style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "12px", color: "var(--brand)", fontSize: "1.1rem" }}>
            Catálogo — {catalogo.toUpperCase()}
          </h2>
          {/* Reutiliza o renderTabela para garantir o scroll bonito aqui também */}
          {renderTabela(dados)}
        </div>
      )}
    </div>
  );
}