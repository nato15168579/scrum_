import { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, Search, UserPlus, 
    HelpCircle, AlertTriangle, ChevronLeft, ChevronRight, User 
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import '../dashboard_instructor/Dashboard.css'; 
import './AsignarProyecto.css'; 
import { API_URL } from '../../config/Api';

const AsignarProyecto = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [proyectos, setProyectos] = useState<any[]>([]); 
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; 

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        // Consumimos el endpoint del controlador /asignacion/proyectos
        fetch(`${API_URL}/asignacion/proyectos`)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener proyectos');
                return res.json();
            })
            .then(data => {
                // Ahora los datos vienen con proId y proNombre (alias del backend)
                setProyectos(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Error API Proyectos:", err);
                setProyectos([]); 
            });

        fetch(`${API_URL}/dashboard?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => setInstructorName(data?.instructor || "Instructor SENA"))
            .catch(() => setInstructorName("Instructor SENA"));
    }, [navigate]);

    // --- LÓGICA DE CIERRE DE MENÚ ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMiPerfil = () => { navigate('/mi-perfil'); setIsMenuOpen(false); };
    const handleSoporte = () => { navigate('/ayuda-soporte'); };
    const confirmLogout = () => { localStorage.clear(); navigate('/'); };

    // --- FILTRADO Y PAGINACIÓN (CORREGIDO A proNombre) ---
    const filtered = proyectos.filter((p: any) => 
        p.proNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

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
                                className={location.pathname === item.path ? 'active' : ''} 
                                onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="settings-footer" style={{marginTop: 'auto', padding: '10px 0'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={handleSoporte} style={{display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#555'}}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section"><h1>Asignar Proyectos</h1></div>
                    <div className="profile-menu" ref={menuRef}>
                        <div className="profile-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px'}}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar"/>
                            <span className="profile-name">{instructorName}</span>
                            <ChevronDown size={18} />
                        </div>
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={handleMiPerfil}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="assign-container">
                    <div className="search-bar-container">
                        <label>Proyecto</label>
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="Buscar proyecto..." 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            />
                            <Search className="search-icon" size={20} />
                        </div>
                    </div>

                    <div className="table-card-assign">
                        <table className="assign-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Proyecto</th>
                                    <th>Fecha de Creación</th>
                                    <th style={{textAlign: 'center'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((p: any) => (
                                        <tr key={p.proId}> {/* llave corregida: proId */}
                                            <td>{p.proNombre}</td> {/* nombre corregido: proNombre */}
                                            <td>{p.proFechaCreacion ? new Date(p.proFechaCreacion).toLocaleDateString() : 'Sin fecha'}</td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="btn-ver-mas" onClick={() => navigate(`/detalle-proyecto/${p.proId}`)}>
                                                        <Eye size={14} /> 
                                                    </button>
                                                    <button 
                                                        className="btn-asignar-row" 
                                                        style={{ backgroundColor: '#00324D', color: 'white' }}
                                                        onClick={() => navigate(`/asignar-integrantes/${p.proId}`)}
                                                    >
                                                        <UserPlus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                                            No se encontraron proyectos disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="assign-footer">
                        <div className="pagination-wrapper">
                            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft size={16}/>
                            </button>
                            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Página {currentPage} de {totalPages || 1}</span>
                            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL CERRAR SESIÓN */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container" style={{backgroundColor: '#e67e22'}}><AlertTriangle size={45} color="white" /></div>
                        <h2 className="modal-title">¿Estás seguro?</h2>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={confirmLogout}>Si, Cerrar</button>
                            <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarProyecto;
