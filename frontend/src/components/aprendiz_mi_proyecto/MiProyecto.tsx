import React, { useEffect, useMemo, useState } from "react";
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
  Users,
  TrendingUp,
  Clock3,
  Flag,
  FileText,
  FolderOpen,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./MiProyecto.css";
import { API_URL } from "../../config/Api";

type IntegranteProyecto = {
  nombre: string;
  rol: string;
};

type ApiMiProyectoResponse = {
  proId?: number | null;
  nombre?: string | null;
  grupo?: number;
  grupoTotal?: number;
  fechaAsignada?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  descripcion?: string | null;
  integrantes?: IntegranteProyecto[];
  distribucion?: {
    creados?: number;
    completos?: number;
    enProceso?: number;
  };
  avanceProyecto?: Array<{ label: string; value: number }>;
};

interface SprintPoint {
  label: string;
  value: number;
}

interface MiProyectoDataUI {
  proId: number | null;
  nombre: string;
  grupoTotal: number;
  fechaAsignada: string | null;
  fechaFin: string | null;
  descripcion: string | null;
  integrantes: IntegranteProyecto[];
  distribucion: {
    creados: number;
    completos: number;
    enProceso: number;
  };
  avanceProyecto: SprintPoint[];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeNumber(n: any, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

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

const LineChartMini: React.FC<{ data: SprintPoint[] }> = ({ data }) => {
  const width = 520;
  const height = 220;
  const padding = 26;

  const points = useMemo(() => {
    if (!data?.length) return "";
    const maxY = 100;
    const stepX = (width - padding * 2) / Math.max(1, data.length - 1);

    const coords = data.map((d, i) => {
      const x = padding + i * stepX;
      const y =
        height -
        padding -
        (clamp(d.value, 0, maxY) / maxY) * (height - padding * 2);
      return { x, y };
    });

    return coords.map((p) => `${p.x},${p.y}`).join(" ");
  }, [data]);

  return (
    <div className="box mp-chart-card">
      <div className="box-title box-title-row">
        <div className="box-title-left">
          <TrendingUp size={18} color="#39A900" />
          <strong>Avance del proyecto</strong>
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
                stroke="#edf0f3"
                strokeWidth="1"
              />
              <text x={6} y={y + 4} fontSize="10" fill="#8b95a5">
                {v}%
              </text>
            </g>
          );
        })}

        <polyline
          points={points}
          fill="none"
          stroke="#39A900"
          strokeWidth="3"
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
              <circle cx={x} cy={y} r="4.5" fill="#39A900" />
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#77808f"
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

