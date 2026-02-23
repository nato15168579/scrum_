import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, ChevronRight 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './CriteriosAceptacion.css'; // Importamos los estilos nuevos

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

// Interfaz basada en las columnas de tu imagen
interface Criterio {
    id: number;
    idHistoria: string; // Ej: "1.1"
    descripcion: string;
    estado: string;
    tiempo: string; // Ej: "2 hora"
    responsable: string;
}

// Sidebar Reutilizable
const Sidebar = ({ navigate }: { navigate: (path: string) => void }) => {
    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard-instructor' },
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

const CriteriosAceptacion: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // Estados
    const [criterios, setCriterios] = useState<Criterio[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; 

    // Perfil
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');

        if (!token || !cedula) { navigate('/'); return; }

        // 1. Cargar Perfil
        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));

        // 2. Cargar Criterios
        cargarCriterios();
        
    }, [id, navigate]);

    const cargarCriterios = () => {
        setLoading(true);
        // MOCK DATA: Simulando los datos de tu imagen
        setTimeout(() => {
            const dataMock: Criterio[] = [
                { id: 1, idHistoria: "1.1", descripcion: "permitir registrar correo y contraseña", estado: "pendiente", tiempo: "2", responsable: "backend" },
                { id: 2, idHistoria: "1.2", descripcion: "Mostrar mensaje si el correo ya está registrado", estado: "pendiente", tiempo: "2 hora", responsable: "frontend" },
                { id: 3, idHistoria: "1.3", descripcion: "Enviar confirmación de registro al correo.", estado: "pendiente", tiempo: "2", responsable: "backend" },
                { id: 4, idHistoria: "2.1", descripcion: "Validar correo y contraseña", estado: "pendiente", tiempo: "1", responsable: "backend" },
                { id: 5, idHistoria: "2.2", descripcion: "Mostrar errores si son incorrectas", estado: "pendiente", tiempo: "2", responsable: "frontend" },
                { id: 6, idHistoria: "2.3", descripcion: "Redirigir al panel principal.", estado: "pendiente", tiempo: "8 hora", responsable: "frontend" },
                // Datos extra para probar paginación
                { id: 7, idHistoria: "3.1", descripcion: "Crear base de datos de usuarios", estado: "pendiente", tiempo: "4", responsable: "backend" },
                { id: 8, idHistoria: "3.2", descripcion: "Diseñar interfaz de login", estado: "pendiente", tiempo: "5", responsable: "frontend" },
            ];
            setCriterios(dataMock);
            setLoading(false);
        }, 600);
    };

    // --- Lógica Paginación ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = criterios.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(criterios.length / itemsPerPage);

    const handlePageChange = (p: number) => setCurrentPage(p);

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />

            <div className="main-content-area">
                {/* NAV SUPERIOR */}
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>Lista de proyectos / Ver más / <span className="current-page">Criterios de aceptación</span></h1>
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
                <div className="criterios-container">
                    <h2 className="section-title">Criterios de aceptación</h2>

                    {loading ? <p style={{textAlign:'center', padding:'30px'}}>Cargando datos...</p> : (
                        <>
                            <table className="table-green-header">
                                <thead>
                                    <tr>
                                        <th style={{width: '60px'}}>ID</th>
                                        <th style={{width: '120px', textAlign: 'center'}}>ID-historia u.</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th style={{textAlign: 'center'}}>Tiempo (H)</th>
                                        <th>Responsable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(c => (
                                        <tr key={c.id}>
                                            <td className="col-id">{c.id}</td>
                                            <td className="col-historia">{c.idHistoria}</td>
                                            <td>{c.descripcion}</td>
                                            <td className="text-estado">{c.estado}</td>
                                            <td className="col-tiempo">{c.tiempo}</td>
                                            <td className="col-responsable">{c.responsable}</td>
                                        </tr>
                                    ))}
                                    {criterios.length === 0 && (
                                        <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>No hay criterios asignados.</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* PAGINACIÓN */}
                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                        className="btn-page"
                                    >
                                        <ChevronLeft size={16} />
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
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CriteriosAceptacion;