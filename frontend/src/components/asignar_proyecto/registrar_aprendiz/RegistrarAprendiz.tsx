import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Home, Users, Plus, MapPin, Eye, List, 
    CheckCircle2, Search, Trash2, ArrowLeft, UserPlus,
    ChevronDown, LogOut, XCircle, HelpCircle, User, AlertTriangle
} from 'lucide-react';
import senaLogo from '../../../assets/sena.png'; 
import '../../dashboard_instructor/Dashboard.css'; 
import './RegistrarAprendiz.css'; 
import { API_URL } from '../../../config/Api';

const AsignarIntegrantes: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: pro_id } = useParams(); 
    const menuRef = useRef<HTMLDivElement>(null);
    
    // UI STATES
    const [instructorName, setInstructorName] = useState('Instructor');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // MODAL STATE
    const [modalConfig, setModalConfig] = useState<{
        show: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ show: false, type: 'success', title: '', message: '' });

    // DATA STATES
    const [aprendicesDb, setAprendicesDb] = useState<any[]>([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [seleccionados, setSeleccionados] = useState<any[]>([]); 

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

    useEffect(() => {
        const cargarDatos = async () => {
            const cedula = localStorage.getItem('userCedula');
            if (!cedula) { navigate('/'); return; }

            try {
                const resInst = await axios.get(`${API_URL}/dashboard?cedula=${cedula}`);
                setInstructorName(resInst.data.instructor || "Instructor SENA");

                const resAp = await axios.get(`${API_URL}/asig-integrantes/aprendices`);
                setAprendicesDb(Array.isArray(resAp.data) ? resAp.data : []);

                const resAsig = await axios.get(`${API_URL}/asig-integrantes/proyecto/${pro_id}`);
                const equipoActual = resAsig.data.map((item: any) => ({
                    usuCedula: item.usuCedula2?.usuCedula || item.usuCedula,
                    usuNombres: item.usuCedula2?.usuNombres || 'Aprendiz',
                    usuApellidos: item.usuCedula2?.usuApellidos || '',
                    rolId: item.detParId === 4 ? 1 : item.detParId === 5 ? 2 : 3
                }));

                setSeleccionados(equipoActual);
            } catch (error) {
                console.error("Error cargando configuración:", error);
            }
        };
        cargarDatos();
    }, [pro_id, navigate]);

    // Función para manejar el cierre de la alerta y redirección
    const handleCloseAlert = () => {
        const wasSuccess = modalConfig.type === 'success';
        setModalConfig({ ...modalConfig, show: false });
        if (wasSuccess) {
            navigate('/asignar-proyectos');
        }
    };

    const agregarAlEquipo = (aprendiz: any) => {
        if (!seleccionados.find(s => String(s.usuCedula) === String(aprendiz.usuCedula))) {
            setSeleccionados([...seleccionados, { ...aprendiz, rolId: 3 }]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                assignments: seleccionados.map(s => ({
                    cedula: Number(s.usuCedula),
                    rolId: Number(s.rolId)
                }))
            };
            await axios.post(`${API_URL}/asig-integrantes/${pro_id}`, payload);
            
            setModalConfig({
                show: true,
                type: 'success',
                title: '¡Actualizado!',
                message: 'Los integrantes han sido asignados correctamente al proyecto.'
            });
        } catch (error: any) {
            setModalConfig({
                show: true,
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || "Error al conectar con el servidor"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAprendices = aprendicesDb.filter(a => {
        const yaEnEquipo = seleccionados.some(s => String(s.usuCedula) === String(a.usuCedula));
        const coincideBusqueda = `${a.usuNombres} ${a.usuApellidos} ${a.usuCedula}`.toLowerCase().includes(searchTerm.toLowerCase());
        return !yaEnEquipo && coincideBusqueda;
    });

    return (
        <div className="dashboard-page">
            <aside className="side-card">
                <div className="brand-block">
                    <img src={senaLogo} alt="SENA" className="logo-lg" />
                    <h2>Gestión de proyectos</h2>
                </div>
                <nav className="menu">
                    <p className="menu-title">MENÚ</p>
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path} className={location.pathname === item.path ? 'active' : ''} onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* NUEVO: SECCIÓN SETTINGS */}
                <div className="settings-footer" style={{marginTop: 'auto', padding: '10px'}}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={() => navigate('/ayuda-soporte')} style={{display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', borderRadius: '8px'}}>
                        <HelpCircle size={18} style={{marginRight: '10px', color: '#39A900'}}/>
                        <span style={{fontSize: '0.9rem', color: '#555'}}>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            <main className="content">
                <nav className="nav-top">
                    <div className="title-section" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        {/* BOTÓN REGRESAR ESTILIZADO */}
                        <button 
                            onClick={() => navigate('/asignar-proyectos')} 
                            className="btn-back-circle"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '42px', height: '42px', borderRadius: '50%',
                                border: '1px solid #e0e0e0', backgroundColor: '#fff',
                                color: '#333', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1>Asignar Integrantes</h1>
                            <p style={{fontSize: '0.85rem', color: '#666', marginTop: '-5px'}}>Gestione los aprendices y sus roles en el equipo</p>
                        </div>
                    </div>

                    <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} ref={menuRef}>
                        <div className="profile-trigger" style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="User"/>
                            <span className="profile-name">{instructorName}</span>
                            <ChevronDown size={18} />
                        </div>
                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li onClick={() => navigate('/mi-perfil')}><User size={16} style={{marginRight: '8px'}}/> Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)}><LogOut size={16} style={{marginRight: '8px'}}/> Salir</li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="assign-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', padding: '25px'}}>
                    {/* BUSCADOR */}
                    <div className="form-card card-scrollable" style={{borderRadius: '16px', border: '1px solid #eee'}}>
                        <h3 className="section-subtitle"><Search size={20}/> Buscar Aprendices</h3>
                        <div className="search-box">
                            <input type="text" placeholder="Nombre o Cédula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="list-container">
                            {filteredAprendices.map((a) => (
                                <div key={a.usuCedula} className="item-row">
                                    <div className="item-info">
                                        <p className="name">{a.usuNombres} {a.usuApellidos}</p>
                                        <span className="id-text">CC {a.usuCedula}</span>
                                    </div>
                                    <button className="btn-add-circle" onClick={() => agregarAlEquipo(a)}><Plus size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* EQUIPO */}
                    <div className="form-card card-scrollable" style={{borderRadius: '16px', border: '1px solid #eee'}}>
                        <h3 className="section-subtitle"><Users size={20}/> Equipo del Proyecto</h3>
                        <div className="list-container">
                            {seleccionados.length === 0 ? (
                                <div className="empty-state"><UserPlus size={40} /><p>No hay integrantes asignados</p></div>
                            ) : (
                                seleccionados.map((s) => (
                                    <div key={s.usuCedula} className="item-row assigned-card" style={{background: '#fcfcfc', border: '1px solid #f0f0f0'}}>
                                        <div className="item-info" style={{flex: 1}}>
                                            <p className="name">{s.usuNombres}</p>
                                            <select 
                                                className="rol-selector" 
                                                value={s.rolId} 
                                                onChange={(e) => setSeleccionados(seleccionados.map(i => i.usuCedula === s.usuCedula ? {...i, rolId: Number(e.target.value)} : i))}
                                            >
                                                <option value={1}>Product Owner</option>
                                                <option value={2}>Scrum Master</option>
                                                <option value={3}>Development Team</option>
                                            </select>
                                        </div>
                                        <button className="btn-delete" onClick={() => setSeleccionados(seleccionados.filter(i => i.usuCedula !== s.usuCedula))}><Trash2 size={20} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="btn-confirm-action" onClick={handleSave} disabled={loading || seleccionados.length === 0} style={{width: '100%', marginTop: '20px'}}>
                            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </div>
            </main>

            {/* MODAL FEEDBACK CON REDIRECCIÓN */}
            {modalConfig.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container" style={{backgroundColor: modalConfig.type === 'success' ? '#39A900' : '#e74c3c'}}>
                            {modalConfig.type === 'success' ? <CheckCircle2 size={45} color="white" /> : <XCircle size={45} color="white" />}
                        </div>
                        <h2 className="modal-title">{modalConfig.title}</h2>
                        <p className="modal-message" style={{marginBottom: '20px'}}>{modalConfig.message}</p>
                        <button className="btn-confirm-logout" onClick={handleCloseAlert} style={{width: '100%'}}>Aceptar</button>
                    </div>
                </div>
            )}

            {/* MODAL SALIR */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="warning-icon-container"><AlertTriangle size={50} color="white" /></div>
                        <h2 className="modal-title">¿Cerrar Sesión?</h2>
                        <div className="modal-buttons" style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                            <button className="btn-confirm-logout" style={{backgroundColor: '#ef4444', flex: 1}} onClick={() => {localStorage.clear(); navigate('/');}}>Salir</button>
                            <button className="btn-cancel-logout" style={{flex: 1}} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarIntegrantes;