import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, Calendar, User, HelpCircle, HeartHandshake, Clock
} from 'lucide-react';
import senaLogo from '../../../../../assets/sena.png'; 
import '../../../../dashboard_instructor/Dashboard.css'; 
import '../reunion_planning/DetallePlanning.css'; 
import { API_URL } from '../../../../../config/Api';

interface RetroSession {
    reuId: number;
    reuFecha: string;
    reuResumen: string | null;
    sprIdFk2?: {
        sprNombre: string;
    };
}

const DetalleRetrospective: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sesiones, setSesiones] = useState<RetroSession[]>([]);
    const [filtroFecha, setFiltroFecha] = useState('');
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

                // Mantenemos la ruta de reuniones con tipo 12
                const res = await axios.get(`${API_URL}/reuniones/proyecto/${id}?tipo=12`);
                setSesiones(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error al cargar retrospectivas:", err);
                setSesiones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const sesionesFiltradas = sesiones.filter(s => 
        filtroFecha === '' || (s.reuFecha && s.reuFecha.includes(filtroFecha))
    );

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

            {/* --- CONTENIDO --- */}
            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center'}}>
                        <button className="btn-back-arrow" onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#39A900', marginRight: '15px'}}>
                            <ChevronLeft size={28} />
                        </button>
                        <h1>Reuniones / <span style={{color: '#d81b60'}}>Sprint Retrospective</span></h1>
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
                    <div className="filter-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <div className="filter-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500'}}><Calendar size={18} /> Filtrar fecha:</label>
                            <input 
                                type="date" 
                                className="input-date-filter"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                                style={{padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd'}}
                            />
                        </div>
                        
                        <div className="total-badge" style={{
                            padding: '6px 18px', 
                            borderRadius: '25px', 
                            backgroundColor: '#fce4ec', 
                            color: '#d81b60',
                            border: '1.5px solid #d81b60',
                            fontWeight: 'bold'
                        }}>
                            Retrospectivas: {sesionesFiltradas.length}
                        </div>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Sprint</th>
                                    <th>Compromisos y Mejoras de la Sesión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="loading-cell">Cargando historial...</td></tr>
                                ) : sesionesFiltradas.length > 0 ? (
                                    sesionesFiltradas.map(sesion => (
                                        <tr key={sesion.reuId}>
                                            <td style={{width: '180px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <Clock size={14} color="#d81b60" />
                                                    <strong>{sesion.reuFecha}</strong>
                                                </div>
                                            </td>
                                            <td style={{width: '150px'}}>
                                                <span className="badge-sprint" style={{backgroundColor: '#fce4ec', color: '#d81b60', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500'}}>
                                                    {sesion.sprIdFk2?.sprNombre || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'left', lineHeight: '1.6'}}>
                                                <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#444', fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
                                                    <HeartHandshake size={16} style={{marginTop: '4px', flexShrink: 0, color: '#d81b60'}}/>
                                                    <span>{sesion.reuResumen || 'Sin compromisos registrados'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="empty-msg" style={{padding: '40px', color: '#999', textAlign: 'center'}}>
                                            No se encontraron retrospectivas para mostrar.
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

export default DetalleRetrospective;