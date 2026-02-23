import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, FileText, User 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './CrearSugerencia.css'; // Estilos específicos (Gris y Neón)

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

// --- SIDEBAR (Reutilizable) ---
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
            <div className="settings">
                <p className="menu-title">SETTINGS</p>
                <ul>
                    <li onClick={() => navigate('/ayuda')}>
                        <FileText size={18} style={{marginRight: '10px'}}/> Ayuda/Soporte
                    </li>
                </ul>
            </div>
        </aside>
    );
};

// --- COMPONENTE PRINCIPAL ---
const CrearSugerencia: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // ID del proyecto desde la URL
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: ''
    });

    // Perfil
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- Carga Inicial ---
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');

        if (!token || !cedula) { navigate('/'); return; }

        // Cargar Nombre del Instructor
        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));
            
        // Cierre del menú al hacer click fuera
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [navigate]);

    // --- Manejo de Inputs ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de cerrar sesión?")) {
            localStorage.clear();
            navigate('/');
        }
    };

    // --- ENVÍO AL BACKEND (Guardar en Base de Datos) ---
    const handleEnviar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Validaciones
        if (!formData.titulo || !formData.descripcion) {
            alert("Por favor completa todos los campos obligatorios (*)");
            return;
        }

        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');

        if (!token || !cedula) {
            alert("Sesión no válida.");
            navigate('/');
            return;
        }

        try {
            // 2. Petición POST al endpoint creado en el Backend
            const response = await axios.post(`${API_BASE_URL}/crear-observacion`, {
                projectId: Number(id),
                cedula: Number(cedula),
                titulo: formData.titulo,
                descripcion: formData.descripcion
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 3. Respuesta Exitosa
            if (response.data.success) {
                alert("✅ ¡Sugerencia guardada correctamente en la base de datos!");
                navigate(`/detalle-proyecto/${id}`); // Regresar al detalle del proyecto
            }

        } catch (error) {
            console.error("Error al enviar sugerencia:", error);
            alert("❌ Hubo un error al guardar la sugerencia. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />

            <div className="main-content-area">
                {/* NAV SUPERIOR */}
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>lista de proyectos / ver mas/ <span className="current-page">crear sugerencias</span></h1>
                    </div>
                    
                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`} className="profile-img" alt="Avatar"/>
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} color="#999"/>
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={handleLogout}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                {/* CONTENIDO PRINCIPAL - FORMULARIO */}
                <div className="sugerencia-container">
                    <h2 className="sugerencia-title">Sugerencias</h2>
                    
                    <p className="sugerencia-desc">
                        Con el objetivo de brindar retroalimentación a los grupos, aquí podrás enviar 
                        tus sugerencias y críticas constructivas con la intención de fomentar mejoras 
                        en el futuro.
                    </p>

                    <form onSubmit={handleEnviar}>
                        <div className="form-group-sugerencia">
                            <label className="label-sugerencia">Título <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                name="titulo"
                                className="input-gray-rounded" 
                                placeholder="Título para tu problema" 
                                value={formData.titulo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-sugerencia">
                            <label className="label-sugerencia">Descripción <span className="required-mark">*</span></label>
                            <textarea 
                                name="descripcion"
                                className="textarea-gray-rounded" 
                                placeholder="Cuéntanos qué ocurrió: explica el problema, cómo sucedió y cualquier información que pueda ayudar a resolverlo"
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Botón Verde Neón */}
                        <button type="submit" className="btn-neon-green">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearSugerencia;