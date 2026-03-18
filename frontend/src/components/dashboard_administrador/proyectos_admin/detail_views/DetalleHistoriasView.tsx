/**
 * DetalleHistoriasView
 * -------------------
 * Subvista del detalle de proyecto (Admin) para listar y gestionar historias de usuario.
 *
 * Se renderiza dentro del modal de "Ver mas" de proyecto y expone callbacks
 * (ver/editar/eliminar/agregar) para que el contenedor (`VerProyectos.tsx`) maneje
 * los modales de detalle/edicion y las llamadas HTTP.
 */
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { normalizeText } from "../../utils/text";

interface HistoriaUsuarioDetalleItem {
  hisId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  puntaje?: number | null;
  numeroSprint?: number | null;
  responsable?: string | null;
  detParIdFk?: number | null;
  responsableCedula?: string | number | null;
}

interface DetalleHistoriasViewProps {
  items: HistoriaUsuarioDetalleItem[];
  onViewItem?: (item: HistoriaUsuarioDetalleItem) => void;
  onEditItem?: (item: HistoriaUsuarioDetalleItem) => void;
  onDeleteItem?: (item: HistoriaUsuarioDetalleItem) => void;
  onAddItem?: () => void;
  isBusy?: boolean;
}

const DetalleHistoriasView = ({
  items,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  isBusy = false,
}: DetalleHistoriasViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const showActions = Boolean(onViewItem || onEditItem || onDeleteItem);

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
        <div className="vp-detail-view-toolbar">
          <div className="vp-modal-search vp-detail-view-search">
            <Search size={16} className="vp-modal-search-icon" />
            <input
              type="text"
              placeholder="Buscar historia de usuario..."
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
              Agregar HU
            </button>
          ) : null}
        </div>
      </div>

      <div className="vp-detail-table-wrap vp-list-scroll">
        <table className="vp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Puntaje</th>
              <th>Sprint</th>
              <th>Responsable</th>
              {showActions ? <th style={{ textAlign: "center" }}>Acciones</th> : null}
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
                  {showActions ? (
                    <td className="vp-actions-cell">
                      <div className="vp-table-actions">
                        {onViewItem ? (
                          <button
                            type="button"
                            className="vp-action-button action-view"
                            onClick={() => onViewItem(item)}
                            title="Ver mas"
                            aria-label={`Ver mas de la historia ${normalizeText(item.titulo) || normalizeText(item.hisId) || index + 1}`}
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
                            aria-label={`Editar historia ${normalizeText(item.titulo) || normalizeText(item.hisId) || index + 1}`}
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
                            aria-label={`Eliminar historia ${normalizeText(item.titulo) || normalizeText(item.hisId) || index + 1}`}
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
                <td colSpan={showActions ? 7 : 6} className="vp-empty-row">
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
