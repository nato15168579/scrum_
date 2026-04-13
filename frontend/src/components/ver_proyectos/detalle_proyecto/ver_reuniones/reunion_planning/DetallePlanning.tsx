import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, Calendar, Clock, Info, Tag, HelpCircle, User
} from 'lucide-react';
import senaLogo from '../../../../../assets/sena.png'; 
import '../../../../dashboard_instructor/Dashboard.css'; 
import './DetallePlanning.css';
import { API_URL } from '../../../../../config/Api';

interface PlanningSession {
    reuId: number;
    reuFecha: string;
    reuHora: string;
    reuLugar: string;
    sprNombre: string; 
    reuDescripcion: string;
}

const DetallePlanning: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sesiones, setSesiones] = useState<PlanningSession[]>([]);
    const [filtroFecha, setFiltroFecha] = useState(''); // Estado para el filtro
    const [loading, setLoading] = useState(true);

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

        const fetchData = async () => {
            setLoading(true);
            try {
                const resProf = await axios.get(`${API_URL}/dashboard?cedula=${cedula}`);
                if (resProf.data?.instructor) setInstructorName(resProf.data.instructor);

                const resSessions = await axios.get(`${API_URL}/reuniones/proyecto/${id}?tipo=10`);
                
                const dataMapeada = resSessions.data.map((r: any) => ({
                    reuId: r.reuId,
                    reuFecha: r.reuFecha,
                    reuHora: r.reuHora || '00:00',
                    reuLugar: r.reuLugar || 'No especificado',
                    sprNombre: r.sprIdFk2?.sprNombre || 'Sin Sprint',
                    reuDescripcion: r.reuDescripcion || 'Sin descripción'
                }));

                setSesiones(dataMapeada);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // Lógica de filtrado: Si no hay fecha seleccionada, muestra todo.
    // De lo contrario, filtra por la propiedad reuFecha.
    const sesionesFiltradas = sesiones.filter(sesion => {
        if (!filtroFecha) return true;
        return sesion.reuFecha === filtroFecha;
    });

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

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
                        <button className="btn-back-arrow" onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Reuniones / <span style={{color: '#39A900'}}>Historial Planning</span></h1>
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

                <div className="planning-view-container" style={{padding: '20px'}}>
                    
                    {/* --- FILTROS Y CONTADOR --- */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>Registros de Planning</h2>
                            
                            {/* Input de Filtro de Fecha */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '5px 10px', borderRadius: '8px', border: '1px solid #ddd'}}>
                                <Calendar size={18} color="#666" />
                                <input 
                                    type="date" 
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                    style={{border: 'none', outline: 'none', color: '#444', fontSize: '0.9rem'}}
                                />
                                {filtroFecha && (
                                    <button 
                                        onClick={() => setFiltroFecha('')}
                                        style={{background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '0.8rem'}}
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="total-badge" style={{backgroundColor: '#e8f5e9', color: '#39A900', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #39A900'}}>
                            Total: {sesionesFiltradas.length}
                        </div>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th><Calendar size={16} /> Fecha y Hora</th>
                                    <th><Tag size={16} /> Sprint</th>
                                    <th><MapPin size={16} /> Lugar</th>
                                    <th><Info size={16} /> Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="loading-cell">Cargando registros...</td></tr>
                                ) : sesionesFiltradas.length > 0 ? (
                                    sesionesFiltradas.map(sesion => (
                                        <tr key={sesion.reuId}>
                                            <td className="date-time-col">
                                                <div style={{fontWeight: 'bold'}}>{sesion.reuFecha}</div>
                                                <div style={{fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                    <Clock size={12} /> {sesion.reuHora}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="sprint-badge" style={{backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem'}}>{sesion.sprNombre}</span>
                                            </td>
                                            <td>{sesion.reuLugar}</td>
                                            <td style={{maxWidth: '350px'}}>{sesion.reuDescripcion}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="empty-msg" style={{textAlign: 'center', padding: '20px'}}>
                                            {filtroFecha ? 'No hay reuniones para esta fecha.' : 'No se encontraron sesiones para este proyecto.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetallePlanning;