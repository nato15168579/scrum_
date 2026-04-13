import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, RefreshCw, Clock, MessageSquare, HelpCircle, User
} from 'lucide-react';
import senaLogo from '../../../../assets/sena.png'; 
import '../../../dashboard_instructor/Dashboard.css'; 
import '../DetalleProyecto.css'; 
import './VerReuniones.css'; 
import { API_URL } from '../../../../config/Api';

const VerReuniones: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        axios.get(`${API_URL}/dashboard?cedula=${cedula}`)
            .then(res => {
                if (res.data?.instructor) setInstructorName(res.data.instructor);
            })
            .catch(() => setInstructorName("Instructor"));
    }, [navigate]);

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
                                className={location.pathname.includes(item.path) || (item.path === '/ver-proyectos' && location.pathname.includes('reuniones')) ? 'active' : ''} 
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
                        <button className="btn-back-arrow" onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Proyectos / <span style={{color: '#39A900'}}>Ver reuniones</span></h1>
                    </div>

                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="meetings-container" style={{padding: '20px'}}>
                    <h2 className="meetings-title" style={{marginBottom: '25px', fontSize: '1.8rem', fontWeight: 'bold'}}>Reuniones del Proyecto</h2>

                    <div className="meetings-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                        
                        {/* Tarjeta Planning - Tipo 10 */}
                        <div className="meeting-card">
                            <div className="icon-circle" style={{backgroundColor: '#e3f2fd', color: '#2196f3'}}><Users size={30} /></div>
                            <h3>Planning</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/planning`)}>Ver Historial</button>
                        </div>

                        {/* Tarjeta Sprint Review - Tipo 11 */}
                        <div className="meeting-card">
                            <div className="icon-circle" style={{backgroundColor: '#e8f5e9', color: '#388e3c'}}><RefreshCw size={30} /></div>
                            <h3>Sprint Review</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/sprint`)}>Ver Historial</button>
                        </div>

                        {/* Tarjeta Daily Scrum - Tipo 13 */}
                        <div className="meeting-card">
                            <div className="icon-circle" style={{backgroundColor: '#fff3e0', color: '#f57c00'}}><Clock size={30} /></div>
                            <h3>Daily Scrum</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/daily`)}>Ver Historial</button>
                        </div>

                        {/* Tarjeta Retrospective - Tipo 12 */}
                        <div className="meeting-card">
                            <div className="icon-circle" style={{backgroundColor: '#fce4ec', color: '#d81b60'}}><MessageSquare size={30} /></div>
                            <h3>Retrospective</h3>
                            <button className="btn-detalle-blue" onClick={() => navigate(`/proyecto/${id}/reuniones/retrospective`)}>Ver Historial</button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default VerReuniones;