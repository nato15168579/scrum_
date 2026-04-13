import { useState, useEffect } from 'react';
import { 
    LogOut, User, ChevronDown, Users, Briefcase, 
    Home, List, Plus, MapPin, Eye, PenTool, Calendar,
    AlertTriangle, HelpCircle
} from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import './Dashboard.css'; 
import { API_URL } from '../../config/Api'; 

// Interfaces en PascalCase 
interface Stat { 
    Label: string; 
    Value: number; 
}

interface ProyectosInfo { 
    Total: number; 
    PorHacer: number; 
    EnProgreso: number; 
    Hecho: number; 
}

interface DashboardData {
    Instructor: string;
    Correo: string;
    Descripcion: string;
    Stats: Stat[];
    ProyectosData: ProyectosInfo; 
}

// Configuración de menú fuera del componente para optimización
const MenuItems = [
    { Name: 'Inicio', Icon: Home, Path: '/dashboard' },
    { Name: 'Lista de Aprendices', Icon: Users, Path: '/lista-aprendices' },
    { Name: 'Crear Proyecto', Icon: Plus, Path: '/crear-proyecto' },
    { Name: 'Asignar Proyectos', Icon: MapPin, Path: '/asignar-proyectos' },
    { Name: 'Ver Proyectos', Icon: Eye, Path: '/ver-proyectos' },
    { Name: 'Registrar Aprendiz', Icon: List, Path: '/registrar-aprendiz' },
];

const InstructorDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedCedula = localStorage.getItem('userCedula'); 
        if (!storedCedula) { navigate('/'); return; }

        fetch(`${API_URL}/dashboard?cedula=${storedCedula}`)
            .then(res => res.json())
            .then(data => {
                // Mapeo simple si la API devuelve minúsculas, para asegurar PascalCase en el estado
                if (data && !data.error) {
                    setDashboardData({
                        Instructor: data.instructor,
                        Correo: data.correo,
                        Descripcion: data.description,
                        Stats: data.stats.map((s: any) => ({ Label: s.label, Value: s.value })),
                        ProyectosData: {
                            Total: data.proyectosData.total,
                            PorHacer: data.proyectosData.porHacer,
                            EnProgreso: data.proyectosData.enProgreso,
                            Hecho: data.proyectosData.hecho
                        }
                    });
                }
                setIsLoading(false);
            })
            .catch(err => { 
                console.error("Error al cargar datos:", err); 
                setIsLoading(false); 
            });
    }, [navigate]);

    const confirmLogout = () => {
        localStorage.clear(); 
        navigate('/'); 
    };

    if (isLoading || !dashboardData) return <div className="loading-screen">Cargando...</div>;

    const { Total, PorHacer, EnProgreso, Hecho } = dashboardData.ProyectosData;
    
    const DonutStyle = {
        background: Total > 0 
            ? `conic-gradient(#FFC107 0% ${(PorHacer / Total) * 100}%, #39A900 ${(PorHacer / Total) * 100}% ${((PorHacer + EnProgreso) / Total) * 100}%, #8a2be2 ${((PorHacer + EnProgreso) / Total) * 100}% 100%)`
            : '#e2e8f0'
    };

    return (
        <div className="dashboard-page">
            <aside className="side-card">
                <div className="brand-block">
                    <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                    <h2>Gestión de proyectos</h2>
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
                        style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px' }}
                        onClick={() => navigate('/ayuda-soporte')}
                    >
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span style={{fontSize: '0.95rem', fontWeight: 500, color: '#555'}}>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section"><h1>Dashboard Principal</h1></div>
                    <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dashboardData.Instructor)}&background=39A900&color=fff`} 
                            className="profile-img" 
                            alt="Avatar"
                        />
                        <span className="profile-name">{dashboardData.Instructor}</span>
                        <ChevronDown size={18} />
                        
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}>
                                    <User size={16} style={{marginRight: '8px'}}/> Mi Perfil
                                </li>
                                <li className="logout" onClick={(e) => {
                                    e.stopPropagation(); 
                                    setShowLogoutModal(true);
                                }}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="vp-container">
                    <section className="dashboard-content">
                        <h2>Bienvenido, {dashboardData.Instructor}</h2>
                        <p className="welcome-subtitle">Consulta la información de tu proyecto y su avance global.</p>
                        
                        <section className="basic-cards">
                            {dashboardData.Stats.map((stat, i) => (
                                <div key={i} className="card-stat">
                                    <div className="icon-container">
                                        {i === 0 && <Users size={24} />}
                                        {i === 1 && <Calendar size={24} />}
                                        {i === 2 && <Briefcase size={24} />}
                                    </div>
                                    <div className="stat-info">
                                        <p className="number">{stat.Value}</p>
                                        <h3>{stat.Label}</h3>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="description-section">
                            <div className="desc-header">
                                <PenTool size={20} color="#39A900" style={{marginRight:'10px'}}/>
                                <h3>Propósito del Sistema</h3>
                            </div>
                            <p className="desc-text">{dashboardData.Descripcion}</p>
                        </section>

                        <section className="summary-section">
                            <div className="summary-card-full">
                                <h3>Estado Global de Proyectos</h3>
                                <div className="summary-layout">
                                    <div className="legend-container">
                                        <div className="legend-item">
                                            <span className="dot" style={{backgroundColor: '#FFC107'}}></span>
                                            <span className="legend-label">Por hacer:</span>
                                            <span className="legend-value">{PorHacer}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="dot" style={{backgroundColor: '#39A900'}}></span>
                                            <span className="legend-label">En progreso:</span>
                                            <span className="legend-value">{EnProgreso}</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="dot" style={{backgroundColor: '#8a2be2'}}></span>
                                            <span className="legend-label">Hecho:</span>
                                            <span className="legend-value">{Hecho}</span>
                                        </div>
                                    </div>
                                    <div className="chart-container">
                                        <div className="donut-chart" style={DonutStyle}>
                                            <div className="donut-inner">
                                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                                    <span style={{fontSize:'1.8rem', fontWeight:'bold'}}>{Total}</span>
                                                    <span style={{fontSize:'0.8rem', color:'#777'}}>Proyectos</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>
                </div>
            </main>

            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container">
                            <AlertTriangle size={50} color="white" />
                        </div>
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

export default InstructorDashboard;
