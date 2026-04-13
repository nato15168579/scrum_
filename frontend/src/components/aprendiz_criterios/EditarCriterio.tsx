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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import { API_URL } from "../../config/Api";
import "./FormCriterioAceptacion.css";
import "./CriteriosAceptacion.css";

type CriterioDetalle = {
  id: number;
  hisId: number;
  contexto: string;
  evento: string;
  resultado: string;
  estadoId: number;
  tiempo: string | null;
};

const EditarCriterio: React.FC = () => {
  const { id } = useParams();
  const caId = Number(id);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  // Campos
  const [hisId, setHisId] = useState<number>(0);
  const [contexto, setContexto] = useState("");
  const [evento, setEvento] = useState("");
  const [resultado, setResultado] = useState("");
  const [estadoId, setEstadoId] = useState<number>(1);
  const [tiempo, setTiempo] = useState<string>("");

  const [loading, setLoading] = useState(true);

  // Validación
  const [touched, setTouched] = useState({
    contexto: false,
    evento: false,
    resultado: false,
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
    const t = tiempo.trim();
    const tiempoOk = t === "" ? true : Number.isFinite(Number(t)) && Number(t) > 0;

    return {
      contexto: !isEmpty(contexto),
      evento: !isEmpty(evento),
      resultado: !isEmpty(resultado),
      tiempo: tiempoOk,
    };
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    if (!Number.isFinite(caId) || caId <= 0) {
      alert("ID inválido");
      navigate("/aprendiz/criterios-aceptacion");
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/criterios-aceptacion/${caId}?cedula=${cedula}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CriterioDetalle) => {
        setHisId(data.hisId);
        setContexto(data.contexto ?? "");
        setEvento(data.evento ?? "");
        setResultado(data.resultado ?? "");
        setEstadoId(Number(data.estadoId ?? 1));
        setTiempo(data.tiempo ?? "");
      })
      .catch((e) => {
        console.error("Error cargando criterio:", e);
        alert("No se pudo cargar el criterio.");
        navigate("/aprendiz/criterios-aceptacion");
      })
      .finally(() => setLoading(false));
  }, [caId, navigate]);

  const onGuardar = async () => {
    const v = validate();
    setTouched({ contexto: true, evento: true, resultado: true, tiempo: true });
    if (!v.contexto || !v.evento || !v.resultado || !v.tiempo) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) return navigate("/");

    try {
      const res = await fetch(`${API_URL}/criterios-aceptacion/${caId}?cedula=${cedula}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contexto,
          evento,
          resultado,
          estadoId,
          tiempo: tiempo.trim() === "" ? null : tiempo.trim(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      navigate("/aprendiz/criterios-aceptacion");
    } catch (e) {
      console.error("Error actualizando CA:", e);
      alert("No se pudo guardar. Revisa backend/ruta.");
    }
  };

  const v = validate();

  if (loading) return <div className="loading-screen">Cargando...</div>;

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
                className={location.pathname === item.path ? "active" : ""}
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
              <h2 className="ca-form-title">Editar criterio de aceptación</h2>

              <label className="ca-form-label">
                Id Historia de usuario<span className="ca-required">*</span>
              </label>
              <input className="ca-input ca-input-small" value={hisId} disabled />

              <label className="ca-form-label">
                Contexto<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-textarea"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, contexto: true }))}
              />
              {touched.contexto && !v.contexto && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <label className="ca-form-label">
                Evento<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-textarea"
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, evento: true }))}
              />
              {touched.evento && !v.evento && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <label className="ca-form-label">
                Resultado<span className="ca-required">*</span>
              </label>
              <textarea
                className="ca-textarea"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, resultado: true }))}
              />
              {touched.resultado && !v.resultado && <div className="ca-error">¡Por favor, llenar este campo!</div>}

              <div className="ca-row-3">
                <div>
                  <label className="ca-form-label">
                    Estado<span className="ca-required">*</span>
                  </label>
                  <select
                    className="ca-input"
                    value={estadoId}
                    onChange={(e) => setEstadoId(Number(e.target.value))}
                  >
                    <option value={1}>pendiente</option>
                    <option value={2}>en proceso</option>
                    <option value={3}>finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="ca-form-label">Tiempo</label>
                  <input
                    className="ca-input"
                    placeholder="Horas"
                    value={tiempo}
                    onChange={(e) => setTiempo(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, tiempo: true }))}
                  />
                  {touched.tiempo && !v.tiempo && <div className="ca-error">Tiempo inválido.</div>}
                </div>

                <div>
                  <label className="ca-form-label">Responsable</label>
                  <input className="ca-input" value={"-"} disabled />
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

export default EditarCriterio;
