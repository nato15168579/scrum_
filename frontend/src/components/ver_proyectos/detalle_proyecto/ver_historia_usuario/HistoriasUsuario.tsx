import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronLeft, ChevronDown, User, LogOut, HelpCircle, AlertTriangle 
} from 'lucide-react';
import senaLogo from '../../../../assets/sena.png'; 
import '../../../dashboard_instructor/Dashboard.css'; 
import '../../VerProyectos.css';
import './HistoriasUsuario.css'; 
import { API_URL } from '../../../../config/Api';

// Interfaz actualizada según tu Entidad de TypeORM
interface Historia {
    hisId: number;
    hisTitulo: string;
    hisDescripcion: string;
    hisPuntaje: number;
    detParIdFk: number; // Coincide con det_par_ID_FK de la DB
    detParIdFk2?: {     // Relación para traer el nombre del estado
        detParDescripcion: string;
    };
    // hisPrioridad no existe en tu entidad HistoriaUsuario, 
    // podrías usar el puntaje para determinarla o agregar el campo a la entidad.
}

const ITEMS_PER_PAGE = 6;

const HistoriasUsuario: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [historias, setHistorias] = useState<Historia[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage] = useState(1);
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Cargar datos del instructor
                const resUser = await fetch(`${API_URL}/dashboard?cedula=${cedula}`);
                const dataUser = await resUser.json();
                if (dataUser?.instructor) setInstructorName(dataUser.instructor);

                // 2. Cargar historias (Usando la ruta definida en el HistoriasController)
                const resHis = await fetch(`${API_URL}/historias/proyecto/${id}`);
                const dataHis = await resHis.json();
                setHistorias(Array.isArray(dataHis) ? dataHis : []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    // Lógica de estados basada en tus IDs de detalle_parametro
    const getStatusInfo = (h: Historia) => {
        // Si el backend trae la relación, usamos la descripción de la DB
        if (h.detParIdFk2) {
            const desc = h.detParIdFk2.detParDescripcion.toUpperCase();
            let clase = 'badge-por-hacer';
            if (desc.includes('PROCESO') || desc.includes('DOING')) clase = 'badge-progreso';
            if (desc.includes('HECHO') || desc.includes('DONE')) clase = 'badge-hecho';
            return { texto: desc, clase };
        }
        
        // Fallback por ID si no hay relación
        switch (h.detParIdFk) {
            case 3: return { texto: 'HECHO', clase: 'badge-hecho' };
            case 2: return { texto: 'PROGRESO', clase: 'badge-progreso' };
            default: return { texto: 'POR HACER', clase: 'badge-por-hacer' };
        }
    };

    const displayData = historias.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return <div className="loading-screen">Cargando backlog...</div>;

    return (
        <div className="dashboard-page">
            <aside className="side-card">
                <div className="brand-block">
                    <img src={senaLogo} alt="Logo" className="logo-lg" />
                    <h2>Gestión de proyectos</h2>
                </div>
                <nav className="menu">
                    <p className="menu-title">MENÚ</p>
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.name} 
                                className={location.pathname === item.path || (location.pathname.includes('historias-usuario') && item.path === '/ver-proyectos') ? 'active' : ''} 
                                onClick={() => navigate(item.path)}>
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

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
                        <button className="btn-back-arrow" onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Detalle / <span style={{color: '#39A900'}}>Historias de Usuario</span></h1>
                    </div>

                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)} style={{position: 'relative', cursor: 'pointer'}}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        {isMenuOpen && (
                            <ul className="dropdown-profile" style={{position: 'absolute', top: '100%', right: 0, background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10, listStyle: 'none', padding: '10px'}}>
                                <li onClick={() => navigate('/mi-perfil')} style={{padding: '8px 12px', display: 'flex', alignItems: 'center'}}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)} style={{padding: '8px 12px', display: 'flex', alignItems: 'center', color: 'red'}}><LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión</li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="vp-container">
                    <div className="vp-header-row">
                        <h2 className="vp-table-title">Backlog del Proyecto #{id}</h2>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th style={{width: '40%'}}>Historia / Requerimiento</th>
                                    <th style={{textAlign: 'center'}}>Puntos</th>
                                    <th style={{textAlign: 'center'}}>Estado</th>
                                    <th style={{textAlign: 'center'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.length > 0 ? (
                                    displayData.map((h) => {
                                        const status = getStatusInfo(h);
                                        return (
                                            <tr key={h.hisId}>
                                                <td><strong>HU-{h.hisId}</strong></td>
                                                <td>
                                                    <div style={{fontWeight:'600', color:'#333'}}>{h.hisTitulo}</div>
                                                    <div style={{fontSize:'0.85rem', color:'#666', marginTop: '4px'}}>{h.hisDescripcion}</div>
                                                </td>
                                                <td style={{textAlign: 'center', fontWeight: 'bold', color: '#39A900'}}>{h.hisPuntaje || 0} pts</td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`status-badge ${status.clase}`}>{status.texto}</span>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <button 
                                                        className="btn-action primary"
                                                        onClick={() => navigate(`/criterios-aceptacion/${id}/${h.hisId}`)}
                                                        style={{ padding: '6px 15px', fontSize: '0.85rem' }}
                                                    >
                                                        Criterios
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{textAlign: 'center', padding: '60px', color: '#999'}}>
                                            No se encontraron historias de usuario para este proyecto.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AlertTriangle size={45} color="#E74C3C" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¿Cerrar sesión?</h2>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={handleLogout}>Sí, salir</button>
                            <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriasUsuario;
