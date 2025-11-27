import HeaderClient from "@/components/HeaderClient";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <HeaderClient />
        <Sidebar />
        {children}
      </body>
    </html>
  );
}