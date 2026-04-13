import React, { useEffect, useState } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  Home,
  Briefcase,
  ClipboardList,
  CheckSquare,
  Calendar,
  Eye,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  FolderKanban,
  FileText,
  Target,
  BadgeInfo,
  Users,
  Mail,
  Phone,
  Hash,
  Clock3,
  ShieldCheck,
  CalendarDays,
  Flag,
  Sparkles,
  Info,
  Crown,
  Gem,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./MiProyecto.css";
import "./MiProyectoDetalle.css";
import { API_URL } from "../../config/Api";

type IntegranteDetalle = {
  cedula?: number | null;
  nombre: string;
  correo?: string | null;
  telefono?: string | null;
  rol: string;
};

type ApiDetalleResponse = {
  proId?: number | null;
  proCodigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  objetivoGeneral?: string | null;
  objetivosEspecificos?: string | null;
  justificacion?: string | null;
  estado?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fechaCreacion?: string | null;
  integrantes?: IntegranteDetalle[];
};

type DetalleUI = {
  proId: number | null;
  proCodigo: string | null;
  nombre: string;
  descripcion: string | null;
  objetivoGeneral: string | null;
  objetivosEspecificos: string | null;
  justificacion: string | null;
  estado: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaCreacion: string | null;
  integrantes: IntegranteDetalle[];
};

