/**
 * VerProyectos (Instructor)
 * ------------------------
 * Vista del instructor para listar proyectos y navegar al detalle.
 *
 * Nota:
 * - Existe una variante admin en `dashboard_administrador/proyectos_admin/VerProyectos.tsx`.
 * - Esta pantalla mantiene paginacion local y layout del dashboard instructor.
 */
import { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, Filter, ChevronLeft, ChevronRight, AlertTriangle, HelpCircle 
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import '../dashboard_instructor/Dashboard.css'; 
import './VerProyectos.css'; 
import { API_URL } from '../../config/Api';
import { resolveUserName } from '../../session/session';

// --- INTERFACES ---
interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    status: string; 
}

interface ProyectoApi {
    detParIdFk?: number;
    proId?: number;
    proNombre?: string;
    proDescription?: string;
    proObjetivoGeneral?: string;
    proFechaInicio?: string;
    proFechaFin?: string;
}

const ITEMS_PER_PAGE = 8;

const VerProyectos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [instructorName, setInstructorName] = useState(() =>
        resolveUserName(undefined, 'Usuario'),
    );
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        fetch(`${API_URL}/verpro`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const validData = Array.isArray(data) ? data : [];
                const formatted = (validData as ProyectoApi[]).map((item) => {
                    
                    // LÓGICA DE ESTADOS SEGÚN TU SOLICITUD:
                    // 1 = POR HACER, 2 = EN PROGRESO, 3 = HECHO
                    let estadoTexto = "POR HACER";
                    const idEstado = item.detParIdFk; 

                    if (idEstado === 1) {
                        estadoTexto = "POR HACER";
                    } else if (idEstado === 2) {
                        estadoTexto = "EN PROGRESO";
                    } else if (idEstado === 3) {
                        estadoTexto = "HECHO";
                    }

                    return {
                        id: item.proId ?? 0, 
                        nombre: item.proNombre || 'Sin nombre',
                        descripcion: item.proDescription || item.proObjetivoGeneral || 'Sin descripción',
                        fechaInicio: item.proFechaInicio ? new Date(item.proFechaInicio).toLocaleDateString('es-ES') : '--/--/--',
                        fechaFin: item.proFechaFin ? new Date(item.proFechaFin).toLocaleDateString('es-ES') : '--/--/--',
                        status: estadoTexto
                    };
                });
                setProyectos(formatted);
            })
            .catch(err => console.error("Error proyectos:", err))
            .finally(() => setLoading(false));

        fetch(`${API_URL}/dashboard?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => setInstructorName(resolveUserName(data?.instructor, 'Usuario')))
            .catch(() => setInstructorName(resolveUserName(undefined, 'Usuario')));
    }, [navigate]);

    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    const filteredProjects = proyectos.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            p.nombre.toLowerCase().includes(term) || 
            p.id.toString().includes(term) ||
            p.status.toLowerCase().includes(term)
        );
    });

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const displayData = filteredProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const renderStatusBadge = (status: string) => {
        let className = 'badge-por-hacer'; 
        if (status === 'HECHO') className = 'badge-hecho';
        else if (status === 'EN PROGRESO') className = 'badge-progreso';
        
        return <span className={`status-badge ${className}`}>{status}</span>;
    };

    if (loading) return <div className="loading-screen">Cargando proyectos...</div>;

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
                            <li key={item.name} className={location.pathname === item.path ? 'active' : ''} onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
                {/* AYUDA Y SOPORTE AL FINAL */}
                <div className="settings-footer" style={{marginTop: 'auto', padding: '10px 0'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={() => navigate('/soporte')} style={{display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#555'}}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section"><h1>Ver proyectos</h1></div>
                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar"/>
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="vp-container">
                    <div className="vp-header-row">
                        <h2 className="vp-table-title">Lista de Proyectos</h2>
                        <div className="vp-search-box">
                            <input 
                                type="text" 
                                placeholder="Buscar proyecto..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Filter size={16} color="#555"/>
                        </div>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Estado</th>
                                    <th style={{textAlign: 'center'}}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.map((p) => (
                                    <tr key={p.id}>
                                        <td><strong>{p.id}</strong></td>
                                        <td className="vp-name-cell">{p.nombre}</td>
                                        <td className="vp-desc-cell">{p.descripcion.substring(0, 35)}...</td>
                                        <td>{p.fechaInicio}</td>
                                        <td>{p.fechaFin}</td>
                                        <td>{renderStatusBadge(p.status)}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <button className="vp-btn-ver-mas" onClick={() => navigate(`/detalle-proyecto/${p.id}`)}>
                                                ver más
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN RESTAURADA */}
                    {totalPages > 1 && (
                        <div className="vp-pagination-footer">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="page-btn">
                                <ChevronLeft size={16}/>
                            </button>
                            <span className="page-info">{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="page-btn">
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AlertTriangle size={45} color="#E74C3C" />
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

export default VerProyectos;
