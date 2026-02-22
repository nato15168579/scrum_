import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, Calendar, Search 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './VerReuniones.css'; 
import './CriteriosAceptacion.css'; // Estilos de tabla

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

// Sidebar (Igual que siempre)
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
            <div className="brand-block"><img src={senaLogo} alt="Logo" className="logo-lg" /><h2>Gestión de proyectos</h2></div>
            <nav className="menu"><p className="menu-title">MENU</p><ul>{menuItems.map(item => <li key={item.name} className={item.active ? 'active' : ''} onClick={() => item.path && navigate(item.path)}><item.icon size={18} style={{marginRight: '10px'}}/> {item.name}</li>)}</ul></nav>
        </aside>
    );
};

const ReunionDetalle: React.FC = () => {
    const { id, type } = useParams<{ id: string, type: string }>(); 
    const navigate = useNavigate();
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Títulos Dinámicos
    const getTitle = () => {
        switch(type) {
            case 'planning': return 'Reunión Planning';
            case 'sprint': return 'Gestión de Sprints'; // Ajustado al contexto
            case 'daily': return 'Reunión Daily Meeting';
            case 'review': return 'Reunión Retrospectiva / Review';
            default: return 'Detalle';
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');
        if (!token) { navigate('/'); return; }

        // 1. Cargar Perfil
        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));

        // 2. Cargar Datos REALES de la BD
        setLoading(true);
        axios.get(`${API_BASE_URL}/proyectos/${id}/reuniones/${type}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                // Si falla (ej: tabla vacía), dejamos data vacía para mostrar mensaje
                setData([]);
            });

    }, [id, type, navigate]);

    // Renderizado de Tablas según el Tipo
    const renderTable = () => {
        if (data.length === 0) return <div style={{textAlign:'center', padding:'40px', color:'#777'}}>No hay registros de reuniones para este proyecto.</div>;

        if (type === 'planning') {
            return (
                <table className="table-green-header">
                    <thead>
                        <tr>
                            <th>ID Sprint</th>
                            <th>Fecha</th>
                            <th>IDs Historias</th>
                            <th>Objetivo del Sprint</th>
                            <th>Entregable Esperado</th>
                            <th>Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                <td>{row.idSprint}</td>
                                <td>{new Date(row.fecha).toLocaleDateString()}</td>
                                <td>{row.idHU || 'Sin historias'}</td>
                                <td>{row.objetivo}</td>
                                <td>{row.entrega}</td>
                                <td>{row.duracion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (type === 'sprint') {
            return (
                <table className="table-green-header">
                    <thead>
                        <tr>
                            <th>ID Sprint</th>
                            <th>Fecha Inicio - Fin</th>
                            <th>Objetivo</th>
                            <th>Descripción</th>
                            <th>Duración Est.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                <td>{row.id}</td>
                                <td>{row.fecha}</td>
                                <td style={{fontWeight:'bold'}}>{row.objetivo}</td>
                                <td>{row.descripcion}</td>
                                <td>{row.duracion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (type === 'daily') {
            return (
                <table className="table-green-header">
                    <thead>
                        <tr>
                            <th>Rol / Asistente</th>
                            <th>Fecha</th>
                            <th>Resumen / Preguntas</th>
                            {/* Columnas visuales para completar el diseño solicitado */}
                            <th>Lunes</th>
                            <th>Martes</th>
                            <th>Miércoles</th>
                            <th>Jueves</th>
                            <th>Viernes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                <td>{row.rol}</td>
                                <td>{new Date(row.fecha).toLocaleDateString()}</td>
                                <td style={{maxWidth:'300px'}}>{row.pregunta}</td>
                                <td style={{color:'#ccc'}}>--</td>
                                <td style={{color:'#ccc'}}>--</td>
                                <td style={{color:'#ccc'}}>--</td>
                                <td style={{color:'#ccc'}}>--</td>
                                <td style={{color:'#ccc'}}>--</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // Default: Review / Retro
        return (
            <table className="table-green-header">
                <thead>
                    <tr>
                        <th>ID Sprint</th>
                        <th>Fecha</th>
                        <th>Scrum Master</th>
                        <th>¿Qué salió bien?</th>
                        <th>¿Qué mejorar?</th>
                        <th>Acciones</th>
                        <th>Responsable</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td>{row.idSprint}</td>
                            <td>{new Date(row.fecha).toLocaleDateString()}</td>
                            <td>{row.master}</td>
                            <td>{row.bien}</td>
                            <td>{row.mejorar}</td>
                            <td>{row.acciones}</td>
                            <td>{row.responsable}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />
            <div className="main-content-area">
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>Proyecto / Ver reuniones / <span className="current-page">Detalle</span></h1>
                    </div>
                    <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`} className="profile-img" alt="Avatar"/>
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} color="#999"/>
                        {isMenuOpen && <ul className="dropdown-profile"><li className="logout" onClick={() => {localStorage.clear(); navigate('/');}}><LogOut size={16} style={{marginRight:'8px'}}/> Cerrar Sesión</li></ul>}
                    </div>
                </nav>

                <div className="criterios-container">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                        <h2 className="section-title">{getTitle()}</h2>
                        <div style={{display:'flex', alignItems:'center', background:'#f3e5f5', padding:'8px 15px', borderRadius:'20px', width:'250px'}}>
                            <input type="text" placeholder="buscar" style={{border:'none', background:'transparent', outline:'none', width:'100%'}} />
                            <Search size={18} color="#555"/>
                        </div>
                    </div>

                    {loading ? <p style={{padding:'20px', textAlign:'center'}}>Cargando información...</p> : renderTable()}
                </div>
            </div>
        </div>
    );
};

export default ReunionDetalle;