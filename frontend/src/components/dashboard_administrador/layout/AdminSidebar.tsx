/**
 * Sidebar compartido del modulo administrador.
 *
 * Encapsula branding, navegacion principal y acceso a ayuda para reutilizar la
 * misma estructura visual en todas las vistas admin.
 */

import { HelpCircle } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import senaLogo from "../../../assets/sena.png";
import { ADMIN_MENU_ITEMS } from "../AdminMenuItems";
import { isAdminMenuItemActive } from "../session/adminSession";

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: NavigateFunction;
  onSupportClick?: () => void;
}

const AdminSidebar = ({
  currentPath,
  onNavigate,
  onSupportClick,
}: AdminSidebarProps) => {
  const handleSupportClick = onSupportClick || (() => onNavigate("/ayuda"));

  return (
    <aside className="side-card">
      <div className="brand-block">
        <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
        <h2>Gestion de proyectos</h2>
      </div>

      <nav className="menu">
        <p className="menu-title">MENU</p>
        <ul>
          {ADMIN_MENU_ITEMS.map((item) => (
            <li
              key={item.name}
              className={
                isAdminMenuItemActive(currentPath, item.path) ? "active" : ""
              }
              onClick={() => onNavigate(item.path)}
            >
              <item.icon size={18} style={{ marginRight: "10px" }} />
              {item.name}
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="settings-footer"
        style={{ marginTop: "auto", padding: "10px 0" }}
      >
        <p className="menu-title">SETTINGS</p>
        <div
          className="support-item"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            cursor: "pointer",
            fontSize: "0.9rem",
            color: "#555",
          }}
          onClick={handleSupportClick}
        >
          <HelpCircle
            size={18}
            style={{ marginRight: "10px", color: "#39A900" }}
          />
          <span>Ayuda y Soporte</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
