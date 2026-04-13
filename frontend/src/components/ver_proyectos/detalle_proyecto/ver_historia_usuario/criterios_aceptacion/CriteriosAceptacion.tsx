import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronLeft, ChevronDown, User, LogOut, HelpCircle, AlertTriangle, Clock
} from 'lucide-react';
import senaLogo from '../../../../../assets/sena.png'; 
import '../../../../dashboard_instructor/Dashboard.css'; 
import '../../../VerProyectos.css';
import { API_URL } from '../../../../../config/Api';

const CriteriosAceptacion: React.FC = () => {
    const { proId, id } = useParams<{ proId: string; id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [criterios, setCriterios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener nombre del instructor para el perfil
                const resUser = await fetch(`${API_URL}/dashboard?cedula=${cedula}`);
                const dataUser = await resUser.json();
                if (dataUser?.instructor) setInstructorName(dataUser.instructor);

                // Obtener criterios filtrados por Proyecto e Historia
                const res = await fetch(`${API_URL}/criterio-aceptacion/${proId}/${id}`);
                const data = await res.json();
                setCriterios(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error cargando criterios:", error);
            } finally {
                setLoading(false);
            }
        };

        if (proId && id) fetchData();
    }, [proId, id, navigate]);

    const getEstadoCriterio = (estado: string) => {
        const est = estado?.toUpperCase();
        if (est === 'HECHO' || est === 'APROBADO' || est === 'FINALIZADO') return 'badge-hecho';
        if (est === 'PROGRESO' || est === 'EN PROCESO') return 'badge-progreso';
        return 'badge-por-hacer';
    };

    if (loading) return <div className="loading-screen">Cargando criterios...</div>;

    return (
        <div className="dashboard-page">
            {/* --- SIDEBAR --- */}
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
                                className={location.pathname.includes(item.path) || (item.path === '/ver-proyectos' && location.pathname.includes('criterio')) ? 'active' : ''} 
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

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
                        <button 
                            className="btn-back-arrow" 
                            onClick={() => navigate(-1)} 
                            style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Historias / <span style={{color: '#39A900'}}>Criterios de Aceptación</span></h1>
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
                    <div className="vp-header-row">
                        <h2 className="vp-table-title">Criterios de la Historia HU-{id}</h2>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th style={{width: '45%'}}>Descripción del Criterio</th>
                                    <th style={{textAlign: 'center'}}>Estado</th>
                                    <th style={{textAlign: 'center'}}>Tiempo Est.</th>
                                    <th>Responsable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criterios.length > 0 ? (
                                    criterios.map((c) => (
                                        <tr key={c.criId}>
                                            <td><strong>#{c.criId}</strong></td>
                                            <td style={{color: '#333', fontSize: '0.95rem'}}>{c.criDescripcion}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`status-badge ${getEstadoCriterio(c.estadoFk2?.detParNombre)}`}>
                                                    {c.estadoFk2?.detParNombre || 'Pendiente'}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', fontWeight: '600'}}>
                                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#666'}}>
                                                    <Clock size={14} /> {c.criTiempo || 0}h
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <div style={{width: '24px', height: '24px', borderRadius: '50%', background: '#39A90022', color: '#39A900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold'}}>
                                                        {c.usuCedulaFk2?.usuNombres?.charAt(0) || 'U'}
                                                    </div>
                                                    <span style={{fontSize: '0.85rem'}}>
                                                        {c.usuCedulaFk2 
                                                            ? `${c.usuCedulaFk2.usuNombres} ${c.usuCedulaFk2.usuApellidos || ''}` 
                                                            : 'Sin asignar'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{textAlign: 'center', padding: '60px', color: '#999'}}>
                                            No se han definido criterios de aceptación para esta historia.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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

export default CriteriosAceptacion;