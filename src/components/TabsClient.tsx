// 4. src/components/TabsClient.tsx
"use client";
import React, { useState } from "react";

type Tab = { id: string; label: string; content: React.ReactNode };

export default function TabsClient({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      <div className="flex gap-2 border-b pb-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1 rounded-t ${t.id === active ? "bg-white text-black" : "text-neutral-300 hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {tabs.map(t => (
          <div key={t.id} style={{ display: t.id === active ? "block" : "none" }}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}