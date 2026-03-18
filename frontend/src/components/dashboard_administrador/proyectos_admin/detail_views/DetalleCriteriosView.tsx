/**
 * DetalleCriteriosView
 * -------------------
 * Subvista del detalle de proyecto (Admin) para listar y gestionar criterios de aceptacion.
 *
 * Se renderiza dentro del modal de "Ver mas" de proyecto. El contenedor define
 * los callbacks y los modales (ver/editar/eliminar/agregar) para mantener una sola
 * fuente de verdad del estado del CRUD en `VerProyectos.tsx`.
 */
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { normalizeText } from "../../utils/text";

interface CriterioAceptacionDetalleItem {
  criId?: number | null;
  tiempo?: string | null;
  descripcion?: string | null;
  responsable?: string | null;
  hisId?: number | null;
  historiaTitulo?: string | null;
  estadoFk?: number | null;
  responsableCedula?: string | number | null;
}

interface DetalleCriteriosViewProps {
  items: CriterioAceptacionDetalleItem[];
  onViewItem?: (item: CriterioAceptacionDetalleItem) => void;
  onEditItem?: (item: CriterioAceptacionDetalleItem) => void;
  onDeleteItem?: (item: CriterioAceptacionDetalleItem) => void;
  onAddItem?: () => void;
  isBusy?: boolean;
}

const DetalleCriteriosView = ({
  items,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  isBusy = false,
}: DetalleCriteriosViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const showActions = Boolean(onViewItem || onEditItem || onDeleteItem);

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
        <div className="vp-detail-view-toolbar">
          <div className="vp-modal-search vp-detail-view-search">
            <Search size={16} className="vp-modal-search-icon" />
            <input
              type="text"
              placeholder="Buscar criterio..."
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
              Agregar CA
            </button>
          ) : null}
        </div>
      </div>

      <div className="vp-detail-table-wrap vp-list-scroll">
        <table className="vp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiempo</th>
              <th>Descripcion</th>
              <th>Responsable</th>
              {showActions ? <th style={{ textAlign: "center" }}>Acciones</th> : null}
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
                  {showActions ? (
                    <td className="vp-actions-cell">
                      <div className="vp-table-actions">
                        {onViewItem ? (
                          <button
                            type="button"
                            className="vp-action-button action-view"
                            onClick={() => onViewItem(item)}
                            title="Ver mas"
                            aria-label={`Ver mas del criterio ${normalizeText(item.criId) || index + 1}`}
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
                            aria-label={`Editar criterio ${normalizeText(item.criId) || index + 1}`}
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
                            aria-label={`Eliminar criterio ${normalizeText(item.criId) || index + 1}`}
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
                <td colSpan={showActions ? 5 : 4} className="vp-empty-row">
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
