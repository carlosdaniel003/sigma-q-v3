"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Renderiza o conteúdo direto no corpo da página (acima de tudo)
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
      {children}
    </div>,
    document.body
  );
}