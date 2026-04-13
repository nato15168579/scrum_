import React, { useEffect, useMemo, useRef, useState } from "react";
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
  TrendingUp,
  ListChecks,
  MessageSquareText,
  MoreHorizontal,
  Sparkles,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./DashboardAprendiz.css";
import { API_URL } from "../../config/Api";

interface ApprenticeStats {
  tareasActivas: number;
  tareasCompletadas: number;
  participacionReuniones: number;
  retroalimentaciones: number;
}

interface SprintPoint {
  label: string;
  value: number;
}

interface ActivityDonut {
  completadas: number;
  enCurso: number;
  pendiente: number;
}

interface RecentActivity {
  text: string;
  time: string;
  type?: "hu" | "reunion" | "observacion";
}

interface ApprenticeDashboardData {
  aprendiz: string;
  correo?: string;
  stats: ApprenticeStats;
  avanceProyecto: SprintPoint[];
  actividad: ActivityDonut;
  actividadGlobal: ActivityDonut;
  actividadesRecientes: RecentActivity[];
  description?: string;
}

type DonutMode = "mine" | "global";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
}> = ({ icon, label, value, helper }) => {
  return (
    <div className="metric-card-pro">
      <div className="metric-card-pro__icon">{icon}</div>

      <div className="metric-card-pro__content">
        <span className="metric-card-pro__label">{label}</span>
        <p className="metric-card-pro__value">{value}</p>
        <span className="metric-card-pro__helper">{helper}</span>
      </div>
    </div>
  );
};

