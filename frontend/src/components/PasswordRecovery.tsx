import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import senaLogo from '../assets/sena.png';
import { API_URL } from '../config/Api';
import {
  getPasswordPolicyChecks,
  validatePasswordPolicy,
} from '../utils/passwordPolicy';
import './Recovery.css';

type RecoveryStep = 1 | 2 | 3 | 4 | 5;

interface RecoveryFormData {
  tipoDocumento: string;
  cedula: string;
  correo: string;
  codigo: string;
  newPassword: string;
  confirmPassword: string;
}

interface RecoveryMeta {
  recoveryId: string;
  maskedEmail: string;
  expiresAt: string;
  resendAvailableAt: string;
  deliveryMode: 'email' | 'console';
  debugCode?: string;
  debugLogLocation?: string;
}

interface ApiPayload {
  message?: string;
  recoveryId?: string;
  maskedEmail?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  deliveryMode?: 'email' | 'console';
  resetToken?: string;
  resetExpiresAt?: string;
  invalidateClientSession?: boolean;
  debugCode?: string;
  debugLogLocation?: string;
}

const DOCUMENT_TYPES = [
  'Cedula de ciudadania',
  'Tarjeta de identidad',
  'Cedula de extranjeria',
  'Permiso por proteccion temporal',
] as const;

const INITIAL_FORM_DATA: RecoveryFormData = {
  tipoDocumento: DOCUMENT_TYPES[0],
  cedula: '',
  correo: '',
  codigo: '',
  newPassword: '',
  confirmPassword: '',
};

