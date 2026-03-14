import { useEffect, useRef, useState } from "react";
import { Eye, History } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CambiosDelSistema.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../session/session";
import AdminLogoutModal from "../modals/AdminLogoutModal";
import AdminProfileMenu from "../layout/AdminProfileMenu";
import AdminSidebar from "../layout/AdminSidebar";
import AdminTimedAlert from "../feedback/AdminTimedAlert";
import { logoutAndRedirect, requireAdminAccess } from "../session/adminSession";
import { useClickOutside } from "../hooks/useClickOutside";

interface CambioSistemaUsuarioInfo {
  cedula: string;
  nombres: string;
  apellidos: string;
  rol: string;
}

interface CambioSistemaItem {
  id: number;
  descripcion: string;
  fecha?: string | null;
  observado?: boolean;
  usuario: CambioSistemaUsuarioInfo;
}

const parseCambiosResponse = (payload: unknown): CambioSistemaItem[] => {
  const cambios = (payload as { cambios?: unknown })?.cambios;
  if (!Array.isArray(cambios)) {
    return [];
  }

  return cambios.filter(Boolean) as CambioSistemaItem[];
};

const CambiosDelSistemaAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [cambios, setCambios] = useState<CambioSistemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const [timedAlert, setTimedAlert] = useState<{
    id: number;
    title: string;
    description?: string;
  } | null>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const fetchCambios = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/cambios-sistema?estado=pendiente&limit=200`,
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setCambios([]);
        return;
      }

      setCambios(parseCambiosResponse(data));
    } catch (error) {
      console.error("Error cargando cambios del sistema:", error);
      setCambios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    fetch(`${API_URL}/dashboard?cedula=${cedula}`)
      .then((res) => res.json())
      .then((data) => {
        setAdminName(resolveUserName(data?.instructor, "Usuario"));
      })
      .catch((err) => {
        console.error("Error perfil:", err);
        setAdminName(resolveUserName(undefined, "Usuario"));
      });

    void fetchCambios();
  }, [navigate]);

  const markAsObserved = async (id: number) => {
    setMarkingId(id);

    try {
      const response = await fetch(`${API_URL}/cambios-sistema/${id}/observado`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("No fue posible marcar la observacion como vista.");
      }

      setCambios((prev) => prev.filter((item) => item.id !== id));
      setTimedAlert({
        id: Date.now(),
        title: "Observacion marcada como vista",
        description: "Se movio al historial de observaciones.",
      });
    } catch (error) {
      console.error("Error marcando observado:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo actualizar",
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return <div className="loading-screen">Cargando cambios del sistema...</div>;
  }

  return (
    <div className="dashboard-page">
      <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Cambios del sistema</h1>
          </div>
          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => setShowLogoutModal(true)}
            showProfileItem
          />
        </nav>

        <div className="cambios-system-wrapper">
          <section className="cambios-system-card">
            <header className="cambios-system-header">
              <div className="cambios-system-title">
                <h2>Pendientes</h2>
                <span>
                  Revisa los cambios realizados y marcalos como observados para
                  moverlos al historial.
                </span>
              </div>

              <div className="cambios-system-actions">
                <button
                  type="button"
                  className="cambios-system-btn"
                  onClick={() => void fetchCambios()}
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  className="cambios-system-btn"
                  onClick={() => navigate("/cambios-del-sistema/historial")}
                >
                  <History size={16} />
                  Historial de observaciones
                </button>
              </div>
            </header>

            <table className="cambios-system-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripcion</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th className="cambios-system-action-cell">Accion</th>
                </tr>
              </thead>
              <tbody>
                {cambios.length > 0 ? (
                  cambios.map((item) => {
                    const fullName = `${item.usuario.nombres} ${item.usuario.apellidos}`.trim();
                    return (
                      <tr key={item.id}>
                        <td className="cambios-system-cell-muted">{item.id}</td>
                        <td>{item.descripcion || "Sin descripcion"}</td>
                        <td>{fullName || item.usuario.cedula || "Sin usuario"}</td>
                        <td>{item.usuario.rol || "Sin rol"}</td>
                        <td className="cambios-system-action-cell">
                          <button
                            type="button"
                            className="cambios-system-eye-btn"
                            onClick={() => void markAsObserved(item.id)}
                            disabled={markingId === item.id}
                            aria-label="Marcar como observado"
                            title="Marcar como observado"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="cambios-system-empty">
                      No hay cambios pendientes por observar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />

      {timedAlert ? (
        <AdminTimedAlert
          key={timedAlert.id}
          title={timedAlert.title}
          description={timedAlert.description}
          durationMs={5000}
          zIndex={2600}
          onClose={() => setTimedAlert(null)}
        />
      ) : null}
    </div>
  );
};

export default CambiosDelSistemaAdmin;
