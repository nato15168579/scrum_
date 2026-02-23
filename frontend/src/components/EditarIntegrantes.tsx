import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Search, User, LogOut, ChevronDown, 
    AlertTriangle, X, Home, Users, Plus, MapPin, Eye, List 
} from 'lucide-react';
import senaLogo from '../assets/sena.png'; 
import './DetalleProyecto.css'; 
import './EditarIntegrantes.css'; 

const API_BASE_URL = 'http://localhost:5000/dashboard'; 

interface Integrante {
    documento: number;
    nombre: string;
    apellido: string;
    email: string;
    rol?: string;
    telefono?: string;
}

interface RolScrum {
    det_par_ID: number;
    det_par_descripcion: string;
}

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
        </aside>
    );
};

const EditarIntegrantes: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estados de Datos
    const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
    const [disponibles, setDisponibles] = useState<Integrante[]>([]);
    const [rolesScrum, setRolesScrum] = useState<RolScrum[]>([]); // Estado para los roles

    // Estados de Selección
    const [selectedToDelete, setSelectedToDelete] = useState<number | null>(null);
    const [selectedToAdd, setSelectedToAdd] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | string>(''); // Estado para el rol seleccionado

    // Buscadores y Modales
    const [searchMain, setSearchMain] = useState('');
    const [searchModal, setSearchModal] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);       
    const [showDeleteAlert, setShowDeleteAlert] = useState(false); 
    const [showAddConfirm, setShowAddConfirm] = useState(false);   
    
    // Perfil
    const [instructorName, setInstructorName] = useState('Cargando...');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const cedula = localStorage.getItem('userCedula');

        if (!token || !cedula) {
            navigate('/');
            return;
        }

        // 1. Cargar Perfil del usuario logueado
        axios.get(`${API_BASE_URL}/stats?cedula=${cedula}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setInstructorName(res.data.instructor || "Instructor"))
            .catch(() => setInstructorName("Usuario"));

        // 2. Cargar Roles Scrum disponibles
        axios.get(`${API_BASE_URL}/roles-scrum`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => setRolesScrum(res.data))
            .catch(err => console.error("Error cargando roles", err));

        if (id) cargarDatosProyecto();
    }, [id, navigate]);

    const cargarDatosProyecto = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/integrantes/${id}`);
            setIntegrantes(
                res.data.map((item: any) => ({ ...item, documento: Number(item.documento) }))
            );
        } catch (error) { console.error(error); }
    };

    const cargarDisponibles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/aprendices-disponibles/${id}`);
            setDisponibles(
                res.data.map((item: any) => ({ ...item, documento: Number(item.documento) }))
            );
            // Resetear selecciones al abrir el modal
            setSelectedToAdd(null);
            setSelectedRole('');
        } catch (error) { console.error(error); }
    };

    const handleEliminarConfirmado = async () => {
        if (!selectedToDelete) return;
        try {
            await axios.post(`${API_BASE_URL}/eliminar-integrantes`, {
                projectId: Number(id),
                cedulas: [selectedToDelete]
            });
            setShowDeleteAlert(false);
            setSelectedToDelete(null);
            cargarDatosProyecto();
            alert("Integrante eliminado correctamente.");
        } catch (error) { alert("Error al eliminar"); }
    };

    const handleAgregarConfirmado = async () => {
        if (!selectedToAdd) return;
        if (!selectedRole) {
            alert("Error: Debes seleccionar un rol Scrum.");
            return;
        }

        try {
            // Enviamos el rol seleccionado dinámicamente
            await axios.post(`${API_BASE_URL}/asignar-integrantes`, {
                projectId: Number(id),
                assignments: [{ cedula: selectedToAdd, rolId: Number(selectedRole) }]
            });
            
            setShowAddConfirm(false);
            setShowAddModal(false);
            setSelectedToAdd(null);
            setSelectedRole('');
            cargarDatosProyecto();
            alert("Aprendiz agregado exitosamente.");
        } catch (error) { alert("Error al agregar"); }
    };

    const filterData = (data: Integrante[], term: string) =>
        data.filter(i => 
            i.nombre.toLowerCase().includes(term.toLowerCase()) || 
            i.apellido.toLowerCase().includes(term.toLowerCase()) ||
            i.documento.toString().includes(term)
        );

    const integrantesFiltrados = filterData(integrantes, searchMain);
    const disponiblesFiltrados = filterData(disponibles, searchModal);

    return (
        <div className="dashboard-page">
            <Sidebar navigate={navigate} />

            <div className="main-content-area">
                
                {/* NAV */}
                <nav className="nav-top">
                    <div className="title-section detail-title-container">
                        <button className="btn-back" onClick={() => navigate(-1)}><ChevronLeft size={20}/></button>
                        <h1>Lista de proyectos / Ver más / <span className="current-page">Editar integrantes</span></h1>
                    </div>
                    
                    <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=random&color=fff`} 
                            className="profile-img" 
                            alt="Avatar"
                        />
                        <span className="profile-name">{instructorName}</span>
                        <ChevronDown size={18} color="#999"/>

                        {isMenuOpen && (
                            <ul className="dropdown-profile">
                                <li className="logout" onClick={() => {localStorage.clear(); navigate('/');}}>
                                    <LogOut size={16} style={{marginRight: '8px'}}/> Cerrar Sesión
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                <div className="editar-container">
                    <h2 style={{marginBottom:'20px'}}>Lista de integrantes</h2>

                    {/* BUSCADOR */}
                    <div className="search-bar-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Buscar..." 
                                value={searchMain}
                                onChange={e => setSearchMain(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TABLA PRINCIPAL */}
                    <table className="table-green-header">
                        <thead>
                            <tr>
                                <th style={{width:'50px'}}>Sel</th>
                                <th>Documento ↓</th>
                                <th>Nombre ↓</th>
                                <th>Apellido ↓</th>
                                <th>Rol ↓</th>
                                <th>Email ↓</th>
                            </tr>
                        </thead>
                        <tbody>
                            {integrantesFiltrados.length > 0 ? integrantesFiltrados.map(int => (
                                <tr key={int.documento}>
                                    <td style={{textAlign:'center'}}>
                                        <input
                                            type="radio"
                                            name="deleteSelect"
                                            className="custom-radio"
                                            checked={selectedToDelete === int.documento}
                                            onChange={() => setSelectedToDelete(int.documento)}
                                        />
                                    </td>
                                    <td>{int.documento}</td>
                                    <td>{int.nombre}</td>
                                    <td>{int.apellido}</td>
                                    {/* Muestra el rol Scrum (Product Owner, Scrum Master, etc) */}
                                    <td>{int.rol}</td>
                                    <td>{int.email}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} style={{textAlign:'center', padding:'20px'}}>No hay integrantes asignados</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="footer-actions">
                        <button 
                            className={`btn-danger ${selectedToDelete === null ? 'btn-disabled' : ''}`}
                            disabled={selectedToDelete === null}
                            onClick={() => setShowDeleteAlert(true)}
                        >
                            Eliminar aprendiz
                        </button>
                        <button 
                            className="btn-success"
                            onClick={() => { cargarDisponibles(); setShowAddModal(true); }}
                        >
                            Agregar aprendiz
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL AGREGAR */}
            {showAddModal && (
                <div className="modal-overlay-large">
                    <div className="modal-content-large">
                        <div className="modal-header-large">
                            <h2>Agregar aprendiz</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        
                        <div className="modal-subtitle">SELECCIONE EL APRENDIZ PARA AGREGAR</div>

                        <div className="search-bar-container" style={{justifyContent:'center'}}>
                            <div className="search-input-wrapper" style={{width:'50%'}}>
                                <Search className="search-icon" size={18} />
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Buscar por nombre o cédula..." 
                                    value={searchModal}
                                    onChange={e => setSearchModal(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-body-scroll">
                            <table className="table-modal">
                                <thead>
                                    <tr>
                                        <th style={{width:'50px'}}>Sel</th>
                                        <th>Documento</th>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Correo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disponiblesFiltrados.length > 0 ? disponiblesFiltrados.map(d => (
                                        <tr key={d.documento} 
                                            className={selectedToAdd === d.documento ? "selected-row-modal" : ""}
                                            onClick={() => setSelectedToAdd(d.documento)}
                                            style={{cursor: 'pointer', backgroundColor: selectedToAdd === d.documento ? '#e8f5e9' : 'transparent'}}
                                        >
                                            <td style={{textAlign:'center'}}>
                                                <input
                                                    type="radio"
                                                    name="addSelect"
                                                    className="custom-radio"
                                                    checked={selectedToAdd === d.documento}
                                                    onChange={() => setSelectedToAdd(d.documento)}
                                                />
                                            </td>
                                            <td>{d.documento}</td>
                                            <td>{d.nombre}</td>
                                            <td>{d.apellido}</td>
                                            <td>{d.email}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>No hay aprendices disponibles</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SECCIÓN NUEVA: SELECTOR DE ROL */}
                        <div style={{
                            padding: '15px', 
                            backgroundColor: '#fafafa', 
                            borderTop: '1px solid #eee',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end',
                            gap: '15px'
                        }}>
                            <label style={{fontWeight:'bold', color: '#333'}}>Asignar Rol Scrum:</label>
                            <select 
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                style={{
                                    padding: '10px', 
                                    borderRadius: '5px', 
                                    border: '1px solid #ccc',
                                    minWidth: '200px'
                                }}
                                disabled={!selectedToAdd} // Se deshabilita si no hay aprendiz seleccionado
                            >
                                <option value="">-- Seleccionar Rol --</option>
                                {rolesScrum.map(rol => (
                                    <option key={rol.det_par_ID} value={rol.det_par_ID}>
                                        {rol.det_par_descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-guardar-azul"
                                disabled={!selectedToAdd || !selectedRole}
                                style={{ opacity: (!selectedToAdd || !selectedRole) ? 0.6 : 1, cursor: (!selectedToAdd || !selectedRole) ? 'not-allowed' : 'pointer'}}
                                onClick={() => setShowAddConfirm(true)}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERTA ELIMINAR */}
            {showDeleteAlert && (
                <div className="modal-alert-overlay">
                    <div className="modal-alert-content">
                        <div className="alert-icon-circle"><AlertTriangle size={40} color="white" /></div>
                        <h2 className="alert-title">¿Estás seguro?</h2>
                        <p className="alert-text">Vas a eliminar al integrante seleccionado.</p>
                        <div className="alert-buttons">
                            <button className="btn-alert-confirm" onClick={handleEliminarConfirmado}>Sí, Eliminar</button>
                            <button className="btn-alert-cancel" onClick={() => setShowDeleteAlert(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERTA AGREGAR */}
            {showAddConfirm && (
                <div className="modal-alert-overlay">
                    <div className="modal-alert-content">
                        <div className="alert-icon-circle" style={{backgroundColor:'#4a6ee0'}}>
                            <AlertTriangle size={40} color="white" />
                        </div>
                        <h2 className="alert-title">¿Estás seguro?</h2>
                        <p className="alert-text">
                            Vas a agregar al aprendiz con el rol: <br/> 
                            <strong>
                                {rolesScrum.find(r => r.det_par_ID === Number(selectedRole))?.det_par_descripcion}
                            </strong>
                        </p>
                        <div className="alert-buttons">
                            <button 
                                className="btn-alert-confirm"
                                style={{backgroundColor:'#00C853'}}
                                onClick={handleAgregarConfirmado}
                            >
                                Sí, Agregar
                            </button>
                            <button className="btn-alert-cancel" onClick={() => setShowAddConfirm(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EditarIntegrantes;