const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>(1);
  const [formData, setFormData] = useState<RecoveryFormData>(INITIAL_FORM_DATA);
  const [recoveryMeta, setRecoveryMeta] = useState<RecoveryMeta | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [resetExpiresAt, setResetExpiresAt] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  const passwordChecks = useMemo(
    () => getPasswordPolicyChecks(formData.newPassword),
    [formData.newPassword],
  );

  useEffect(() => {
    if (!recoveryMeta?.resendAvailableAt) {
      setResendSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const diffMs =
        new Date(recoveryMeta.resendAvailableAt).getTime() - Date.now();
      setResendSeconds(diffMs > 0 ? Math.ceil(diffMs / 1000) : 0);
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [recoveryMeta?.resendAvailableAt]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.name as keyof RecoveryFormData;
    let value = event.target.value;

    if (field === 'cedula') {
      value = value.replace(/\D/g, '').slice(0, 18);
    }

    if (field === 'codigo') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setError('');
  };

  const handleDocumentValidation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.cedula.trim()) {
      setError('Ingresa tu numero de documento para continuar.');
      return;
    }

    setStep(2);
  };

  const handleRequestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await requestRecoveryCode();
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');

    if (!recoveryMeta?.recoveryId) {
      setError('Primero debes solicitar un codigo de recuperacion.');
      setStep(2);
      return;
    }

    if (formData.codigo.length !== 6) {
      setError('Ingresa el codigo de 6 digitos que recibiste.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usu_cedula: formData.cedula,
          recovery_id: recoveryMeta.recoveryId,
          codigo: formData.codigo,
        }),
      });

      const payload = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          getApiMessage(payload, 'No fue posible validar el codigo.'),
        );
      }

      if (!payload?.resetToken || !payload?.resetExpiresAt) {
        throw new Error(
          'La validacion se completo, pero el backend no devolvio el token temporal.',
        );
      }

      setResetToken(payload.resetToken);
      setResetExpiresAt(payload.resetExpiresAt);
      setInfoMessage(
        payload.message ||
          'Codigo correcto. Ya puedes definir una nueva contrasena.',
      );
      setStep(4);
    } catch (requestError) {
      setError(
        getFriendlyRequestError(
          requestError,
          'No fue posible validar el codigo.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');

    if (!recoveryMeta?.recoveryId || !resetToken) {
      setError('La validacion expiro. Solicita un nuevo codigo.');
      setStep(2);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('La nueva contrasena y su confirmacion deben coincidir.');
      return;
    }

    const passwordValidation = validatePasswordPolicy(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError(
        `La contrasena debe cumplir: ${passwordValidation.errors.join(', ')}.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usu_cedula: formData.cedula,
          recovery_id: recoveryMeta.recoveryId,
          reset_token: resetToken,
          new_password: formData.newPassword,
        }),
      });

      const payload = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          getApiMessage(payload, 'No fue posible actualizar la contrasena.'),
        );
      }

      if (payload?.invalidateClientSession) {
        clearStoredSession();
      }

      setSuccessMessage(
        payload?.message || 'Tu contrasena se actualizo correctamente.',
      );
      setStep(5);
    } catch (requestError) {
      setError(
        getFriendlyRequestError(
          requestError,
          'No fue posible actualizar la contrasena.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0 || isSubmitting) {
      return;
    }

    await requestRecoveryCode(true);
  };

  const requestRecoveryCode = async (isResend = false) => {
    setError('');
    setInfoMessage('');

    if (!formData.cedula.trim()) {
      setError('Ingresa tu numero de documento para continuar.');
      setStep(1);
      return;
    }

    if (!formData.correo.trim()) {
      setError('Ingresa el correo registrado.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/send-recovery-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usu_cedula: formData.cedula,
          usu_correo: formData.correo,
        }),
      });

      const payload = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          getApiMessage(
            payload,
            'No fue posible enviar el codigo de recuperacion.',
          ),
        );
      }

      if (
        !payload?.recoveryId ||
        !payload?.maskedEmail ||
        !payload?.expiresAt ||
        !payload?.resendAvailableAt ||
        !payload?.deliveryMode
      ) {
        throw new Error(
          'El backend no devolvio la informacion necesaria para continuar el proceso.',
        );
      }

      setRecoveryMeta({
        recoveryId: payload.recoveryId,
        maskedEmail: payload.maskedEmail,
        expiresAt: payload.expiresAt,
        resendAvailableAt: payload.resendAvailableAt,
        deliveryMode: payload.deliveryMode,
        debugCode: payload.debugCode,
        debugLogLocation: payload.debugLogLocation,
      });
      setResetToken('');
      setResetExpiresAt('');
      setFormData((current) => ({
        ...current,
        codigo: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setInfoMessage(
        payload.message ||
          (isResend
            ? 'Se envio un nuevo codigo temporal.'
            : 'Se envio un codigo al correo registrado.'),
      );
      setStep(3);
    } catch (requestError) {
      setError(
        getFriendlyRequestError(
          requestError,
          'No fue posible enviar el codigo de recuperacion.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setError('');

    if (step === 1 || step === 5) {
      navigate('/login');
      return;
    }

    setStep((current) => (current > 1 ? ((current - 1) as RecoveryStep) : 1));
  };

  const recoveryDeadlineText = recoveryMeta?.expiresAt
    ? formatDateTime(recoveryMeta.expiresAt)
    : '';

  const resetDeadlineText = resetExpiresAt
    ? formatDateTime(resetExpiresAt)
    : '';

  return (
    <div className="recovery-container">
      <div className="recovery-card">
        <div className="header-nav">
          <button
            type="button"
            className="back-button"
            onClick={goBack}
            aria-label="Volver"
          >
            <ArrowLeft size={22} />
          </button>
          <img src={senaLogo} alt="SENA" className="sena-logo-small" />
        </div>

        <div className="step-progress">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`step-pill ${step >= item ? 'step-pill-active' : ''}`}
            >
              {item}
            </span>
          ))}
        </div>

        {step !== 5 && (
          <>
            <h2 className="step-title">Recuperar contrasena</h2>
            <div className="instruction-bar">
              {step === 1 && '1. Verifica tu documento'}
              {step === 2 && '2. Confirma tu correo registrado'}
              {step === 3 && '3. Valida el codigo temporal'}
              {step === 4 && '4. Define una nueva contrasena'}
            </div>
          </>
        )}

        {recoveryMeta && step >= 3 && step <= 4 && (
          <div className="info-banner">
            <p>
              Enviamos un codigo a <strong>{recoveryMeta.maskedEmail}</strong>.
            </p>
            <p>La solicitud vence el {recoveryDeadlineText}.</p>
            {recoveryMeta.deliveryMode === 'console' && (
              <>
                <p>
                  Modo desarrollo: SMTP aun no esta configurado, asi que el flujo
                  usa un codigo temporal local.
                </p>
                {recoveryMeta.debugCode ? (
                  <div className="debug-code-box">
                    <span className="debug-code-label">
                      Codigo temporal de prueba
                    </span>
                    <strong className="debug-code-value">
                      {recoveryMeta.debugCode}
                    </strong>
                    <span className="debug-code-note">
                      Este apoyo solo se muestra fuera de produccion.
                    </span>
                  </div>
                ) : (
                  <p>
                    Si no ves la terminal del backend, revisa el log{' '}
                    <strong>
                      {recoveryMeta.debugLogLocation || 'backend/run-backend.log'}
                    </strong>
                    .
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {infoMessage && step !== 5 && (
          <div className="success-banner">{infoMessage}</div>
        )}
        {error && <div className="error-msg">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleDocumentValidation} className="recovery-form">
            <div className="input-with-icon">
              <User size={20} className="input-icon" />
              <select
                name="tipoDocumento"
                className="form-select"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
              >
                {DOCUMENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-with-icon">
              <Hash size={20} className="input-icon" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="username"
                className="form-control"
                placeholder="Numero de documento"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                required
              />
            </div>

            <p className="helper-text">
              Usaremos tu documento para localizar el usuario asociado.
            </p>

            <button type="submit" className="btn-sena">
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRequestCode} className="recovery-form">
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                autoComplete="email"
                className="form-control"
                placeholder="Correo electronico registrado"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                required
              />
            </div>

            <p className="helper-text">
              El sistema enviara un codigo unico y temporal al correo asociado con
              tu cuenta.
            </p>

            <button type="submit" className="btn-sena" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando codigo...' : 'Enviar codigo'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyCode} className="recovery-form">
            <div className="code-card">
              <ShieldCheck size={22} />
              <p>
                Ingresa el codigo de 6 digitos antes de que expire. Si solicitas
                uno nuevo, el anterior dejara de ser valido.
              </p>
            </div>

            <div className="form-group">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-control code-input"
                placeholder="000000"
                maxLength={6}
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="inline-actions">
              <button type="submit" className="btn-sena" disabled={isSubmitting}>
                {isSubmitting ? 'Validando...' : 'Validar codigo'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResendCode}
                disabled={isSubmitting || resendSeconds > 0}
              >
                {resendSeconds > 0
                  ? `Reenviar en ${resendSeconds}s`
                  : 'Reenviar codigo'}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleResetPassword} className="recovery-form">
            <div className="code-card">
              <ShieldCheck size={22} />
              <p>
                Tu validacion final vence el {resetDeadlineText}. Despues de
                cambiar la contrasena se invalidaran los codigos anteriores.
              </p>
            </div>

            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className="form-control password-control"
                placeholder="Nueva contrasena"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords((current) => !current)}
                aria-label={
                  showPasswords ? 'Ocultar contrasenas' : 'Mostrar contrasenas'
                }
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className="form-control password-control"
                placeholder="Confirmar contrasena"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="rules-card">
              <strong>La contrasena debe incluir:</strong>
              <ul className="password-rules">
                {passwordChecks.map((rule) => (
                  <li
                    key={rule.id}
                    className={rule.valid ? 'rule-valid' : 'rule-pending'}
                  >
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="btn-sena" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Restablecer contrasena'}
            </button>
          </form>
        )}

        {step === 5 && (
          <div className="success-state">
            <CheckCircle size={54} className="success-icon" />
            <h2 className="step-title success-title">Contrasena actualizada</h2>
            <p>{successMessage}</p>
            <p>
              Por seguridad, las validaciones temporales anteriores quedaron
              invalidadas.
            </p>
            <button
              type="button"
              className="btn-sena"
              onClick={() => navigate('/login')}
            >
              Ir al inicio de sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function clearStoredSession() {
  ['userCedula', 'userRoleId', 'userName'].forEach((key) =>
    localStorage.removeItem(key),
  );
}

async function readPayload(response: Response): Promise<ApiPayload | null> {
  try {
    return (await response.json()) as ApiPayload;
  } catch {
    return null;
  }
}

function getApiMessage(payload: ApiPayload | null, fallback: string) {
  if (payload?.message && typeof payload.message === 'string') {
    return payload.message;
  }

  return fallback;
}

function getFriendlyRequestError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const normalizedMessage = String(error.message || '').trim().toLowerCase();

  if (
    normalizedMessage === 'failed to fetch' ||
    normalizedMessage.includes('networkerror') ||
    normalizedMessage.includes('could not connect') ||
    normalizedMessage.includes('no es posible conectar')
  ) {
    return 'No fue posible conectar con el servidor. Verifica que el backend este activo en http://localhost:5000.';
  }

  return error.message || fallback;
}

function formatDateTime(isoValue: string) {
  return new Date(isoValue).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default PasswordRecovery;
