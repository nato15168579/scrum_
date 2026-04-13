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
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import { API_URL } from "../../config/Api";
import "./Observaciones.css";

type ObservacionRow = {
  id: number;
  descripcion: string;
  area: string;
  instructor: string;
  fecha: string | null;
  visto: boolean;
  estadoFk?: number | null;
};

type SortDir = "asc" | "desc";

const PAGE_SIZE = 5;

const Observaciones: React.FC = () => {
  const [rows, setRows] = useState<ObservacionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [showVistoModal, setShowVistoModal] = useState(false);
  const [selectedObs, setSelectedObs] = useState<ObservacionRow | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

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
    navigate("/logIn");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPage(1);
  };

  const fetchObservaciones = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/observaciones?cedula=${cedula}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      const normalized: ObservacionRow[] = Array.isArray(json)
        ? json.map((r: any) => ({
            id: Number(r.id ?? 0),
            descripcion: r.descripcion ?? "",
            area:
              typeof r.area === "string" && r.area.trim()
                ? r.area
                : r.visto
                ? "hecho"
                : "por hacer",
            instructor: r.instructor ?? "-",
            fecha: r.fecha ?? null,
            visto: !!r.visto,
            estadoFk: r.estadoFk ?? null,
          }))
        : [];

      setRows(normalized);
      setPage(1);
    } catch (error) {
      console.error("Error cargando observaciones:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
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

    fetchObservaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;

    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) => {
      const descripcionText = (row.descripcion ?? "").toLowerCase();
      const estadoText = (row.area ?? "").toLowerCase();
      const instructorText = (row.instructor ?? "").toLowerCase();
      const fechaText = formatFecha(row.fecha).toLowerCase();

      return (
        descripcionText.includes(term) ||
        estadoText.includes(term) ||
        instructorText.includes(term) ||
        fechaText.includes(term)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      const fa = a.fecha ?? "";
      const fb = b.fecha ?? "";

      if (fa < fb) return -1 * dir;
      if (fa > fb) return 1 * dir;
      return 0;
    });

    return copy;
  }, [filteredRows, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safePage]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [safePage, totalPages]);

  const toggleSort = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortArrow = () => {
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const openVistoModal = (obs: ObservacionRow) => {
    setSelectedObs(obs);
    setShowVistoModal(true);
  };

  const closeVistoModal = () => {
    setSelectedObs(null);
    setShowVistoModal(false);
  };

  const confirmToggleVista = async () => {
    if (!selectedObs) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setTogglingId(selectedObs.id);

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/observaciones/${selectedObs.id}/toggle-visto?cedula=${cedula}`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "No se pudo actualizar la observación.");
      }

      setRows((prev) =>
        prev.map((obs) => {
          if (obs.id !== selectedObs.id) return obs;

          const nuevoVisto =
            typeof data.visto === "boolean" ? data.visto : !obs.visto;

          return {
            ...obs,
            visto: nuevoVisto,
            area: nuevoVisto ? "hecho" : "por hacer",
            estadoFk: data.estadoFk ?? obs.estadoFk ?? null,
          };
        })
      );

      closeVistoModal();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocurrió un error al actualizar la observación.");
    } finally {
      setTogglingId(null);
    }
  };

  const getEstadoClass = (estado: string) => {
    const value = estado.toLowerCase().trim();

    if (value === "hecho" || value === "completada" || value === "finalizado") {
      return "estado-finalizado";
    }

    if (value === "por hacer" || value === "pendiente") {
      return "estado-pendiente";
    }

    if (value === "en progreso" || value === "en proceso") {
      return "estado-progreso";
    }

    return "estado-default";
  };

  const hasActiveFilters = !!searchTerm.trim();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

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
                <item.icon size={18} style={{ marginRight: 10 }} />
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
            <HelpCircle
              size={18}
              style={{ marginRight: 10, color: "#39A900" }}
            />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Observaciones</h1>
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
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/mi-perfil");
                  }}
                >
                  <User size={16} style={{ marginRight: 8 }} />
                  Mi Perfil
                </li>
                <li
                  className="logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <div className="obs-topbar">
              <div>
                <p className="obs-eyebrow">PROJECT FEEDBACK</p>
                <h2 className="obs-heading">Observaciones</h2>
                <p className="welcome-subtitle">
                  Revisa las observaciones enviadas por tus instructores y marca
                  cada una como vista cuando ya la hayas revisado.
                </p>
              </div>
            </div>

            <section className="obs-box">
              <div className="hu-filter-bar-compact">
                <div className="hu-filter-input-compact">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por descripción, estado, instructor o fecha"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="hu-filter-actions-compact">
                  <span className="hu-results-counter compact">
                    {filteredRows.length} resultado
                    {filteredRows.length !== 1 ? "s" : ""}
                  </span>

                  <button
                    className={`hu-clear-filters-btn compact ${
                      hasActiveFilters ? "active" : ""
                    }`}
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <X size={14} />
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="obs-table-wrap">
                <table className="obs-table">
                  <thead>
                    <tr>
                      <th className="th-desc">DESCRIPCION</th>
                      <th className="th-estado">ESTADO</th>
                      <th className="th-instructor">INSTRUCTOR</th>
                      <th className="th-sort th-fecha" onClick={toggleSort}> FECHA{sortArrow()}
                      </th>
                      <th className="th-actions">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">
                          No hay observaciones para mostrar.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((r) => (
                        <tr key={r.id} className={r.visto ? "row-vista" : ""}>
                          <td>
                            <div className="obs-main-info">
                              <span className="obs-title">{r.descripcion}</span>
                              <span className="obs-subtext">
                                Observación del proyecto
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`obs-estado-pill ${getEstadoClass(
                                r.area
                              )}`}
                            >
                              {r.area}
                            </span>
                          </td>

                          <td className="obs-instructor-cell">
                            {r.instructor}
                          </td>

                          <td className="obs-date-cell">
                            {formatFecha(r.fecha)}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className={`icon-btn view ${
                                  r.visto ? "done" : ""
                                }`}
                                title={
                                  r.visto ? "Quitar visto" : "Marcar como vista"
                                }
                                onClick={() => openVistoModal(r)}
                                disabled={togglingId === r.id}
                              >
                                {r.visto ? (
                                  <CheckCircle2 size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="obs-footer">
                <div />
                <div className="obs-pagination">
                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Anterior
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pg-btn ${n === safePage ? "active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>

      {showVistoModal && selectedObs && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle
              size={45}
              color={selectedObs.visto ? "#F39C12" : "#39A900"}
              style={{ marginBottom: 15 }}
            />
            <h2 className="modal-title">
              {selectedObs.visto
                ? "¿Quitar marca de visto?"
                : "¿Marcar como vista?"}
            </h2>
            <p className="success-text">
              {selectedObs.visto
                ? "Esta observación volverá a quedar como no revisada y su estado cambiará a por hacer."
                : "Esta observación quedará registrada como revisada y su estado cambiará a hecho."}
            </p>
            <div className="modal-buttons">
              <button
                className="btn-success-ok"
                onClick={confirmToggleVista}
                disabled={togglingId === selectedObs.id}
              >
                {togglingId === selectedObs.id
                  ? "Procesando..."
                  : selectedObs.visto
                  ? "Sí, quitar"
                  : "Sí, marcar"}
              </button>
              <button className="btn-cancel-logout" onClick={closeVistoModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle
              size={45}
              color="#E74C3C"
              style={{ marginBottom: 15 }}
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

export default Observaciones;
