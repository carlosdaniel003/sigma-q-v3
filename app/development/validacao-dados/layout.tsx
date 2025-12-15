"use client";

import React from "react";
import "../dev.css"; // mantém o estilo geral do módulo development

export default function LayoutValidacaoDados({ children }: any) {
  return (
    <div className="validacao-content fade-in">
      {children}
    </div>
  );
}