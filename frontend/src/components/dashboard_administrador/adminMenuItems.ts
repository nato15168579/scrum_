/**
 * Catalogo central de navegacion del modulo administrador.
 *
 * Este archivo evita rutas duplicadas y mantiene sincronizados el sidebar,
 * el orden visual del menu y la deteccion del item activo.
 */

import {
  FolderOpen,
  Home,
  Settings,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminMenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { name: "Inicio", icon: Home, path: "/dashboard" },
  { name: "Aprendices", icon: Users, path: "/lista-aprendices-admin" },
  { name: "Instructores", icon: UserCheck, path: "/lista-instructores-admin" },
  { name: "Cambios Del sistema", icon: Settings, path: "/cambios-del-sistema" },
  { name: "Proyectos", icon: FolderOpen, path: "/ver-proyectos" },
  {
    name: "Registrar Usuario",
    icon: UserPlus,
    path: "/registrar-usuarios-admin",
  },
];

