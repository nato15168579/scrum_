import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../../assets/sena.png";
import "./ListaInstructores.css";
import { API_URL } from "../../../config/Api";
import { ADMIN_MENU_ITEMS } from "../AdminMenuItems";
import { resolveUserName } from "../../../utils/session";

interface FichaDetalle {
  ficha: string;
  nombre: string;
  programa: string;
  estado?: string | null;
  fechaCreacion?: string | null;
}

interface Instructor {
  documento: string;
  tipoDocumento: string;
  especializacion: string;
  fichasCargo?: string[] | null;
  fichasDetalle?: FichaDetalle[] | null;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
}

interface FichaDisponible {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
  fechaCreacion?: string | null;
}

interface FichasModalData {
  instructorNombre: string;
  fichas: FichaDetalle[];
}

interface EditInstructorForm {
  documento: string;
  tipoDocumento: string;
  nombre: string;
  apellido: string;
  especializacion: string;
  sexo: string;
  email: string;
  telefono: string;
  fechaInscripcion: string;
  fichasSeleccionadas: string[];
}

type FilterKey =
  | "todos"
  | "documento"
  | "especializacion"
  | "nombre"
  | "apellido"
  | "telefono"
  | "email"
  | "fechaRegistro"
  | "fichasCargo";

const ITEMS_PER_PAGE = 10;

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

const normalizeText = (value: unknown) => String(value ?? "").trim();

const normalizeFichasCargo = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => normalizeText(item))
          .filter(Boolean),
      ),
    );
  }

  const raw = normalizeText(value);
  if (!raw) return [];

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
};

const normalizeFichasDetalle = (value: unknown): FichaDetalle[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      ficha: normalizeText((item as FichaDetalle)?.ficha),
      nombre: normalizeText((item as FichaDetalle)?.nombre) || "Sin nombre",
      programa:
        normalizeText((item as FichaDetalle)?.programa) || "Sin programa",
      estado: normalizeText((item as FichaDetalle)?.estado) || null,
      fechaCreacion: (item as FichaDetalle)?.fechaCreacion || null,
    }))
    .filter((item) => item.ficha);
};

const buildFichaSearchValue = (item: Instructor) => {
  const fichas = normalizeFichasDetalle(item.fichasDetalle);
  if (fichas.length > 0) {
    return fichas
      .map((ficha) =>
        `${ficha.ficha} ${ficha.nombre} ${ficha.programa}`.toLowerCase(),
      )
      .join(" ");
  }

  return normalizeFichasCargo(item.fichasCargo).join(" ").toLowerCase();
};

const getInstructorFichas = (item: Instructor) => {
  const fichasDetalle = normalizeFichasDetalle(item.fichasDetalle);

  if (fichasDetalle.length > 0) {
    return fichasDetalle;
  }

  return normalizeFichasCargo(item.fichasCargo).map((ficha) => ({
    ficha,
    nombre: "Sin nombre",
    programa: "Sin programa",
    estado: null,
    fechaCreacion: null,
  }));
};

const getInstructorDetailFields = (instructor: Instructor) => [
  { label: "Documento", value: instructor.documento || "Sin documento" },
  {
    label: "Tipo de documento",
    value: instructor.tipoDocumento || "Sin tipo de documento",
  },
  { label: "Nombre", value: instructor.nombre || "Sin nombre" },
  { label: "Apellido", value: instructor.apellido || "Sin apellido" },
  {
    label: "Especializacion",
    value: instructor.especializacion || "Sin especializacion",
  },
  { label: "Sexo", value: instructor.sexo || "Sin sexo" },
  { label: "Email", value: instructor.email || "Sin email" },
  { label: "Telefono", value: instructor.telefono || "Sin telefono" },
  {
    label: "Fecha de registro",
    value: formatFechaRegistro(instructor.fechaInscripcion),
  },
];