const MiProyecto: React.FC = () => {
  const [data, setData] = useState<MiProyectoDataUI | null>(null);
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

    fetch(`${API_URL}/aprendiz/mi-proyecto?cedula=${cedula}`)
      .then((res) => res.json())
      .then((json: ApiMiProyectoResponse) => {
        const distrib = json?.distribucion ?? {};
        

        const ui: MiProyectoDataUI = {
          proId: (json.proId ?? null) as any,
          nombre: (json.nombre ?? "Mi proyecto") as any,
          grupoTotal: safeNumber(json.grupoTotal ?? json.grupo, 0),
          fechaAsignada: (json.fechaInicio ?? json.fechaAsignada ?? null) as any,
          fechaFin: (json.fechaFin ?? null) as any,
          descripcion: (json.descripcion ?? null) as any,
          integrantes: Array.isArray(json.integrantes) ? json.integrantes : [],
          distribucion: {
            creados: safeNumber(distrib.creados, 0),
            completos: safeNumber(distrib.completos, 0),
            enProceso: safeNumber(distrib.enProceso, 0),
          },
          avanceProyecto: (json.avanceProyecto ?? []).map((p) => ({
            label: p.label,
            value: clamp(safeNumber(p.value, 0), 0, 100),
          })),
        };

        setData(ui);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error MiProyecto:", err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!data) return <div className="loading-screen">Sin datos</div>;

  const totalDist =
    data.distribucion.creados +
    data.distribucion.completos +
    data.distribucion.enProceso;

  const p1 = totalDist
    ? Math.round((data.distribucion.creados / totalDist) * 100)
    : 0;
  const p2 = totalDist
    ? Math.round((data.distribucion.completos / totalDist) * 100)
    : 0;
  const p3 = totalDist
    ? Math.round((data.distribucion.enProceso / totalDist) * 100)
    : 0;

  const donutStyle = {
    background: `conic-gradient(
      #1f3b73 0% ${p1}%,
      #f4a62a ${p1}% ${p1 + p2}%,
      #a7c957 ${p1 + p2}% 100%
    )`,
  } as React.CSSProperties;

  const teamGridClass =
    data.integrantes.length > 6 ? "team-grid team-grid-scroll" : "team-grid";

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
        <nav className="nav-top">
          <div className="title-section">
            <h1>Mi proyecto</h1>
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
            <div
              className="mp-header-block"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="mp-kicker">PROYECTO ASIGNADO</span>
                <h2 className="mp-project-title">{data.nombre}</h2>
                <p className="welcome-subtitle">
                  Aquí puedes consultar toda la información de tu proyecto, sus
                  integrantes y su avance.
                </p>
              </div>

              <button
                  type="button"
                  className="mp-view-btn-soft"
                  onClick={() => navigate("/aprendiz/mi-proyecto/detalle")}
                >
                  <span className="mp-view-btn-soft__icon">
                    <FolderOpen size={15} />
                  </span>
                  <span className="mp-view-btn-soft__text">Ver detalle</span>
                  <span className="mp-view-btn-soft__arrow">
                  </span>
                </button>
            </div>

            <section className="mp-top-layout">
              <div className="mini-card mini-card-team">
                <div className="mini-card-head">
                  <div className="mini-icon">
                    <Users size={17} />
                  </div>

                  <div className="mini-card-heading">
                    <small>Equipo de trabajo</small>
                    <strong>{data.grupoTotal} integrantes</strong>
                  </div>
                </div>

                <div className="team-summary">
                  Personas asignadas actualmente al proyecto
                </div>

                {data.integrantes.length > 0 && (
                  <div className={teamGridClass}>
                    {data.integrantes.map((item, index) => (
                      <div
                        className="team-member-card"
                        key={`${item.nombre}-${index}`}
                      >
                        <div className="team-avatar">
                          {item.nombre.trim().charAt(0).toUpperCase()}
                        </div>

                        <div className="team-member-info">
                          <span className="team-member-name">{item.nombre}</span>
                          <span className="team-member-role">{item.rol}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mp-dates-column">
                <div className="mini-card mini-card-date mini-card-compact">
                  <div className="mini-card-head">
                    <div className="mini-icon">
                      <Clock3 size={17} />
                    </div>

                    <div className="mini-card-heading">
                      <small>Fecha asignada</small>
                      <strong>{formatFecha(data.fechaAsignada)}</strong>
                    </div>
                  </div>

                  <p className="mini-helper-text">Inicio oficial del proyecto</p>
                </div>

                <div className="mini-card mini-card-date mini-card-compact">
                  <div className="mini-card-head">
                    <div className="mini-icon">
                      <Flag size={17} />
                    </div>

                    <div className="mini-card-heading">
                      <small>Fecha fin</small>
                      <strong>{formatFecha(data.fechaFin)}</strong>
                    </div>
                  </div>

                  <p className="mini-helper-text">
                    Fecha estimada de cierre
                  </p>
                </div>
              </div>
            </section>

            <section className="box descripcion mp-description-card">
              <div className="box-title box-title-row">
                <div className="box-title-left">
                  <div className="description-icon-wrap">
                    <FileText size={16} color="#39A900" />
                  </div>
                  <div className="description-title-group">
                    <strong>Descripción del proyecto</strong>
                    <span>Resumen general del propósito y alcance</span>
                  </div>
                </div>
              </div>

              <div className="mp-description-main">
                <p className="mp-description-text">
                  {data.descripcion ?? "Sin descripción"}
                </p>
              </div>
            </section>

            <section className="grid-bottom">
              <div className="box mp-deliverables-card">
                <div className="box-title box-title-row mp-backlog-header">
                  <div className="box-title-left">
                    <strong>Distribución de Backlog</strong>
                  </div>

                  <div className="mp-backlog-actions">
                    <button
                      className="mp-view-btn-pro"
                      onClick={() => navigate("/aprendiz/historias-usuario")}
                      type="button"
                    >
                      <span className="mp-view-btn-pro-icon">
                        <FolderOpen size={15} />
                      </span>
                      <span className="mp-view-btn-pro-text">Ver</span>
                    </button>

                    <div className="mp-backlog-total">
                      <span>Total</span>
                      <strong>{totalDist}</strong>
                    </div>
                  </div>
                </div>

                <div className="mp-backlog-layout">
                  <div className="mp-donut-area">
                    <div
                      className="donut-chart mp-donut mp-donut-lg"
                      style={donutStyle}
                    >
                      <div className="donut-inner mp-donut-inner-lg">
                        <span className="mp-donut-total">{totalDist}</span>
                        <span className="mp-donut-title">Entregables</span>
                      </div>
                    </div>
                  </div>

                  <div className="legend legend-pro">
                    <div className="legend-card legend-card-pending">
                      <div className="legend-card-left">
                        <span
                          className="dot dot-lg"
                          style={{ backgroundColor: "#1f3b73" }}
                        />
                        <div className="legend-texts">
                          <span className="legend-label">Pendientes</span>
                          <strong>{data.distribucion.creados}</strong>
                        </div>
                      </div>
                      <span className="legend-percent">{p1}%</span>
                    </div>

                    <div className="legend-card legend-card-complete">
                      <div className="legend-card-left">
                        <span
                          className="dot dot-lg"
                          style={{ backgroundColor: "#f4a62a" }}
                        />
                        <div className="legend-texts">
                          <span className="legend-label">Completos</span>
                          <strong>{data.distribucion.completos}</strong>
                        </div>
                      </div>
                      <span className="legend-percent">{p2}%</span>
                    </div>

                    <div className="legend-card legend-card-progress">
                      <div className="legend-card-left">
                        <span
                          className="dot dot-lg"
                          style={{ backgroundColor: "#a7c957" }}
                        />
                        <div className="legend-texts">
                          <span className="legend-label">En proceso</span>
                          <strong>{data.distribucion.enProceso}</strong>
                        </div>
                      </div>
                      <span className="legend-percent">{p3}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <LineChartMini data={data.avanceProyecto} />
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

export default MiProyecto;