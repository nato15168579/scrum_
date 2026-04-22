import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home, Users, Plus, MapPin, Eye, List, ChevronDown, LogOut, 
  AlertTriangle, HelpCircle, CheckCircle2, User
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "../dashboard_instructor/Dashboard.css";
import "./CrearProyecto.css";
import { API_URL } from "../../config/Api";
import { resolveUserName } from "../../session/session";

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

const CrearProyecto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [instructorName, setInstructorName] = useState("Usuario");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "",
    message: "",
  });
  
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedFicha, setSelectedFicha] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    objetivo: "",
    fechaCreacion: getCurrentLocalDate(),
  });

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard" },
    { name: "Lista de Aprendices", icon: Users, path: "/lista-aprendices" },
    { name: "Crear Proyecto", icon: Plus, path: "/crear-proyecto" },
    { name: "Asignar Proyectos", icon: MapPin, path: "/asignar-proyectos" },
    { name: "Ver Proyectos", icon: Eye, path: "/ver-proyectos" },
    { name: "Registrar Aprendiz", icon: List, path: "/registrar-aprendiz" },
  ];

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) { navigate("/"); return; }

    Promise.all([
      fetch(`${API_URL}/dashboard?cedula=${cedula}`),
      fetch(`${API_URL}/fichas`),
    ])
      .then(async ([dashboardRes, fichasRes]) => {
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
        const fichasData = fichasRes.ok ? await fichasRes.json() : [];

        const parsedFichas: FichaOption[] = (Array.isArray(fichasData) ? fichasData : []).map((item) => ({
          numero: String(item?.numero ?? "").trim(),
          nombre: String(item?.nombre ?? "").trim() || "Sin nombre",
          programa: String(item?.programa ?? "").trim() || "Sin programa",
          estado: String(item?.estado ?? "").trim() || "Sin estado",
        }));

        setInstructorName(resolveUserName(dashboardData?.instructor, "Usuario"));
        setFichas(parsedFichas);
      })
      .catch(() => setInstructorName("Usuario"));
  }, [navigate]);

  // Lógica de filtrado de Fichas
  const programas = useMemo(() => {
    const set = new Set<string>();
    fichas.forEach((item) => {
      if (item.estado.toLowerCase() === "activa" && item.programa !== "Sin programa") set.add(item.programa);
    });
    return Array.from(set).sort();
  }, [fichas]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    fichas.forEach((item) => {
      if (item.estado.toLowerCase() === "activa" && item.programa === selectedPrograma) set.add(item.nombre);
    });
    return Array.from(set).sort();
  }, [fichas, selectedPrograma]);

  const fichasFiltradas = useMemo(() => {
    return fichas
      .filter((item) => item.estado.toLowerCase() === "activa" && 
             (selectedPrograma ? item.programa === selectedPrograma : true) &&
             (selectedArea ? item.nombre === selectedArea : true))
      .sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [fichas, selectedArea, selectedPrograma]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedula = localStorage.getItem("userCedula");
    if (!selectedFicha) {
      setErrorModal({ show: true, title: "Ficha requerida", message: "Selecciona una ficha válida." });
      return;
    }

    try {
      const checkRes = await fetch(`${API_URL}/check-project?nombre=${encodeURIComponent(formData.nombre)}`);
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setErrorModal({ show: true, title: "Proyecto Duplicado", message: "Este nombre ya está en uso." });
        return;
      }

      const createRes = await fetch(`${API_URL}/create-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cedula: Number(cedula),
          fichaNumero: Number(selectedFicha),
        }),
      });

      if (createRes.ok) {
        setShowSuccessModal(true);
        setFormData(prev => ({ ...prev, nombre: "", objetivo: "" }));
      }
    } catch {
      setErrorModal({ show: true, title: "Error", message: "Error de conexión." });
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo" className="logo-lg" />
          <h2>Gestión de Proyectos</h2>
        </div>
        <nav className="menu">
          <p className="menu-title">MENÚ</p>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className={location.pathname === item.path ? "active" : ""} onClick={() => navigate(item.path)}>
                <item.icon size={18} style={{ marginRight: "10px" }} /> {item.name}
              </li>
            ))}
          </ul>
        </nav>
        <div className="settings-footer" style={{ marginTop: "auto" }}>
          <p className="menu-title">SETTINGS</p>
          <div className="support-item" onClick={() => navigate("/ayuda-soporte")} style={{ cursor: "pointer" }}>
            <HelpCircle size={18} style={{ marginRight: "10px", color: "#39A900" }} />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section"><h1>Crear Proyecto</h1></div>
          <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" />
            <span className="profile-name">{instructorName}</span>
            <ChevronDown size={18} />
            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <div className="table-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="table-header">
                <h3>Nuevo Registro de Proyecto</h3>
                <p className="welcome-subtitle" style={{marginTop: '5px'}}>Complete los campos para habilitar un nuevo proyecto en el sistema.</p>
              </div>

              <form onSubmit={handleSubmit} className="form-container" style={{ padding: '25px' }}>
                <div className="filters-grid" style={{ marginBottom: '20px' }}>
                  <div className="filter-group">
                    <label>Programa de Formación</label>
                    <select className="input-filter" value={selectedPrograma} onChange={(e) => { setSelectedPrograma(e.target.value); setSelectedArea(""); setSelectedFicha(""); }} required>
                      <option value="">Seleccionar Programa</option>
                      {programas.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Área / Especialidad</label>
                    <select className="input-filter" value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setSelectedFicha(""); }} disabled={!selectedPrograma} required>
                      <option value="">Seleccionar Área</option>
                      {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Ficha</label>
                    <select className="input-filter" value={selectedFicha} onChange={(e) => setSelectedFicha(e.target.value)} disabled={!selectedArea} required>
                      <option value="">Seleccionar Ficha</option>
                      {fichasFiltradas.map(f => <option key={f.numero} value={f.numero}>{f.numero}</option>)}
                    </select>
                  </div>
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                  <label>Nombre del Proyecto</label>
                  <input type="text" name="nombre" className="input-filter" value={formData.nombre} onChange={handleChange} placeholder="Ej: Sistema de Gestión de Inventarios" required />
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                  <label>Objetivo General</label>
                  <textarea name="objetivo" className="input-filter" style={{ minHeight: "100px", resize: 'vertical' }} value={formData.objetivo} onChange={handleChange} placeholder="Describa el propósito principal..." required />
                </div>

                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Fecha de Creación</label>
                    <input type="date" name="fechaCreacion" className="input-filter" value={formData.fechaCreacion} onChange={handleChange} />
                  </div>
                  <div className="filter-group">
                    <label>Instructor Responsable</label>
                    <input type="text" className="input-filter" style={{ backgroundColor: "#f0f0f0", fontWeight: 'bold' }} value={instructorName} readOnly />
                  </div>
                </div>

                <button type="submit" className="btn-search-indicator" style={{ width: "100%", marginTop: "30px", height: '48px', fontSize: '1rem' }}>
                  <Plus size={18} style={{marginRight: '8px'}}/> REGISTRAR PROYECTO
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Modales unificados */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container"><AlertTriangle size={45} color="white" /></div>
            <h2 className="modal-title">¿Cerrar sesión?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={() => { localStorage.clear(); navigate("/"); }}>Si, Salir</button>
              <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Volver</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container" style={{ backgroundColor: "#39A900" }}><CheckCircle2 size={45} color="white" /></div>
            <h2 className="modal-title">¡Éxito!</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>Proyecto registrado correctamente.</p>
            <button className="btn-confirm-logout" onClick={() => setShowSuccessModal(false)} style={{ width: "100%" }}>Continuar</button>
          </div>
        </div>
      )}
      {errorModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container" style={{ backgroundColor: "#ef4444" }}>
              <AlertTriangle size={45} color="white" />
            </div>
            <h2 className="modal-title">{errorModal.title || "Error"}</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
              {errorModal.message || "No fue posible completar la operacion."}
            </p>
            <button
              className="btn-confirm-logout"
              onClick={() => setErrorModal({ show: false, title: "", message: "" })}
              style={{ width: "100%", backgroundColor: "#ef4444" }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearProyecto;
