"use client";
import { useState, useEffect } from "react";

export default function CatalogoOficialPage() {
  // --- 🔵 PASSO 1: Estados para as 6 bases ---
  const [todosModelos, setTodosModelos] = useState([]);
  const [todasCausas, setTodasCausas] = useState([]);
  const [todasResp, setTodasResp] = useState([]);
  const [todosDefeitos, setTodosDefeitos] = useState([]);
  const [todosCodigos, setTodosCodigos] = useState([]);
  // 📌 NOVO ESTADO ADICIONADO:
  const [todasExcessoes, setTodasExcessoes] = useState([]);

  const [buscaGlobal, setBuscaGlobal] = useState("");

  // --- Estados de Navegação ---
  const [catalogo, setCatalogo] = useState("");
  const [dados, setDados] = useState([]);

  // --- 🔵 PASSO 2: Carregar tudo com SEGURANÇA ---
  useEffect(() => {
    // Função auxiliar: se der erro ou 404, retorna [] para não travar o Promise.all
    const fetchSeguro = (url: string) =>
      fetch(url)
        .then((res) => (res.ok ? res.json() : []))
        .catch((err) => {
          console.error(`Erro ao carregar ${url}:`, err);
          return [];
        });

    async function carregarTudo() {
      // Carrega as 6 bases em paralelo
      const [m, c, r, d, cod, exc] = await Promise.all([
        fetchSeguro("/api/catalogo/modelos"),
        fetchSeguro("/api/catalogo/causas"),
        fetchSeguro("/api/catalogo/responsabilidades"),
        fetchSeguro("/api/catalogo/defeitos"),
        fetchSeguro("/api/catalogo/codigos"),
        fetchSeguro("/api/catalogo/excecoes"), // 📌 NOVO FETCH
      ]);

      setTodosModelos(m);
      setTodasCausas(c);
      setTodasResp(r);
      setTodosDefeitos(d);
      setTodosCodigos(cod);
      setTodasExcessoes(exc); // 📌 NOVO SET
    }

    carregarTudo();
  }, []);

  // --- 🔵 Função OTIMIZADA: Carrega da memória (Instantâneo) ---
  function carregar(tipo: string) {
    setCatalogo(tipo);
    setBuscaGlobal(""); // Limpa a busca para focar na tabela
    
    // Seleciona o estado correto baseado no botão clicado
    if (tipo === "modelos") setDados(todosModelos);
    else if (tipo === "causas") setDados(todasCausas);
    else if (tipo === "responsabilidades") setDados(todasResp);
    else if (tipo === "defeitos") setDados(todosDefeitos);
    else if (tipo === "codigos") setDados(todosCodigos);
    else if (tipo === "excecoes") setDados(todasExcessoes); // 📌 AQUI ESTÁ A LIGAÇÃO
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
  // 📌 NOVA FILTRAGEM:
  const achadosExcessoes = filtrar(todasExcessoes);

  const temBusca = buscaGlobal.trim().length > 0;

  // --- 🔵 PASSO 7: Função Helper ---
  function renderTabela(lista: any[]) {
    if (lista.length === 0) return null;
    const colunas = Object.keys(lista[0]);

    return (
      <table className="tabela-catalogo">
        <thead>
          <tr>
            {colunas.map((c, idx) => (
              <th key={idx}>{c.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lista.map((item, i) => (
            <tr key={i}>
              {Object.values(item).map((v, j) => (
                <td key={j}>{String(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="catalogo-container">
      <h1>Catálogo Oficial</h1>

      {/* --- Input de Busca Global --- */}
      <input
        type="text"
        placeholder="Pesquisar em todos os catálogos..."
        className="input-busca-global"
        value={buscaGlobal}
        onChange={(e) => setBuscaGlobal(e.target.value)}
      />

      {/* --- Resultados da Busca Global --- */}
      {temBusca && (
        <div className="resultados-global">
          <h2>Resultados da Pesquisa</h2>

          {achadosDefeitos.length > 0 && (
            <div className="fade-in">
              <h3>Códigos de Defeitos</h3>
              {renderTabela(achadosDefeitos)}
            </div>
          )}

          {achadosCodigos.length > 0 && (
            <div className="fade-in">
              <h3>Modelos — Categorias — Códigos</h3>
              {renderTabela(achadosCodigos)}
            </div>
          )}

          {/* 📌 NOVA EXIBIÇÃO NA BUSCA: */}
          {achadosExcessoes.length > 0 && (
            <div className="fade-in">
              <h3>Exceções</h3>
              {renderTabela(achadosExcessoes)}
            </div>
          )}

          {achadosModelos.length > 0 && (
            <div className="fade-in">
              <h3>Modelos</h3>
              {renderTabela(achadosModelos)}
            </div>
          )}

          {achadosCausas.length > 0 && (
            <div className="fade-in">
              <h3>Causas</h3>
              {renderTabela(achadosCausas)}
            </div>
          )}

          {achadosResp.length > 0 && (
            <div className="fade-in">
              <h3>Responsabilidades</h3>
              {renderTabela(achadosResp)}
            </div>
          )}

          {/* Mensagem se não encontrar nada em nenhuma das 6 bases */}
          {achadosDefeitos.length === 0 &&
            achadosModelos.length === 0 &&
            achadosCausas.length === 0 &&
            achadosResp.length === 0 &&
            achadosCodigos.length === 0 &&
            achadosExcessoes.length === 0 && <p>Nenhum resultado encontrado.</p>}
        </div>
      )}

      {/* ---- CARDS DE NAVEGAÇÃO ---- */}
      {!temBusca && (
        <div className="cards-grid">
          <div className="card-btn" onClick={() => carregar("modelos")}>
            Ver Informações de Modelos
          </div>
          <div className="card-btn" onClick={() => carregar("causas")}>
            Ver Informações de Causas
          </div>
          <div className="card-btn" onClick={() => carregar("responsabilidades")}>
            Ver Informações de Responsabilidades
          </div>
          <div className="card-btn" onClick={() => carregar("defeitos")}>
            Ver Informações de Defeitos
          </div>
          <div className="card-btn" onClick={() => carregar("codigos")}>
            Ver Informações de Modelos — Categorias — Códigos
          </div>
          {/* 📌 NOVO BOTÃO: */}
          <div className="card-btn" onClick={() => carregar("excecoes")}>
            Ver Informações de Exceções
          </div>
        </div>
      )}

      {/* ---- TABELA DE NAVEGAÇÃO ---- */}
      {catalogo && !temBusca && (
        <div className="tabela-area fade-in" key={catalogo}>
          <h2>Catálogo — {catalogo.toUpperCase()}</h2>
          <table className="tabela-catalogo">
            <thead>
              <tr>
                {dados.length > 0 &&
                  Object.keys(dados[0]).map((col, index) => (
                    <th key={index}>{col.toUpperCase()}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {dados.map((item, idx) => (
                <tr key={idx}>
                  {Object.values(item).map((valor, idv) => (
                    <td key={idv}>{String(valor)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}