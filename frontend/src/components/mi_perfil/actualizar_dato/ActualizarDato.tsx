import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, User, Mail, Phone, CreditCard, 
    ShieldCheck, AlertTriangle, CheckCircle, Save, X 
} from 'lucide-react'; 
import { API_URL } from '../../../config/Api';
import './ActualizarDato.css';

const ActualizarDato = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        usu_cedula: '',
        usu_nombres: '',
        usu_apellidos: '',
        usu_correo: '',
        usu_telefono: '',
        usu_tipodedocumento: ''
    });

    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const cedula = localStorage.getItem('userCedula');
            if (!cedula) { navigate('/'); return; }

            try {
                const response = await fetch(`${API_URL}/usuario/${cedula}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        usu_cedula: data.usu_cedula,
                        usu_nombres: data.usu_nombres || '',
                        usu_apellidos: data.usu_apellidos || '',
                        usu_correo: data.usu_correo || '',
                        usu_telefono: data.usu_telefono || '',
                        usu_tipodedocumento: data.usu_tipodedocumento || ''
                    });
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        try {
            const response = await fetch(`${API_URL}/usuario/actualizar/${formData.usu_cedula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) setShowSuccessModal(true);
        } catch (error) {
            alert("Error de conexión al servidor");
        }
    };

    if (loading) return <div className="loading-screen">Cargando formulario...</div>;

    return (
        <div className="profile-dashboard-layout">
            {/* HEADER IGUAL A MI PERFIL */}
            <header className="profile-header-actions">
                <button onClick={() => navigate(-1)} className="back-circle-btn">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-text">
                    <h1>Editar Perfil</h1>
                    <p>Actualiza tu información de contacto y personal</p>
                </div>
            </header>

            <div className="update-content-wrapper">
                <div className="profile-details-container update-card-full">
                    
                    {/* SECCIÓN IDENTIDAD (BLOQUEADA - ESTILO SOBRIO) */}
                    <div className="details-section-title">
                        <ShieldCheck size={18} />
                        <h3>Información de Identidad</h3>
                    </div>
                    <div className="update-form-grid readonly-grid">
                        <div className="data-cell">
                            <label><CreditCard size={14}/> Tipo de Documento</label>
                            <input type="text" value={formData.usu_tipodedocumento} readOnly className="input-locked" />
                        </div>
                        <div className="data-cell">
                            <label> Número de Documento</label>
                            <input type="text" value={formData.usu_cedula} readOnly className="input-locked" />
                        </div>
                    </div>

                    {/* SECCIÓN DATOS PERSONALES (EDITABLE) */}
                    <div className="details-section-title academic-title">
                        <User size={18} />
                        <h3>Datos Personales</h3>
                    </div>
                    <div className="update-form-grid">
                        <div className="data-cell">
                            <label>Nombres</label>
                            <input type="text" name="usu_nombres" value={formData.usu_nombres} onChange={handleChange} />
                        </div>
                        <div className="data-cell">
                            <label>Apellidos</label>
                            <input type="text" name="usu_apellidos" value={formData.usu_apellidos} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECCIÓN CONTACTO (EDITABLE) */}
                    <div className="details-section-title academic-title">
                        <Mail size={18} />
                        <h3>Medios de Contacto</h3>
                    </div>
                    <div className="update-form-grid">
                        <div className="data-cell">
                            <label>Correo Electrónico</label>
                            <input type="email" name="usu_correo" value={formData.usu_correo} onChange={handleChange} />
                        </div>
                        <div className="data-cell">
                            <label><Phone size={14}/> Teléfono Celular</label>
                            <input type="text" name="usu_telefono" value={formData.usu_telefono} onChange={handleChange} />
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="update-actions-footer">
                        <button className="btn-action-cancel" onClick={() => navigate(-1)}>
                            <X size={16} /> Descartar
                        </button>
                        <button className="btn-action-save" onClick={() => setShowConfirmModal(true)}>
                            <Save size={16} /> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN (ESTILO DASHBOARD) */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AlertTriangle size={45} color="#2c3e50" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¿Guardar cambios?</h2>
                        <p>Tu información se actualizará en la plataforma.</p>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={confirmSave}>Si, Guardar</button>
                            <button className="btn-cancel-logout" onClick={() => setShowConfirmModal(false)}>Volver</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE ÉXITO */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CheckCircle size={45} color="#39A900" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¡Éxito!</h2>
                        <p>Los datos han sido actualizados correctamente.</p>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={() => navigate('/mi-perfil')}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActualizarDato;
