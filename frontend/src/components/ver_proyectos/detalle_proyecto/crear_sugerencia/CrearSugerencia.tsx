import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Home, Users, Plus, MapPin, Eye, List, 
    LogOut, ChevronDown, User, HelpCircle, AlertTriangle, CheckCircle 
} from 'lucide-react';
import senaLogo from '../../../../assets/sena.png'; 
import '../../../dashboard_instructor/Dashboard.css'; 
import '../DetalleProyecto.css'; 
import './CrearSugerencia.css';
import { API_URL } from '../../../../config/Api';

const CrearSugerencia: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    // Estados
    const [formData, setFormData] = useState({ titulo: '', descripcion: '' });
    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal de éxito
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleSuccessAction = () => {
        setShowSuccessModal(false);
        navigate(`/detalle-proyecto/${id}`); // Te saca al proyecto al aceptar
    };

    const handleEnviar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.titulo || !formData.descripcion) {
            alert("Por favor completa todos los campos obligatorios (*)");
            return;
        }

        const cedula = localStorage.getItem('userCedula');

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/crear-observacion`, {
                projectId: Number(id),
                cedula: Number(cedula),
                titulo: formData.titulo,
                descripcion: formData.descripcion
            });

            if (response.data) {
                setShowSuccessModal(true); // Mostramos el modal de éxito en lugar del alert
            }
        } catch (error) {
            console.error("Error al enviar sugerencia:", error);
            alert("❌ Hubo un error al guardar la sugerencia.");
        } finally {
            setLoading(false);
        }
    };

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
                                className={location.pathname.includes(item.path) || (item.path === '/ver-proyectos' && location.pathname.includes('crear-sugerencia')) ? 'active' : ''} 
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
                        <h1>Proyectos / <span style={{color: '#39A900'}}>Crear Sugerencia</span></h1>
                    </div>

                    <div className="profile-menu" ref={menuRef} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} />
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="sugerencia-container">
                    <div className="vp-header-row">
                        <h2 className="vp-table-title">Sugerencias</h2>
                    </div>
                    
                    <p className="sugerencia-desc">
                        Brinda retroalimentación al grupo del proyecto. Tus sugerencias y críticas 
                        constructivas ayudan a fomentar mejoras en el desarrollo del software.
                    </p>

                    <div className="vp-table-card" style={{padding: '30px'}}>
                        <form onSubmit={handleEnviar}>
                            <div className="form-group-sugerencia">
                                <label className="label-sugerencia">Título de la observación <span className="required-mark">*</span></label>
                                <input 
                                    type="text" 
                                    name="titulo"
                                    className="input-gray-rounded" 
                                    placeholder="Ej: Mejora en la arquitectura de base de datos" 
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group-sugerencia">
                                <label className="label-sugerencia">Descripción detallada <span className="required-mark">*</span></label>
                                <textarea 
                                    name="descripcion"
                                    className="textarea-gray-rounded" 
                                    placeholder="Explica detalladamente la sugerencia o el problema detectado..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    style={{ minHeight: '150px' }}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-neon-green" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                                {loading ? 'Enviando...' : 'Enviar Sugerencia'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE ÉXITO --- */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content text-center">
                        <CheckCircle size={50} color="#39A900" style={{ marginBottom: '15px' }} />
                        <h2 className="modal-title">¡Sugerencia Enviada!</h2>
                        <p style={{marginBottom: '20px', color: '#666'}}>La observación se ha guardado correctamente en el sistema.</p>
                        <div className="modal-buttons" style={{justifyContent: 'center'}}>
                            <button className="btn-confirm-logout" onClick={handleSuccessAction} style={{backgroundColor: '#39A900', padding: '10px 40px'}}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DE LOGOUT --- */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AlertTriangle size={45} color="#E74C3C" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¿Cerrar sesión?</h2>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={confirmLogout}>Sí, salir</button>
                            <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearSugerencia;