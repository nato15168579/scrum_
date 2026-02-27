import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, RefreshCw, Clock, MessageSquare 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './VerReuniones.css'; 

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

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

const VerReuniones: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');
        if (!token) { navigate('/'); return; }

        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));
    }, [navigate]);

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />

            <div className="main-content-area">
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>Proyecto / Ver más / <span className="current-page">Ver reuniones</span></h1>
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

                <div className="meetings-container" style={{background: 'transparent', boxShadow: 'none', border: 'none'}}>
                    <h2 className="meetings-title">Ver reuniones</h2>

                    <div className="meetings-grid">
                        
                        {/* Tarjeta Planning */}
                        <div className="meeting-card">
                            <div className="icon-circle">
                                <Users size={30} />
                            </div>
                            <h3>Planning</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/planning`)}>
                                Detalle
                            </button>
                        </div>

                        {/* Tarjeta Sprint */}
                        <div className="meeting-card">
                            <div className="icon-circle">
                                <RefreshCw size={30} />
                            </div>
                            <h3>Sprint</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/sprint`)}>
                                Detalle
                            </button>
                        </div>

                        {/* Tarjeta Daily */}
                        <div className="meeting-card">
                            <div className="icon-circle">
                                <Clock size={30} />
                            </div>
                            <h3>Daily</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/daily`)}>
                                Detalle
                            </button>
                        </div>

                        {/* Tarjeta Review/Retrospective */}
                        <div className="meeting-card">
                            <div className="icon-circle">
                                <MessageSquare size={30} />
                            </div>
                            <h3>Review / Retro</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/review`)}>
                                Detalle
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerReuniones;
