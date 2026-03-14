import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  Users,
  Plus,
  MapPin,
  Eye,
  List,
  Search,
  Filter,
  User,
  ChevronDown,
  LogOut,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "../dashboard_instructor/Dashboard.css";
import "./ListaAprendices.css";
import { API_URL } from "../../config/Api";
import { resolveUserName } from "../../session/session";

interface Aprendiz {
  documento: string;
  ficha: string;
  fichaNombre?: string;
  programa: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
}

type EstadoAprendiz = "Activo" | "Inactivo";

const ITEMS_PER_PAGE = 10;
const INACTIVE_DOCUMENT = "1047043541";

const getDefaultEstado = (documento: string): EstadoAprendiz =>
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

const ListaAprendices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [estadoPorDocumento, setEstadoPorDocumento] = useState<
    Record<string, EstadoAprendiz>
  >({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [instructorName, setInstructorName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    documento: "",
    ficha: "",
    programa: "",
    nombre: "",
    apellido: "",
  });

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard" },
    { name: "Lista de Aprendices", icon: Users, path: "/lista-aprendices" },
    { name: "Crear Proyecto", icon: Plus, path: "/crear-proyecto" },
    { name: "Asignar Proyectos", icon: MapPin, path: "/asignar-proyectos" },
    { name: "Ver Proyectos", icon: Eye, path: "/ver-proyectos" },
    { name: "Registrar Aprendiz", icon: List, path: "/registrar-aprendiz" },
  ];

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

    if (roleId === "3") {
      navigate("/dashboard-administrador");
      return;
    }

    if (roleId && roleId !== "2") {
      navigate("/student-dashboard");
      return;
    }

    fetch(`${API_URL}/aprendices?cedula=${cedula}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setAprendices(validData);
        setEstadoPorDocumento(
          validData.reduce<Record<string, EstadoAprendiz>>((acc, item) => {
            acc[item.documento] = getDefaultEstado(item.documento);
            return acc;
          }, {}),
        );
      })
      .catch((err) => console.error("Error aprendices:", err))
      .finally(() => setLoading(false));

    fetch(`${API_URL}/dashboard?cedula=${cedula}`)
      .then((res) => res.json())
      .then((data) => {
        setInstructorName(resolveUserName(data?.instructor, "Usuario"));
      })
      .catch((err) => {
        console.error("Error perfil:", err);
        setInstructorName(resolveUserName(undefined, "Usuario"));
      });
  }, [navigate]);

  const filteredData = useMemo(() => {
    return aprendices.filter((item) => {
      return (
        (item.documento || "")
          .toString()
          .toLowerCase()
          .includes(filters.documento.toLowerCase()) &&
        `${item.ficha || ""} ${item.fichaNombre || ""}`
          .toLowerCase()
          .includes(filters.ficha.toLowerCase()) &&
        (item.programa || "")
          .toLowerCase()
          .includes(filters.programa.toLowerCase()) &&
        (item.nombre || "").toLowerCase().includes(filters.nombre.toLowerCase()) &&
        (item.apellido || "")
          .toLowerCase()
          .includes(filters.apellido.toLowerCase())
      );
    });
  }, [filters, aprendices]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const handleToggleEstado = (documento: string) => {
    const shouldUpdate = window.confirm(
      "¿Está seguro de que desea cambiar el estado de este estudiante?",
    );
    if (!shouldUpdate) return;

    setEstadoPorDocumento((previousState) => {
      const currentState = previousState[documento] || getDefaultEstado(documento);
      const nextState: EstadoAprendiz =
        currentState === "Activo" ? "Inactivo" : "Activo";

      return {
        ...previousState,
        [documento]: nextState,
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const displayData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) return <div className="loading-screen">Cargando lista...</div>;

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
            {menuItems.map((item) => (
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
            <h1>Lista de Aprendices</h1>
          </div>

          <div
            className="profile-menu"
            ref={menuRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{instructorName}</span>
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
              <h2>Aprendices Registrados</h2>
              <span className="table-subtitle">
                Listado oficial de aprendices registrados en el sistema.
              </span>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Ficha</th>
                  <th>Programa</th>
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
                        <td>
                          {row.fichaNombre
                            ? `${row.ficha} - ${row.fichaNombre}`
                            : row.ficha}
                        </td>
                        <td>{row.programa || "Sin programa"}</td>
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
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#777",
                      }}
                    >
                      No se encontraron aprendices con estos filtros.
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

          <aside className="filter-card">
            <div className="filter-header">
              <h3>
                <Filter size={18} style={{ marginRight: "8px" }} /> Filtros
              </h3>
            </div>
            <div className="filter-group">
              <label>Documento</label>
              <input
                type="text"
                name="documento"
                className="input-filter"
                value={filters.documento}
                onChange={handleFilterChange}
                placeholder="Buscar..."
              />
            </div>
            <div className="filter-group">
              <label>Ficha</label>
              <input
                type="text"
                name="ficha"
                className="input-filter"
                value={filters.ficha}
                onChange={handleFilterChange}
                placeholder="Buscar..."
              />
            </div>
            <div className="filter-group">
              <label>Programa</label>
              <input
                type="text"
                name="programa"
                className="input-filter"
                value={filters.programa}
                onChange={handleFilterChange}
                placeholder="Buscar..."
              />
            </div>
            <div className="filter-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                className="input-filter"
                value={filters.nombre}
                onChange={handleFilterChange}
                placeholder="Buscar..."
              />
            </div>
            <div className="filter-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                className="input-filter"
                value={filters.apellido}
                onChange={handleFilterChange}
                placeholder="Buscar..."
              />
            </div>
            <div className="btn-search-indicator">
              <Search size={16} style={{ marginRight: "5px" }} /> Registros:{" "}
              {totalItems}
            </div>
          </aside>
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

export default ListaAprendices;
