// ===============================
// CONFIGURACIÓN GLOBAL DE API
// ===============================
// URL del backend desde .env
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

// Endpoints
export const API_LOGIN = `${API_URL}/auth/login`;


