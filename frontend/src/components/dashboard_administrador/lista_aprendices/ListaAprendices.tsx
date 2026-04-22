/**
 * Lista administrativa de aprendices.
 *
 * Esta vista resuelve tres casos principales sobre un mismo dataset:
 * - consulta y busqueda paginada
 * - lectura detallada en modal
 * - edicion y eliminacion conectadas al backend
 *
 * Los normalizadores locales absorben diferencias historicas de payload para
 * que la UI no dependa de un unico formato exacto de respuesta.
 */
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ListaAprendices.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../session/session";
import AdminLogoutModal from "../modals/AdminLogoutModal";
import AdminTimedAlert from "../feedback/AdminTimedAlert";
import AdminProfileMenu from "../layout/AdminProfileMenu";
import AdminSidebar from "../layout/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "../session/adminSession";
import { useClickOutside } from "../hooks/useClickOutside";

type EstadoAprendiz = "Activo" | "Inactivo";

interface Aprendiz {
  documento: string;
  tipoDocumento?: string;
  ficha: string;
  area?: string;
  fichaNombre?: string;
  programa: string;
  nombre: string;
  apellido: string;
  sexo?: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
  estado: EstadoAprendiz;
}

interface FichaOption {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
  fechaCreacion?: string | null;
}

interface EditAprendizForm {
  documento: string;
  ficha: string;
  area: string;
  programa: string;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  email: string;
  fechaInscripcion: string;
  estado: EstadoAprendiz;
}

type FilterKey =
  | "todos"
  | "documento"
  | "ficha"
  | "area"
  | "programa"
  | "nombre"
  | "apellido"
  | "sexo"
  | "telefono"
  | "email"
  | "fechaRegistro"
  | "estado";

const ITEMS_PER_PAGE = 10;
const ROW_FADE_DURATION_MS = 420;

// Helpers de normalizacion para mantener estable la UI aunque el backend haya
// enviado nombres de campo distintos en etapas anteriores del proyecto.
const normalizeEstado = (estado?: string | null): EstadoAprendiz =>
  estado === "Inactivo" ? "Inactivo" : "Activo";

