/**
 * Vista administrativa para crear proyectos.
 *
 * Reutiliza el shell del admin y agrega formularios, ayudas y feedback visual
 * para el registro de proyectos desde el panel administrativo.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../AdminDashboard.css";
import "../../crear_proyecto/CrearProyecto.css";
import "./CrearProyectoAdmin.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../session/session";
import AdminLogoutModal from "../modals/AdminLogoutModal";
import AdminProfileMenu from "../layout/AdminProfileMenu";
import AdminSidebar from "../layout/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "../session/adminSession";
import { useClickOutside } from "../hooks/useClickOutside";

interface ErrorModalState {
  show: boolean;
  title: string;
  message: string;
}

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

const CrearProyectoAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    show: false,
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    nombre: "",
    objetivo: "",
    fechaCreacion: getCurrentLocalDate(),
    fechaInicio: "",
    fechaFin: "",
  });

  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedFicha, setSelectedFicha] = useState("");

  const handleGoBack = () => {
    if (location.key !== "default" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/ver-proyectos");
  };

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    Promise.all([
      fetch(`${API_URL}/dashboard?cedula=${cedula}`),
      fetch(`${API_URL}/fichas`),
    ])
      .then(async ([dashboardRes, fichasRes]) => {
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
        const fichasData = fichasRes.ok ? await fichasRes.json() : [];

        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
        setFormData((prev) => ({ ...prev, fechaCreacion: getCurrentLocalDate() }));

        const validFichas = Array.isArray(fichasData) ? fichasData : [];
        const parsed = validFichas.map((item) => ({
          numero: String(item?.numero ?? "").trim(),
          nombre: String(item?.nombre ?? "").trim() || "Sin nombre",
          programa: String(item?.programa ?? "").trim() || "Sin programa",
          estado: String(item?.estado ?? "").trim() || "Sin estado",
        }));

        setFichas(parsed);
      })
      .catch(() => {
        setAdminName(resolveUserName(undefined, "Usuario"));
        setFichas([]);
      });
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
      if (!selectedPrograma) return;
      if (item.programa !== selectedPrograma) return;
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
          title: "Proyecto duplicado",
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
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          cedula: Number(cedula),
          fichaNumero,
        }),
      });

      if (createRes.ok) {
        setShowSuccessModal(true);
        setFormData((prev) => ({
          ...prev,
          nombre: "",
          objetivo: "",
          fechaInicio: "",
          fechaFin: "",
        }));
      } else {
        setErrorModal({
          show: true,
          title: "Error",
          message: "No se pudo registrar el proyecto.",
        });
      }
    } catch {
      setErrorModal({
        show: true,
        title: "Error de conexion",
        message: "No se pudo conectar con el servidor.",
      });
    }
  };

  return (
    <div className="dashboard-page">
      <AdminSidebar
        currentPath={location.pathname}
        onNavigate={navigate}
        onSupportClick={() => setShowHelpModal(true)}
      />

      <main className="content">
        <nav className="nav-top">
          <div className="admin-project-header">
            <button
              type="button"
              className="admin-project-back-button"
              onClick={handleGoBack}
            >
              <ArrowLeft size={18} />
              Volver
            </button>
            <div className="title-section">
              <h1>Crear Proyecto</h1>
            </div>
          </div>

          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => setShowLogoutModal(true)}
          />
        </nav>

        <section
          className="table-card"
          style={{ maxWidth: "700px", margin: "40px auto" }}
        >
          <div className="table-header">
            <h2>Informacion del Proyecto</h2>
            <span className="table-subtitle">
              Registre los detalles para habilitar el nuevo proyecto.
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "15px",
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
                  readOnly
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>

              <div className="filter-group">
                <label>Administrador Responsable</label>
                <input
                  type="text"
                  className="input-filter"
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  value={adminName}
                  readOnly
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div className="filter-group">
                <label>Fecha de Inicio (Opcional)</label>
                <input
                  type="date"
                  name="fechaInicio"
                  className="input-filter"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label>Fecha de Fin (Opcional)</label>
                <input
                  type="date"
                  name="fechaFin"
                  className="input-filter"
                  value={formData.fechaFin}
                  onChange={handleChange}
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

      <AdminLogoutModal
        isOpen={showLogoutModal}
        iconBackgroundColor="#e67e22"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />

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
              Soporte tecnico: <b>soporte@sena.edu.co</b>
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
            <div className="admin-project-feedback-icon success">
              <CheckCircle2 size={45} />
            </div>
            <h2 className="modal-title">Proyecto guardado exitosamente</h2>
            <p className="admin-project-feedback-message">
              El proyecto se registro correctamente en el sistema.
            </p>
            <button
              className="btn-confirm-logout admin-project-feedback-button success"
              onClick={() => setShowSuccessModal(false)}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {errorModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="admin-project-feedback-icon error">
              <AlertTriangle size={45} />
            </div>
            <h2 className="modal-title">{errorModal.title}</h2>
            <p className="admin-project-feedback-message">{errorModal.message}</p>
            <button
              className="btn-confirm-logout admin-project-feedback-button error"
              onClick={() => setErrorModal({ show: false, title: "", message: "" })}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearProyectoAdmin;