const LineChartMini: React.FC<{ data: SprintPoint[] }> = ({ data }) => {
  const width = 520;
  const height = 210;
  const padding = 30;

  const points = useMemo(() => {
    if (!data?.length) return "";
    const maxY = 100;
    const minY = 0;
    const stepX = (width - padding * 2) / Math.max(1, data.length - 1);

    const coords = data.map((d, i) => {
      const x = padding + i * stepX;
      const y =
        height -
        padding -
        ((clamp(d.value, minY, maxY) - minY) / (maxY - minY)) *
          (height - padding * 2);
      return { x, y };
    });

    return coords.map((p) => `${p.x},${p.y}`).join(" ");
  }, [data]);

  return (
    <div className="panel-pro">
      <div className="panel-pro__header">
        <div className="panel-pro__title-wrap">
          <span className="panel-pro__icon">
            <TrendingUp size={16} />
          </span>
          <div>
            <h3 className="panel-pro__title">Avance del proyecto</h3>
            <p className="panel-pro__subtitle">Seguimiento por sprint</p>
          </div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
        {[0, 25, 50, 75, 100].map((v) => {
          const y = height - padding - (v / 100) * (height - padding * 2);
          return (
            <g key={v}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e7edf2"
                strokeWidth="1"
              />
              <text x={6} y={y + 4} fontSize="10" fill="#8ea0b0">
                {v}%
              </text>
            </g>
          );
        })}

        <polyline
          points={points}
          fill="none"
          stroke="#45b12b"
          strokeWidth="2.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => {
          const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
          const x = padding + i * stepX;
          const y =
            height -
            padding -
            (clamp(d.value, 0, 100) / 100) * (height - padding * 2);

          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r="4.2" fill="#45b12b" />
              <circle cx={x} cy={y} r="8.2" fill="rgba(69, 177, 43, 0.12)" />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#8ea0b0"
              >
                {d.label.replace("Sprint ", "S")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ApprenticeDashboard: React.FC = () => {
  const [data, setData] = useState<ApprenticeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showActividadesModal, setShowActividadesModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");
  const [donutMode, setDonutMode] = useState<DonutMode>("mine");
  const [showDonutMenu, setShowDonutMenu] = useState(false);

  const donutMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const storedCedula = localStorage.getItem("userCedula");
    if (!storedCedula) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim()) {
      setDisplayName(storedName);
    }

    fetch(`${API_URL}/aprendiz/dashboard?cedula=${storedCedula}`)
      .then((res) => res.json())
      .then((json) => {
        if (json && !json.error) {
          setData(json);
        } else {
          setData({
            aprendiz: "Aprendiz",
            stats: {
              tareasActivas: 0,
              tareasCompletadas: 0,
              participacionReuniones: 0,
              retroalimentaciones: 0,
            },
            avanceProyecto: [
              { label: "Sprint 1", value: 10 },
              { label: "Sprint 2", value: 25 },
              { label: "Sprint 3", value: 20 },
              { label: "Sprint 4", value: 60 },
              { label: "Sprint 5", value: 35 },
              { label: "Sprint 6", value: 55 },
            ],
            actividad: { completadas: 55, enCurso: 15, pendiente: 30 },
            actividadGlobal: { completadas: 45, enCurso: 20, pendiente: 35 },
            actividadesRecientes: [],
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        setData({
          aprendiz: "Aprendiz",
          stats: {
            tareasActivas: 0,
            tareasCompletadas: 0,
            participacionReuniones: 0,
            retroalimentaciones: 0,
          },
          avanceProyecto: [
            { label: "Sprint 1", value: 10 },
            { label: "Sprint 2", value: 25 },
            { label: "Sprint 3", value: 20 },
            { label: "Sprint 4", value: 60 },
            { label: "Sprint 5", value: 35 },
            { label: "Sprint 6", value: 55 },
          ],
          actividad: { completadas: 55, enCurso: 15, pendiente: 30 },
          actividadGlobal: { completadas: 45, enCurso: 20, pendiente: 35 },
          actividadesRecientes: [],
        });
        setIsLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        donutMenuRef.current &&
        !donutMenuRef.current.contains(event.target as Node)
      ) {
        setShowDonutMenu(false);
      }
    };

    if (showDonutMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDonutMenu]);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getActivityIcon = (type?: "hu" | "reunion" | "observacion") => {
    switch (type) {
      case "hu":
        return <ClipboardList size={15} />;
      case "reunion":
        return <Calendar size={15} />;
      case "observacion":
        return <MessageSquareText size={15} />;
      default:
        return <Sparkles size={15} />;
    }
  };

  const getActivityIconClass = (type?: "hu" | "reunion" | "observacion") => {
    switch (type) {
      case "hu":
        return "recent-list-modern__icon recent-list-modern__icon--hu";
      case "reunion":
        return "recent-list-modern__icon recent-list-modern__icon--reunion";
      case "observacion":
        return "recent-list-modern__icon recent-list-modern__icon--observacion";
      default:
        return "recent-list-modern__icon";
    }
  };

  if (isLoading || !data) {
    return <div className="loading-screen">Cargando...</div>;
  }

  const donutData =
    donutMode === "mine" ? data.actividad : data.actividadGlobal;

  const donutTitle = donutMode === "mine" ? "Mi actividad" : "Actividad global";
  const donutSubtitle =
    donutMode === "mine"
      ? "Estado general de tus tareas"
      : "Estado general de las tareas del proyecto";

  const donutStyle = {
    background: `conic-gradient(
      #264579 0% ${donutData.completadas}%,
      #efad35 ${donutData.completadas}% ${
      donutData.completadas + donutData.enCurso
    }%,
      #a9c95d ${donutData.completadas + donutData.enCurso}% 100%
    )`,
  };

  const todasLasActividades = data.actividadesRecientes || [];

  const actividadesHU = todasLasActividades.filter((a) => a.type === "hu");
  const actividadesReuniones = todasLasActividades.filter(
    (a) => a.type === "reunion"
  );
  const actividadesObservaciones = todasLasActividades.filter(
    (a) => a.type === "observacion"
  );

  let actividadesPreview = [
    ...actividadesHU.slice(0, 2),
    ...actividadesReuniones.slice(0, 2),
    ...actividadesObservaciones.slice(0, 1),
  ];

  if (actividadesPreview.length < 5) {
    const usados = new Set(
      actividadesPreview.map((a) => `${a.type}-${a.text}-${a.time}`)
    );

    const restantes = todasLasActividades.filter(
      (a) => !usados.has(`${a.type}-${a.text}-${a.time}`)
    );

    actividadesPreview = [...actividadesPreview, ...restantes].slice(0, 5);
  } else {
    actividadesPreview = actividadesPreview.slice(0, 5);
  }

  return (
    <div className="dashboard-aprendiz">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
          <h2>GESTIÓN DE PROYECTOS</h2>
        </div>

        <nav className="menu">
          <p className="menu-title">MENÚ</p>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={location.pathname === item.path ? "active" : ""}
              >
                <item.icon size={18} style={{ marginRight: "10px" }} />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>

        <div className="settings-footer">
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            onClick={() => navigate("/ayuda-soporte")}
          >
            <HelpCircle size={18} className="support-icon" />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Dashboard</h1>
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
                  <User size={16} style={{ marginRight: "8px" }} />
                  Mi Perfil
                </li>
                <li
                  className="logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} style={{ marginRight: "8px" }} />
                  Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <div className="hero-pro">
              <div className="hero-pro__left">
                <span className="hero-pro__eyebrow">PANEL PRINCIPAL</span>
                <h2>Bienvenido, {displayName}</h2>
                <p className="welcome-subtitle">
                  Aquí puedes visualizar tu rendimiento, el estado de tus tareas,
                  la actividad del proyecto y el progreso general de tu proceso
                  formativo.
                </p>
              </div>

              <div className="hero-pro__summary-card">
                <div className="hero-pro__summary-icon">
                  <LayoutDashboard size={18} />
                </div>
                <div className="hero-pro__summary-content">
                  <span className="hero-pro__summary-label">
                    Estado general
                  </span>
                  <strong className="hero-pro__summary-title">Aprendiz</strong>
                  <span className="hero-pro__summary-helper">
                    Resumen rápido de actividad y avance
                  </span>
                </div>
              </div>
            </div>

            <section className="metrics-grid-pro">
              <MetricCard
                icon={<ListChecks size={18} strokeWidth={2} />}
                label="Mis tareas activas"
                value={data.stats.tareasActivas}
                helper="Actividades pendientes por desarrollar"
              />

              <MetricCard
                icon={<CheckSquare size={18} strokeWidth={2} />}
                label="Tareas completadas"
                value={data.stats.tareasCompletadas}
                helper="Actividades cerradas correctamente"
              />

              <MetricCard
                icon={<Calendar size={18} strokeWidth={2} />}
                label="Participación en reuniones"
                value={data.stats.participacionReuniones}
                helper="Intervenciones y asistencia registrada"
              />

              <MetricCard
                icon={<MessageSquareText size={18} strokeWidth={2} />}
                label="Retroalimentaciones"
                value={data.stats.retroalimentaciones}
                helper="Observaciones y comentarios recibidos"
              />
            </section>

            <section className="main-grid-pro">
              <LineChartMini data={data.avanceProyecto} />

              <div className="panel-pro">
                <div className="panel-pro__header">
                  <div className="panel-pro__title-wrap">
                    <span className="panel-pro__icon panel-pro__icon--blue">
                      <CheckSquare size={16} />
                    </span>
                    <div>
                      <h3 className="panel-pro__title">{donutTitle}</h3>
                      <p className="panel-pro__subtitle">{donutSubtitle}</p>
                    </div>
                  </div>

                  <div className="activity-menu-wrap" ref={donutMenuRef}>
                    <button
                      className="panel-pro__action"
                      title="Opciones"
                      onClick={() => setShowDonutMenu((prev) => !prev)}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {showDonutMenu && (
                      <div className="activity-menu-dropdown">
                        <button
                          className={`activity-menu-dropdown__item ${
                            donutMode === "mine" ? "active" : ""
                          }`}
                          onClick={() => {
                            setDonutMode("mine");
                            setShowDonutMenu(false);
                          }}
                        >
                          Mi actividad
                        </button>

                        <button
                          className={`activity-menu-dropdown__item ${
                            donutMode === "global" ? "active" : ""
                          }`}
                          onClick={() => {
                            setDonutMode("global");
                            setShowDonutMenu(false);
                          }}
                        >
                          Global
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="activity-card-pro__chart">
                  <div className="activity-donut-pro" style={donutStyle}>
                    <div className="activity-donut-pro__inner">
                      <span className="activity-donut-pro__label">
                        {donutMode === "mine" ? "Progreso" : "Proyecto"}
                      </span>
                      <strong className="activity-donut-pro__value">
                        {donutData.completadas}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="activity-legend-pro">
                  <div className="activity-legend-pro__item">
                    <span
                      className="activity-legend-pro__dot"
                      style={{ backgroundColor: "#264579" }}
                    />
                    <span className="activity-legend-pro__text">
                      <b>{donutData.completadas}%</b> Completas
                    </span>
                  </div>

                  <div className="activity-legend-pro__item">
                    <span
                      className="activity-legend-pro__dot"
                      style={{ backgroundColor: "#efad35" }}
                    />
                    <span className="activity-legend-pro__text">
                      <b>{donutData.enCurso}%</b> En curso
                    </span>
                  </div>

                  <div className="activity-legend-pro__item">
                    <span
                      className="activity-legend-pro__dot"
                      style={{ backgroundColor: "#a9c95d" }}
                    />
                    <span className="activity-legend-pro__text">
                      <b>{donutData.pendiente}%</b> Pendiente
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bottom-grid-pro">
              <div className="panel-pro">
                <div className="panel-pro__header">
                  <div className="panel-pro__title-wrap">
                    <span className="panel-pro__icon">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h3 className="panel-pro__title">Desempeño del aprendiz</h3>
                      <p className="panel-pro__subtitle">
                        Resumen general del proceso
                      </p>
                    </div>
                  </div>
                </div>

                <div className="info-box-pro">
                  Tu participación en cada sprint fortalece tu experiencia en el
                  trabajo colaborativo, la gestión ágil, la organización del
                  proyecto y el desarrollo de soluciones reales.
                </div>

                <div className="check-list-pro">
                  <div className="check-list-pro__item">
                    <span className="check-list-pro__mark">✓</span>
                    <span>Seguimiento de tareas asignadas</span>
                  </div>
                  <div className="check-list-pro__item">
                    <span className="check-list-pro__mark">✓</span>
                    <span>Participación en espacios de equipo</span>
                  </div>
                  <div className="check-list-pro__item">
                    <span className="check-list-pro__mark">✓</span>
                    <span>Fortalecimiento de buenas prácticas</span>
                  </div>
                </div>
              </div>

              <div className="panel-pro">
                <div className="panel-pro__header panel-pro__header--recent">
                  <div className="panel-pro__title-wrap">
                    <span className="panel-pro__icon panel-pro__icon--purple">
                      <MessageSquareText size={16} />
                    </span>
                    <div>
                      <h3 className="panel-pro__title">Actividades recientes</h3>
                      <p className="panel-pro__subtitle">
                        Últimos movimientos registrados
                      </p>
                    </div>
                  </div>

                  {!!data.actividadesRecientes?.length && (
                    <button
                      className="btn-ver-todas"
                      onClick={() => setShowActividadesModal(true)}
                    >
                      Ver todas
                    </button>
                  )}
                </div>

                <div className="recent-list-modern">
                  {actividadesPreview?.length ? (
                    actividadesPreview.map((a, idx) => (
                      <div
                        key={idx}
                        className={`recent-list-modern__item ${
                          idx === actividadesPreview.length - 1 ? "last" : ""
                        }`}
                      >
                        <div className="recent-list-modern__left">
                          <span className={getActivityIconClass(a.type)}>
                            {getActivityIcon(a.type)}
                          </span>
                          <span className="recent-list-modern__text">
                            {a.text}
                          </span>
                        </div>
                        <span className="recent-list-modern__time">
                          {a.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="recent-list-modern__empty">
                      Aún no hay actividades recientes.
                    </p>
                  )}
                </div>
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
                Sí, cerrar
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

      {showActividadesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowActividadesModal(false)}
        >
          <div
            className="modal-actividades"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-actividades__header">
              <div>
                <h3>Todas las actividades</h3>
                <p>Historial completo de movimientos del proyecto</p>
              </div>

              <button
                className="modal-actividades__close"
                onClick={() => setShowActividadesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-actividades__body">
              {data.actividadesRecientes?.length ? (
                data.actividadesRecientes.map((a, idx) => (
                  <div
                    key={idx}
                    className={`recent-list-modern__item ${
                      idx === data.actividadesRecientes.length - 1 ? "last" : ""
                    }`}
                  >
                    <div className="recent-list-modern__left">
                      <span className={getActivityIconClass(a.type)}>
                        {getActivityIcon(a.type)}
                      </span>
                      <span className="recent-list-modern__text">{a.text}</span>
                    </div>
                    <span className="recent-list-modern__time">{a.time}</span>
                  </div>
                ))
              ) : (
                <p className="recent-list-modern__empty">
                  Aún no hay actividades recientes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprenticeDashboard;