/**
 * Utilidades compartidas de sesion para vistas del administrador.
 *
 * Centraliza validacion de rol, cierre de sesion y helpers de presentacion
 * para que todas las pantallas administrativas se comporten igual.
 */

import type { NavigateFunction } from "react-router-dom";

const ADMIN_ROLE_ID = "3";

const getStoredValue = (key: string) => String(localStorage.getItem(key) || "").trim();

export const requireAdminAccess = (navigate: NavigateFunction) => {
  const cedula = getStoredValue("userCedula");
  const roleId = getStoredValue("userRoleId");

  if (!cedula) {
    navigate("/");
    return null;
  }

  if (roleId === "2") {
    navigate("/dashboard-instructor");
    return null;
  }

  if (roleId && roleId !== ADMIN_ROLE_ID) {
    navigate("/student-dashboard");
    return null;
  }

  return cedula;
};

export const logoutAndRedirect = (navigate: NavigateFunction) => {
  localStorage.clear();
  navigate("/");
};

export const isAdminMenuItemActive = (pathname: string, itemPath: string) => {
  if (itemPath === "/dashboard") {
    return ["/dashboard", "/dashboard-administrador"].includes(pathname);
  }

  return pathname === itemPath;
};

export const buildAvatarUrl = (displayName: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=39A900&color=fff`;

