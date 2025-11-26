// 6. src/app/layout.tsx  (server component)
import "@/app/globals.css";
import HeaderClient from "@/components/HeaderClient";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth/session";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body className="bg-neutral-950 text-white">
        <HeaderClient />
        <div className="flex">
          <Sidebar session={session} />
          <div className="flex-1 p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}