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
import { API_URL } from "../../../config/Api";
import { ADMIN_MENU_ITEMS } from "../AdminMenuItems";

interface Instructor {
  documento: string;
  especializacion: string;
  fichasCargo?: string[] | string | null;
  programa?: string | null;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
}

interface FichasModalData {
  instructorNombre: string;
  fichas: Array<{
    ficha: string;
    programa: string;
  }>;
}

type FilterKey =
  | "todos"
  | "documento"
  | "especializacion"
  | "nombre"
  | "apellido"
  | "email"
  | "fechaRegistro";

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

const normalizeFichasCargo = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => String(item ?? "").trim())
          .filter(Boolean),
      ),
    );
  }

  const raw = String(value ?? "").trim();
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

const FILTER_OPTIONS: { key: FilterKey; label: string; placeholder: string }[] = [
  {
    key: "todos",
    label: "Todos los campos",
    placeholder:
      "Buscar en documento, especializacion, nombre, apellido, telefono, email o fichas",
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminName, setAdminName] = useState("Admin");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fichasModalData, setFichasModalData] =
    useState<FichasModalData | null>(null);
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
        const [instructoresRes, dashboardRes] = await Promise.all([
          fetch(`${API_URL}/instructores?cedula=${cedula}`),
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
        ]);

        const instructoresData = instructoresRes.ok
          ? await instructoresRes.json()
          : [];
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;

        const validData = (Array.isArray(instructoresData)
          ? instructoresData
          : []
        ).map((item) => ({
          documento: String(item?.documento || ""),
          especializacion: String(item?.especializacion || "Sin especializacion"),
          fichasCargo: normalizeFichasCargo(item?.fichasCargo ?? item?.ficha),
          programa: String(item?.programa || "Sin programa"),
          nombre: String(item?.nombre || ""),
          apellido: String(item?.apellido || ""),
          telefono: String(item?.telefono || ""),
          email: String(item?.email || ""),
          fechaInscripcion: item?.fechaInscripcion || null,
        }));

        setInstructores(validData);

        if (dashboardData && dashboardData.instructor) {
          setAdminName(dashboardData.instructor);
        } else {
          setAdminName("Administrador SENA");
        }
      } catch (err) {
        console.error("Error cargando lista de instructores:", err);
        setAdminName("Administrador SENA");
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
      fechaRegistro: (item) => formatFechaRegistro(item.fechaInscripcion).toLowerCase(),
      fichasCargo: (item) => normalizeFichasCargo(item.fichasCargo).join(" ").toLowerCase(),
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

  const handleOpenFichasModal = (instructor: Instructor) => {
    const fichas = normalizeFichasCargo(instructor.fichasCargo);
    const instructorNombre = `${instructor.nombre} ${instructor.apellido}`.trim();
    const programa = String(instructor.programa || "Sin programa");

    setFichasModalData({
      instructorNombre: instructorNombre || `Instructor ${instructor.documento}`,
      fichas: fichas.map((ficha) => ({
        ficha,
        programa,
      })),
    });
  };

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
                  <th>Especializacion</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Telefono</th>
                  <th>Email</th>
                  <th>Fecha de registro</th>
                  <th>Fichas a cargo</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row, index) => {
                    const fichas = normalizeFichasCargo(row.fichasCargo);

                    return (
                      <tr key={`${row.documento}-${index}`}>
                        <td>{row.documento}</td>
                        <td>{row.especializacion || "Sin especializacion"}</td>
                        <td>{row.nombre || "Sin nombre"}</td>
                        <td>{row.apellido || "Sin apellido"}</td>
                        <td>{row.telefono || "Sin telefono"}</td>
                        <td>{row.email || "Sin email"}</td>
                        <td>{formatFechaRegistro(row.fechaInscripcion)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-fichas-modal"
                            onClick={() => handleOpenFichasModal(row)}
                            disabled={fichas.length === 0}
                          >
                            {fichas.length > 0
                              ? `Ver fichas (${fichas.length})`
                              : "Sin fichas asignadas"}
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

      {fichasModalData && (
        <div
          className="fichas-modal-overlay"
          onClick={() => setFichasModalData(null)}
        >
          <div
            className="fichas-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fichas-modal-header">
              <h3>Fichas a cargo</h3>
              <button
                type="button"
                className="fichas-modal-close"
                onClick={() => setFichasModalData(null)}
              >
                x
              </button>
            </div>

            <p className="fichas-modal-subtitle">{fichasModalData.instructorNombre}</p>

            {fichasModalData.fichas.length > 0 ? (
              <div className="fichas-modal-table-wrapper">
                <table className="fichas-modal-table">
                  <thead>
                    <tr>
                      <th>Ficha</th>
                      <th>Programa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichasModalData.fichas.map((item) => (
                      <tr key={`${item.ficha}-${item.programa}`}>
                        <td>{item.ficha}</td>
                        <td>{item.programa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="fichas-modal-empty">Este instructor no tiene fichas asignadas.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaInstructoresAdmin;
