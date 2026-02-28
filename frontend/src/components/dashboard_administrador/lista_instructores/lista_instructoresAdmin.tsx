import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../../assets/sena.png";
import "./ListaInstructores.css";
import { API_URL } from "../../../config/api";
import { ADMIN_MENU_ITEMS } from "../adminMenuItems";

interface Instructor {
  documento: string;
  ficha: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
}

const ITEMS_PER_PAGE = 10;
const INACTIVE_DOCUMENT = "1047043541";

type EstadoInstructor = "Activo" | "Inactivo";

type FilterKey =
  | "todos"
  | "documento"
  | "ficha"
  | "nombre"
  | "apellido"
  | "telefono"
  | "email"
  | "fechaRegistro"
  | "estado";

const getDefaultEstado = (documento: string): EstadoInstructor =>
  documento === INACTIVE_DOCUMENT ? "Inactivo" : "Activo";

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

const FILTER_OPTIONS: { key: FilterKey; label: string; placeholder: string }[] = [
  {
    key: "todos",
    label: "Todos los campos",
    placeholder:
      "Buscar en documento, ficha, nombre, apellido, telefono, email o estado",
  },
  {
    key: "documento",
    label: "Documento",
    placeholder: "Buscar por documento",
  },
  { key: "ficha", label: "Ficha", placeholder: "Buscar por ficha" },
  { key: "nombre", label: "Nombre", placeholder: "Buscar por nombre" },
  { key: "apellido", label: "Apellido", placeholder: "Buscar por apellido" },
  { key: "telefono", label: "Telefono", placeholder: "Buscar por telefono" },
  { key: "email", label: "Email", placeholder: "Buscar por email" },
  {
    key: "fechaRegistro",
    label: "Fecha de registro",
    placeholder: "Buscar por fecha de registro",
  },
  { key: "estado", label: "Estado", placeholder: "Buscar Activo/Inactivo" },
];

const ListaInstructoresAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [estadoPorDocumento, setEstadoPorDocumento] = useState<
    Record<string, EstadoInstructor>
  >({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminName, setAdminName] = useState("Admin");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

    fetch(`${API_URL}/instructores?cedula=${cedula}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setInstructores(validData);
        setEstadoPorDocumento(
          validData.reduce<Record<string, EstadoInstructor>>((acc, item) => {
            acc[item.documento] = getDefaultEstado(item.documento);
            return acc;
          }, {}),
        );
      })
      .catch((err) => console.error("Error instructores:", err))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/dashboard?cedula=${cedula}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.instructor) {
          setAdminName(data.instructor);
        } else {
          setAdminName("Administrador SENA");
        }
      })
      .catch((err) => {
        console.error("Error perfil:", err);
        setAdminName("Administrador SENA");
      });
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

  const handleToggleEstado = (documento: string) => {
    const shouldUpdate = window.confirm(
      "¿Está seguro de que desea cambiar el estado de este instructor?",
    );
    if (!shouldUpdate) return;

    setEstadoPorDocumento((previousState) => {
      const currentState = previousState[documento] || getDefaultEstado(documento);
      const nextState: EstadoInstructor =
        currentState === "Activo" ? "Inactivo" : "Activo";

      return {
        ...previousState,
        [documento]: nextState,
      };
    });
  };

  const filteredData = useMemo(() => {
    const searchableFields: Record<
      Exclude<FilterKey, "todos">,
      (item: Instructor) => string
    > = {
      documento: (item) => (item.documento || "").toString().toLowerCase(),
      ficha: (item) => (item.ficha || "").toLowerCase(),
      nombre: (item) => (item.nombre || "").toLowerCase(),
      apellido: (item) => (item.apellido || "").toLowerCase(),
      telefono: (item) => (item.telefono || "").toLowerCase(),
      email: (item) => (item.email || "").toLowerCase(),
      fechaRegistro: (item) =>
        formatFechaRegistro(item.fechaInscripcion).toLowerCase(),
      estado: (item) =>
        (estadoPorDocumento[item.documento] || getDefaultEstado(item.documento))
          .toLowerCase(),
    };

    const query = searchTerm.trim().toLowerCase();
    if (!query) return instructores;

    return instructores.filter((item) => {
      if (activeFilter === "todos") {
        return Object.values(searchableFields).some((getter) =>
          getter(item).includes(query),
        );
      }

      return searchableFields[activeFilter](item).includes(query);
    });
  }, [instructores, searchTerm, activeFilter, estadoPorDocumento]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const displayData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activeFilterOption =
    FILTER_OPTIONS.find((option) => option.key === activeFilter) ||
    FILTER_OPTIONS[0];

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
                  <th>Ficha</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Telefono</th>
                  <th>Email</th>
                  <th>Fecha de registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row, index) => {
                    const estadoActual =
                      estadoPorDocumento[row.documento] ||
                      getDefaultEstado(row.documento);

                    return (
                      <tr key={index}>
                        <td>{row.documento}</td>
                        <td>{row.ficha}</td>
                        <td>{row.nombre}</td>
                        <td>{row.apellido}</td>
                        <td>{row.telefono}</td>
                        <td>{row.email}</td>
                        <td>{formatFechaRegistro(row.fechaInscripcion)}</td>
                        <td>
                          <button
                            type="button"
                            className={`status-badge ${estadoActual === "Activo" ? "status-active" : "status-inactive"}`}
                            onClick={() => handleToggleEstado(row.documento)}
                          >
                            {estadoActual}
                          </button>
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
    </div>
  );
};

export default ListaInstructoresAdmin;
