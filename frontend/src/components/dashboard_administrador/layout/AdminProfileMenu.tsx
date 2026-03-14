/**
 * Menu desplegable del perfil administrador.
 *
 * Reutiliza avatar, dropdown y acciones rapidas sin repetir esa logica en
 * dashboard, listas y formularios del panel admin.
 */

import type { RefObject } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { buildAvatarUrl } from "../session/adminSession";

interface AdminProfileMenuProps {
  displayName: string;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  menuRef?: RefObject<HTMLDivElement | null>;
  showProfileItem?: boolean;
}

const AdminProfileMenu = ({
  displayName,
  isOpen,
  onToggle,
  onLogout,
  menuRef,
  showProfileItem = false,
}: AdminProfileMenuProps) => (
  <div className="profile-menu" ref={menuRef} onClick={onToggle}>
    <img
      src={buildAvatarUrl(displayName)}
      className="profile-img"
      alt="Avatar"
    />
    <span className="profile-name">{displayName}</span>
    <ChevronDown size={18} />

    {isOpen && (
      <ul className="dropdown-profile">
        {showProfileItem && (
          <li>
            <User size={16} style={{ marginRight: "8px" }} />
            Mi Perfil
          </li>
        )}
        <li
          className="logout"
          onClick={(event) => {
            event.stopPropagation();
            onLogout();
          }}
        >
          <LogOut size={16} style={{ marginRight: "8px" }} />
          Cerrar Sesion
        </li>
      </ul>
    )}
  </div>
);

export default AdminProfileMenu;

