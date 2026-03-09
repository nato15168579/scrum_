/**
 * Modal reutilizable para confirmaciones y alertas del administrador.
 *
 * Aunque nacio para cierre de sesion, hoy tambien sirve para confirmaciones,
 * errores y mensajes de exito con un estilo visual consistente.
 */

import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface AdminLogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  iconBackgroundColor?: string;
  showCancelButton?: boolean;
  zIndex?: number;
}

const AdminLogoutModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Estas seguro?",
  description,
  confirmLabel = "Si, Cerrar",
  cancelLabel = "Cancelar",
  iconBackgroundColor,
  showCancelButton = true,
  zIndex,
}: AdminLogoutModalProps) => {
  if (!isOpen) {
    return null;
  }

  const overlayStyle: CSSProperties | undefined = zIndex
    ? { zIndex }
    : undefined;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content">
        <div
          className="warning-icon-container"
          style={iconBackgroundColor ? { backgroundColor: iconBackgroundColor } : undefined}
        >
          <AlertTriangle size={45} color="white" />
        </div>
        <h2 className="modal-title">{title}</h2>
        {description ? <p className="modal-subtitle">{description}</p> : null}
        <div className="modal-buttons">
          <button className="btn-confirm-logout" onClick={onConfirm}>
            {confirmLabel}
          </button>
          {showCancelButton ? (
            <button className="btn-cancel-logout" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminLogoutModal;

