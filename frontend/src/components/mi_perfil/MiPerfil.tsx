import { useEffect, useState } from 'react';
import { 
    User, Mail, Phone, CreditCard, BookOpen, 
    Hash, ArrowLeft, ShieldCheck, GraduationCap, KeyRound, PenTool 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/Api';
import './MiPerfil.css';

const MiPerfil = () => {
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const cedula = localStorage.getItem('userCedula');
            if (!cedula) { navigate('/'); return; }
            try {
                const response = await fetch(`${API_URL}/mi-perfil/${cedula}`);
                const data = await response.json();
                setPerfil(data);
            } catch (error) {
                console.error("Error cargando perfil:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, [navigate]);

    if (loading) return <div className="loading-screen">Cargando perfil...</div>;

    return (
        <div className="profile-dashboard-layout">
            <header className="profile-header-actions">
                <button onClick={() => navigate(-1)} className="back-circle-btn">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-text">
                    <h1>Mi Perfil</h1>
                    <p>Configuración y datos de cuenta</p>
                </div>
            </header>

            <div className="profile-content-grid">
                {/* TARJETA IZQUIERDA - RESUMEN */}
                <div className="profile-main-card">
                    <div className="profile-cover-green"></div>
                    <div className="profile-avatar-wrapper">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(perfil?.usuNombres + ' ' + perfil?.usuApellidos)}&background=39A900&color=fff&size=150`} 
                            alt="Avatar" 
                        />
                    </div>
                    <div className="profile-info-basic">
                        <h2>{perfil?.usuNombres}</h2>
                        <h2 className="lastname-text">{perfil?.usuApellidos}</h2>
                        <div className="role-badge-pill">
                            <ShieldCheck size={14} />
                            {perfil?.rolSisIdFk2?.rolNombre || 'Usuario'}
                        </div>
                    </div>
                    
                    <div className="profile-card-actions">
                        {/* EDITAR DATOS PERSONALES */}
                        <button 
                            className="btn-action-edit" 
                            onClick={() => navigate('/actualizar-dato')}
                        >
                            <PenTool size={16} /> Editar Perfil
                        </button>
                        
                        {/* CAMBIAR CONTRASEÑA */}
                        <button 
                            className="btn-action-password"
                            onClick={() => navigate('/actualizar-contrasena')}
                        >
                            <KeyRound size={16} /> Cambiar Contraseña
                        </button>
                    </div>
                </div>

                {/* TARJETA DERECHA - DETALLES */}
                <div className="profile-details-container">
                    <div className="details-section-title">
                        <User size={18} />
                        <h3>Datos Personales</h3>
                    </div>
                    
                    <div className="details-info-grid">
                        <div className="data-row">
                            <div className="data-cell">
                                <label><CreditCard size={14}/> Documento</label>
                                <p>{perfil?.usuTipodedocumento} {perfil?.usuCedula}</p>
                            </div>
                            <div className="data-cell">
                                <label><Mail size={14}/> Correo</label>
                                <p>{perfil?.usuCorreo}</p>
                            </div>
                        </div>

                        <div className="data-row">
                            <div className="data-cell">
                                <label><Phone size={14}/> Teléfono</label>
                                <p>{perfil?.usuTelefono || 'No registrado'}</p>
                            </div>
                        </div>

                        {/* SECCIÓN ACADÉMICA (Solo visible si hay datos o rol aprendiz) */}
                        <div className="details-section-title academic-title">
                            <GraduationCap size={18} />
                            <h3>Información Académica</h3>
                        </div>

                        <div className="data-row">
                            <div className="data-cell">
                                <label><BookOpen size={14}/> Programa</label>
                                <p>{perfil?.usuPrograma || 'No asignado'}</p>
                            </div>
                            <div className="data-cell">
                                <label><Hash size={14}/> Ficha</label>
                                <p className="ficha-text">{perfil?.usuFicha || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiPerfil;
