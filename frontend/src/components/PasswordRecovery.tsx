import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Mail, 
    Lock, 
    Hash, 
    User 
} from 'lucide-react'; 
import senaLogo from '../assets/sena.png'; 
import './Recovery.css'; 

const PasswordRecovery = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        tipoDocumento: 'Cédula de ciudadanía',
        cedula: '',
        correo: '',
        codigo: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- LÓGICA DE PASOS ---
    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.cedula) return setError("Por favor ingrese su número de documento.");
        setStep(2);
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/auth/send-recovery-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usu_cedula: formData.cedula, usu_correo: formData.correo })
            });
            if (!response.ok) throw new Error("El correo no coincide.");
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep3 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:5000/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usu_cedula: formData.cedula, codigo: formData.codigo })
            });
            if (!response.ok) throw new Error("Código incorrecto.");
            setStep(4);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleStep4 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.newPassword !== formData.confirmPassword) return setError("Las contraseñas no coinciden.");
        try {
            const response = await fetch('http://localhost:5000/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usu_cedula: formData.cedula, new_password: formData.newPassword })
            });
            if (!response.ok) throw new Error("Error al actualizar.");
            alert("¡Contraseña restablecida con éxito!");
            navigate('/'); 
        } catch (err: any) {
            setError(err.message);
        }
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/');
    };

    return (
        <div className="recovery-container">
            <div className="recovery-card">
                
                {/* Cabecera Común */}
                <div className="header-nav">
                    <ArrowLeft size={28} style={{cursor:'pointer', color:'#000'}} onClick={goBack}/>
                    <img src={senaLogo} alt="SENA" className="sena-logo-small"/>
                </div>

                {/* --- VISTA 1: VALIDACIÓN DE DOCUMENTO --- */}
                {step === 1 && (
                    <form onSubmit={handleStep1}>
                        <h2 className="step-title">Recuperar contraseña</h2>
                        <div className="instruction-bar">
                            Validación de documento
                        </div>
                        
                        <div className="input-with-icon">
                            <User size={20} className="input-icon" />
                            <select 
                                name="tipoDocumento"
                                className="form-select"
                                value={formData.tipoDocumento}
                                onChange={handleChange}
                            >
                                <option>Cédula de ciudadanía</option>
                                <option>Tarjeta de identidad</option>
                                <option>Cédula de extranjería</option>
                                <option>Permiso por protección temporal</option>
                            </select>
                        </div>

                        <div className="input-with-icon">
                            <Hash size={20} className="input-icon" />
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Número de documento"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-sena">Continuar</button>
                    </form>
                )}

                {/* --- VISTA 2: VALIDACIÓN DE CORREO --- */}
                {step === 2 && (
                    <form onSubmit={handleStep2}>
                        <h2 className="step-title">Recuperar contraseña</h2>
                        <div className="instruction-bar">
                            Validación de correo
                        </div>
                        
                        <div className="input-with-icon">
                            <Mail size={20} className="input-icon" />
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Correo electrónico"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-sena" disabled={isLoading}>
                            {isLoading ? 'Enviando...' : 'Enviar código'}
                        </button>
                    </form>
                )}

                {/* --- VISTA 3: CÓDIGO DE VALIDACIÓN --- */}
                {step === 3 && (
                    <form onSubmit={handleStep3}>
                        <h2 className="step-title">Recuperar contraseña</h2>
                        <div className="instruction-bar">
                            Código de validación
                        </div>
                        
                        <div className="form-group" style={{marginBottom:'20px'}}>
                            <input 
                                type="text" 
                                className="form-control code-input" 
                                placeholder="- - - - - -"
                                maxLength={6}
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-sena">Confirmar código</button>
                    </form>
                )}

                {/* --- VISTA 4: NUEVA CONTRASEÑA --- */}
                {step === 4 && (
                    <form onSubmit={handleStep4}>
                        <h2 className="step-title">Recuperar contraseña</h2>
                        <div className="instruction-bar">
                            Nueva contraseña
                        </div>
                        
                        <div className="input-with-icon">
                            <Lock size={20} className="input-icon" />
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Nueva contraseña"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-with-icon">
                            <Lock size={20} className="input-icon" />
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Confirmar contraseña"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="btn-sena">Restablecer contraseña</button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default PasswordRecovery;