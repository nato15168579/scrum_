/**
 * AdminTimedAlert
 * --------------
 * Componente de feedback con cierre automatico para el panel administrador.
 *
 * Caracteristicas:
 * - Temporizador con barra de progreso circular.
 * - Cierre manual y automatico.
 * - `zIndex` opcional para mostrarse sobre modales anidados.
 *
 * Nota: se maneja el cierre con refs para evitar dobles ejecuciones cuando coinciden
 * el timeout y el click del usuario.
 */
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import "./AdminTimedAlert.css";

interface AdminTimedAlertProps {
  title: string;
  description?: ReactNode;
  durationMs?: number;
  onClose: () => void;
  zIndex?: number;
}

const DEFAULT_DURATION_MS = 5000;
const TICK_MS = 50;

const AdminTimedAlert = ({
  title,
  description,
  durationMs = DEFAULT_DURATION_MS,
  onClose,
  zIndex,
}: AdminTimedAlertProps) => {
  const [progress, setProgress] = useState(1);
  const onCloseRef = useRef(onClose);
  const isClosingRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeAlert = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    onCloseRef.current();
  };

  useEffect(() => {
    isClosingRef.current = false;

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.max(0, 1 - elapsed / durationMs);
      setProgress(nextProgress);

      if (elapsed >= durationMs) {
        window.clearInterval(intervalId);
        closeAlert();
      }
    }, TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [durationMs]);

  const { circumference, dashOffset } = useMemo(() => {
    const radius = 20;
    const nextCircumference = 2 * Math.PI * radius;
    return {
      circumference: nextCircumference,
      dashOffset: nextCircumference * (1 - progress),
    };
  }, [progress]);

  const overlayStyle: CSSProperties | undefined = zIndex ? { zIndex } : undefined;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div
        className="modal-content admin-timed-alert"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          className="admin-timed-alert-close"
          onClick={closeAlert}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="admin-timed-alert-icon-shell" aria-hidden="true">
          <div className="admin-timed-alert-icon-bg">
            <Check size={44} color="white" />
          </div>
          <svg className="admin-timed-alert-progress" viewBox="0 0 44 44">
            <circle
              className="admin-timed-alert-progress-bg"
              cx="22"
              cy="22"
              r="20"
            />
            <circle
              className="admin-timed-alert-progress-fg"
              cx="22"
              cy="22"
              r="20"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
        </div>

        <h2 className="modal-title">{title}</h2>
        {description ? <p className="modal-subtitle">{description}</p> : null}
      </div>
    </div>
  );
};

export default AdminTimedAlert;
