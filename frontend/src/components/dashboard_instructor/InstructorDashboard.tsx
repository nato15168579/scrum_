import { useState, useEffect } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  Users,
  Briefcase,
  Home,
  List,
  Plus,
  MapPin,
  Eye,
  PenTool,
  Calendar,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./Dashboard.css";
import { API_URL } from "../../config/Api";

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
  instructor: string;
  correo: string;
  description: string;
  stats: Stat[];
  proyectosData: ProyectosInfo;
}

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-instructor" },
    { name: "Lista de Aprendices", icon: Users, path: "/lista-aprendices" },
    { name: "Crear Proyecto", icon: Plus, path: "/crear-proyecto" },
    { name: "Asignar Proyectos", icon: MapPin, path: "/asignar-proyectos" },
    { name: "Ver Proyectos", icon: Eye, path: "/ver-proyectos" },
    { name: "Registrar Aprendiz", icon: List, path: "/registrar-aprendiz" },
  ];

  useEffect(() => {
    const storedCedula = localStorage.getItem("userCedula");
    const storedRoleId = localStorage.getItem("userRoleId");

    if (!storedCedula) {
      navigate("/");
      return;
    }

    if (storedRoleId === "3") {
      navigate("/dashboard-administrador");
      return;
    }

    if (storedRoleId && storedRoleId !== "2") {
      navigate("/student-dashboard");
      return;
    }

    fetch(`${API_URL}/dashboard?cedula=${storedCedula}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setDashboardData(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        setIsLoading(false);
      });
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (isLoading || !dashboardData)
    return <div className="loading-screen">Cargando...</div>;

  const { total, porHacer, enProgreso, hecho } = dashboardData.proyectosData;

  const donutStyle = {
    background:
      total > 0
        ? `conic-gradient(#FFC107 0% ${(porHacer / total) * 100}%, #39A900 ${(porHacer / total) * 100}% ${((porHacer + enProgreso) / total) * 100}%, #8a2be2 ${((porHacer + enProgreso) / total) * 100}% 100%)`
        : "#e2e8f0",
  };

  return (
    <div className="dashboard-page">
      <div className="container-dashboard">
        <aside className="side-card">
          <div className="brand-block">
            <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
            <h2>Gestion de proyectos</h2>
          </div>

          <nav className="menu">
            <p className="menu-title">MENU</p>
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={location.pathname === item.path ? "active" : ""}
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
              <h1>Dashboard Principal</h1>
            </div>
            <div
              className="profile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dashboardData.instructor)}&background=39A900&color=fff`}
                className="profile-img"
                alt="Avatar"
              />
              <span className="profile-name">{dashboardData.instructor}</span>
              <ChevronDown size={18} />

              {isMenuOpen && (
                <ul className="dropdown-profile">
                  <li>
                    <User size={16} style={{ marginRight: "8px" }} /> Mi Perfil
                  </li>
                  <li
                    className="logout"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLogoutModal(true);
                    }}
                  >
                    <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar
                    Sesion
                  </li>
                </ul>
              )}
            </div>
          </nav>

          <section className="dashboard-content">
            <h2>Bienvenido, {dashboardData.instructor}</h2>
            <p className="welcome-subtitle">
              Consulta la informacion de tu proyecto y su avance global.
            </p>

            <section className="basic-cards">
              {dashboardData.stats.map((stat, i) => (
                <div key={i} className="card-stat">
                  <div className="stat-info">
                    {i === 0 && (
                      <Users
                        size={20}
                        color="#39A900"
                        style={{ marginBottom: "10px" }}
                      />
                    )}
                    {i === 1 && (
                      <Calendar
                        size={20}
                        color="#39A900"
                        style={{ marginBottom: "10px" }}
                      />
                    )}
                    {i === 2 && (
                      <Briefcase
                        size={20}
                        color="#39A900"
                        style={{ marginBottom: "10px" }}
                      />
                    )}
                    <p className="number">{stat.value}</p>
                    <h3>{stat.label}</h3>
                  </div>
                </div>
              ))}
            </section>

            <section className="description-section">
              <div className="desc-header">
                <PenTool
                  size={20}
                  color="#39A900"
                  style={{ marginRight: "10px" }}
                />
                <h3>Proposito del Sistema</h3>
              </div>
              <p className="desc-text">{dashboardData.description}</p>
            </section>

            <section className="summary-section">
              <div className="summary-card-full">
                <h3>Estado Global de Proyectos</h3>
                <div className="summary-layout">
                  <div className="legend-container">
                    <div className="legend-item">
                      <span
                        className="dot"
                        style={{ backgroundColor: "#FFC107" }}
                      ></span>
                      <span className="legend-label">
                        Por hacer: {porHacer}
                      </span>
                    </div>
                    <div className="legend-item">
                      <span
                        className="dot"
                        style={{ backgroundColor: "#39A900" }}
                      ></span>
                      <span className="legend-label">
                        En progreso: {enProgreso}
                      </span>
                    </div>
                    <div className="legend-item">
                      <span
                        className="dot"
                        style={{ backgroundColor: "#8a2be2" }}
                      ></span>
                      <span className="legend-label">Hecho: {hecho}</span>
                    </div>
                  </div>
                  <div className="chart-container">
                    <div className="donut-chart" style={donutStyle}>
                      <div className="donut-inner">
                        <span
                          style={{ fontSize: "1.8rem", fontWeight: "bold" }}
                        >
                          {total}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#777" }}>
                          Proyectos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container">
              <AlertTriangle size={45} color="white" strokeWidth={3} />
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

export default InstructorDashboard;
