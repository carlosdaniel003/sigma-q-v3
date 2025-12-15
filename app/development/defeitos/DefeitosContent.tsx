"use client";

import DefeitosPage from "./page";

export default function DefeitosContent({ embedded = false }: { embedded?: boolean }) {
  return <DefeitosPage embedded={embedded} />;
}