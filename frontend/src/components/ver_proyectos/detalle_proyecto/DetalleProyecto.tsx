import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Home, Users, Plus, MapPin, Eye, List, FileText, 
    User, ChevronDown, LogOut, ChevronLeft 
} from 'lucide-react'; 
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 

// ==========================================================
// INTERFACES
// ==========================================================
interface ProyectoData {
  id: number;
  nombre: string;
  objetivo: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
  fechaAsignacion?: string; 
  fechaFin?: string;
}

interface Miembro {
    nombre: string;
    rol: string;
}

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

// ==========================================================
// COMPONENTE SIDEBAR (Barra Lateral)
// ==========================================================
const Sidebar = ({ navigate }: { navigate: (path: string) => void }) => {
    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, active: true, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];
    const settingsItems = [{ name: 'Ayuda / Soporte', icon: FileText, path: '/ayuda' }];
    
    return (
        <aside className="side-card">
            <div className="brand-block">
                <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                <h2>Gestión de proyectos</h2>
            </div>
            <nav className="menu">
                <p className="menu-title">MENU</p>
                <ul>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <li 
                                key={item.name} 
                                className={item.path === '/ver-proyectos' ? 'active' : ''} 
                                onClick={() => item.path && navigate(item.path)}
                            >
                                <Icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="settings">
                <p className="menu-title">SETTINGS</p>
                <ul>
                    {settingsItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <li key={item.name} onClick={() => item.path && navigate(item.path)}>
                                <Icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}

// ==========================================================
// COMPONENTE PRINCIPAL (DetalleProyecto)
// ==========================================================
const DetalleProyecto: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const [proyecto, setProyecto] = useState<ProyectoData | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]); 
  const [cargando, setCargando] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [instructorName, setInstructorName] = useState('Cargando...'); 

  // --- 1. CARGAR NOMBRE INSTRUCTOR ---
  const cargarNombreInstructor = async (cedula: string, token: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setInstructorName(response.data.instructor || 'Usuario SENA');
    } catch (error) {
        console.error("Error cargando nombre de instructor:", error);
        setInstructorName('Error de perfil');
    }
  };
  
  // --- 2. CARGAR DETALLES DEL PROYECTO ---
  const cargarDetallesProyecto = async (projectId: number) => {
    try {
        const [proyectoResponse, miembrosResponse] = await Promise.all([
            axios.get<ProyectoData>(`${API_BASE_URL}/detalle-proyecto/${projectId}`),
            axios.get<Miembro[]>(`${API_BASE_URL}/integrantes/${projectId}`)
        ]);
        
        const dataConFechas: ProyectoData = {
            ...proyectoResponse.data,
            fechaAsignacion: '11/Feb/2025', 
            fechaFin: '15/Dic/2027',
        };

        setProyecto(dataConFechas);
        setMiembros(miembrosResponse.data);
        
    } catch (error) {
        console.error('Error cargando los detalles del proyecto:', error);
        setProyecto(null);
        setMiembros([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const cedula = localStorage.getItem('userCedula');

    if (!token || !cedula) {
        navigate('/');
        return;
    }
    
    cargarNombreInstructor(cedula, token);
    
    if (id) {
        cargarDetallesProyecto(Number(id)).then(() => setCargando(false));
    } else {
        setCargando(false);
    }
    
  }, [id, navigate]);

  // --- MANEJO DE BOTONES DE ACCIÓN (NAVEGACIÓN) ---
  const handleAccion = (accion: string) => {
    if (accion === 'editar-integrantes') {
        navigate(`/proyecto/${id}/editar-integrantes`);
    } else if (accion === 'historia-usuario') {
        navigate(`/proyecto/${id}/historias-usuario`);
    } else if (accion === 'criterios-aceptacion') {
        navigate(`/proyecto/${id}/criterios-aceptacion`);
    } else if (accion === 'ver-reuniones') {
        navigate(`/proyecto/${id}/ver-reuniones`);
    } else if (accion === 'crear-sugerencias') {
        navigate(`/proyecto/${id}/crear-sugerencias`);
    } else {
        alert(`Acción: ${accion} (Se debe implementar la navegación o modal correspondiente)`);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
        localStorage.clear();
        navigate('/');
    }
  };
  
  // 🟢 FUNCIÓN RETROCEDER
  const handleGoBack = () => {
    navigate(-1); 
  };


  // --- RENDERIZADO CONDICIONAL (Loading / Error) ---
  if (cargando) {
    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />
            <div className="main-content-area loading-overlay">Cargando proyecto...</div>
        </div>
    );
  }
  
  if (!proyecto) {
    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />
            <div className="main-content-area error-msg">
                <h1>Error</h1>
                <p>No se pudo encontrar o cargar el proyecto con ID {id}.</p>
            </div>
        </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="dashboard-page">
      
      <Sidebar navigate={navigate} />

      <div className="main-content-area">
        
        {/* Navbar Superior */}
        <nav className="nav-top">
            <div className="title-section detail-title-container">
                <button className="btn-back" onClick={handleGoBack}>
                    <ChevronLeft size={20} />
                </button>
                <h1>Lista de proyectos / <span className="current-page">Ver Más</span></h1>
            </div>

            <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`} className="profile-img" alt="Avatar"/>
                <span className="profile-name">{instructorName}</span>
                <ChevronDown size={18} style={{color: '#999'}}/>
                
                {isMenuOpen && (
                    <ul className="dropdown-profile">
                        <li><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                        <li className="logout" onClick={handleLogout}>
                            <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                        </li>
                    </ul>
                )}
            </div>
        </nav>
        
        {/* Botones de Acción */}
        <div className="action-buttons-container">
          <button onClick={() => handleAccion('editar-integrantes')} className="btn-action primary">Editar integrantes</button>
          
          <button onClick={() => handleAccion('historia-usuario')} className="btn-action primary">Historia de usuario</button>
          
          <button onClick={() => handleAccion('criterios-aceptacion')} className="btn-action primary">Criterios de aceptación</button>
          
          <button onClick={() => handleAccion('ver-reuniones')} className="btn-action primary">Ver reuniones</button>
          
          <button onClick={() => handleAccion('crear-sugerencias')} className="btn-action primary">Crear sugerencias</button>
        </div>

        {/* Info Grid (Tarjetas) */}
        <div className="info-grid">
          
          {/* Tarjeta 1: Información */}
          <div className="card-info">
            <h3>Información del Proyecto</h3>
            <div className="info-detail-row">
              <label>Nombre</label>
              <span>{proyecto.nombre}</span>
            </div>
            <div className="info-detail-row">
              <label>Fecha de asignación</label>
              <span>{proyecto.fechaAsignacion}</span>
            </div>
            <div className="info-detail-row">
              <label>Fecha fin</label>
              <span>{proyecto.fechaFin}</span>
            </div>
            <div className="info-detail-row">
              <label>Estado</label>
              <span className="status-active">{proyecto.estado}</span>
            </div>
          </div>
          
          {/* Tarjeta 2: Miembros */}
          <div className="card-info">
            <h3>Miembros del Proyecto</h3>
            {miembros.length > 0 ? (
                miembros.map((miembro, index) => (
                    <div key={index} className="info-detail-row">
                        <label>{miembro.nombre}</label>
                        <span>{miembro.rol}</span>
                    </div>
                ))
            ) : (
                 <div className="info-detail-row">
                    <span style={{textAlign: 'center', width: '100%', color: '#999'}}>No hay integrantes asignados.</span>
                </div>
            )}
          </div>
        </div>

        {/* Objetivo General */}
        <div className="objetivo-general-section">
          <h2>Objetivo General</h2>
          <p className="description-text">
            {proyecto.objetivo}
          </p>
          <p className="description-text detailed-description">
              {proyecto.descripcion}
          </p>
        </div>

      </div>
    </div>
  );
};

export default DetalleProyecto;