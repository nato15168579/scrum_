import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, ChevronLeft, AlertTriangle, User, HelpCircle 
} from 'lucide-react'; 
import senaLogo from '../../../assets/sena.png'; 
import './DetalleProyecto.css'; 
import { API_URL } from '../../../config/Api';

// --- INTERFACES ---
interface ProyectoData {
    id: number;
    nombre: string;
    objetivo: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    estadoId: number; 
}

interface Miembro {
    nombre: string;
    rol: string;
}

const DetalleProyecto: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [proyecto, setProyecto] = useState<ProyectoData | null>(null);
    const [miembros, setMiembros] = useState<Miembro[]>([]); 
    const [cargando, setCargando] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

    // Cierre de sesión
    const confirmLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) {
            navigate('/'); 
            return;
        }

        const fetchData = async () => {
            setCargando(true);
            try {
                // Info del Instructor
                const profileRes = await axios.get(`${API_URL}/dashboard?cedula=${cedula}`);
                if (profileRes.data?.instructor) setInstructorName(profileRes.data.instructor);

                // Info del Proyecto e Integrantes
                const [proRes, miembrosRes] = await Promise.all([
                    axios.get(`${API_URL}/verpro/${id}`),
                    axios.get(`${API_URL}/integrantes/${id}`).catch(() => ({ data: [] }))
                ]);

                const p = proRes.data;
                if (p) {
                    setProyecto({
                        id: p.proId || Number(id),
                        nombre: p.proNombre || 'Sin nombre',
                        objetivo: p.proObjetivoGeneral || 'Sin objetivo definido',
                        descripcion: p.proDescripcion || p.proJustificacion || 'Sin descripción.',
                        fechaInicio: p.proFechaInicio ? new Date(p.proFechaInicio).toLocaleDateString('es-ES') : '--/--/--',
                        fechaFin: p.proFechaFin ? new Date(p.proFechaFin).toLocaleDateString('es-ES') : '--/--/--',
                        estadoId: p.detParIdFk || 1
                    });
                }
                
                if (Array.isArray(miembrosRes.data)) {
                    const mps = miembrosRes.data.map((m: any) => ({
                        nombre: `${m.perNombre || m.nombre || ''} ${m.perApellido || m.apellido || ''}`.trim() || 'Desconocido',
                        rol: m.detParDescripcion || m.rol || 'Integrante'
                    }));
                    setMiembros(mps);
                }

            } catch (error) {
                console.error('Error en fetchData:', error);
            } finally {
                setCargando(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    const getEstadoTexto = (id: number) => {
        const estados: Record<number, {texto: string, clase: string}> = {
            1: { texto: "POR HACER", clase: "badge-por-hacer" },
            2: { texto: "EN PROGRESO", clase: "badge-progreso" },
            3: { texto: "HECHO", clase: "badge-hecho" }
        };
        return estados[id] || { texto: "PENDIENTE", clase: "badge-por-hacer" };
    };

    if (cargando) return <div className="loading-screen">Cargando detalles...</div>;
    if (!proyecto) return <div className="error-msg">Proyecto no encontrado.</div>;

    const estado = getEstadoTexto(proyecto.estadoId);

    return (
        <div className="dashboard-page">
            {/* --- SIDEBAR --- */}
            <aside className="side-card">
                <div className="brand-block">
                    <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                    <h2>Gestión de proyectos</h2>
                </div>
                <nav className="menu">
                    <p className="menu-title">MENÚ</p>
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.name} className={location.pathname === item.path ? 'active' : ''} onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="settings-footer" style={{marginTop: 'auto', padding: '10px 0'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={() => navigate('/ayuda-soporte')} style={{display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#555'}}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
                        <button className="btn-back-arrow" onClick={() => navigate('/ver-proyectos')} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Ver Proyectos / <span style={{color: '#39A900'}}>Detalle</span></h1>
                    </div>

                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="vp-container">
                    {/* Botonera de Acciones */}
                    <div className="action-buttons-container" style={{display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap'}}>
                        <button onClick={() => navigate(`/editar-integrante/${id}`)} className="btn-action primary">Editar integrantes</button>
                        <button onClick={() => navigate(`/ver-historia-usuario/${id}`)} className="btn-action primary">Historias</button>
                        <button onClick={() => navigate(`/proyecto/${id}/reuniones`)} className="btn-action primary">Reuniones</button>
                        <button onClick={() => navigate(`/sugerencia/${id}`)} className="btn-action primary">Observación</button>
                    </div>

                    {/* Grid de Información */}
                    <div className="info-grid-layout" style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px'}}>
                        <div className="left-column">
                            <div className="card-info" style={{marginBottom: '20px'}}>
                                <h3 style={{color: '#39A900'}}>Información General</h3>
                                <div className="info-detail-row"><label>Proyecto:</label><strong>{proyecto.nombre}</strong></div>
                                <div className="info-detail-row"><label>Estado:</label> <span className={`status-badge ${estado.clase}`}>{estado.texto}</span></div>
                            </div>
                            <div className="card-info">
                                <h3 style={{color: '#39A900'}}>Objetivo</h3>
                                <p>{proyecto.objetivo}</p>
                                <hr style={{margin: '15px 0', opacity: 0.2}} />
                                <h3 style={{color: '#39A900'}}>Descripción</h3>
                                <p>{proyecto.descripcion}</p>
                            </div>
                        </div>

                        <div className="right-column">
                            <div className="card-info">
                                <h3 style={{color: '#39A900'}}>Equipo del Proyecto</h3>
                                {miembros.length > 0 ? (
                                    miembros.map((m, i) => (
                                        <div key={i} className="member-item" style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                                            <span style={{fontWeight: 500}}>{m.nombre}</span>
                                            <span className="role-tag" style={{fontSize: '0.7rem', background: '#39A90022', color: '#39A900', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'}}>{m.rol}</span>
                                        </div>
                                    ))
                                ) : <p style={{color: '#777', fontStyle: 'italic'}}>No hay integrantes asignados.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE LOGOUT --- */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AlertTriangle size={45} color="#E74C3C" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¿Cerrar sesión?</h2>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={confirmLogout}>Sí, salir</button>
                            <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetalleProyecto;