import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, KeyRound, ShieldCheck, 
    CheckCircle, Eye, EyeOff, Save, X, Lock 
} from 'lucide-react'; 
import { API_URL } from '../../../config/Api';
import './CambiarPassword.css';

const CambiarPassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Estado para evitar múltiples clics
    const [passwords, setPasswords] = useState({
        actual: '',
        nueva: '',
        confirmar: ''
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const handlePreSave = () => {
        // Validaciones en el cliente
        if (!passwords.actual.trim() || !passwords.nueva.trim() || !passwords.confirmar.trim()) {
            setErrorMsg('Todos los campos son obligatorios');
            return;
        }
        if (passwords.nueva.length < 4) {
            setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres');
            return;
        }
        if (passwords.nueva !== passwords.confirmar) {
            setErrorMsg('La nueva contraseña y su confirmación no coinciden');
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        setIsSaving(true);
        const cedula = localStorage.getItem('userCedula');

        try {
            const response = await fetch(`${API_URL}/auth/cambiar-password/${cedula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    // CAMBIO CLAVE: Deben coincidir con el Controller de NestJS
                    passActual: passwords.actual, 
                    passNueva: passwords.nueva 
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccessModal(true);
            } else {
                // Aquí capturamos el "La contraseña actual es incorrecta" o "Faltan datos"
                setErrorMsg(data.message || 'Error al actualizar');
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-dashboard-layout">
            <header className="profile-header-actions">
                <button onClick={() => navigate(-1)} className="back-circle-btn">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-text">
                    <h1>Seguridad</h1>
                    <p>Actualiza tus credenciales de acceso</p>
                </div>
            </header>

            <div className="update-content-wrapper">
                <div className="profile-details-container update-card-full">
                    
                    <div className="details-section-title">
                        <Lock size={18} />
                        <h3>Verificación de Identidad</h3>
                    </div>

                    <div className="password-form-body">
                        <div className="input-group-password">
                            <label>Contraseña Actual</label>
                            <input 
                                type="password" 
                                name="actual"
                                value={passwords.actual}
                                onChange={handleChange}
                                placeholder="Ingresa tu clave actual"
                            />
                        </div>

                        <div className="details-section-title academic-title" style={{marginTop: '30px'}}>
                            <KeyRound size={18} />
                            <h3>Nueva Contraseña</h3>
                        </div>

                        <div className="input-group-password">
                            <label>Nueva Contraseña</label>
                            <div className="password-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="nueva"
                                    value={passwords.nueva}
                                    onChange={handleChange}
                                    placeholder="Mínimo 4 caracteres"
                                />
                                <button 
                                    type="button"
                                    className="toggle-eye" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <div className="input-group-password">
                            <label>Confirmar Nueva Contraseña</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="confirmar"
                                value={passwords.confirmar}
                                onChange={handleChange}
                                placeholder="Repite la nueva clave"
                            />
                        </div>

                        {errorMsg && <div className="error-badge" style={{color: '#e74c3c', marginTop: '10px', fontSize: '0.9rem'}}>
                            {errorMsg}
                        </div>}
                    </div>

                    <div className="update-actions-footer">
                        <button className="btn-action-cancel" onClick={() => navigate(-1)} disabled={isSaving}>
                            <X size={16} /> Cancelar
                        </button>
                        <button className="btn-action-save" onClick={handlePreSave} disabled={isSaving}>
                            <Save size={16} /> {isSaving ? 'Cambiando...' : 'Cambiar Clave'}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ShieldCheck size={45} color="#2c3e50" style={{marginBottom: '15px'}} />
                        <h2 className="modal-title">¿Confirmar cambio?</h2>
                        <p>Tu contraseña se actualizará permanentemente.</p>
                        <div className="modal-buttons">
                            <button className="btn-confirm-logout" onClick={confirmSave}>Confirmar</button>
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
                        <p>Tu contraseña ha sido cambiada correctamente.</p>
                        <div className="modal-buttons">
                            <button 
                                className="btn-confirm-logout" 
                                onClick={() => navigate('/mi-perfil')}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CambiarPassword;