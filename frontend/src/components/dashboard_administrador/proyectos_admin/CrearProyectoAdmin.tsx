import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../../assets/sena.png";
import "../../dashboard_instructor/Dashboard.css";
import "../../crear_proyecto/CrearProyecto.css";
import { API_URL } from "../../../config/Api";
import { ADMIN_MENU_ITEMS } from "../AdminMenuItems";

interface ErrorModalState {
  show: boolean;
  title: string;
  message: string;
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

  const [adminName, setAdminName] = useState("Administrador");
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

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    const roleId = (localStorage.getItem("userRoleId") || "").trim();

    if (!cedula) {
      navigate("/");
      return;
    }

    if (roleId === "2") {
      navigate("/dashboard-instructor");
      return;
    }

    if (roleId && roleId !== "3") {
      navigate("/student-dashboard");
      return;
    }

    fetch(`${API_URL}/dashboard?cedula=${cedula}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setAdminName(data?.instructor || "Administrador SENA");
        setFormData((prev) => ({ ...prev, fechaCreacion: getCurrentLocalDate() }));
      })
      .catch(() => setAdminName("Administrador SENA"));
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedula = localStorage.getItem("userCedula");

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
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo" className="logo-lg" />
          <h2>Gestion de proyectos</h2>
        </div>

        <nav className="menu">
          <p className="menu-title">MENU</p>
          <ul>
            {ADMIN_MENU_ITEMS.map((item) => (
              <li
                key={item.name}
                className={
                  item.path === "/dashboard"
                    ? ["/dashboard", "/dashboard-administrador"].includes(
                        location.pathname,
                      )
                      ? "active"
                      : ""
                    : location.pathname === item.path
                      ? "active"
                      : ""
                }
                onClick={() => navigate(item.path)}
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
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{adminName}</span>
            <ChevronDown size={18} />
            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar
                  Sesion
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
            <h2>Informacion del Proyecto</h2>
            <span className="table-subtitle">
              Registre los detalles para habilitar el nuevo proyecto.
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
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

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#e67e22" }}
            >
              <AlertTriangle size={45} color="white" />
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
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#39A900" }}
            >
              <CheckCircle2 size={45} color="white" />
            </div>
            <h2 className="modal-title">Proyecto registrado</h2>
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

      {errorModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              className="warning-icon-container"
              style={{ backgroundColor: "#E74C3C" }}
            >
              <AlertTriangle size={45} color="white" />
            </div>
            <h2 className="modal-title">{errorModal.title}</h2>
            <p style={{ textAlign: "center", color: "#666" }}>
              {errorModal.message}
            </p>
            <button
              className="btn-confirm-logout"
              onClick={() => setErrorModal({ show: false, title: "", message: "" })}
              style={{ width: "100%" }}
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
