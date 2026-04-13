import { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, Filter, ChevronLeft, ChevronRight, 
    AlertTriangle, HelpCircle, User 
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import '../dashboard_instructor/Dashboard.css'; 
import './VerProyectos.css'; 
import { API_URL } from '../../config/Api';

// --- INTERFACES ---
interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    status: string; 
    detParIdFk: number;
}

const ITEMS_PER_PAGE = 8;

const VerProyectos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [instructorName, setInstructorName] = useState('Instructor'); 
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

    // Cierra el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const confirmLogout = () => {
        localStorage.clear(); 
        navigate('/');
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        setLoading(true);

        // Carga de Proyectos
        fetch(`${API_URL}/verpro`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const validData = Array.isArray(data) ? data : [];
                const formatted = validData.map((item: any) => {
                    let estadoTexto = "POR HACER";
                    if (item.detParIdFk === 2) estadoTexto = "EN PROGRESO";
                    else if (item.detParIdFk === 3) estadoTexto = "HECHO";

                    return {
                        id: item.proId,
                        nombre: item.proNombre || 'Sin nombre',
                        descripcion: item.proDescription || item.proObjetivoGeneral || 'Sin descripción',
                        fechaInicio: item.proFechaInicio ? new Date(item.proFechaInicio).toLocaleDateString('es-ES') : '--/--/--',
                        fechaFin: item.proFechaFin ? new Date(item.proFechaFin).toLocaleDateString('es-ES') : '--/--/--',
                        status: estadoTexto,
                        detParIdFk: item.detParIdFk
                    };
                });
                setProyectos(formatted);
            })
            .catch(err => console.error("Error proyectos:", err))
            .finally(() => setLoading(false));

        // Carga de Info del Instructor
        fetch(`${API_URL}/dashboard?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => {
                if (data?.instructor) setInstructorName(data.instructor);
            })
            .catch(() => setInstructorName("Instructor SENA"));
    }, [navigate]);

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
                <div className="settings-footer" style={{marginTop: 'auto', padding: '10px 0'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={() => navigate('/ayuda-soporte')}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section">
                        <h1>Ver proyectos</h1>
                    </div>
                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar"/>
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
                        <h2 className="vp-table-title">Lista de Proyectos</h2>
                        <div className="vp-search-box">
                            <input 
                                type="text" 
                                placeholder="Buscar proyecto..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Filter size={18} color="#888"/>
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
                                        <td><strong>#{p.id}</strong></td>
                                        <td className="vp-name-cell">{p.nombre}</td>
                                        <td className="vp-desc-cell">
                                            {p.descripcion.length > 40 ? p.descripcion.substring(0, 40) + "..." : p.descripcion}
                                        </td>
                                        <td>{p.fechaInicio}</td>
                                        <td>{p.fechaFin}</td>
                                        <td>{renderStatusBadge(p.status)}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="vp-btn-ver-mas" onClick={() => navigate(`/detalle-proyecto/${p.id}`)}>
                                                    <Eye size={18} /> 
                                                 </button>
                                            </td>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="vp-pagination-footer">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="page-btn">
                                <ChevronLeft size={20}/>
                            </button>
                            <span className="page-info">{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="page-btn">
                                <ChevronRight size={20}/>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container" style={{backgroundColor: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', margin: '0 auto 15px auto'}}>
                            <AlertTriangle size={30} color="white" />
                        </div>
                        <h2 className="modal-title">¿Cerrar sesión?</h2>
                        <p style={{color: '#666', marginBottom: '20px'}}>Perderás el acceso hasta que ingreses de nuevo.</p>
                        <div className="modal-buttons" style={{display: 'flex', gap: '10px'}}>
                            <button className="btn-confirm-logout" style={{backgroundColor: '#ef4444', flex: 1}} onClick={confirmLogout}>Salir</button>
                            <button className="btn-cancel-logout" style={{flex: 1}} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerProyectos;
