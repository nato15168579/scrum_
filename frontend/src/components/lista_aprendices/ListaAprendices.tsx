import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    Home, Users, Plus, MapPin, Eye, List, Search, Filter, User,
    ChevronDown, LogOut, AlertTriangle, ChevronLeft, ChevronRight, HelpCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "../dashboard_instructor/Dashboard.css"; 
import "./ListaAprendices.css"; 
import { API_URL } from "../../config/Api";
import { resolveUserName } from "../../session/session";

// Interfaces
interface Aprendiz {
    Documento: string;
    Ficha: string;
    FichaNombre?: string;
    Programa: string;
    Nombre: string;
    Apellido: string;
    Telefono: string;
    Email: string;
}

type EstadoAprendiz = "Activo" | "Inactivo";

const ITEMS_PER_PAGE = 10;

const MenuItems = [
    { Name: "Inicio", Icon: Home, Path: "/dashboard" },
    { Name: "Lista de Aprendices", Icon: Users, Path: "/lista-aprendices" },
    { Name: "Crear Proyecto", Icon: Plus, Path: "/crear-proyecto" },
    { Name: "Asignar Proyectos", Icon: MapPin, Path: "/asignar-proyectos" },
    { Name: "Ver Proyectos", Icon: Eye, Path: "/ver-proyectos" },
    { Name: "Registrar Aprendiz", Icon: List, Path: "/registrar-aprendiz" },
];

const ListaAprendices = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
    const [estadoPorDocumento, setEstadoPorDocumento] = useState<Record<string, EstadoAprendiz>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [instructorName, setInstructorName] = useState("Usuario");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [filters, setFilters] = useState({
        Documento: "",
        Ficha: "",
        Programa: "",
        Nombre: "",
    });

    useEffect(() => {
        const cedula = localStorage.getItem("userCedula");
        if (!cedula) { navigate("/"); return; }

        // Carga de Aprendices
        fetch(`${API_URL}/aprendices?cedula=${cedula}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                const mappedData: Aprendiz[] = (Array.isArray(data) ? data : []).map((item: any) => ({
                    Documento: item.documento,
                    Ficha: item.ficha,
                    FichaNombre: item.fichaNombre,
                    Programa: item.programa,
                    Nombre: item.nombre,
                    Apellido: item.apellido,
                    Telefono: item.telefono,
                    Email: item.email,
                }));

                setAprendices(mappedData);
                const estados = mappedData.reduce<Record<string, EstadoAprendiz>>((acc, item) => {
                    acc[item.Documento] = "Activo"; // Lógica por defecto
                    return acc;
                }, {});
                setEstadoPorDocumento(estados);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));

        // Carga de nombre del Instructor para el TopNav
        fetch(`${API_URL}/dashboard?cedula=${cedula}`)
            .then((res) => res.json())
            .then((data) => setInstructorName(resolveUserName(data?.instructor, "Usuario")))
            .catch(() => setInstructorName("Usuario"));
    }, [navigate]);

    const confirmLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    const FilteredData = useMemo(() => {
        return aprendices.filter((item) => (
            (item.Documento || "").toLowerCase().includes(filters.Documento.toLowerCase()) &&
            (`${item.Ficha || ""} ${item.FichaNombre || ""}`).toLowerCase().includes(filters.Ficha.toLowerCase()) &&
            (item.Programa || "").toLowerCase().includes(filters.Programa.toLowerCase()) &&
            (item.Nombre || "").toLowerCase().includes(filters.Nombre.toLowerCase())
        ));
    }, [filters, aprendices]);

    const DisplayData = FilteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const TotalPages = Math.ceil(FilteredData.length / ITEMS_PER_PAGE);

    if (isLoading) return <div className="loading-screen">Cargando...</div>;

    return (
        <div className="dashboard-page">
            {/* Sidebar idéntico al Dashboard */}
            <aside className="side-card">
                <div className="brand-block">
                    <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                    <h2>Gestión de Proyectos</h2>
                </div>
                
                <nav className="menu">
                    <p className="menu-title">MENÚ</p>
                    <ul>
                        {MenuItems.map(item => (
                            <li 
                                key={item.Name} 
                                onClick={() => navigate(item.Path)} 
                                className={location.pathname === item.Path ? 'active' : ''}
                            >
                                <item.Icon size={18} style={{marginRight: '10px'}}/> 
                                {item.Name}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="settings-footer" style={{marginTop: 'auto'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div 
                        className={`support-item ${location.pathname === '/ayuda-soporte' ? 'active' : ''}`} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/ayuda-soporte')}
                    >
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                {/* TopNav idéntico al Dashboard */}
                <nav className="nav-top">
                    <div className="title-section"><h1>Lista de Aprendices</h1></div>
                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} 
                            className="profile-img" 
                            alt="Avatar"
                        />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                {/* Contenido Principal con estructura de Dashboard */}
                <div className="vp-container">
                    <section className="dashboard-content">
                        <h2>Panel de Aprendices</h2>
                        <p className="welcome-subtitle">Gestiona y filtra la información de los aprendices registrados.</p>

                        {/* Sección de Filtros estilizada como las cards del dashboard */}
                        <aside className="filter-card" style={{ marginBottom: '20px' }}>
                            <div className="filter-header">
                                <h3><Filter size={18} style={{ marginRight: "8px" }} /> Filtros de Búsqueda</h3>
                            </div>
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label>Documento</label>
                                    <input type="text" name="Documento" className="input-filter" value={filters.Documento} onChange={handleFilterChange} placeholder="Buscar..." />
                                </div>
                                <div className="filter-group">
                                    <label>Ficha / Programa</label>
                                    <input type="text" name="Ficha" className="input-filter" value={filters.Ficha} onChange={handleFilterChange} placeholder="Buscar..." />
                                </div>
                                <div className="btn-search-indicator">
                                    <Search size={16} style={{ marginRight: "5px" }} /> Registros: {FilteredData.length}
                                </div>
                            </div>
                        </aside>

                        {/* Tabla estilizada */}
                        <section className="table-card">
                            <div className="table-header">
                                <h3>Listado Oficial</h3>
                            </div>
                            <div className="table-responsive">
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Documento</th>
                                            <th>Ficha</th>
                                            <th>Programa</th>
                                            <th>Nombre Completo</th>
                                            <th>Contacto</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {DisplayData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{row.Documento}</strong></td>
                                                <td>{row.Ficha}</td>
                                                <td>{row.Programa}</td>
                                                <td>{row.Nombre} {row.Apellido}</td>
                                                <td>
                                                    <div style={{fontSize: '0.85rem'}}>{row.Email}</div>
                                                    <div style={{color: '#777', fontSize: '0.8rem'}}>{row.Telefono}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${estadoPorDocumento[row.Documento] === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                                                        {estadoPorDocumento[row.Documento]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {TotalPages > 1 && (
                                <div className="pagination-controls">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-page">
                                        <ChevronLeft size={16} /> Anterior
                                    </button>
                                    <span className="pagination-info">Página {currentPage} de {TotalPages}</span>
                                    <button disabled={currentPage === TotalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-page">
                                        Siguiente <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </main>

            {/* Modal de Logout idéntico */}
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