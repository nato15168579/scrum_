/**
 * DetalleSugerenciasView
 * ---------------------
 * Subvista del detalle de proyecto (Admin) para listar y gestionar sugerencias/observaciones.
 *
 * Sugerencias puede ser un dataset grande; por eso la tabla se renderiza dentro de un
 * contenedor con scroll (`vp-list-scroll`) y el detalle/edicion se maneja con modales
 * controlados por `VerProyectos.tsx`.
 */
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { normalizeText } from "../../utils/text";

interface SugerenciaDetalleItem {
  obsId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  fecha?: string | null;
  detParIdFk?: number | null;
  responsable?: string | null;
  responsableCedula?: string | number | null;
}

interface DetalleSugerenciasViewProps {
  items: SugerenciaDetalleItem[];
  onViewItem?: (item: SugerenciaDetalleItem) => void;
  onEditItem?: (item: SugerenciaDetalleItem) => void;
  onDeleteItem?: (item: SugerenciaDetalleItem) => void;
  onAddItem?: () => void;
  isBusy?: boolean;
}

const DetalleSugerenciasView = ({
  items,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  isBusy = false,
}: DetalleSugerenciasViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const showActions = Boolean(onViewItem || onEditItem || onDeleteItem);

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
        <div className="vp-detail-view-toolbar">
          <div className="vp-modal-search vp-detail-view-search">
            <Search size={16} className="vp-modal-search-icon" />
            <input
              type="text"
              placeholder="Buscar sugerencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {onAddItem ? (
            <button
              type="button"
              className="vp-btn-secondary vp-btn-secondary-compact"
              onClick={onAddItem}
              disabled={isBusy}
            >
              <Plus size={16} />
              Agregar sugerencia
            </button>
          ) : null}
        </div>
      </div>

      <div className="vp-detail-table-wrap vp-list-scroll">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Descripcion</th>
              {showActions ? <th style={{ textAlign: "center" }}>Acciones</th> : null}
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
                  {showActions ? (
                    <td className="vp-actions-cell">
                      <div className="vp-table-actions">
                        {onViewItem ? (
                          <button
                            type="button"
                            className="vp-action-button action-view"
                            onClick={() => onViewItem(item)}
                            title="Ver mas"
                            aria-label={`Ver mas de la sugerencia ${normalizeText(item.obsId) || index + 1}`}
                            disabled={isBusy}
                          >
                            <Eye size={18} />
                          </button>
                        ) : null}
                        {onEditItem ? (
                          <button
                            type="button"
                            className="vp-action-button action-edit"
                            onClick={() => onEditItem(item)}
                            title="Editar"
                            aria-label={`Editar sugerencia ${normalizeText(item.obsId) || index + 1}`}
                            disabled={isBusy}
                          >
                            <Pencil size={18} />
                          </button>
                        ) : null}
                        {onDeleteItem ? (
                          <button
                            type="button"
                            className="vp-action-button action-delete"
                            onClick={() => onDeleteItem(item)}
                            title="Eliminar"
                            aria-label={`Eliminar sugerencia ${normalizeText(item.obsId) || index + 1}`}
                            disabled={isBusy}
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showActions ? 3 : 2} className="vp-empty-row">
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