const getInstructorDeleteFields = (instructor: Instructor) => [
  { label: "Documento", value: instructor.documento || "Sin documento" },
  {
    label: "Tipo de documento",
    value: instructor.tipoDocumento || "Sin tipo de documento",
  },
  { label: "Nombre", value: instructor.nombre || "Sin nombre" },
  { label: "Apellido", value: instructor.apellido || "Sin apellido" },
  {
    label: "Especializacion",
    value: instructor.especializacion || "Sin especializacion",
  },
  { label: "Email", value: instructor.email || "Sin email" },
];

const FILTER_OPTIONS: { key: FilterKey; label: string; placeholder: string }[] = [
  {
    key: "todos",
    label: "Todos los campos",
    placeholder: "Buscar",
  },
  {
    key: "documento",
    label: "Documento",
    placeholder: "Buscar por documento",
  },
  {
    key: "especializacion",
    label: "Especializacion",
    placeholder: "Buscar por especializacion",
  },
  { key: "nombre", label: "Nombre", placeholder: "Buscar por nombre" },
  { key: "apellido", label: "Apellido", placeholder: "Buscar por apellido" },
  { key: "telefono", label: "Telefono", placeholder: "Buscar por telefono" },
  { key: "email", label: "Email", placeholder: "Buscar por email" },
  {
    key: "fechaRegistro",
    label: "Fecha de registro",
    placeholder: "Buscar por fecha de registro",
  },
  {
    key: "fichasCargo",
    label: "Fichas a cargo",
    placeholder: "Buscar por fichas a cargo",
  },
];

const ListaInstructoresAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [fichasDisponibles, setFichasDisponibles] = useState<FichaDisponible[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fichasModalData, setFichasModalData] =
    useState<FichasModalData | null>(null);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(
    null,
  );
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );
  const [instructorToDelete, setInstructorToDelete] =
    useState<Instructor | null>(null);
  const [editForm, setEditForm] = useState<EditInstructorForm | null>(null);
  const [editFichaSearchTerm, setEditFichaSearchTerm] = useState("");
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);
  const [isDeletingInstructor, setIsDeletingInstructor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    const roleId = (localStorage.getItem("userRoleId") || "").trim();

    if (!cedula) {
      navigate("/");
      return;
    }

    if (roleId === "2") {
      navigate("/dashboard-instructor");
      return;
    }

    if (roleId && roleId !== "3") {
      navigate("/student-dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const [instructoresRes, dashboardRes, fichasRes] = await Promise.all([
          fetch(`${API_URL}/instructores?cedula=${cedula}`),
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
          fetch(`${API_URL}/fichas`),
        ]);

        const instructoresData = instructoresRes.ok
          ? await instructoresRes.json()
          : [];
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
        const fichasData = fichasRes.ok ? await fichasRes.json() : [];

        const validData = (Array.isArray(instructoresData)
          ? instructoresData
        : []
        ).map((item) => ({
          documento: normalizeText(item?.documento),
          tipoDocumento: normalizeText(item?.tipoDocumento) || "CC",
          especializacion:
            normalizeText(item?.especializacion) || "Sin especializacion",
          fichasCargo: normalizeFichasCargo(item?.fichasCargo ?? item?.ficha),
          fichasDetalle: normalizeFichasDetalle(item?.fichasDetalle),
          nombre: normalizeText(item?.nombre),
          apellido: normalizeText(item?.apellido),
          sexo: normalizeText(item?.sexo),
          telefono: normalizeText(item?.telefono),
          email: normalizeText(item?.email),
          fechaInscripcion: item?.fechaInscripcion || null,
        }));
        const validFichas = (Array.isArray(fichasData) ? fichasData : []).map(
          (item) => ({
            numero: normalizeText(item?.numero),
            nombre: normalizeText(item?.nombre) || "Sin nombre",
            programa: normalizeText(item?.programa) || "Sin programa",
            estado: normalizeText(item?.estado) || "Sin estado",
            fechaCreacion: item?.fechaCreacion || null,
          }),
        );

        setInstructores(validData);
        setFichasDisponibles(validFichas);
        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
      } catch (err) {
        console.error("Error cargando lista de instructores:", err);
        setAdminName(resolveUserName(undefined, "Usuario"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return instructores;

    const searchableFields: Record<
      Exclude<FilterKey, "todos">,
      (item: Instructor) => string
    > = {
      documento: (item) => item.documento.toLowerCase(),
      especializacion: (item) => item.especializacion.toLowerCase(),
      nombre: (item) => item.nombre.toLowerCase(),
      apellido: (item) => item.apellido.toLowerCase(),
      telefono: (item) => item.telefono.toLowerCase(),
      email: (item) => item.email.toLowerCase(),
      fechaRegistro: (item) =>
        formatFechaRegistro(item.fechaInscripcion).toLowerCase(),
      fichasCargo: (item) => buildFichaSearchValue(item),
    };

    return instructores.filter((item) => {
      if (activeFilter === "todos") {
        return Object.values(searchableFields).some((getter) =>
          getter(item).includes(query),
        );
      }

      return searchableFields[activeFilter](item).includes(query);
    });
  }, [instructores, searchTerm, activeFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const displayData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const activeFilterOption =
    FILTER_OPTIONS.find((option) => option.key === activeFilter) ||
    FILTER_OPTIONS[0];

  const closeViewModal = () => setViewingInstructor(null);

  const openFichasModal = (instructor: Instructor) => {
    const fichas = getInstructorFichas(instructor);
    const instructorNombre = `${instructor.nombre} ${instructor.apellido}`.trim();

    setFichasModalData({
      instructorNombre: instructorNombre || `Instructor ${instructor.documento}`,
      fichas,
    });
  };

  const openEditModal = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setEditFichaSearchTerm("");
    setEditForm({
      documento: instructor.documento,
      tipoDocumento: instructor.tipoDocumento || "CC",
      nombre: instructor.nombre || "",
      apellido: instructor.apellido || "",
      especializacion: instructor.especializacion || "",
      sexo: instructor.sexo || "",
      email: instructor.email || "",
      telefono: instructor.telefono || "",
      fechaInscripcion: formatFechaRegistro(instructor.fechaInscripcion),
      fichasSeleccionadas: getInstructorFichas(instructor).map(
        (item) => item.ficha,
      ),
    });
  };

  const closeEditModal = () => {
    setEditingInstructor(null);
    setEditForm(null);
    setEditFichaSearchTerm("");
  };

  const openDeleteModal = (instructor: Instructor) => {
    setInstructorToDelete(instructor);
  };

  const closeDeleteModal = () => setInstructorToDelete(null);

  const handleEditFieldChange = (
    field: keyof EditInstructorForm,
    value: string,
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleFichaSelectionChange = (fichaNumero: string, checked: boolean) => {
    setEditForm((prev) => {
      if (!prev) return prev;

      const nextFichas = checked
        ? Array.from(new Set([...prev.fichasSeleccionadas, fichaNumero]))
        : prev.fichasSeleccionadas.filter((item) => item !== fichaNumero);

      return {
        ...prev,
        fichasSeleccionadas: nextFichas,
      };
    });
  };

  const filteredFichasDisponibles = useMemo(() => {
    const query = editFichaSearchTerm.trim().toLowerCase();

    if (!query) {
      return fichasDisponibles;
    }

    return fichasDisponibles.filter((ficha) =>
      [ficha.numero, ficha.nombre, ficha.programa]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [editFichaSearchTerm, fichasDisponibles]);

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingInstructor || !editForm) {
      return;
    }

    setIsSavingInstructor(true);

    try {
      const response = await fetch(
        `${API_URL}/instructores/${editingInstructor.documento}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: editForm.nombre,
            apellidos: editForm.apellido,
            correo: editForm.email,
            telefono: editForm.telefono,
            sexo: editForm.sexo,
            especializacion: editForm.especializacion,
            fichas: editForm.fichasSeleccionadas,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "No se pudo actualizar la informacion del instructor.",
        );
      }

      setInstructores((prev) =>
        prev.map((item) =>
          item.documento === editingInstructor.documento
            ? {
                ...item,
                nombre: normalizeText(data?.instructor?.nombre) || editForm.nombre,
                apellido:
                  normalizeText(data?.instructor?.apellido) || editForm.apellido,
                especializacion:
                  normalizeText(data?.instructor?.especializacion) ||
                  editForm.especializacion,
                sexo: normalizeText(data?.instructor?.sexo) || editForm.sexo,
                telefono:
                  normalizeText(data?.instructor?.telefono) || editForm.telefono,
                email: normalizeText(data?.instructor?.email) || editForm.email,
                tipoDocumento:
                  normalizeText(data?.instructor?.tipoDocumento) ||
                  item.tipoDocumento,
                fechaInscripcion:
                  data?.instructor?.fechaInscripcion || item.fechaInscripcion,
                fichasCargo: normalizeFichasCargo(data?.instructor?.fichasCargo),
                fichasDetalle: normalizeFichasDetalle(
                  data?.instructor?.fichasDetalle,
                ),
              }
            : item,
        ),
      );

      closeEditModal();
      window.alert(data?.mensaje || "Instructor actualizado correctamente.");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el instructor.",
      );
    } finally {
      setIsSavingInstructor(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!instructorToDelete) {
      return;
    }

    setIsDeletingInstructor(true);

    try {
      const response = await fetch(
        `${API_URL}/instructores/${instructorToDelete.documento}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo eliminar el instructor.");
      }

      setInstructores((prev) =>
        prev.filter((item) => item.documento !== instructorToDelete.documento),
      );
      closeDeleteModal();
      window.alert(data?.mensaje || "Instructor eliminado correctamente.");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el instructor.",
      );
    } finally {
      setIsDeletingInstructor(false);
    }
  };

  const viewingInstructorFichas = viewingInstructor
    ? getInstructorFichas(viewingInstructor)
    : [];
  const deleteInstructorFichas = instructorToDelete
    ? getInstructorFichas(instructorToDelete)
    : [];

  if (loading) {
    return <div className="loading-screen">Cargando lista de instructores...</div>;
  }

  return (
    <div className="dashboard-page">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo" className="logo-lg" />
          <h2>Gestion de proyectos</h2>
        </div>
        <nav className="menu">
          <p className="menu-title">MENU</p>
          <ul>
            {ADMIN_MENU_ITEMS.map((item) => (
              <li
                key={item.name}
                className={location.pathname === item.path ? "active" : ""}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={18} style={{ marginRight: "10px" }} />{" "}
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
        <div
          className="settings-footer"
          style={{ marginTop: "auto", padding: "10px 0" }}
        >
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
              color: "#555",
            }}
            onClick={() => navigate("/ayuda")}
          >
            <HelpCircle
              size={18}
              style={{ marginRight: "10px", color: "#39A900" }}
            />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Lista de Instructores</h1>
          </div>

          <div
            className="profile-menu"
            ref={menuRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{adminName}</span>
            <ChevronDown size={18} />

            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li>
                  <User size={16} style={{ marginRight: "8px" }} /> Mi Perfil
                </li>
                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar
                  Sesion
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="lista-container">
          <section className="table-card">
            <div className="table-header">
              <div className="table-header-top">
                <div>
                  <h2>Instructores Registrados</h2>
                  <span className="table-subtitle">
                    Listado oficial de instructores registrados en el sistema.
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
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Especializacion</th>
                  <th>Email</th>
                  <th>Fichas a cargo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row) => {
                    const fichas = getInstructorFichas(row);
                    const totalFichas = fichas.length;

                    return (
                      <tr key={row.documento}>
                        <td>{row.documento}</td>
                        <td>{row.nombre || "Sin nombre"}</td>
                        <td>{row.apellido || "Sin apellido"}</td>
                        <td>{row.especializacion || "Sin especializacion"}</td>
                        <td>{row.email || "Sin email"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-fichas-modal"
                            onClick={() => openFichasModal(row)}
                            disabled={totalFichas === 0}
                          >
                            {totalFichas > 0
                              ? `Fichas a Cargo (${totalFichas})`
                              : "Sin Fichas a Cargo"}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action-button action-view"
                              onClick={() => setViewingInstructor(row)}
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
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#777",
                      }}
                    >
                      No se encontraron instructores con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="btn-page"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="pagination-info">
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="btn-page"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container">
              <AlertTriangle size={45} color="white" />
            </div>
            <h2 className="modal-title">Estas seguro?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Si, Cerrar
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {fichasModalData && (
        <div
          className="fichas-modal-overlay"
          onClick={() => setFichasModalData(null)}
        >
          <div
            className="fichas-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fichas-modal-header">
              <h3>Fichas a Cargo</h3>
              <button
                type="button"
                className="fichas-modal-close"
                onClick={() => setFichasModalData(null)}
              >
                x
              </button>
            </div>

            <p className="fichas-modal-subtitle">
              {fichasModalData.instructorNombre}
            </p>

            {fichasModalData.fichas.length > 0 ? (
              <div className="fichas-modal-table-wrapper">
                <table className="fichas-modal-table">
                  <thead>
                    <tr>
                      <th>Ficha</th>
                      <th>Area</th>
                      <th>Programa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichasModalData.fichas.map((item) => (
                      <tr key={`${item.ficha}-${item.programa}`}>
                        <td>{item.ficha}</td>
                        <td>{item.nombre}</td>
                        <td>{item.programa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="fichas-modal-empty">
                Este instructor no tiene Fichas a Cargo.
              </p>
            )}
          </div>
        </div>
      )}

      {viewingInstructor && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div
            className="detail-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div>
                <h2>Informacion completa del instructor</h2>
                <p>
                  Consulta los datos registrados para{" "}
                  {viewingInstructor.nombre || "este instructor"}.
                </p>
              </div>
            </div>

            <div className="instructor-modal-layout">
              <div className="instructor-modal-panel instructor-modal-panel-info">
                <div className="detail-grid">
                  {getInstructorDetailFields(viewingInstructor).map((field) => (
                    <div key={field.label} className="detail-field">
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="instructor-modal-panel instructor-modal-panel-fichas">
                <div className="detail-fichas-section">
                  <div className="detail-fichas-header">
                    <h3>Fichas a Cargo</h3>
                    <span>{viewingInstructorFichas.length}</span>
                  </div>

                  {viewingInstructorFichas.length > 0 ? (
                    <div className="fichas-modal-table-wrapper detail-fichas-table">
                      <table className="fichas-modal-table">
                        <thead>
                          <tr>
                            <th>Ficha</th>
                            <th>Area</th>
                            <th>Programa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingInstructorFichas.map((item) => (
                            <tr key={`${item.ficha}-${item.programa}`}>
                              <td>{item.ficha}</td>
                              <td>{item.nombre}</td>
                              <td>{item.programa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="fichas-modal-empty">
                      Este instructor no tiene Fichas a Cargo.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel-logout" onClick={closeViewModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingInstructor && editForm && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="edit-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div>
                <h2>Editar instructor</h2>
                <p>
                  Actualiza la informacion del instructor. El documento, el tipo
                  de documento y la fecha de registro son solo de consulta.
                </p>
              </div>
            </div>

            <form className="edit-aprendiz-form" onSubmit={handleSaveEdit}>
              <div className="instructor-modal-layout">
                <div className="instructor-modal-panel instructor-modal-panel-info">
                  <div className="edit-form-grid">
                    <label className="edit-form-field">
                      <span>Documento</span>
                      <input type="text" value={editForm.documento} disabled />
                    </label>

                    <label className="edit-form-field">
                      <span>Tipo de documento</span>
                      <input type="text" value={editForm.tipoDocumento} disabled />
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
                      <span>Especializacion</span>
                      <input
                        type="text"
                        value={editForm.especializacion}
                        onChange={(e) =>
                          handleEditFieldChange("especializacion", e.target.value)
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
                        <option value="">Seleccione una opcion</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    </label>

                    <label className="edit-form-field">
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

                    <label className="edit-form-field edit-form-field-full">
                      <span>Fecha de registro</span>
                      <input
                        type="text"
                        value={editForm.fechaInscripcion}
                        disabled
                      />
                    </label>
                  </div>
                </div>

                <div className="instructor-modal-panel instructor-modal-panel-fichas">
                  <div className="detail-fichas-header">
                    <h3>Fichas a Cargo</h3>
                    <span>{editForm.fichasSeleccionadas.length}</span>
                  </div>

                  <div className="edit-fichas-search">
                    <Search size={16} className="edit-fichas-search-icon" />
                    <input
                      type="text"
                      value={editFichaSearchTerm}
                      onChange={(e) => setEditFichaSearchTerm(e.target.value)}
                      placeholder="Buscar por ficha, area o programa"
                    />
                  </div>

                  <div className="edit-fichas-selector">
                    {filteredFichasDisponibles.length > 0 ? (
                      filteredFichasDisponibles.map((ficha) => {
                        const isSelected =
                          editForm.fichasSeleccionadas.includes(ficha.numero);

                        return (
                          <label
                            key={ficha.numero}
                            className={`edit-ficha-option ${isSelected ? "selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleFichaSelectionChange(
                                  ficha.numero,
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="edit-ficha-option-content">
                              <strong>Ficha {ficha.numero}</strong>
                              <span>{ficha.nombre}</span>
                              <small>
                                {ficha.programa}
                                {ficha.estado ? ` | ${ficha.estado}` : ""}
                              </small>
                            </div>
                          </label>
                        );
                      })
                    ) : fichasDisponibles.length > 0 ? (
                      <p className="empty-chip-text">
                        No hay fichas que coincidan con la busqueda.
                      </p>
                    ) : (
                      <p className="empty-chip-text">
                        No hay fichas disponibles para asignar.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel-logout"
                  onClick={closeEditModal}
                  disabled={isSavingInstructor}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-confirm-logout"
                  disabled={isSavingInstructor}
                >
                  {isSavingInstructor ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {instructorToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-content delete-instructor-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="instructor-modal-layout">
              <div className="instructor-modal-panel instructor-modal-panel-info">
                <div className="warning-icon-container delete-warning-icon">
                  <AlertTriangle size={45} color="white" />
                </div>
                <h2 className="modal-title">Desea eliminar este instructor?</h2>
                <p className="modal-subtitle">
                  Esta accion eliminara a {instructorToDelete.nombre}{" "}
                  {instructorToDelete.apellido} del sistema.
                </p>

                <div className="delete-summary-grid">
                  {getInstructorDeleteFields(instructorToDelete).map((field) => (
                    <div key={field.label} className="detail-field">
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="instructor-modal-panel instructor-modal-panel-fichas">
                <div className="detail-fichas-header">
                  <h3>Fichas a Cargo</h3>
                  <span>{deleteInstructorFichas.length}</span>
                </div>

                {deleteInstructorFichas.length > 0 ? (
                  <div className="fichas-modal-table-wrapper detail-fichas-table">
                    <table className="fichas-modal-table">
                      <thead>
                        <tr>
                          <th>Ficha</th>
                          <th>Area</th>
                          <th>Programa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deleteInstructorFichas.map((item) => (
                          <tr key={`${item.ficha}-${item.programa}`}>
                            <td>{item.ficha}</td>
                            <td>{item.nombre}</td>
                            <td>{item.programa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="fichas-modal-empty">
                    Este instructor no tiene Fichas a Cargo.
                  </p>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-confirm-logout btn-delete-confirm"
                onClick={handleDeleteInstructor}
                disabled={isDeletingInstructor}
              >
                {isDeletingInstructor ? "Eliminando..." : "Si, eliminar"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={closeDeleteModal}
                disabled={isDeletingInstructor}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaInstructoresAdmin;
