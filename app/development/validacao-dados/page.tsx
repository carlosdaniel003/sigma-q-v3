"use client";

import React, { useState } from "react";
import "./tabs.css";

import ProducaoContent from "../producao/ProducaoContent";
import DefeitosContent from "../defeitos/DefeitosContent";

export default function ValidacaoDadosPage() {
  const [tab, setTab] = useState<"producao" | "defeitos">("producao");

  return (
    <div className="validacao-wrapper fade-in">

      <h1 className="page-title">Validação de Dados</h1>

      {/* Topbar com abas */}
      <div className="tabs-topbar">
        <button 
          className={`tab-btn ${tab === "producao" ? "active" : ""}`}
          onClick={() => setTab("producao")}
        >
          Validação de Produção
        </button>

        <button 
          className={`tab-btn ${tab === "defeitos" ? "active" : ""}`}
          onClick={() => setTab("defeitos")}
        >
          Validação de Defeitos
        </button>
      </div>

      {/* Conteúdo renderizado */}
      <div className="conteudo-wrapper">

        {tab === "producao" && <ProducaoContent embedded={true} />}
        {tab === "defeitos" && <DefeitosContent embedded={true} />}

      </div>
    </div>
  );
}