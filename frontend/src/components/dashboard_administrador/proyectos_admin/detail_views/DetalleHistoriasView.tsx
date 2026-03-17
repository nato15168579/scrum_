import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface HistoriaUsuarioDetalleItem {
  hisId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  puntaje?: number | null;
  numeroSprint?: number | null;
  responsable?: string | null;
}

interface DetalleHistoriasViewProps {
  items: HistoriaUsuarioDetalleItem[];
}

const normalizeText = (value: unknown) => String(value ?? "").trim();

const DetalleHistoriasView = ({ items }: DetalleHistoriasViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const term = normalizeText(searchTerm).toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [
        item.hisId,
        item.titulo,
        item.descripcion,
        item.puntaje,
        item.numeroSprint,
        item.responsable,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, searchTerm]);

  return (
    <section className="vp-detail-card vp-detail-subview-card">
      <div className="vp-detail-card-header">
        <div>
          <h3>Historias de usuario</h3>
          <p className="vp-detail-helper">
            Busca por ID, titulo, descripcion, puntaje, sprint o responsable.
          </p>
        </div>
        <div className="vp-modal-search vp-detail-view-search">
          <Search size={16} className="vp-modal-search-icon" />
          <input
            type="text"
            placeholder="Buscar historia de usuario..."
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
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Puntaje</th>
              <th>Sprint</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length ? (
              filteredItems.map((item, index) => (
                <tr
                  key={`${normalizeText(item.hisId) || "historia"}-${index}`}
                >
                  <td>{normalizeText(item.hisId) || "--"}</td>
                  <td className="vp-name-cell">
                    {normalizeText(item.titulo) || "Sin titulo"}
                  </td>
                  <td className="vp-detail-table-text">
                    {normalizeText(item.descripcion) || "Sin descripcion"}
                  </td>
                  <td>{normalizeText(item.puntaje) || "--"}</td>
                  <td>{normalizeText(item.numeroSprint) || "--"}</td>
                  <td>{normalizeText(item.responsable) || "Sin responsable"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="vp-empty-row">
                  {items.length
                    ? "No se encontraron historias de usuario con ese filtro."
                    : "Este proyecto no tiene historias de usuario registradas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DetalleHistoriasView;
