import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, ChevronRight 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './HistoriasUsuario.css'; 

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

interface Historia {
    id: number;
    titulo: string;
    descripcion: string;
    prioridad: string;
    puntos: number;
    estado: string;
}

// Sidebar Reutilizable
const Sidebar = ({ navigate }: { navigate: (path: string) => void }) => {
    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, active: true, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];
    return (
        <aside className="side-card">
            <div className="brand-block">
                <img src={senaLogo} alt="Logo" className="logo-lg" />
                <h2>Gestión de proyectos</h2>
            </div>
            <nav className="menu">
                <p className="menu-title">MENU</p>
                <ul>
                    {menuItems.map(item => (
                        <li key={item.name} className={item.active ? 'active' : ''} onClick={() => item.path && navigate(item.path)}>
                            <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const HistoriasUsuario: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // Estados de Datos
    const [historias, setHistorias] = useState<Historia[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Cantidad de historias por página

    // Perfil
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');

        if (!token || !cedula) { navigate('/'); return; }

        // 1. Cargar Nombre Instructor
        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));

        // 2. Cargar Historias
        cargarHistorias();
        
    }, [id, navigate]);

    const cargarHistorias = () => {
        // MOCK DATA: Generamos más datos para probar la paginación
        setTimeout(() => {
            const dataMock = [
                { id: 101, titulo: "Login de Usuarios", descripcion: "Como usuario quiero ingresar con email y clave", prioridad: "Alta", puntos: 5, estado: "Terminado" },
                { id: 102, titulo: "Crear Proyecto", descripcion: "Como instructor quiero crear un proyecto nuevo", prioridad: "Alta", puntos: 8, estado: "En Proceso" },
                { id: 103, titulo: "Exportar PDF", descripcion: "Como usuario quiero descargar reporte en PDF", prioridad: "Baja", puntos: 3, estado: "Pendiente" },
                { id: 104, titulo: "Recuperar Contraseña", descripcion: "Como usuario quiero restablecer mi clave olvidada", prioridad: "Alta", puntos: 5, estado: "Pendiente" },
                { id: 105, titulo: "Asignar Roles", descripcion: "Como admin quiero asignar roles a usuarios", prioridad: "Media", puntos: 5, estado: "En Proceso" },
                { id: 106, titulo: "Ver Perfil", descripcion: "Como usuario quiero editar mi información personal", prioridad: "Baja", puntos: 2, estado: "Terminado" },
                { id: 107, titulo: "Notificaciones", descripcion: "Como usuario quiero recibir alertas al correo", prioridad: "Media", puntos: 3, estado: "Pendiente" },
                { id: 108, titulo: "Dashboard", descripcion: "Como instructor quiero ver estadísticas generales", prioridad: "Alta", puntos: 13, estado: "En Proceso" },
            ];
            setHistorias(dataMock);
            setLoading(false);
        }, 500);
    };

    // --- LÓGICA DE PAGINACIÓN ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistorias = historias.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(historias.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // --- CLASES CSS DINÁMICAS ---
    const getStatusClass = (estado: string) => {
        if (estado === 'Terminado') return 'status-terminado';
        if (estado === 'En Proceso') return 'status-proceso';
        return 'status-pendiente';
    };

    const getPriorityClass = (p: string) => {
        if (p === 'Alta') return 'priority-alta';
        if (p === 'Baja') return 'priority-baja';
        return 'priority-media';
    };

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />

            <div className="main-content-area">
                {/* NAV */}
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>Proyecto / Detalle / <span className="current-page">Historias de Usuario</span></h1>
                    </div>
                    
                    <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`} className="profile-img" alt="Avatar"/>
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} color="#999"/>
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li className="logout" onClick={() => {localStorage.clear(); navigate('/');}}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                {/* CONTENIDO PRINCIPAL */}
                <div className="historias-container">
                    <div className="header-actions">
                        <h2>Backlog de Historias</h2>
                        {/* Botón de crear eliminado como solicitaste */}
                    </div>

                    {loading ? <p style={{textAlign:'center', padding:'30px'}}>Cargando...</p> : (
                        <>
                            <table className="table-green-header">
                                <thead>
                                    <tr>
                                        <th style={{width: '80px'}}>ID</th>
                                        <th style={{width:'40%'}}>Título / Descripción</th>
                                        <th style={{textAlign:'center'}}>Prioridad</th>
                                        <th style={{textAlign:'center'}}>Puntos</th>
                                        <th style={{textAlign:'center'}}>Estado</th>
                                        {/* Columna Acciones eliminada */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentHistorias.map(h => (
                                        <tr key={h.id}>
                                            <td><strong>HU-{h.id}</strong></td>
                                            <td>
                                                <div style={{fontWeight:'bold', color:'#333', marginBottom:'4px'}}>{h.titulo}</div>
                                                <div style={{fontSize:'0.85rem', color:'#666'}}>{h.descripcion}</div>
                                            </td>
                                            <td style={{textAlign:'center'}}><span className={getPriorityClass(h.prioridad)}>{h.prioridad}</span></td>
                                            <td style={{textAlign:'center', fontWeight:'bold'}}>{h.puntos} pts</td>
                                            <td style={{textAlign:'center'}}><span className={`badge ${getStatusClass(h.estado)}`}>{h.estado}</span></td>
                                        </tr>
                                    ))}
                                    {historias.length === 0 && (
                                        <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>No hay historias registradas.</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* CONTROLES DE PAGINACIÓN */}
                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <span className="pagination-info">
                                        Página {currentPage} de {totalPages} ({historias.length} historias)
                                    </span>
                                    <div className="pagination-buttons">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="btn-page"
                                        >
                                            <ChevronLeft size={16} /> Anterior
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button 
                                                key={i + 1} 
                                                onClick={() => handlePageChange(i + 1)} 
                                                className={`btn-page ${currentPage === i + 1 ? 'active-page' : ''}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            className="btn-page"
                                        >
                                            Siguiente <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoriasUsuario;