export function CatalogoSearch({ value, onChange }: any) {
  return (
    <input
      type="text"
      placeholder="Pesquisar em todos os catálogos..."
      className="input-busca-global"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        maxWidth: "calc(100% - 4px)", // 🔥 impede escapar para fora
        display: "block",              // 🔥 garante alinhamento 100%

        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",

        background: "rgba(255,255,255,0.04)",
        color: "white",

        marginBottom: 24,
      }}
    />
  );
}