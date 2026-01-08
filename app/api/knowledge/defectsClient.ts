export async function runDefectsKnowledge(items: any[], options?: any) {
  const res = await fetch("/api/knowledge/defects/v1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, options })
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error("Defects knowledge failed");
  }

  return json.enriched;
}