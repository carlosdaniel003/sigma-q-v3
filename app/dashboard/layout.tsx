import React from "react";

// Não importamos mais a Sidebar aqui, pois ela já vem do pai (app/layout.tsx)
// Não importamos CSS aqui, pois já está no AppLayoutClient

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}