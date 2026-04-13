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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import { API_URL } from "../../config/Api";
import "./FormHistoriaUsuario.css";
import "../aprendiz_historias/HistoriasUsuario.css";

const CrearHistoria: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  const [como, setComo] = useState("");
  const [quiero, setQuiero] = useState("");
  const [para, setPara] = useState("");
  const [puntaje, setPuntaje] = useState<string>("");

  const [touched, setTouched] = useState({
    como: false,
    quiero: false,
    para: false,
    puntaje: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-aprendiz" },
    { name: "Mi Proyecto", icon: Briefcase, path: "/aprendiz/mi-proyecto" },
    { name: "Historias de usuario", icon: ClipboardList, path: "/aprendiz/historias-usuario" },
    { name: "Criterios de aceptación", icon: CheckSquare, path: "/aprendiz/criterios-aceptacion" },
    { name: "Reuniones", icon: Calendar, path: "/aprendiz/reuniones" },
    { name: "Observaciones", icon: Eye, path: "/aprendiz/observaciones" },
  ];

  const isActive = (path: string) => {
    if (path === "/aprendiz/historias-usuario") {
      return location.pathname.startsWith("/aprendiz/historias-usuario");
    }
    return location.pathname === path;
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim()) setDisplayName(storedName);
  }, [navigate]);

  const isEmpty = (v: string) => !v || !v.trim();

  const validate = () => {
    const scoreNum = Number(puntaje);
    const puntajeOk = Number.isFinite(scoreNum) && scoreNum >= 1 && scoreNum <= 10;

    return {
      como: !isEmpty(como),
      quiero: !isEmpty(quiero),
      para: !isEmpty(para),
      puntaje: puntajeOk,
    };
  };

  const onGuardar = async () => {
    const v = validate();
    setTouched({ como: true, quiero: true, para: true, puntaje: true });
    if (!v.como || !v.quiero || !v.para || !v.puntaje) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const titulo = quiero.trim();
    const descripcion = `Como ${como.trim()} quiero ${quiero.trim()} para ${para.trim()}`;

    try {
      const res = await fetch(`${API_URL}/historias-usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: Number(cedula),
          titulo,
          descripcion,
          puntaje: Number(puntaje),
          prioridad: null,
          numeroSprint: null,
          estadoId: null,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      navigate("/aprendiz/historias-usuario");
    } catch (e: any) {
      console.error("Error creando HU:", e);
      alert(`No se pudo guardar. ${String(e.message ?? e)}`);
    }
  };

  const v = validate();

  return (
    <div className="dashboard-aprendiz">
      {/* SIDEBAR */}
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
                className={isActive(item.path) ? "active" : ""}
              >
                <item.icon size={18} style={{ marginRight: "10px" }} />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>

        <div className="settings-footer" style={{ marginTop: "auto", padding: "10px 0" }}>
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
            <HelpCircle size={18} style={{ marginRight: "10px", color: "#39A900" }} />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Historias de usuario</h1>
          </div>

          <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <div className="hu-form-page">
            <div className="hu-form-card">
              <h2 className="hu-form-title">Crear historias de usuario</h2>
              <p className="hu-form-desc">
                Las historias de usuario se escriben con la fórmula "Como, quiero, para", definiendo al usuario, su
                necesidad y el propósito; a cada una se le asigna un puntaje que mide el esfuerzo y ayuda a planificar el
                trabajo en los sprints.
              </p>

              <label className="hu-form-label">
                Como<span className="hu-required">*</span>
              </label>
              <input
                className="hu-input"
                value={como}
                onChange={(e) => setComo(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, como: true }))}
              />
              {touched.como && !v.como && <div className="hu-error">¡Por favor, llenar este campo!</div>}

              <label className="hu-form-label">
                Quiero<span className="hu-required">*</span>
              </label>
              <input
                className="hu-input"
                value={quiero}
                onChange={(e) => setQuiero(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, quiero: true }))}
              />
              {touched.quiero && !v.quiero && <div className="hu-error">¡Por favor, llenar este campo!</div>}

              <label className="hu-form-label">
                Para<span className="hu-required">*</span>
              </label>
              <input
                className="hu-input"
                value={para}
                onChange={(e) => setPara(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, para: true }))}
              />
              {touched.para && !v.para && <div className="hu-error">¡Por favor, llenar este campo!</div>}

              <label className="hu-form-label">
                Puntaje<span className="hu-required">*</span>
              </label>
              <input
                className="hu-input hu-input-score"
                type="number"
                min={1}
                max={10}
                placeholder="1-10"
                value={puntaje}
                onChange={(e) => setPuntaje(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, puntaje: true }))}
              />
              {touched.puntaje && !v.puntaje && <div className="hu-error">El puntaje debe estar entre 1 y 10.</div>}

              <div className="hu-form-actions">
                <button className="btn-back" onClick={() => navigate(-1)}>
                  Volver
                </button>

                <div className="hu-form-right">
                  <button className="btn-cancel" onClick={() => navigate("/aprendiz/historias-usuario")}>
                    Cancelar
                  </button>
                  <button className="btn-save" onClick={onGuardar}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={45} color="#E74C3C" style={{ marginBottom: "15px" }} />
            <h2 className="modal-title">¿Estás seguro?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Sí, Cerrar
              </button>
              <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearHistoria;
