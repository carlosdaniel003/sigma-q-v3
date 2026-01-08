/* ======================================================
   Loader oficial de Defeitos Brutos (PPM)
   Fonte: API interna já existente
====================================================== */

export async function loadDefeitosBrutos(): Promise<any[]> {
  const res = await fetch(
    "http://localhost:3000/api/defeitos/diagnose?fonte=todas&limit=0",
    {
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!json?.ok || !Array.isArray(json.items)) {
    console.error(
      "❌ [defeitosLoader] Resposta inválida da API:",
      json
    );
    return [];
  }

  return json.items;
}