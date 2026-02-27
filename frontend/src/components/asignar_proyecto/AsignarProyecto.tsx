import { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, Search, UserPlus, 
    HelpCircle, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import '../dashboard_instructor/Dashboard.css'; 
import './AsignarProyecto.css'; 
import { API_URL } from '../../config/api';

interface ProyectoAsignado {
    pro_ID: number;
    pro_nombre: string;
    pro_fecha_inicio?: string | null;
}

const AsignarProyecto = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [proyectos, setProyectos] = useState<ProyectoAsignado[]>([]);
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; 

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        fetch(`${API_URL}/proyectos?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => setProyectos(Array.isArray(data) ? data : []));

        fetch(`${API_URL}/dashboard?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => setInstructorName(data?.instructor || "Instructor SENA"));
    }, [navigate]);

    const filtered = proyectos.filter((p) => 
        p.pro_nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <div className="support-item" style={{display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#555'}}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section"><h1>Asignar Proyectos</h1></div>
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
                                    <th>Fecha Inicio</th>
                                    <th style={{textAlign: 'center'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((p) => (
                                    <tr key={p.pro_ID}>
                                        <td>{p.pro_nombre}</td>
                                        <td>{p.pro_fecha_inicio ? new Date(p.pro_fecha_inicio).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="btn-ver-mas" onClick={() => navigate(`/asignar-proyectos-vermas/${p.pro_ID}`)}>
                                                    <Eye size={14} /> ver mas
                                                </button>
                                                {/* Botón Asignar con el color azul oscuro original */}
                                                <button 
                                                    className="btn-asignar-row" 
                                                    style={{ backgroundColor: '#00324D', color: 'white' }}
                                                    onClick={() => console.log("Asignar", p.pro_ID)}
                                                >
                                                    <UserPlus size={14} /> asignar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="assign-footer">
                        <div className="pagination-wrapper">
                            <button 
                                className="page-btn" 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <span style={{fontWeight: '600', fontSize: '0.9rem', color: '#333'}}>
                                Página {currentPage} de {totalPages || 1}
                            </span>
                            <button 
                                className="page-btn" 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container" style={{backgroundColor: '#e67e22'}}><AlertTriangle size={45} color="white" /></div>
                        <h2 className="modal-title">¿Estás seguro?</h2>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={() => { localStorage.clear(); navigate('/'); }}>Si, Cerrar</button>
                            <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarProyecto;
