export async function runProductionKnowledge(items: any[], options?: any) {
  const res = await fetch("/api/knowledge/production/v1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, options }),
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error("Production knowledge failed");
  }

  return json.enriched;
}