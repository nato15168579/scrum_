import React, { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, FileText, 
    Search, Filter, User, ChevronDown, LogOut, AlertTriangle, 
    ChevronLeft, ChevronRight, HelpCircle 
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import '../dashboard_instructor/Dashboard.css'; 
import './ListaAprendices.css';
import { API_URL } from '../../config/api';

// --- INTERFACES ---
interface Aprendiz {
    documento: string;
    ficha: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    programa: string;
}

const ITEMS_PER_PAGE = 10;

const ListaAprendices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados de datos
    const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
    const [filteredData, setFilteredData] = useState<Aprendiz[]>([]); 
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Estados de Perfil
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Filtros
    const [filters, setFilters] = useState({
        documento: '',
        nombre: '',
        apellido: '',
        ficha: '',
    });

    // --- CONFIGURACIÓN DEL MENÚ ---
    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard-instructor' },
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
        
        // Si no hay cédula, fuera al login
        if (!cedula) {
            navigate('/');
            return;
        }

        setLoading(true);

        // 1. Cargar lista de aprendices
        fetch(`${API_URL}/aprendices?cedula=${cedula}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const validData = Array.isArray(data) ? data : [];
                setAprendices(validData);
                setFilteredData(validData);
            })
            .catch(err => console.error("Error aprendices:", err))
            .finally(() => setLoading(false));
        
        // 2. Cargar perfil (Solución al error data.instructor)
        fetch(`${API_URL}/dashboard-instructor?cedula=${cedula}`)
            .then(res => res.json())
            .then(data => {
                // Verificamos si la propiedad existe antes de asignarla
                if (data && data.instructor) {
                    setInstructorName(data.instructor);
                } else {
                    setInstructorName("Instructor SENA");
                }
            })
            .catch(err => {
                console.error("Error perfil:", err);
                setInstructorName("Instructor SENA");
            });

    }, [navigate]);

    // --- LÓGICA DE FILTRADO ---
    useEffect(() => {
        const resultado = aprendices.filter(item => {
            return (
                (item.documento || '').toString().toLowerCase().includes(filters.documento.toLowerCase()) &&
                (item.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase()) &&
                (item.apellido || '').toLowerCase().includes(filters.apellido.toLowerCase()) &&
                (item.ficha || '').toLowerCase().includes(filters.ficha.toLowerCase())
            );
        });
        setFilteredData(resultado);
        setCurrentPage(1);
    }, [filters, aprendices]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    
    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- PAGINACIÓN ---
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const displayData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (loading) return <div className="loading-screen">Cargando lista de aprendices...</div>;

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
                            <li 
                                key={item.name} 
                                className={location.pathname === item.path ? 'active' : ''} 
                                onClick={() => navigate(item.path)}
                            >
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
                    <div className="title-section"><h1>Lista de Aprendices</h1></div>
                    
                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} 
                            className="profile-img" alt="Avatar"
                        />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="lista-container">
                    <section className="table-card">
                        <div className="table-header">
                            <h2>Aprendices Registrados</h2>
                            <span className="table-subtitle">Listado oficial de aprendices registrados en el sistema.</span>
                        </div>

                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Ficha</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.length > 0 ? (
                                    displayData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.documento}</td>
                                            <td>{row.ficha}</td>
                                            <td>{row.nombre}</td>
                                            <td>{row.apellido}</td>
                                            <td>{row.telefono}</td>
                                            <td>{row.email}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center', padding: '30px', color: '#777'}}>
                                            No se encontraron aprendices con estos filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page">
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-page">
                                    Siguiente <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </section>

                    <aside className="filter-card">
                        <div className="filter-header">
                            <h3><Filter size={18} style={{marginRight: '8px'}}/> Filtros</h3>
                        </div>
                        <div className="filter-group">
                            <label>Documento</label>
                            <input type="text" name="documento" className="input-filter" value={filters.documento} onChange={handleFilterChange} placeholder="Buscar..." />
                        </div>
                        <div className="filter-group">
                            <label>Ficha</label>
                            <input type="text" name="ficha" className="input-filter" value={filters.ficha} onChange={handleFilterChange} placeholder="Buscar..." />
                        </div>
                        <div className="filter-group">
                            <label>Nombre</label>
                            <input type="text" name="nombre" className="input-filter" value={filters.nombre} onChange={handleFilterChange} placeholder="Buscar..." />
                        </div>
                        <div className="filter-group">
                            <label>Apellido</label>
                            <input type="text" name="apellido" className="input-filter" value={filters.apellido} onChange={handleFilterChange} placeholder="Buscar..." />
                        </div>
                        <div className="btn-search-indicator">
                            <Search size={16} style={{marginRight:'5px'}} /> Registros: {totalItems}
                        </div>
                    </aside>
                </div>
            </main>
            
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container"><AlertTriangle size={45} color="white" /></div>
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

export default ListaAprendices;