/**
 * session.ts
 * ----------
 * Helpers pequenos para resolver informacion de sesion guardada en localStorage.
 *
 * Nota:
 * Este archivo no implementa seguridad. Solo mejora UX (nombre por defecto, fallback).
 */
export const getStoredUserName = () =>
  (localStorage.getItem("userName") || "").trim();

export const resolveUserName = (
  preferredName?: string | null,
  fallback = "Usuario",
) => {
  const directName = String(preferredName ?? "").trim();
  if (directName) return directName;

  const storedName = getStoredUserName();
  if (storedName) return storedName;

  return fallback;
};
