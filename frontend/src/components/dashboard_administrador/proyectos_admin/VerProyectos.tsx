/**
 * Vista administrativa de consulta rapida de proyectos.
 *
 * Concentra filtros, acceso a creacion y lectura resumida del inventario de
 * proyectos visibles para el administrador.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  Plus,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../dashboard_instructor/Dashboard.css";
import "./VerProyectos.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../utils/session";
import AdminLogoutModal from "../shared/AdminLogoutModal";
import AdminProfileMenu from "../shared/AdminProfileMenu";
import AdminSidebar from "../shared/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "../shared/adminSession";
import { useClickOutside } from "../shared/useClickOutside";

interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  status: string;
}

interface ProyectoApi {
  detParIdFk?: number;
  proId?: number;
  proCodigo?: string | null;
  proNombre?: string;
  proDescription?: string;
  proObjetivoGeneral?: string;
  proFechaInicio?: string;
  proFechaFin?: string;
}

const formatProjectCode = (code: string | null | undefined, id: number) => {
  const normalizedCode = String(code || "").trim();
  if (normalizedCode) return normalizedCode;
  return `PRO-${String(id).padStart(6, "0")}`;
};

const getEstadoTexto = (idEstado?: number) => {
  if (idEstado === 2) return "EN PROGRESO";
  if (idEstado === 3) return "HECHO";
  return "POR HACER";
};

const VerProyectosAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    const fetchData = async () => {
      try {
        const [proyectosRes, dashboardRes] = await Promise.all([
          fetch(`${API_URL}/verpro`),
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
        ]);

        const proyectosData = proyectosRes.ok ? await proyectosRes.json() : [];
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;

        const validData = Array.isArray(proyectosData) ? proyectosData : [];
        const formatted = validData.map((item: ProyectoApi) => {
          const id = Number(item.proId || 0);
          return {
            id,
            codigo: formatProjectCode(item.proCodigo, id),
            nombre: item.proNombre || "Sin nombre",
            descripcion:
              item.proDescription || item.proObjetivoGeneral || "Sin descripcion",
            fechaInicio: item.proFechaInicio
              ? new Date(item.proFechaInicio).toLocaleDateString("es-CO")
              : "--/--/--",
            fechaFin: item.proFechaFin
              ? new Date(item.proFechaFin).toLocaleDateString("es-CO")
              : "--/--/--",
            status: getEstadoTexto(item.detParIdFk),
          };
        });

        setProyectos(formatted);
        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
      } catch (error) {
        console.error("Error cargando proyectos de admin:", error);
        setAdminName(resolveUserName(undefined, "Usuario"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return proyectos;

    return proyectos.filter(
      (proyecto) =>
        proyecto.nombre.toLowerCase().includes(term) ||
        proyecto.codigo.toLowerCase().includes(term) ||
        proyecto.status.toLowerCase().includes(term),
    );
  }, [proyectos, searchTerm]);

  const displayData = filteredProjects;

  const renderStatusBadge = (status: string) => {
    let className = "badge-por-hacer";
    if (status === "HECHO") className = "badge-hecho";
    else if (status === "EN PROGRESO") className = "badge-progreso";
    return <span className={`status-badge ${className}`}>{status}</span>;
  };

  if (loading) return <div className="loading-screen">Cargando proyectos...</div>;

  return (
    <div className="dashboard-page">
      <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Proyectos</h1>
          </div>
          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => setShowLogoutModal(true)}
          />
        </nav>

        <div className="vp-container">
          <div className="vp-header-row">
            <h2 className="vp-table-title">Lista de Proyectos</h2>

            <div className="vp-header-actions">
              <button
                type="button"
                className="vp-btn-crear"
                onClick={() => navigate("/crear-proyecto")}
              >
                <Plus size={16} />
                Crear proyecto
              </button>

              <div className="vp-search-box">
                <input
                  type="text"
                  placeholder="Buscar por codigo, nombre o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Filter size={16} color="#555" />
              </div>
            </div>
          </div>

          <div className="vp-table-card">
            <table className="vp-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre del proyecto</th>
                  <th>Descripcion del proyecto</th>
                  <th>Fecha de inicio</th>
                  <th>Fecha fin</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "center" }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((proyecto) => (
                    <tr key={proyecto.id}>
                      <td>
                        <strong>{proyecto.codigo}</strong>
                      </td>
                      <td className="vp-name-cell">{proyecto.nombre}</td>
                      <td className="vp-desc-cell">{proyecto.descripcion}</td>
                      <td>{proyecto.fechaInicio}</td>
                      <td>{proyecto.fechaFin}</td>
                      <td>{renderStatusBadge(proyecto.status)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="vp-btn-ver-mas"
                          onClick={() => navigate(`/detalle-proyecto/${proyecto.id}`)}
                        >
                          Ver mas
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#6b7280",
                      }}
                    >
                      No se encontraron proyectos con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        title="Cerrar sesion"
        confirmLabel="Si, salir"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />
    </div>
  );
};

export default VerProyectosAdmin;

