import "./globals.css";

export const metadata = {
  title: "SIGMA-Q V3",
  description: "Sistema de Qualidade Industrial V3"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}