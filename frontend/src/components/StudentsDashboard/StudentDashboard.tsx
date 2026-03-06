import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  Briefcase,
  Home,
  List,
  PenTool,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "../dashboard_instructor/Dashboard.css";
import { API_URL } from "../../config/Api";

// ==================== INTERFACES ====================
interface Stat {
  label: string;
  value: number;
}

interface ProyectosInfo {
  total: number;
  porHacer: number;
  enProgreso: number;
  hecho: number;
}

interface DashboardData {
  displayName: string;
  correo: string;
  description: string;
  stats: Stat[];
  proyectosData: ProyectosInfo;
}

// ==================== CONSTANTS ====================
const COLORS = {
  porHacer: "#FFC107", // Amarillo
  enProgreso: "#39A900", // Verde SENA
  hecho: "#8a2be2", // Morado
} as const;

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURACIÓN DEL MENÚ (Unificado con tus otras vistas) ---
  const menuItems = [
    { name: "Inicio", icon: Home, path: "/student-dashboard" },
    { name: "Mis Proyectos", icon: Briefcase, path: "/mis-proyectos" },
    { name: "Historias de Usuario", icon: List, path: "/ver-tareas" },
    { name: "Criterios de Aceptación", icon: Calendar, path: "/reuniones" },
    { name: "Observaciones", icon: MessageSquare, path: "/retroalimentacion" },
  ];

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // Usamos la misma ruta de API que tus otras vistas
    fetch(`${API_URL}/dashboard-student?cedula=${cedula}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[StudentDashboard] response:", data);
        if (data && data.error) {
          console.error("[StudentDashboard] API error:", data);
          localStorage.clear();
          navigate("/");
          return;
        }
        // Adaptamos la respuesta de la API a nuestra interfaz
        const displayName =
          data.displayName || data.administrador || data.instructor || data.student ||
          `${data.usuNombres || ""} ${data.usuApellidos || ""}`.trim() ||
          "Usuario";

        setDashboardData({
          displayName,
          correo: data.correo || "",
          description:
            data.description ||
            "Sistema de gestión de proyectos basado en metodología ágil Scrum.",
          stats: data.stats || [
            { label: "Mis tareas Activas", value: 0 },
            { label: "Tareas Completadas", value: 0 },
          ],
          proyectosData: data.proyectosData || {
            total: 0,
            porHacer: 0,
            enProgreso: 0,
            hecho: 0,
          },
        });
      })
      .catch((err) => console.error("Error cargando dashboard:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- LÓGICA DEL GRÁFICO ---
  const percentages = useMemo(() => {
    if (!dashboardData) return { porHacer: 0, enProgreso: 0, hecho: 0 };
    const { total, porHacer, enProgreso, hecho } = dashboardData.proyectosData;
    if (total === 0) return { porHacer: 0, enProgreso: 0, hecho: 0 };

    return {
      porHacer: Math.round((porHacer / total) * 100),
      enProgreso: Math.round((enProgreso / total) * 100),
      hecho: Math.round((hecho / total) * 100),
    };
  }, [dashboardData]);

  if (loading || !dashboardData)
    return <div className="loading-screen">Cargando dashboard...</div>;

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
        <div
          className="settings-footer"
          style={{ marginTop: "auto", padding: "10px 0" }}
        >
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            onClick={() => navigate("/soporte")}
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
            <h1>Dashboard Estudiantil</h1>
          </div>

          <div
            className="profile-menu"
            ref={menuRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dashboardData.displayName)}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{dashboardData.displayName}</span>
            <ChevronDown size={18} />

            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li>
                  <User size={16} style={{ marginRight: "8px" }} /> Mi Perfil
                </li>
                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar
                  Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Bienvenido, {dashboardData.displayName}</h2>
            <p>Monitorea tus avances y los de tu equipo en tiempo real.</p>
          </div>

          {/* Tarjetas de Estadísticas */}
          <div className="basic-cards">
            {dashboardData.stats.map((stat, index) => (
              <div key={index} className="card-stat">
                <div className="icon-container">
                  {stat.label.includes("Activas") ? (
                    <Clock size={24} />
                  ) : (
                    <CheckCircle size={24} />
                  )}
                </div>
                <div className="stat-info">
                  <p className="number">{stat.value}</p>
                  <h3>{stat.label}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Descripción y Gráfico */}
          <div className="dashboard-grid-summary">
            <section className="description-section">
              <div className="desc-header">
                <PenTool
                  size={20}
                  color="#39A900"
                  style={{ marginRight: "10px" }}
                />
                <h3>Propósito del Proyecto</h3>
              </div>
              <p>{dashboardData.description}</p>
            </section>

            <section className="summary-card-full">
              <h3>Estado Global de Proyectos</h3>
              <div className="summary-layout">
                <div className="legend-container">
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ backgroundColor: COLORS.porHacer }}
                    />
                    <span>
                      Por hacer: {dashboardData.proyectosData.porHacer} (
                      {percentages.porHacer}%)
                    </span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ backgroundColor: COLORS.enProgreso }}
                    />
                    <span>
                      En progreso: {dashboardData.proyectosData.enProgreso} (
                      {percentages.enProgreso}%)
                    </span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ backgroundColor: COLORS.hecho }}
                    />
                    <span>
                      Hecho: {dashboardData.proyectosData.hecho} (
                      {percentages.hecho}%)
                    </span>
                  </div>
                </div>

                <div className="chart-container">
                  <div
                    className="donut-chart"
                    style={{
                      background: `conic-gradient(
                                            ${COLORS.porHacer} 0% ${percentages.porHacer}%,
                                            ${COLORS.enProgreso} ${percentages.porHacer}% ${percentages.porHacer + percentages.enProgreso}%,
                                            ${COLORS.hecho} ${percentages.porHacer + percentages.enProgreso}% 100%
                                        )`,
                    }}
                  >
                    <div className="donut-inner">
                      <span className="total-num">
                        {dashboardData.proyectosData.total}
                      </span>
                      <span className="total-text">Total</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal de Logout */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container">
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
    </div>
  );
};

export default StudentDashboard;
