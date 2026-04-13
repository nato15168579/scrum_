import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Search, LogOut, ChevronDown, 
    AlertTriangle, X, Home, Users, Plus, MapPin, Eye, List, User, HelpCircle 
} from 'lucide-react';
import senaLogo from '../../../../assets/sena.png'; 
import '../DetalleProyecto.css'; 
import './EditarIntegrantes.css'; 

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

const EditarIntegrantes: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    // Estados de datos
    const [integrantes, setIntegrantes] = useState<any[]>([]);
    const [disponibles, setDisponibles] = useState<any[]>([]);
    const [rolesScrum, setRolesScrum] = useState<any[]>([]);

    // Estados de selección
    const [selectedToDelete, setSelectedToDelete] = useState<number | null>(null);
    const [selectedToAdd, setSelectedToAdd] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | string>('');

    // Estados de UI
    const [searchMain, setSearchMain] = useState('');
    const [searchModal, setSearchModal] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);       
    const [showDeleteAlert, setShowDeleteAlert] = useState(false); 
    const [showAddConfirm, setShowAddConfirm] = useState(false);   
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [instructorName, setInstructorName] = useState('Instructor SENA');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/dashboard' },
        { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
        { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
        { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
        { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
        { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
    ];

    // Carga inicial: Perfil y Roles de Scrum
    useEffect(() => {
        const cedula = localStorage.getItem('userCedula');
        if (!cedula) { navigate('/'); return; }

        const fetchInitialData = async () => {
            try {
                const [profileRes, rolesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}?cedula=${cedula}`),
                    axios.get(`${API_BASE_URL}/roles-scrum`)
                ]);
                if (profileRes.data?.instructor) setInstructorName(profileRes.data.instructor);
                setRolesScrum(rolesRes.data); // Aquí se guardan los IDs 4, 5, 6
            } catch (err) {
                console.error("Error cargando roles o perfil:", err);
            }
        };

        fetchInitialData();
        if (id) cargarDatosProyecto();
    }, [id, navigate]);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const cargarDatosProyecto = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/integrantes/${id}`);
            setIntegrantes(res.data);
            setSelectedToDelete(null);
        } catch (error) { console.error(error); }
    };

    const cargarDisponibles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/aprendices-disponibles/${id}`);
            setDisponibles(res.data);
            setSelectedToAdd(null);
            setSelectedRole('');
        } catch (error) { console.error(error); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const handleEliminarConfirmado = async () => {
        if (!selectedToDelete) return;
        try {
            await axios.post(`${API_BASE_URL}/eliminar-integrantes`, { 
                projectId: Number(id), 
                cedulas: [selectedToDelete] 
            });
            setShowDeleteAlert(false); 
            cargarDatosProyecto();
        } catch (error) { alert("Error al eliminar"); }
    };

    const handleAgregarConfirmado = async () => {
        if (!selectedToAdd || !selectedRole) return;
        try {
            await axios.post(`${API_BASE_URL}/asignar-integrantes`, {
                projectId: Number(id),
                assignments: [{ cedula: selectedToAdd, rolId: Number(selectedRole) }]
            });
            setShowAddConfirm(false); 
            setShowAddModal(false); 
            cargarDatosProyecto();
        } catch (error) { alert("Error al asignar"); }
    };

    const filterData = (data: any[], term: string) =>
        data.filter(i => 
            i.nombre?.toLowerCase().includes(term.toLowerCase()) || 
            i.apellido?.toLowerCase().includes(term.toLowerCase()) ||
            i.documento?.toString().includes(term)
        );

    return (
        <div className="dashboard-page" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* SIDEBAR */}
            <aside className="side-card" style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="brand-block">
                    <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
                    <h2>Gestión de proyectos</h2>
                </div>
                <nav className="menu" style={{ flex: 1 }}>
                    <p className="menu-title">MENÚ</p>
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.name} 
                                className={location.pathname === item.path || (item.path === '/ver-proyectos' && location.pathname.includes('editar-integrante')) ? 'active' : ''} 
                                onClick={() => navigate(item.path)}>
                                <item.icon size={18} style={{marginRight: '10px'}}/> {item.name}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="settings-footer" style={{ padding: '20px 0', borderTop: '1px solid #eee' }}>
                    <p className="menu-title">SETTINGS</p>
                    <div className="support-item" onClick={() => navigate('/ayuda-soporte')} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', cursor: 'pointer', color: '#555' }}>
                        <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
                        <span>Ayuda y Soporte</span>
                    </div>
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="main-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', overflowY: 'auto' }}>
                {/* NAV TOP */}
                <nav className="nav-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', minHeight: '70px', backgroundColor: '#fff', borderBottom: '1px solid #eee', width: '100%', boxSizing: 'border-box' }}>
                    <div className="title-section" style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="btn-back" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '15px' }}><ChevronLeft size={24} color="#333" /></button>
                        <h1 >Lista de proyectos / Ver más / <span style={{ color: '#39A900', fontWeight: 'bold' }}>Editar integrantes</span></h1>
                    </div>
                    <div className="profile-menu" ref={menuRef} style={{ position: 'relative' }}>
                        <div className="profile-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`} className="profile-img" alt="Avatar" style={{ width: '35px', height: '35px', borderRadius: '50%' }}/>
                            <span className="profile-name" style={{ fontWeight: 500 }}>{instructorName}</span>
                            <ChevronDown size={18} color="#666" />
                        </div>
                        {isMenuOpen && (
                            <ul className="dropdown-profile" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', listStyle: 'none', padding: '10px', zIndex: 1000, width: '180px' }}>
                                <li onClick={() => navigate('/mi-perfil')} style={{ padding: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}><User size={16} style={{marginRight: '10px'}}/> Mi Perfil</li>
                                <li className="logout" onClick={() => setShowLogoutModal(true)} style={{ padding: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'red' }}><LogOut size={16} style={{marginRight: '10px'}}/> Cerrar Sesión</li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="content-container" style={{ padding: '30px' }}>
                    <div className="editar-container" style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <div className="header-with-search" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Integrantes en el proyecto</h2>
                            <div className="search-input-wrapper" style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={18} color="#999" />
                                <input type="text" className="search-input" placeholder="Buscar aprendiz..." value={searchMain} onChange={e => setSearchMain(e.target.value)} style={{ padding: '10px 15px 10px 40px', borderRadius: '25px', border: '1px solid #ddd', width: '280px' }}/>
                            </div>
                        </div>

                        <table className="table-green-header" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#39A900', color: '#fff', textAlign: 'left' }}>
                                    <th style={{ padding: '15px', borderRadius: '10px 0 0 0' }}>Sel</th>
                                    <th>Documento</th>
                                    <th>Nombre Completo</th>
                                    <th>Rol Scrum</th>
                                    <th style={{ borderRadius: '0 10px 0 0' }}>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterData(integrantes, searchMain).map(int => (
                                    <tr key={int.documento} onClick={() => setSelectedToDelete(int.documento)} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedToDelete === int.documento ? '#f9fff5' : 'transparent' }}>
                                        <td style={{ padding: '15px', textAlign: 'center' }}><input type="radio" checked={selectedToDelete === int.documento} readOnly /></td>
                                        <td>{int.documento}</td>
                                        <td>{int.nombre} {int.apellido}</td>
                                        <td><span className="badge-rol" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '5px', fontSize: '0.85rem' }}>{int.rol}</span></td>
                                        <td>{int.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="footer-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button className={selectedToDelete ? "btn-danger" : "btn-disabled"} disabled={!selectedToDelete} onClick={() => setShowDeleteAlert(true)}>Eliminar aprendiz</button>
                            <button className="btn-success" onClick={() => { cargarDisponibles(); setShowAddModal(true); }}>+ Agregar aprendiz</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL AGREGAR */}
            {showAddModal && (
                <div className="modal-overlay-large" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="modal-content-large" style={{ background: '#fff', width: '90%', maxWidth: '800px', borderRadius: '15px', padding: '30px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h2 style={{ margin: 0 }}>Vincular nuevo aprendiz</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Selecciona un aprendiz y asígnale un rol Scrum</p>

                        <div className="search-input-wrapper" style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={18} color="#999" />
                            <input type="text" className="search-input" placeholder="Buscar por cédula o nombre..." value={searchModal} onChange={e => setSearchModal(e.target.value)} style={{ padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' }}/>
                        </div>

                        <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f9f9f9', position: 'sticky', top: 0 }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Sel</th>
                                        <th>Cédula</th>
                                        <th>Nombre Completo</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterData(disponibles, searchModal).map(d => (
                                        <tr key={d.documento} onClick={() => setSelectedToAdd(d.documento)} style={{ borderTop: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedToAdd === d.documento ? '#f0f9eb' : 'transparent' }}>
                                            <td style={{ padding: '12px', textAlign: 'center' }}><input type="radio" checked={selectedToAdd === d.documento} readOnly /></td>
                                            <td>{d.documento}</td>
                                            <td>{d.nombre} {d.apellido}</td>
                                            <td>{d.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* SELECT DE ROLES CORREGIDO */}
                        <div style={{ marginTop: '20px', padding: '15px', background: '#f4f7f6', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label style={{ fontWeight: 'bold' }}>Rol Scrum:</label>
                            <select 
                                value={selectedRole} 
                                onChange={(e) => setSelectedRole(e.target.value)} 
                                disabled={!selectedToAdd} 
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, backgroundColor: '#fff' }}
                            >
                                <option value="">-- Seleccione un rol --</option>
                                {rolesScrum.map(r => (
                                    <option key={r.det_par_ID} value={r.det_par_ID}>
                                        {r.det_par_descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button className="btn-guardar-azul" disabled={!selectedToAdd || !selectedRole} onClick={() => setShowAddConfirm(true)} style={{ padding: '10px 30px', background: '#4a6ee0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (!selectedToAdd || !selectedRole) ? 0.6 : 1 }}>Confirmar selección</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERTAS DE CONFIRMACIÓN */}
            {(showDeleteAlert || showAddConfirm || showLogoutModal) && (
                <div className="modal-alert-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div className="modal-alert-content" style={{ background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px' }}>
                        <div style={{ background: showAddConfirm ? '#4a6ee0' : showLogoutModal ? '#FF9800' : '#FF0000', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle color="white" size={30} />
                        </div>
                        <h2>{showLogoutModal ? '¿Cerrar Sesión?' : '¿Confirmar acción?'}</h2>
                        <p>{showLogoutModal ? '¿Deseas salir?' : showDeleteAlert ? '¿Eliminar este aprendiz?' : '¿Vincular este aprendiz al proyecto?'}</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button onClick={showLogoutModal ? handleLogout : showDeleteAlert ? handleEliminarConfirmado : handleAgregarConfirmado} style={{ background: showAddConfirm ? '#4a6ee0' : showLogoutModal ? '#FF9800' : '#FF0000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Sí, Continuar</button>
                            <button onClick={() => { setShowDeleteAlert(false); setShowAddConfirm(false); setShowLogoutModal(false); }} style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarIntegrantes;