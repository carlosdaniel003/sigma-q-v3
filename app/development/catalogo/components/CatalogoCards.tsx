export function CatalogoCards({ onSelect }: any) {
  return (
    <div className="cards-grid">
      <div className="card-btn" onClick={() => onSelect("modelos")}>Modelos</div>
      <div className="card-btn" onClick={() => onSelect("causas")}>Causas</div>
      <div className="card-btn" onClick={() => onSelect("responsabilidades")}>Responsabilidades</div>
      <div className="card-btn" onClick={() => onSelect("defeitos")}>Defeitos</div>
      <div className="card-btn" onClick={() => onSelect("fmea")}>FMEA</div>
      <div className="card-btn" onClick={() => onSelect("excecoes")}>Exceções</div>
    </div>
  );
}