/**
 * Normalizacion de texto para UI (Admin)
 * -------------------------------------
 * Helpers pequenos y puros para:
 * - Evitar `null/undefined` en renderizados.
 * - Estandarizar filtros (trim + lower).
 * - Comparaciones robustas (sin tildes) cuando el origen de datos puede variar.
 */

export const normalizeText = (value: unknown) => String(value ?? "").trim();

/**
 * Convierte un valor a una representacion comparable:
 * - trim
 * - lowercase
 * - sin tildes/diacriticos
 */
export const normalizeComparableText = (value: unknown) =>
  normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

