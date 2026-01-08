"use client";

import ProducaoPage from "./page";
import { useProductionData } from "../context/ProductionContext";

export default function ProducaoContent({ embedded = false }: { embedded?: boolean }) {
  // 🔑 Apenas inicializa o contexto para a Produção
  // A escrita real acontecerá dentro do ProducaoPage
  useProductionData();

  return <ProducaoPage embedded={embedded} />;
}