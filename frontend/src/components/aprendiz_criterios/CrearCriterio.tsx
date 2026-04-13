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

import "./FormCriterioAceptacion.css";
import "./CriteriosAceptacion.css";

type HUOption = { id: number; titulo: string };

const CrearCriterio: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState("Usuario SENA");

  const [huOptions, setHuOptions] = useState<HUOption[]>([]);
  const [hisId, setHisId] = useState<string>("");

  const [contexto, setContexto] = useState("");
  const [evento, setEvento] = useState("");
  const [resultado, setResultado] = useState("");

  const [estadoId, setEstadoId] = useState<string>("1"); // Pendiente
  const [tiempo, setTiempo] = useState("");

  const [touched, setTouched] = useState({
    hisId: false,
    contexto: false,
    evento: false,
    resultado: false,
    estadoId: false,
    tiempo: false,
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

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isEmpty = (v: string) => !v || !v.trim();

  const buildDescripcion = () =>
    `Contexto: ${contexto.trim()}\nEvento: ${evento.trim()}\nResultado: ${resultado.trim()}`;

  const validate = () => ({
    hisId: Number(hisId) > 0,
    contexto: !isEmpty(contexto),
    evento: !isEmpty(evento),
    resultado: !isEmpty(resultado),
    estadoId: ["1", "2", "3"].includes(estadoId),
    tiempo: !isEmpty(tiempo),
  });

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      void navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName?.trim()) setDisplayName(storedName);

    // ✅ NUEVA RUTA: NO TOCA HU
    fetch(`${API_URL}/aprendiz/criterios-aceptacion/historias?cedula=${cedula}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setHuOptions(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("Error cargando HU para select:", e);
        setHuOptions([]);
      });
  }, [navigate]);

  const onGuardar = async () => {
    const v = validate();
    setTouched({
      hisId: true,
      contexto: true,
      evento: true,
      resultado: true,
      estadoId: true,
      tiempo: true,
    });

    if (!v.hisId || !v.contexto || !v.evento || !v.resultado || !v.estadoId || !v.tiempo) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      void navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/criterios-aceptacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: Number(cedula),
          hisId: Number(hisId),
          descripcion: buildDescripcion(),
          estadoId: Number(estadoId),
          tiempo: tiempo.trim(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      navigate("/aprendiz/criterios-aceptacion");
    } catch (e) {
      console.error("Error creando CA:", e);
      alert("No se pudo guardar. Revisa el backend.");
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
                className={location.pathname.startsWith(item.path) ? "active" : ""}
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
            <h1>Criterios de aceptación</h1>
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
          <div className="ca-form-page">
            <div className="ca-form-card">
              <h2 className="ca-form-title">Crear criterios de aceptación</h2>

              <label className="ca-form-label">
                Id Historia de usuario<span className="ca-required">*</span>
              </label>

              <select
                className="ca-input"
                value={hisId}
                onChange={(e) => setHisId(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, hisId: true }))}
              >
                <option value="">Selecciona...</option>
                {huOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.id} - {h.titulo}
                  </option>
                ))}
              </select>

              {touched.hisId && !v.hisId && <div className="ca-error">Selecciona una HU.</div>}

              <label className="ca-form-label">
                Contexto<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-input ca-textarea"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, contexto: true }))}
              />
              {touched.contexto && !v.contexto && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <label className="ca-form-label">
                Evento<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-input ca-textarea"
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, evento: true }))}
              />
              {touched.evento && !v.evento && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <label className="ca-form-label">
                Resultado<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-input ca-textarea"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, resultado: true }))}
              />
              {touched.resultado && !v.resultado && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <div className="ca-row">
                <div>
                  <label className="ca-form-label">
                    Estado<span className="ca-required">*</span>
                  </label>
                  <select
                    className="ca-input"
                    value={estadoId}
                    onChange={(e) => setEstadoId(e.target.value)}
                  >
                    <option value="1">Pendiente</option>
                    <option value="2">En proceso</option>
                    <option value="3">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="ca-form-label">
                    Tiempo<span className="ca-required">*</span>
                  </label>
                  <input
                    className="ca-input"
                    placeholder="Horas"
                    value={tiempo}
                    onChange={(e) => setTiempo(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, tiempo: true }))}
                  />
                  {touched.tiempo && !v.tiempo && <div className="ca-error">Ingresa el tiempo.</div>}
                </div>
              </div>

              <div className="ca-form-actions">
                <button className="btn-back" onClick={() => navigate(-1)}>
                  Volver
                </button>

                <div className="ca-form-right">
                  <button className="btn-cancel" onClick={() => navigate("/aprendiz/criterios-aceptacion")}>
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

export default CrearCriterio;
