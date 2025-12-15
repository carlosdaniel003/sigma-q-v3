export function CatalogoTable({ title, dados }: any) {
  if (!dados || dados.length === 0) return null;

  const colunas = Object.keys(dados[0]);

  return (
    <div className="catalogo-section fade-in" style={{ marginTop: 20 }}>
      <h3 className="catalogo-title">{title}</h3>

      <div
        className="custom-scroll catalogo-table-wrapper"
      >
        <table className="tabela-catalogo premium-table">
          <thead>
            <tr>
              {colunas.map((c) => (
                <th key={c} className="catalogo-th">
                  {c.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dados.map((linha: any, i: number) => (
              <tr key={i} className="catalogo-tr">
                {Object.values(linha).map((v: any, j: number) => (
                  <td key={j} className="catalogo-td">
                    {String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}