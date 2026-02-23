
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { RefObject } from 'react';
import {
    LogOut, User, ChevronDown, Briefcase, FileText,
    Home, List, PenTool, Calendar,
    AlertTriangle, CheckCircle, Clock, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import senaLogo from '../assets/sena.png';
import './dashboard_instructor/Dashboard.css';

// ==================== TYPES & INTERFACES ====================

/**
 * Estadística individual del dashboard estudiantil
 * @interface Stat
 * @property {string} label - Etiqueta descriptiva de la estadística
 * @property {number} value - Valor numérico de la estadística
 */
interface Stat {
    label: string;
    value: number;
}

/**
 * Información de estados de proyectos según metodología Scrum
 * @interface ProyectosInfo
 * @property {number} total - Total de proyectos
 * @property {number} porHacer - Proyectos pendientes (To Do)
 * @property {number} enProgreso - Proyectos en desarrollo (In Progress)
 * @property {number} hecho - Proyectos completados (Done)
 */
interface ProyectosInfo {
    total: number;
    porHacer: number;
    enProgreso: number;
    hecho: number;
}

/**
 * Datos principales del dashboard estudiantil
 * @interface DashboardData
 * @property {string} instructor - Nombre del estudiante
 * @property {string} correo - Correo electrónico del estudiante
 * @property {string} description - Descripción personal o del equipo
 * @property {Stat[]} stats - Array de estadísticas personales
 * @property {number} avance - Porcentaje general de avance
 * @property {ProyectosInfo} proyectosData - Información detallada de proyectos
 */
interface DashboardData {
    instructor: string;
    correo: string;
    description: string;
    stats: Stat[];
    avance: number;
    proyectosData: ProyectosInfo;
}

/**
 * Configuración de item de menú de navegación
 * @interface MenuItemConfig
 * @property {string} name - Nombre visible del menú
 * @property {React.ComponentType} icon - Icono de Lucide React
 * @property {boolean} active - Estado de activación del item
 * @property {string} path - Ruta de navegación
 */
interface MenuItemConfig {
    name: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    active: boolean;
    path: string;
}

// ==================== CONSTANTS ====================

/** URL base para la API de estadísticas del dashboard */
const API_URL = 'http://localhost:5000/dashboard-student';

/**
 * Datos iniciales del dashboard mientras se carga la información
 * @constant {DashboardData}
 */
const INITIAL_DATA: DashboardData = {
    instructor: "Cargando...",
    correo: "",
    description: "Cargando información...",
    stats: [
        { label: "Mis tareas Activas", value: 0 },
        { label: "Tareas Completadas", value: 0 },
        { label: "Participación en reuniones", value: 0 },
        { label: "Retroalimentaciones recibidas", value: 0 }
    ],
    avance: 0,
    proyectosData: { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 }
};

/**
 * Configuración del menú principal para estudiantes
 * Adaptado a metodología Scrum con enfoque en historias de usuario
 * @constant {MenuItemConfig[]}
 */
const STUDENT_MENU_ITEMS: MenuItemConfig[] = [
    { name: 'Inicio', icon: Home, active: true, path: '/dashboard' },
    { name: 'Mis Proyectos', icon: Briefcase, active: false, path: '/mis-proyectos' },
    { name: 'Historias de Usuario', icon: List, active: false, path: '/ver-tareas' },
    { name: 'Criterios de Aceptación', icon: Calendar, active: false, path: '/reuniones' },
    { name: 'Observaciones', icon: MessageSquare, active: false, path: '/retroalimentacion' }
];

/**
 * Configuración del menú de configuración y soporte
 * @constant {MenuItemConfig[]}
 */
const SETTINGS_ITEMS: MenuItemConfig[] = [
    { name: 'Ayuda / Soporte', icon: FileText, active: false, path: '/ayuda' }
];

/**
 * Paleta de colores para estados de proyectos
 * Basada en colores estándar de metodologías ágiles
 * @constant {Object}
 * @readonly
 */
const COLORS = {
    porHacer: '#FFC107',
    enProgreso: '#39A900',
    hecho: '#8a2be2'
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calcula los porcentajes de distribución de proyectos
 * @param {ProyectosInfo} data - Datos de proyectos
 * @returns {{porHacer: number, enProgreso: number, hecho: number}} Porcentajes calculados
 */
const calculatePercentages = (data: ProyectosInfo) => {
    const { total, porHacer, enProgreso } = data;

    if (total === 0) {
        return { porHacer: 0, enProgreso: 0, hecho: 0 };
    }

    const pctPorHacer = Math.round((porHacer / total) * 100);
    const pctEnProgreso = Math.round((enProgreso / total) * 100);
    const pctHecho = 100 - pctPorHacer - pctEnProgreso;

    return { porHacer: pctPorHacer, enProgreso: pctEnProgreso, hecho: pctHecho };
};

// ==================== CUSTOM HOOKS ====================

/**
 * Hook personalizado para validación de autenticación
 * Verifica cédula y rolId en localStorage, redirige si no válidos
 * @returns {{validateAuth: Function}} Función de validación
 */
const useAuthValidation = () => {
    const navigate = useNavigate();

    const validateAuth = useCallback(() => {
        const cedula = localStorage.getItem('userCedula');
        const roleId = localStorage.getItem('userRoleId');

        console.log('Validando auth:', { cedula, roleId });

        if (!cedula || !roleId) {
            console.warn('Auth validation failed: missing cedula or roleId');
            localStorage.clear();
            navigate('/');
            return false;
        }

        return { cedula, roleId };
    }, [navigate]);

    return { validateAuth };
};

/**
 * Hook personalizado para gestión de datos del dashboard estudiantil
 * Maneja estado de carga, fetching de datos y errores
 * @returns {{data: DashboardData, isLoading: boolean}} Estado del dashboard
 */
const useStudentDashboardData = () => {
    const [data, setData] = useState<DashboardData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const { validateAuth } = useAuthValidation();

    useEffect(() => {
        const auth = validateAuth();
        if (!auth) return;

        const { token, cedula } = auth;

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}?cedula=${cedula}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener datos');
                }

                const apiData = await response.json();

                setData({
                    instructor: apiData.instructor ?? "Estudiante SENA",
                    correo: apiData.correo ?? "",
                    description: apiData.description ?? "Sin descripción disponible.",
                    stats: apiData.stats?.length > 0 ? apiData.stats : INITIAL_DATA.stats,
                    avance: apiData.avance ?? 0,
                    proyectosData: apiData.proyectosData ?? INITIAL_DATA.proyectosData
                });
            } catch (error) {
                console.error("Error API:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [validateAuth]);

    return { data, isLoading };
};

/**
 * Hook personalizado para detectar clics fuera de un elemento
 * Útil para cerrar menús dropdown y modales
 * @param {RefObject<HTMLDivElement | null>} ref - Referencia al elemento
 * @param {() => void} callback - Función a ejecutar al hacer clic fuera
 */
const useClickOutside = (ref: RefObject<HTMLDivElement | null>, callback: () => void) => {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [ref, callback]);
};

// ==================== REUSABLE COMPONENTS ====================

/**
 * Componente Dropdown para el perfil de usuario
 * Muestra opciones de perfil y cerrar sesión
 * @component
 * @param {DropdownProfileProps} props - Propiedades del componente
 */
interface DropdownProfileProps {
    onLogoutRequest: () => void;
}

const DropdownProfile: React.FC<DropdownProfileProps> = ({ onLogoutRequest }) => (
    <ul className="dropdown-profile">
        <li>
            <User size={16} style={{ marginRight: '8px' }} />
            Mi Perfil
        </li>
        <li className="logout" onClick={onLogoutRequest}>
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Cerrar Sesión
        </li>
    </ul>
);

/**
 * Componente de tarjeta de estadística individual
 * Muestra un icono, valor y etiqueta de forma visual
 * @component
 * @param {StatCardProps} props - Propiedades del componente
 */
interface StatCardProps {
    stat: Stat;
    index: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
    const renderIcon = () => {
        const normalizedLabel = stat.label.toLowerCase();

        if (normalizedLabel.includes('tarea activa'))
            return <Clock size={28} />;
        if (normalizedLabel.includes('tarea completa') || normalizedLabel.includes('tarea completada'))
            return <CheckCircle size={28} />;
        if (normalizedLabel.includes('reunion') || normalizedLabel.includes('participación'))
            return <Calendar size={28} />;
        if (normalizedLabel.includes('retroalimentación'))
            return <MessageSquare size={28} />;
        if (normalizedLabel.includes('proyecto'))
            return <Briefcase size={28} />;

        return <FileText size={28} />;
    };

    return (
        <div key={index} className="card-stat">
            <div className="icon-container">
                {renderIcon()}
            </div>
            <div className="stat-info">
                <p className="number">{stat.value}</p>
                <h3>{stat.label}</h3>
            </div>
        </div>
    );
};

/**
 * Componente de gráfico circular (donut chart) para proyectos
 * Muestra visualmente la distribución de estados de proyectos
 * @component
 * @param {StudentProjectChartProps} props - Propiedades del componente
 */
interface StudentProjectChartProps {
    proyectosData: ProyectosInfo;
}

const StudentProjectChart: React.FC<StudentProjectChartProps> = ({ proyectosData }) => {
    const percentages = useMemo(() => calculatePercentages(proyectosData), [proyectosData]);
    const { total, porHacer, enProgreso, hecho } = proyectosData;

    const chartStyle = useMemo(() => ({
        background: `conic-gradient(
            ${COLORS.porHacer} 0% ${percentages.porHacer}%,
            ${COLORS.enProgreso} ${percentages.porHacer}% ${percentages.porHacer + percentages.enProgreso}%,
            ${COLORS.hecho} ${percentages.porHacer + percentages.enProgreso}% 100%
        )`
    }), [percentages]);

    const legendItems = [
        { label: 'Por hacer (Pendiente)', value: porHacer, percentage: percentages.porHacer, color: COLORS.porHacer },
        { label: 'En progreso (Activo)', value: enProgreso, percentage: percentages.enProgreso, color: COLORS.enProgreso },
        { label: 'Hecho (Finalizado)', value: hecho, percentage: percentages.hecho, color: COLORS.hecho }
    ];

    return (
        <div className="summary-card-full">
            <h3>Estado Global de Proyectos</h3>
            <div className="summary-layout">
                <div className="legend-container">
                    {legendItems.map((item) => (
                        <div key={item.label} className="legend-item">
                            <span className="dot" style={{ backgroundColor: item.color }} />
                            <span className="legend-label">{item.label}</span>
                            <span className="legend-value">
                                {item.value} ({item.percentage}%)
                            </span>
                        </div>
                    ))}

                    <div className="legend-item" style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                        <span className="legend-label"><strong>Total Proyectos:</strong></span>
                        <span className="legend-value"><strong>{total}</strong></span>
                    </div>
                </div>

                <div className="chart-container">
                    <div className="donut-chart" style={chartStyle}>
                        <div className="donut-inner">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{total}</span>
                                <span style={{ fontSize: '0.85rem', color: '#777' }}>Proyectos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Componente Modal de confirmación para cerrar sesión
 * Muestra advertencia y botones de confirmación
 * @component
 * @param {LogoutModalProps} props - Propiedades del componente
 */
interface LogoutModalProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isVisible, onConfirm, onCancel }) => {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="warning-icon-container">
                    <AlertTriangle size={40} color="white" strokeWidth={3} />
                </div>
                <h2 className="modal-title">¿Estás seguro?</h2>
                <div className="modal-buttons">
                    <button className="btn-confirm-logout" onClick={onConfirm}>
                        Sí, Cerrar
                    </button>
                    <button className="btn-cancel-logout" onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

/**
 * Componente principal del Dashboard Estudiantil
 * 
 * Orquesta todos los subcomponentes y hooks para crear una experiencia
 * completa de dashboard para aprendices del SENA con enfoque Scrum.
 * 
 * Características principales:
 * - Navegación contextual para estudiantes
 * - Estadísticas personales en tiempo real
 * - Visualización de proyectos con metodología Scrum
 * - Gestión de sesión segura
 * - Interfaz responsive y moderna
 * 
 * @component
 * @returns {JSX.Element} Dashboard completo renderizado
 */
const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: dashboardData, isLoading } = useStudentDashboardData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/');
    }, [navigate]);

    const handleNavigation = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    if (isLoading) {
        return <div className="loading-screen">Cargando...</div>;
    }

    return (
        <div className="dashboard-page">
            <div className="container-dashboard">

                {/* Sidebar Navigation */}
                <aside className="side-card">
                    <div className="brand-block">
                        <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                        <h2>Gestión de proyectos</h2>
                    </div>

                    <nav className="menu">
                        <p className="menu-title">MENU</p>
                        <ul>
                            {STUDENT_MENU_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li
                                        key={item.name}
                                        className={item.active ? 'active' : ''}
                                        onClick={() => handleNavigation(item.path)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Icon size={18} style={{ marginRight: '10px' }} />
                                        {item.name}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="settings">
                        <p className="menu-title">SETTINGS</p>
                        <ul>
                            {SETTINGS_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li
                                        key={item.name}
                                        onClick={() => handleNavigation(item.path)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Icon size={18} style={{ marginRight: '10px' }} />
                                        {item.name}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="content">
                    <nav className="nav-top">
                        <div className="title-section">
                            <h1>Gestión de proyectos</h1>
                        </div>
                        <div
                            className="profile-menu"
                            ref={menuRef}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dashboardData.instructor)}&background=random&color=fff`}
                                className="profile-img"
                                alt="Avatar"
                            />
                            <span className="profile-name">{dashboardData.instructor}</span>
                            <ChevronDown size={18} style={{ color: '#999' }} />
                            {isMenuOpen && (
                                <DropdownProfile onLogoutRequest={() => setShowLogoutModal(true)} />
                            )}
                        </div>
                    </nav>

                    <section className="dashboard-content">
                        <h2>Bienvenido, {dashboardData.instructor}</h2>
                        <p className="welcome-subtitle">
                            Aquí puedes ver tus avances, tus logros y todo lo que estás construyendo junto a tu equipo
                        </p>

                        {/* Statistics Cards */}
                        <section className="basic-cards">
                            {dashboardData.stats.map((stat, index) => (
                                <StatCard key={index} stat={stat} index={index} />
                            ))}
                        </section>

                        {/* Description Section */}
                        <section className="description-section">
                            <div className="desc-header">
                                <PenTool size={20} color={COLORS.enProgreso} style={{ marginRight: '10px' }} />
                                <h3>Descripción</h3>
                            </div>
                            <h4>
                                Facilitar la gestión, administración y monitoreo de los proyectos desarrollados
                                por los aprendices del SENA mediante una aplicación basada en la metodología
                                ágil Scrum. La plataforma brindará herramientas para que los instructores
                                supervisen los proyectos, promoviendo la colaboración, la innovación y la
                                creación de soluciones efectivas.
                            </h4>
                        </section>

                        {/* Projects Summary */}
                        <section className="summary-section">
                            <StudentProjectChart proyectosData={dashboardData.proyectosData} />
                        </section>
                    </section>
                </main>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isVisible={showLogoutModal}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </div>
    );
};

export default StudentDashboard;
