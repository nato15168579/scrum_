import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { API_URL } from '../../../config/Api';
import {
  getPasswordPolicyChecks,
  validatePasswordPolicy,
} from '../../../utils/passwordPolicy';
import './CambiarPassword.css';

const CambiarPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordChecks = useMemo(
    () => getPasswordPolicyChecks(passwords.nueva),
    [passwords.nueva],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setErrorMsg('');
  };

  const handlePreSave = () => {
    if (!passwords.actual.trim() || !passwords.nueva.trim() || !passwords.confirmar.trim()) {
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }

    if (passwords.nueva !== passwords.confirmar) {
      setErrorMsg('La nueva contrasena y su confirmacion no coinciden');
      return;
    }

    const passwordValidation = validatePasswordPolicy(passwords.nueva);
    if (!passwordValidation.isValid) {
      setErrorMsg(
        `La nueva contrasena debe cumplir: ${passwordValidation.errors.join(', ')}.`,
      );
      return;
    }

    if (passwords.actual === passwords.nueva) {
      setErrorMsg('La nueva contrasena debe ser diferente a la actual');
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
          passActual: passwords.actual,
          passNueva: passwords.nueva,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMsg(data?.message || 'Error al actualizar');
      }
    } catch {
      setErrorMsg('Error de conexion con el servidor');
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
            <h3>Verificacion de Identidad</h3>
          </div>

          <div className="password-form-body">
            <p className="password-instruction">
              Usa una contrasena robusta: 8 o mas caracteres, con mayuscula,
              minuscula, numero y simbolo.
            </p>

            <div className="input-group-password">
              <label>Contrasena Actual</label>
              <input
                type="password"
                name="actual"
                value={passwords.actual}
                onChange={handleChange}
                placeholder="Ingresa tu clave actual"
              />
            </div>

            <div
              className="details-section-title academic-title"
              style={{ marginTop: '30px' }}
            >
              <KeyRound size={18} />
              <h3>Nueva Contrasena</h3>
            </div>

            <div className="input-group-password">
              <label>Nueva Contrasena</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="nueva"
                  value={passwords.nueva}
                  onChange={handleChange}
                  placeholder="Nueva clave segura"
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group-password">
              <label>Confirmar Nueva Contrasena</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmar"
                value={passwords.confirmar}
                onChange={handleChange}
                placeholder="Repite la nueva clave"
              />
            </div>

            <div className="password-instruction" style={{ marginBottom: 0 }}>
              {passwordChecks.map((rule) => (
                <div key={rule.id} style={{ color: rule.valid ? '#166534' : '#64748b' }}>
                  {rule.valid ? 'Cumple' : 'Pendiente'}: {rule.label}
                </div>
              ))}
            </div>

            {errorMsg && <div className="error-badge">{errorMsg}</div>}
          </div>

          <div className="update-actions-footer">
            <button
              className="btn-action-cancel"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              <X size={16} /> Cancelar
            </button>
            <button
              className="btn-action-save"
              onClick={handlePreSave}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? 'Cambiando...' : 'Cambiar Clave'}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ShieldCheck
              size={45}
              color="#2c3e50"
              style={{ marginBottom: '15px' }}
            />
            <h2 className="modal-title">Confirmar cambio</h2>
            <p>Tu contrasena se actualizara permanentemente.</p>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmSave}>
                Confirmar
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => setShowConfirmModal(false)}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CheckCircle
              size={45}
              color="#39A900"
              style={{ marginBottom: '15px' }}
            />
            <h2 className="modal-title">Exito</h2>
            <p>Tu contrasena ha sido cambiada correctamente.</p>
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
