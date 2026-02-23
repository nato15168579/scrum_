import React, { useState, useEffect, useRef } from 'react';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    ChevronDown, LogOut, ArrowLeft, HelpCircle, AlertTriangle
} from 'lucide-react'; 
import { useNavigate, useParams } from 'react-router-dom';
import senaLogo from '../../../assets/sena.png'; 
import '../../dashboard_instructor/Dashboard.css'; 
import './VerMasProyecto.css'; 
import { API_URL } from '../../../config/api';

const VerMasProyecto = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    
    const [proyecto, setProyecto] = useState<any>(null);
    const [instructorName, setInstructorName] = useState('Instructor'); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');
        
        if (!id) return;

        // 1. Obtener detalles del proyecto
        fetch(`${API_URL}/proyectos/${id}`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Respuesta del server:", data);

            // IMPORTANTE: Tu código normaliza las llaves a minúsculas
            const raw = Array.isArray(data) ? data[0] : data;

            if (raw) {
                const normalizedData = Object.keys(raw).reduce((acc: any, key) => {
                    acc[key.toLowerCase()] = raw[key];
                    return acc;
                }, {});
                setProyecto(normalizedData);
            }
        })
        .catch(err => console.error("Error al cargar detalle:", err));

        // 2. Obtener nombre del instructor
        if (cedula) {
            fetch(`${API_URL}/dashboard?cedula=${cedula}`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setInstructorName(data?.instructor || "Instructor SENA"));
        }
    }, [id]);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard-instructor' },
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
                                className={item.path === '/asignar-proyectos' ? 'active' : ''} 
                                onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <button onClick={() => navigate('/asignar-proyectos')} className="btn-back-arrow" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900'}}>
                            <ArrowLeft size={28} />
                        </button>
                        <h1>Asignar proyectos / Ver más</h1>
                    </div>
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

                <div className="detalle-container">
                    <div className="detalle-card">
                        <h2 className="detalle-title">Información del Proyecto</h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">CÓDIGO</span> 
                                {/* pro_id en minúsculas por la normalización */}
                                <span className="value">{proyecto?.pro_id || id}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">NOMBRE</span> 
                                <span className="value">{proyecto?.pro_nombre || 'Cargando...'}</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="label">FECHA DE INICIO</span> 
                                <span className="value">
                                    {proyecto?.pro_fecha_inicio 
                                        ? new Date(proyecto.pro_fecha_inicio).toLocaleDateString('es-ES') 
                                        : '---'}
                                </span>
                            </div>

                            <div className="info-row">
                                <span className="label">ESTADO</span> 
                                <span className="value status-text" style={{ color: '#39A900', fontWeight: 'bold' }}>
                                    {proyecto?.estado_nombre || 'ACTIVO'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="descripcion-section">
                        <h3>Descripción / Objetivo General</h3>
                        <p>{proyecto?.pro_descripcion || proyecto?.pro_objetivo_general || 'Sin descripción disponible.'}</p>
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

export default VerMasProyecto;