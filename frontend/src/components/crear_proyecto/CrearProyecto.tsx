import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Users,
  Plus,
  MapPin,
  Eye,
  List,
  ChevronDown,
  LogOut,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "../dashboard_instructor/Dashboard.css";
import "./CrearProyecto.css";
import { API_URL } from "../../config/Api";
import { resolveUserName } from "../../session/session";

interface FichaOption {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
}

const getCurrentLocalDate = () => {
  const now = new Date();
  const timezoneOffsetInMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetInMs).toISOString().slice(0, 10);
};

const CrearProyecto = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [instructorName, setInstructorName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // MODALES
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false); // Modal de Ayuda
  const [, setErrorModal] = useState({ show: false, title: "", message: "" });
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedFicha, setSelectedFicha] = useState("");


  const [formData, setFormData] = useState({
    nombre: "",
    objetivo: "",
    fechaCreacion: getCurrentLocalDate(),
  });

  // Menú sin la opción de Ayuda (porque irá en el footer)
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
    if (!cedula) {
      navigate("/");
      return;
    }
    Promise.all([
      fetch(`${API_URL}/dashboard?cedula=${cedula}`),
      fetch(`${API_URL}/fichas`),
    ])
      .then(async ([dashboardRes, fichasRes]) => {
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
        const fichasData = fichasRes.ok ? await fichasRes.json() : [];

        const validFichas = Array.isArray(fichasData) ? fichasData : [];
        const parsedFichas: FichaOption[] = validFichas.map((item) => ({
          numero: String(item?.numero ?? "").trim(),
          nombre: String(item?.nombre ?? "").trim() || "Sin nombre",
          programa: String(item?.programa ?? "").trim() || "Sin programa",
          estado: String(item?.estado ?? "").trim() || "Sin estado",
        }));

        setInstructorName(resolveUserName(dashboardData?.instructor, "Usuario"));
        setFichas(parsedFichas);
        setFormData((prev) => ({ ...prev, fechaCreacion: getCurrentLocalDate() }));
      })
      .catch(() => setInstructorName(resolveUserName(undefined, "Usuario")));
  }, [navigate]);

  const programas = useMemo(() => {
    const set = new Set<string>();
    fichas.forEach((item) => {
      if (item.estado.toLowerCase() !== "activa") return;
      if (!item.programa || item.programa === "Sin programa") return;
      set.add(item.programa);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [fichas]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    fichas.forEach((item) => {
      if (item.estado.toLowerCase() !== "activa") return;
      if (!selectedPrograma || item.programa !== selectedPrograma) return;
      if (!item.nombre || item.nombre === "Sin nombre") return;
      set.add(item.nombre);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [fichas, selectedPrograma]);

  const fichasFiltradas = useMemo(() => {
    return fichas
      .filter((item) => item.estado.toLowerCase() === "activa")
      .filter((item) => (selectedPrograma ? item.programa === selectedPrograma : true))
      .filter((item) => (selectedArea ? item.nombre === selectedArea : true))
      .sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [fichas, selectedArea, selectedPrograma]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedula = localStorage.getItem("userCedula");
    const fichaNumero = Number(String(selectedFicha || "").trim());

    if (!selectedPrograma || !selectedArea || !selectedFicha) {
      setErrorModal({
        show: true,
        title: "Ficha requerida",
        message: "Selecciona programa, area y ficha antes de registrar el proyecto.",
      });
      return;
    }

    if (!fichaNumero || Number.isNaN(fichaNumero)) {
      setErrorModal({
        show: true,
        title: "Ficha invalida",
        message: "La ficha seleccionada no es valida.",
      });
      return;
    }

    try {
      const checkRes = await fetch(
        `${API_URL}/check-project?nombre=${encodeURIComponent(formData.nombre)}`,
      );
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setErrorModal({
          show: true,
          title: "Proyecto Duplicado",
          message: "El nombre de este proyecto ya existe.",
        });
        return;
      }

      const createRes = await fetch(`${API_URL}/create-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          objetivo: formData.objetivo,
          fecha: formData.fechaCreacion,
          cedula: Number(cedula),
          fichaNumero,
        }),
      });

      if (createRes.ok) {
        setShowSuccessModal(true);
        setFormData((prev) => ({ ...prev, nombre: "", objetivo: "" }));
      } else {
        setErrorModal({
          show: true,
          title: "Error",
          message: "No se pudo registrar.",
        });
      }
    } catch {
      setErrorModal({
        show: true,
        title: "Error",
        message: "Fallo de conexión.",
      });
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo" className="logo-lg" />
          <h2>Gestión de proyectos</h2>
        </div>
        <nav className="menu">
          <p className="menu-title">MENÚ</p>
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

        {/* SECCIÓN DE AYUDA IGUAL A LISTA DE APRENDICES */}
        <div
          className="settings-footer"
          style={{ marginTop: "auto", padding: "10px 0" }}
        >
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            onClick={() => setShowHelpModal(true)}
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
            <h1>Crear Proyecto</h1>
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
                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar
                  Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <section
          className="table-card"
          style={{ maxWidth: "700px", margin: "40px auto" }}
        >
          <div className="table-header">
            <h2>Información del Proyecto</h2>
            <span className="table-subtitle">
              Registre los detalles para habilitar el nuevo proyecto.
            </span>
          </div>
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div className="filter-group">
                <label>Programa</label>
                <select
                  className="input-filter"
                  value={selectedPrograma}
                  onChange={(e) => {
                    setSelectedPrograma(e.target.value);
                    setSelectedArea("");
                    setSelectedFicha("");
                  }}
                  required
                >
                  <option value="">Seleccionar</option>
                  {programas.map((programa) => (
                    <option key={programa} value={programa}>
                      {programa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Area</label>
                <select
                  className="input-filter"
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setSelectedFicha("");
                  }}
                  disabled={!selectedPrograma}
                  required
                >
                  <option value="">Seleccionar</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Ficha</label>
                <select
                  className="input-filter"
                  value={selectedFicha}
                  onChange={(e) => setSelectedFicha(e.target.value)}
                  disabled={!selectedArea}
                  required
                >
                  <option value="">Seleccionar</option>
                  {fichasFiltradas.map((item) => (
                    <option key={item.numero} value={item.numero}>
                      {item.numero}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label>Nombre del Proyecto</label>
              <input
                type="text"
                name="nombre"
                className="input-filter"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="filter-group">
              <label>Objetivo General</label>
              <textarea
                name="objetivo"
                className="input-filter"
                style={{ minHeight: "120px" }}
                value={formData.objetivo}
                onChange={handleChange}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div className="filter-group">
                <label>Fecha de Registro</label>
                <input
                  type="date"
                  name="fechaCreacion"
                  className="input-filter"
                  value={formData.fechaCreacion}
                  onChange={handleChange}
                />
              </div>
              <div className="filter-group">
                <label>Instructor Responsable</label>
                <input
                  type="text"
                  className="input-filter"
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  value={instructorName}
                  readOnly
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-search-indicator"
              style={{
                width: "100%",
                marginTop: "25px",
                backgroundColor: "#39A900",
                color: "white",
                border: "none",
                height: "50px",
                borderRadius: "10px",
                fontWeight: "bold",
              }}
            >
              REGISTRAR PROYECTO
            </button>
          </form>
        </section>
      </main>

      {/* MODALES IGUALES A LAS OTRAS VISTAS */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#e67e22" }}
            >
              <AlertTriangle size={45} color="white" />
            </div>
            <h2 className="modal-title">¿Estás seguro?</h2>
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

      {showHelpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#00324D" }}
            >
              <HelpCircle size={45} color="white" />
            </div>
            <h2 className="modal-title">Ayuda y Soporte</h2>
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              Soporte técnico: <b>soporte@sena.edu.co</b>
            </p>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => setShowHelpModal(false)}
                style={{ width: "100%", backgroundColor: "#00324D" }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#39A900" }}
            >
              <CheckCircle2 size={45} color="white" />
            </div>
            <h2 className="modal-title">¡Éxito!</h2>
            <button
              className="btn-confirm-logout"
              onClick={() => setShowSuccessModal(false)}
              style={{ width: "100%" }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearProyecto;
