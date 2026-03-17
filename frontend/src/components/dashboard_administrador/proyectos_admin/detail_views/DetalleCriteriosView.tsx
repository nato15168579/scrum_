import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface CriterioAceptacionDetalleItem {
  criId?: number | null;
  tiempo?: string | null;
  descripcion?: string | null;
  responsable?: string | null;
}

interface DetalleCriteriosViewProps {
  items: CriterioAceptacionDetalleItem[];
}

const normalizeText = (value: unknown) => String(value ?? "").trim();

const DetalleCriteriosView = ({ items }: DetalleCriteriosViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const term = normalizeText(searchTerm).toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [item.criId, item.tiempo, item.descripcion, item.responsable]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, searchTerm]);

  return (
    <section className="vp-detail-card vp-detail-subview-card">
      <div className="vp-detail-card-header">
        <div>
          <h3>Criterios de aceptacion</h3>
          <p className="vp-detail-helper">
            Busca por ID, tiempo, descripcion o responsable.
          </p>
        </div>
        <div className="vp-modal-search vp-detail-view-search">
          <Search size={16} className="vp-modal-search-icon" />
          <input
            type="text"
            placeholder="Buscar criterio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="vp-detail-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiempo</th>
              <th>Descripcion</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length ? (
              filteredItems.map((item, index) => (
                <tr
                  key={`${normalizeText(item.criId) || "criterio"}-${index}`}
                >
                  <td>{normalizeText(item.criId) || "--"}</td>
                  <td>{normalizeText(item.tiempo) || "--"}</td>
                  <td className="vp-detail-table-text">
                    {normalizeText(item.descripcion) || "Sin descripcion"}
                  </td>
                  <td>{normalizeText(item.responsable) || "Sin responsable"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="vp-empty-row">
                  {items.length
                    ? "No se encontraron criterios de aceptacion con ese filtro."
                    : "Este proyecto no tiene criterios de aceptacion registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DetalleCriteriosView;
