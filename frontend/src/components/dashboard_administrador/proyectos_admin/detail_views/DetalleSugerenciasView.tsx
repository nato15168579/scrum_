import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface SugerenciaDetalleItem {
  obsId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
}

interface DetalleSugerenciasViewProps {
  items: SugerenciaDetalleItem[];
}

const normalizeText = (value: unknown) => String(value ?? "").trim();

const DetalleSugerenciasView = ({ items }: DetalleSugerenciasViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const term = normalizeText(searchTerm).toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [item.obsId, item.titulo, item.descripcion]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, searchTerm]);

  return (
    <section className="vp-detail-card vp-detail-subview-card">
      <div className="vp-detail-card-header">
        <div>
          <h3>Sugerencias</h3>
          <p className="vp-detail-helper">
            Busca por titulo, descripcion o identificador.
          </p>
        </div>
        <div className="vp-modal-search vp-detail-view-search">
          <Search size={16} className="vp-modal-search-icon" />
          <input
            type="text"
            placeholder="Buscar sugerencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="vp-detail-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Descripcion</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length ? (
              filteredItems.map((item, index) => (
                <tr
                  key={`${normalizeText(item.obsId) || "sugerencia"}-${index}`}
                >
                  <td className="vp-name-cell">
                    {normalizeText(item.titulo) ||
                      `Sugerencia #${normalizeText(item.obsId) || index + 1}`}
                  </td>
                  <td className="vp-detail-table-text">
                    {normalizeText(item.descripcion) || "Sin descripcion"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="vp-empty-row">
                  {items.length
                    ? "No se encontraron sugerencias con ese filtro."
                    : "Este proyecto no tiene sugerencias registradas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DetalleSugerenciasView;
