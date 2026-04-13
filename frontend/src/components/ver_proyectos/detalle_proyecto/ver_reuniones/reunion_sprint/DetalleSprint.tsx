import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, Calendar, Clock, Tag, 
    HelpCircle, User, MessageSquare
} from 'lucide-react';
import senaLogo from '../../../../../assets/sena.png'; 
import '../../../../dashboard_instructor/Dashboard.css'; 
import '../reunion_planning/DetallePlanning.css'; 
import { API_URL } from '../../../../../config/Api';

interface SprintMeeting {
    reuId: number;
    reuFecha: string;
    reuHora: string;
    reuLugar: string;
    reuResumen?: string | null;
    reuDescripcion?: string | null; 
    sprIdFk2?: {
        sprNombre: string;
    };
}

const DetalleSprint: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const queryParams = new URLSearchParams(location.search);
    const tipoReunion = parseInt(queryParams.get('tipo') || '11'); 

    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sesiones, setSesiones] = useState<SprintMeeting[]>([]);
    const [filtroFecha, setFiltroFecha] = useState(''); // Estado para el filtro
    const [loading, setLoading] = useState(true);

    const titulos: Record<number, string> = {
        11: 'Sprint Review',
        12: 'Sprint Retrospective',
        13: 'Daily Scrum'
    };

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

                const res = await axios.get(`${API_URL}/reuniones/proyecto/${id}?tipo=${tipoReunion}`);
                setSesiones(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setSesiones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, tipoReunion, navigate]);

    // Lógica de filtrado
    const sesionesFiltradas = sesiones.filter(s => 
        filtroFecha === '' || (s.reuFecha && s.reuFecha.includes(filtroFecha))
    );

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
                        <h1>Reuniones / <span style={{color: '#39A900'}}>{titulos[tipoReunion]}</span></h1>
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
                    {/* BARRA DE FILTROS ACTUALIZADA */}
                    <div className="filter-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <div className="filter-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500'}}>
                                <Calendar size={18} /> Filtrar por fecha:
                            </label>
                            <input 
                                type="date" 
                                className="input-date-filter"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                                style={{padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd'}}
                            />
                        </div>
                        <div className="total-badge" style={{padding: '6px 18px', borderRadius: '25px', border: '1.5px solid #39A900', color: '#39A900', fontWeight: 'bold'}}>
                            Actas encontradas: {sesionesFiltradas.length}
                        </div>
                    </div>

                    <div className="vp-table-card">
                        <table className="vp-table">
                            <thead>
                                <tr>
                                    <th><Calendar size={16} /> Fecha / Hora</th>
                                    <th><Tag size={16} /> Sprint</th>
                                    <th><MapPin size={16} /> Lugar</th>
                                    <th><MessageSquare size={16} /> Resumen / Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="loading-cell">Cargando registros...</td></tr>
                                ) : sesionesFiltradas.length > 0 ? (
                                    sesionesFiltradas.map(sesion => (
                                        <tr key={sesion.reuId}>
                                            <td style={{minWidth: '140px'}}>
                                                <div style={{fontWeight: 'bold'}}>{sesion.reuFecha}</div>
                                                <div style={{fontSize: '0.85rem', color: '#666'}}>
                                                    <Clock size={12} style={{verticalAlign: 'middle'}}/> {sesion.reuHora || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="sprint-tag" style={{backgroundColor: '#f4f4f4', padding: '4px 8px', borderRadius: '5px'}}>
                                                    {sesion.sprIdFk2?.sprNombre || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{sesion.reuLugar || 'No definido'}</td>
                                            <td style={{textAlign: 'left', lineHeight: '1.5', minWidth: '350px'}}>
                                                <div style={{color: '#444', fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
                                                    {sesion.reuDescripcion || sesion.reuResumen || (
                                                        <em style={{color: '#999'}}>Sin descripción registrada</em>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="empty-msg" style={{padding: '40px', color: '#999', textAlign: 'center'}}>
                                            No se encontraron registros para la fecha seleccionada.
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

export default DetalleSprint;