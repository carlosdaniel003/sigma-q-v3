"use client";

import ProducaoPage from "./page";

export default function ProducaoContent({ embedded = false }: { embedded?: boolean }) {
  return <ProducaoPage embedded={embedded} />;
}