const formatFechaRegistro = (value?: string | null) => {
  if (!value) return "Sin registro";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Sin registro";

  return parsedDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeAprendiz = (item: any): Aprendiz => ({
  documento: String(item?.documento ?? ""),
  tipoDocumento: item?.tipoDocumento || item?.usuTipoDocumento || "CC",
  ficha: String(item?.ficha ?? ""),
  area: item?.area || item?.fichaNombre || "",
  fichaNombre: item?.fichaNombre || item?.area || "",
  programa: item?.programa || "",
  nombre: item?.nombre || "",
  apellido: item?.apellido || "",
  sexo: item?.sexo || "",
  telefono: item?.telefono || "",
  email: item?.email || "",
  fechaInscripcion: item?.fechaInscripcion || null,
  estado: normalizeEstado(item?.estado),
});

const getAprendizDetailFields = (aprendiz: Aprendiz) => [
  { label: "Documento", value: aprendiz.documento || "Sin documento" },
  {
    label: "Tipo de documento",
    value: aprendiz.tipoDocumento || "CC",
  },
  { label: "Ficha", value: aprendiz.ficha || "Sin ficha" },
  {
    label: "Programa",
    value: aprendiz.programa || "Sin programa",
  },
  {
    label: "Area",
    value: aprendiz.area || aprendiz.fichaNombre || "Sin area",
  },
  { label: "Nombre", value: aprendiz.nombre || "Sin nombre" },
  { label: "Apellido", value: aprendiz.apellido || "Sin apellido" },
  { label: "Sexo", value: aprendiz.sexo || "Sin sexo" },
  { label: "Telefono", value: aprendiz.telefono || "Sin telefono" },
  { label: "Email", value: aprendiz.email || "Sin email" },
  {
    label: "Fecha de registro",
    value: formatFechaRegistro(aprendiz.fechaInscripcion),
  },
  { label: "Estado", value: aprendiz.estado || "Activo" },
];

const FILTER_OPTIONS: { key: FilterKey; label: string; placeholder: string }[] = [
  {
    key: "todos",
    label: "Todos los campos",
    placeholder:
      "Buscar en documento, ficha, area, programa, nombre, apellido, sexo, telefono, email o estado",
  },
  {
    key: "documento",
    label: "Documento",
    placeholder: "Buscar por documento",
  },
  { key: "ficha", label: "Ficha", placeholder: "Buscar por ficha" },
  { key: "area", label: "Area", placeholder: "Buscar por area" },
  { key: "programa", label: "Programa", placeholder: "Buscar por programa" },
  { key: "nombre", label: "Nombre", placeholder: "Buscar por nombre" },
  { key: "apellido", label: "Apellido", placeholder: "Buscar por apellido" },
  { key: "sexo", label: "Sexo", placeholder: "Buscar por sexo" },
  { key: "telefono", label: "Telefono", placeholder: "Buscar por telefono" },
  { key: "email", label: "Email", placeholder: "Buscar por email" },
  {
    key: "fechaRegistro",
    label: "Fecha de registro",
    placeholder: "Buscar por fecha de registro",
  },
  { key: "estado", label: "Estado", placeholder: "Buscar Activo/Inactivo" },
];

const ListaAprendicesAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [viewingAprendiz, setViewingAprendiz] = useState<Aprendiz | null>(null);
  const [editingAprendiz, setEditingAprendiz] = useState<Aprendiz | null>(null);
  const [editForm, setEditForm] = useState<EditAprendizForm | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [aprendizToDelete, setAprendizToDelete] = useState<Aprendiz | null>(
    null,
  );
  const [isDeletingAprendiz, setIsDeletingAprendiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [adminCedula, setAdminCedula] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [timedAlert, setTimedAlert] = useState<{
    id: number;
    title: string;
    description?: string;
  } | null>(null);
  const [pendingRowRemovalDocumento, setPendingRowRemovalDocumento] =
    useState<string | null>(null);
  const [rowsLeaving, setRowsLeaving] = useState<Record<string, boolean>>({});
  const rowRemovalTimeoutsRef = useRef<Record<string, number>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const timeouts = rowRemovalTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    setAdminCedula(cedula);

    // Se cargan por separado aprendices, fichas y datos del perfil admin para
    // que cada flujo tenga fallos aislados y feedback independiente.
    fetch(`${API_URL}/aprendices?cedula=${cedula}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setAprendices(validData.map(normalizeAprendiz));
      })
      .catch((err) => console.error("Error aprendices:", err))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/fichas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setFichas(
          validData.map((item) => ({
            numero: String(item?.numero ?? ""),
            nombre: item?.nombre || "Sin area",
            programa: item?.programa || "Sin programa",
            estado: item?.estado || "Sin estado",
            fechaCreacion: item?.fechaCreacion || null,
          })),
        );
      })
      .catch((err) => console.error("Error fichas:", err));

    fetch(`${API_URL}/dashboard?cedula=${cedula}`)
      .then((res) => res.json())
      .then((data) => {
        setAdminName(resolveUserName(data?.instructor, "Usuario"));
      })
      .catch((err) => {
        console.error("Error perfil:", err);
        setAdminName(resolveUserName(undefined, "Usuario"));
      });
  }, [navigate]);

  const openViewModal = (aprendiz: Aprendiz) => {
    setViewingAprendiz(aprendiz);
  };

  const closeViewModal = () => {
    setViewingAprendiz(null);
  };

  const openEditModal = (aprendiz: Aprendiz) => {
    setEditingAprendiz(aprendiz);
    setEditForm({
      documento: aprendiz.documento,
      ficha: aprendiz.ficha,
      area: aprendiz.area || aprendiz.fichaNombre || "Sin area",
      programa: aprendiz.programa || "Sin programa",
      nombre: aprendiz.nombre || "",
      apellido: aprendiz.apellido || "",
      sexo: aprendiz.sexo || "",
      telefono: aprendiz.telefono || "",
      email: aprendiz.email || "",
      fechaInscripcion: formatFechaRegistro(aprendiz.fechaInscripcion),
      estado: normalizeEstado(aprendiz.estado),
    });
  };

  const resetEditModal = () => {
    setEditingAprendiz(null);
    setEditForm(null);
  };

  const closeEditModal = () => {
    if (isSavingEdit) return;
    resetEditModal();
  };

  const handleEditFieldChange = (
    field: keyof EditAprendizForm,
    value: string,
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleEditFichaChange = (fichaNumero: string) => {
    const selectedFicha = fichas.find((item) => item.numero === fichaNumero);

    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            ficha: fichaNumero,
            area: selectedFicha?.nombre || "Sin area",
            programa: selectedFicha?.programa || "Sin programa",
          }
        : prev,
    );
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingAprendiz || !editForm) return;

    if (
      !editForm.nombre.trim() ||
      !editForm.apellido.trim() ||
      !editForm.email.trim() ||
      !editForm.ficha.trim()
    ) {
      window.alert(
        "Nombre, apellido, correo y ficha son obligatorios para guardar.",
      );
      return;
    }

    // La edicion siempre envia la foto completa del formulario para evitar que
    // el backend mezcle datos nuevos con residuos del estado anterior.
    setIsSavingEdit(true);

    try {
      const endpoint = adminCedula
        ? `${API_URL}/aprendices/${editingAprendiz.documento}?actorCedula=${encodeURIComponent(adminCedula)}`
        : `${API_URL}/aprendices/${editingAprendiz.documento}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: editForm.nombre.trim(),
          apellidos: editForm.apellido.trim(),
          correo: editForm.email.trim(),
          telefono: editForm.telefono.trim(),
          sexo: editForm.sexo.trim(),
          ficha: editForm.ficha,
          estado: editForm.estado,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "No fue posible actualizar el aprendiz.",
        );
      }

      const aprendizActualizado = normalizeAprendiz({
        ...editingAprendiz,
        ...payload?.aprendiz,
        ...editForm,
        fichaNombre: payload?.aprendiz?.fichaNombre || editForm.area,
        area: payload?.aprendiz?.area || editForm.area,
        tipoDocumento:
          payload?.aprendiz?.tipoDocumento || editingAprendiz.tipoDocumento,
      });

      setAprendices((prev) =>
        prev.map((item) =>
          item.documento === editingAprendiz.documento
            ? aprendizActualizado
            : item,
        ),
      );

      resetEditModal();
      setTimedAlert({
        id: Date.now(),
        title: "Cambios guardados correctamente",
        description: "La informacion del usuario se actualizo correctamente.",
      });
    } catch (error) {
      console.error("Error actualizando aprendiz:", error);
      window.alert("No fue posible guardar los cambios del aprendiz.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openDeleteModal = (aprendiz: Aprendiz) => {
    setAprendizToDelete(aprendiz);
  };

  const resetDeleteModal = () => {
    setAprendizToDelete(null);
  };

  const closeDeleteModal = () => {
    if (isDeletingAprendiz) return;
    resetDeleteModal();
  };

  const handleDeleteAprendiz = async () => {
    if (!aprendizToDelete) return;

    // La eliminacion actualiza el estado local solo si el backend confirma la
    // operacion para mantener sincronizada la tabla visible.
    setIsDeletingAprendiz(true);

    try {
      const endpoint = adminCedula
        ? `${API_URL}/aprendices/${aprendizToDelete.documento}?actorCedula=${encodeURIComponent(adminCedula)}`
        : `${API_URL}/aprendices/${aprendizToDelete.documento}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "No fue posible eliminar el aprendiz.",
        );
      }

      const deletedDocumento = aprendizToDelete.documento;
      const deletedName = `${aprendizToDelete.nombre} ${aprendizToDelete.apellido}`.trim();
      resetDeleteModal();
      setPendingRowRemovalDocumento(deletedDocumento);
      setTimedAlert({
        id: Date.now(),
        title: "Usuario eliminado correctamente",
        description: deletedName
          ? `El usuario ${deletedName} se ha eliminado correctamente.`
          : "El usuario se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error eliminando aprendiz:", error);
      window.alert("No fue posible eliminar el aprendiz.");
    } finally {
      setIsDeletingAprendiz(false);
    }
  };

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return aprendices;

    const searchableFields: Record<
      Exclude<FilterKey, "todos">,
      (item: Aprendiz) => string
    > = {
      documento: (item) => (item.documento || "").toString().toLowerCase(),
      ficha: (item) => (item.ficha || "").toLowerCase(),
      area: (item) => (item.area || item.fichaNombre || "").toLowerCase(),
      programa: (item) => (item.programa || "").toLowerCase(),
      nombre: (item) => (item.nombre || "").toLowerCase(),
      apellido: (item) => (item.apellido || "").toLowerCase(),
      sexo: (item) => (item.sexo || "").toLowerCase(),
      telefono: (item) => (item.telefono || "").toLowerCase(),
      email: (item) => (item.email || "").toLowerCase(),
      fechaRegistro: (item) =>
        formatFechaRegistro(item.fechaInscripcion).toLowerCase(),
      estado: (item) => item.estado.toLowerCase(),
    };

    return aprendices.filter((item) => {
      if (activeFilter === "todos") {
        return Object.values(searchableFields).some((getter) =>
          getter(item).includes(query),
        );
      }

      return searchableFields[activeFilter](item).includes(query);
    });
  }, [aprendices, searchTerm, activeFilter]);

  const startRowRemovalAnimation = (documento: string) => {
    setRowsLeaving((prev) => (prev[documento] ? prev : { ...prev, [documento]: true }));

    if (rowRemovalTimeoutsRef.current[documento]) {
      window.clearTimeout(rowRemovalTimeoutsRef.current[documento]);
    }

    rowRemovalTimeoutsRef.current[documento] = window.setTimeout(() => {
      setAprendices((prev) => prev.filter((item) => item.documento !== documento));
      setRowsLeaving((prev) => {
        if (!prev[documento]) return prev;
        const next = { ...prev };
        delete next[documento];
        return next;
      });
      delete rowRemovalTimeoutsRef.current[documento];
    }, ROW_FADE_DURATION_MS);
  };

  const closeTimedAlert = () => {
    setTimedAlert(null);

    if (pendingRowRemovalDocumento) {
      const documento = pendingRowRemovalDocumento;
      setPendingRowRemovalDocumento(null);
      startRowRemovalAnimation(documento);
    }
  };

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Solo se muestran fichas activas, salvo la ya asignada al aprendiz en
  // edicion para no perder la seleccion actual mientras se actualiza el form.
  const fichasDisponibles = useMemo(() => {
    return fichas.filter(
      (item) =>
        item.estado === "Activa" || item.numero === String(editForm?.ficha || ""),
    );
  }, [editForm?.ficha, fichas]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const displayData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activeFilterOption =
    FILTER_OPTIONS.find((option) => option.key === activeFilter) ||
    FILTER_OPTIONS[0];

  if (loading) {
    return (
      <div className="loading-screen">Cargando lista de aprendices...</div>
    );
  }

  return (
    <div className="dashboard-page">
      <AdminSidebar
        currentPath={location.pathname}
        onNavigate={navigate}
        onSupportClick={() => undefined}
      />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Lista de Aprendices</h1>
          </div>
          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => setShowLogoutModal(true)}
            showProfileItem
          />
        </nav>

        <div className="lista-container">
          <section className="table-card">
            <div className="table-header">
              <div className="table-header-top">
                <div>
                  <h2>Aprendices Registrados</h2>
                  <span className="table-subtitle">
                    Listado oficial de todos los aprendices registrados en el
                    sistema.
                  </span>
                </div>

                <div className="minimal-search">
                  <div className="minimal-search-input-wrapper">
                    <Search size={15} className="minimal-search-icon" />
                    <input
                      type="text"
                      className="minimal-search-input"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={activeFilterOption.placeholder}
                    />
                  </div>

                  <div className="minimal-select-wrapper">
                    <span className="minimal-select-label">
                      {activeFilterOption.label}
                    </span>
                    <select
                      className="minimal-filter-select"
                      value={activeFilter}
                      onChange={(e) => {
                        setActiveFilter(e.target.value as FilterKey);
                        setCurrentPage(1);
                      }}
                      aria-label="Opciones de filtrado"
                    >
                      {FILTER_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="minimal-select-icon" />
                  </div>
                </div>
              </div>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Ficha</th>
                  <th>Programa</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row) => {
                    return (
                      <tr
                        key={row.documento}
                        className={rowsLeaving[row.documento] ? "row-fade-out" : undefined}
                      >
                        <td>{row.documento}</td>
                        <td>{row.ficha}</td>
                        <td>{row.programa || "Sin programa"}</td>
                        <td>{row.nombre}</td>
                        <td>{row.apellido}</td>
                        <td>{row.email}</td>
                        <td>
                          <span
                            className={`status-badge ${row.estado === "Activo" ? "status-active" : "status-inactive"}`}
                          >
                            {row.estado}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action-button action-view"
                              onClick={() => openViewModal(row)}
                              aria-label={`Ver mas de ${row.nombre} ${row.apellido}`}
                              title="Ver mas"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              className="table-action-button action-edit"
                              onClick={() => openEditModal(row)}
                              aria-label={`Editar a ${row.nombre} ${row.apellido}`}
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              className="table-action-button action-delete"
                              onClick={() => openDeleteModal(row)}
                              aria-label={`Eliminar a ${row.nombre} ${row.apellido}`}
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#777",
                      }}
                    >
                      No se encontraron aprendices con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="btn-page"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="pagination-info">
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="btn-page"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />

      {timedAlert ? (
        <AdminTimedAlert
          key={timedAlert.id}
          title={timedAlert.title}
          description={timedAlert.description}
          durationMs={5000}
          zIndex={2600}
          onClose={closeTimedAlert}
        />
      ) : null}

      {viewingAprendiz && (
        <div className="modal-overlay">
          <div className="detail-modal-content">
            <div className="detail-modal-header">
              <div>
                <h2>Informacion completa del aprendiz</h2>
                <p>
                  Consulta los datos registrados para{" "}
                  {viewingAprendiz.nombre || "este aprendiz"}.
                </p>
              </div>
            </div>

            <div className="detail-grid">
              {getAprendizDetailFields(viewingAprendiz).map((field) => (
                <div key={field.label} className="detail-field">
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel-logout" onClick={closeViewModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {aprendizToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container">
              <AlertTriangle size={45} color="white" />
            </div>
            <h2 className="modal-title">Desea eliminar este aprendiz?</h2>
            <p className="modal-subtitle">
              Esta accion eliminara a {aprendizToDelete.nombre}{" "}
              {aprendizToDelete.apellido} del sistema.
            </p>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout btn-delete-confirm"
                onClick={handleDeleteAprendiz}
                disabled={isDeletingAprendiz}
              >
                {isDeletingAprendiz ? "Eliminando..." : "Si, eliminar"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={closeDeleteModal}
                disabled={isDeletingAprendiz}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAprendiz && editForm && (
        <div className="modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <div>
                <h2>Editar aprendiz</h2>
                <p>
                  Actualiza la informacion del aprendiz. El documento y la fecha
                  de registro son solo de consulta.
                </p>
              </div>
            </div>

            <form className="edit-aprendiz-form" onSubmit={handleSaveEdit}>
              <div className="edit-form-grid">
                <label className="edit-form-field">
                  <span>Documento</span>
                  <input type="text" value={editForm.documento} disabled />
                </label>

                <label className="edit-form-field">
                  <span>Fecha de registro</span>
                  <input
                    type="text"
                    value={editForm.fechaInscripcion}
                    disabled
                  />
                </label>

                <label className="edit-form-field">
                  <span>Ficha</span>
                  <select
                    value={editForm.ficha}
                    onChange={(e) => handleEditFichaChange(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una ficha</option>
                    {fichasDisponibles.map((item) => (
                      <option key={item.numero} value={item.numero}>
                        {item.numero}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="edit-form-field">
                  <span>Area</span>
                  <input type="text" value={editForm.area} readOnly />
                </label>

                <label className="edit-form-field">
                  <span>Programa</span>
                  <input type="text" value={editForm.programa} readOnly />
                </label>

                <label className="edit-form-field">
                  <span>Estado</span>
                  <select
                    value={editForm.estado}
                    onChange={(e) =>
                      handleEditFieldChange(
                        "estado",
                        e.target.value as EstadoAprendiz,
                      )
                    }
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </label>

                <label className="edit-form-field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) =>
                      handleEditFieldChange("nombre", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="edit-form-field">
                  <span>Apellido</span>
                  <input
                    type="text"
                    value={editForm.apellido}
                    onChange={(e) =>
                      handleEditFieldChange("apellido", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="edit-form-field">
                  <span>Sexo</span>
                  <select
                    value={editForm.sexo}
                    onChange={(e) =>
                      handleEditFieldChange("sexo", e.target.value)
                    }
                  >
                    <option value="">Sin especificar</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </label>

                <label className="edit-form-field">
                  <span>Telefono</span>
                  <input
                    type="text"
                    value={editForm.telefono}
                    onChange={(e) =>
                      handleEditFieldChange("telefono", e.target.value)
                    }
                  />
                </label>

                <label className="edit-form-field full-width">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      handleEditFieldChange("email", e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <p className="edit-form-note">
                El area y el programa se actualizan automaticamente segun la
                ficha seleccionada.
              </p>

              <div className="modal-buttons">
                <button
                  type="submit"
                  className="btn-confirm-logout btn-save-aprendiz"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn-cancel-logout"
                  onClick={closeEditModal}
                  disabled={isSavingEdit}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAprendicesAdmin;
