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
import { AlertTriangle, Check, X } from "lucide-react";
import "./AdminTimedAlert.css";

type AlertVariant = "success" | "error";

interface AdminTimedAlertProps {
  title: string;
  description?: ReactNode;
  durationMs?: number;
  onClose: () => void;
  zIndex?: number;
  variant?: AlertVariant;
}

const DEFAULT_DURATION_MS = 5000;
const TICK_MS = 50;

const inferAlertVariant = (title: string): AlertVariant => {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (
    /(^error\b|no se pudo|no fue posible|inval|requerid|duplicad|fall|denegad|no existe|sin permisos|bloquead)/.test(
      normalized,
    )
  ) {
    return "error";
  }

  return "success";
};

const AdminTimedAlert = ({
  title,
  description,
  durationMs = DEFAULT_DURATION_MS,
  onClose,
  zIndex,
  variant,
}: AdminTimedAlertProps) => {
  const [progress, setProgress] = useState(1);
  const onCloseRef = useRef(onClose);
  const isClosingRef = useRef(false);
  const resolvedVariant = useMemo(
    () => variant ?? inferAlertVariant(title),
    [title, variant],
  );

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
        className={`modal-content admin-timed-alert ${resolvedVariant === "error" ? "is-error" : "is-success"}`}
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
            {resolvedVariant === "error" ? (
              <AlertTriangle size={44} color="white" />
            ) : (
              <Check size={44} color="white" />
            )}
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