function formatFecha(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getRoleIcon(rol: string) {
  const role = (rol || "").toLowerCase();

  if (role.includes("master")) return <Crown size={13} />;
  if (role.includes("owner")) return <Gem size={13} />;
  if (role.includes("team")) return <Users size={13} />;
  return <BadgeInfo size={13} />;
}

function getRoleClass(rol: string) {
  const role = (rol || "").toLowerCase();

  if (role.includes("master")) return "mpd-role-badge mpd-role-badge--master";
  if (role.includes("owner")) return "mpd-role-badge mpd-role-badge--owner";
  if (role.includes("team")) return "mpd-role-badge mpd-role-badge--team";
  return "mpd-role-badge mpd-role-badge--default";
}

const MiProyectoDetalle: React.FC = () => {
  const [data, setData] = useState<DetalleUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-aprendiz" },
    { name: "Mi Proyecto", icon: Briefcase, path: "/aprendiz/mi-proyecto" },
    {
      name: "Historias de usuario",
      icon: ClipboardList,
      path: "/aprendiz/historias-usuario",
    },
    {
      name: "Criterios de aceptación",
      icon: CheckSquare,
      path: "/aprendiz/criterios-aceptacion",
    },
    { name: "Reuniones", icon: Calendar, path: "/aprendiz/reuniones" },
    { name: "Observaciones", icon: Eye, path: "/aprendiz/observaciones" },
  ];

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim()) {
      setDisplayName(storedName);
    }

    fetch(`${API_URL}/aprendiz/mi-proyecto/detalle?cedula=${cedula}`)
      .then((res) => res.json())
      .then((json: ApiDetalleResponse) => {
        setData({
          proId: json.proId ?? null,
          proCodigo: json.proCodigo ?? null,
          nombre: json.nombre ?? "Mi proyecto",
          descripcion: json.descripcion ?? null,
          objetivoGeneral: json.objetivoGeneral ?? null,
          objetivosEspecificos: json.objetivosEspecificos ?? null,
          justificacion: json.justificacion ?? null,
          estado: json.estado ?? null,
          fechaInicio: json.fechaInicio ?? null,
          fechaFin: json.fechaFin ?? null,
          fechaCreacion: json.fechaCreacion ?? null,
          integrantes: Array.isArray(json.integrantes) ? json.integrantes : [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error detalle proyecto:", err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!data) return <div className="loading-screen">Sin datos</div>;

  return (
    <div className="dashboard-aprendiz">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
          <h2>Gestión de proyectos</h2>
        </div>

        <nav className="menu">
          <p className="menu-title">MENÚ</p>
          <ul>
            {menuItems.map((item) => {
              const isMiProyectoRoot = item.path === "/aprendiz/mi-proyecto";
              const isActive = isMiProyectoRoot
                ? location.pathname.startsWith("/aprendiz/mi-proyecto")
                : location.pathname === item.path;

              return (
                <li
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={isActive ? "active" : ""}
                >
                  <item.icon size={18} style={{ marginRight: "10px" }} />
                  {item.name}
                </li>
              );
            })}
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
            onClick={() => navigate("/ayuda-soporte")}
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
        <nav className="nav-top mpd-nav-top">
          <div className="mpd-breadcrumb-shell">
            <div className="mpd-breadcrumb-wrap">
              <button
                type="button"
                className="mpd-breadcrumb-back"
                onClick={() => navigate(-1)}
                title="Volver"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="mpd-breadcrumb-text">
                <span className="mpd-breadcrumb-main">Mi proyecto</span>
                <span className="mpd-breadcrumb-separator">/</span>
                <span className="mpd-breadcrumb-current">Detalle</span>
              </div>
            </div>
          </div>

          <div
            className="profile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{displayName}</span>
            <ChevronDown size={18} />

            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li onClick={() => navigate("/mi-perfil")}>
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
                  Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <div className="mpd-hero-premium">
              <div className="mpd-hero-premium__content">
                <div className="mpd-hero-premium__tag">
                  <Sparkles size={14} />
                  <span>DETALLE COMPLETO</span>
                </div>

                <h2 className="mpd-title">{data.nombre}</h2>
                <p className="welcome-subtitle">
                  Consulta la información completa del proyecto y el rol de cada
                  integrante asignado.
                </p>
              </div>

              <div className="mpd-hero-premium__side">
                <div className="mpd-premium-orb">
                  <FolderKanban size={28} />
                </div>
              </div>
            </div>

            <section className="mpd-card mpd-card--main mpd-card--premium">
              <div className="mpd-card__header">
                <div className="mpd-card__title">
                  <span className="mpd-title-icon mpd-title-icon--emerald">
                    <FolderKanban size={18} />
                  </span>
                  <strong>Información del proyecto</strong>
                </div>
              </div>

              <div className="mpd-info-grid">
                <div className="mpd-info-item">
                  <span className="mpd-label">
                    <Hash size={14} />
                    Código
                  </span>
                  <strong>{data.proCodigo || "-"}</strong>
                </div>

                <div className="mpd-info-item">
                  <span className="mpd-label">
                    <ShieldCheck size={14} />
                    Estado
                  </span>
                  <strong>{data.estado || "-"}</strong>
                </div>

                <div className="mpd-info-item">
                  <span className="mpd-label">
                    <Clock3 size={14} />
                    Fecha inicio
                  </span>
                  <strong>{formatFecha(data.fechaInicio)}</strong>
                </div>

                <div className="mpd-info-item">
                  <span className="mpd-label">
                    <Flag size={14} />
                    Fecha fin
                  </span>
                  <strong>{formatFecha(data.fechaFin)}</strong>
                </div>

                <div className="mpd-info-item mpd-info-item--full">
                  <span className="mpd-label">
                    <CalendarDays size={14} />
                    Fecha de creación
                  </span>
                  <strong>{formatFecha(data.fechaCreacion)}</strong>
                </div>
              </div>
            </section>

            <section className="mpd-grid">
              <div className="mpd-card mpd-card--premium">
                <div className="mpd-card__header">
                  <div className="mpd-card__title">
                    <span className="mpd-title-icon mpd-title-icon--blue">
                      <FileText size={18} />
                    </span>
                    <strong>Descripción</strong>
                  </div>
                </div>
                <p className="mpd-text-block">{data.descripcion || "-"}</p>
              </div>

              <div className="mpd-card mpd-card--premium">
                <div className="mpd-card__header">
                  <div className="mpd-card__title">
                    <span className="mpd-title-icon mpd-title-icon--gold">
                      <Target size={18} />
                    </span>
                    <strong>Objetivo general</strong>
                  </div>
                </div>
                <p className="mpd-text-block">{data.objetivoGeneral || "-"}</p>
              </div>

              <div className="mpd-card mpd-card--premium">
                <div className="mpd-card__header">
                  <div className="mpd-card__title">
                    <span className="mpd-title-icon mpd-title-icon--purple">
                      <BadgeInfo size={18} />
                    </span>
                    <strong>Objetivos específicos</strong>
                  </div>
                </div>
                <p className="mpd-text-block">
                  {data.objetivosEspecificos || "-"}
                </p>
              </div>

              <div className="mpd-card mpd-card--premium">
                <div className="mpd-card__header">
                  <div className="mpd-card__title">
                    <span className="mpd-title-icon mpd-title-icon--slate">
                      <Info size={18} />
                    </span>
                    <strong>Justificación</strong>
                  </div>
                </div>
                <p className="mpd-text-block">{data.justificacion || "-"}</p>
              </div>
            </section>

            <section className="mpd-card mpd-team-card mpd-team-card--premium">
              <div className="mpd-card__header">
                <div className="mpd-card__title">
                  <span className="mpd-title-icon mpd-title-icon--emerald">
                    <Users size={18} />
                  </span>
                  <strong>Integrantes del proyecto</strong>
                </div>

                <span className="mpd-team-total">
                  {data.integrantes.length} integrante
                  {data.integrantes.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="mpd-team-grid">
                {data.integrantes.length ? (
                  data.integrantes.map((item, index) => (
                    <div
                      key={`${item.nombre}-${index}`}
                      className="mpd-team-member mpd-team-member--compact"
                    >
                      <div className="mpd-team-left">
                        <div className="mpd-team-avatar mpd-team-avatar--premium">
                          {item.nombre.trim().charAt(0).toUpperCase()}
                        </div>

                        <div className="mpd-team-head">
                          <strong className="mpd-team-name">{item.nombre}</strong>

                          <div className={getRoleClass(item.rol)}>
                            {getRoleIcon(item.rol)}
                            <span>{item.rol}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mpd-team-right mpd-team-right--compact">
                        <div className="mpd-mini-data">
                          <Hash size={13} />
                          <span className="mpd-mini-data__label">CC</span>
                          <strong>{item.cedula || "-"}</strong>
                        </div>

                        <div className="mpd-mini-data">
                          <Mail size={13} />
                          <span className="mpd-mini-data__label">Correo</span>
                          <strong>{item.correo || "-"}</strong>
                        </div>

                        <div className="mpd-mini-data">
                          <Phone size={13} />
                          <span className="mpd-mini-data__label">Número</span>
                          <strong>{item.telefono || "-"}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mpd-empty">No hay integrantes registrados.</p>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle
              size={45}
              color="#E74C3C"
              style={{ marginBottom: "15px" }}
            />
            <h2 className="modal-title">¿Estás seguro?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Sí, Cerrar
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

export default MiProyectoDetalle;