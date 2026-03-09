/**
 * Hook minimo para cerrar menus o dropdowns cuando el click ocurre fuera.
 *
 * Se usa sobre todo en el menu de perfil del administrador para evitar
 * listeners manuales repetidos en cada pantalla.
 */

import { type RefObject, useEffect } from "react";

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOutsideClick, ref]);
};

