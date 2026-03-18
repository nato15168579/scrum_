/**
 * LoginScreen
 * -----------
 * Pantalla de autenticacion del sistema.
 *
 * Flujo:
 * - Envia credenciales a `POST /auth/login`.
 * - Persiste cedula/rol/nombre en localStorage.
 * - Redirige segun rol: admin (3), instructor (2), aprendiz (1).
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./Login.css";
import { API_LOGIN } from "../../config/Api";

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({ cedula: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!credentials.cedula || !credentials.password) {
      setError("Por favor ingrese todos los campos.");
      return;
    }

    try {
      console.log("Iniciando login con cédula:", credentials.cedula);

      const response = await fetch(`${API_LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: parseInt(credentials.cedula),
          pass: credentials.password,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error("Cédula o contraseña incorrectas");
      }

      const data = await response.json();
      console.log("✅ Datos recibidos del servidor:", data);

      // Validar que tenemos los datos necesarios
      if (!data.usuCedula) {
        console.error("❌ El servidor no envió usuCedula");
        setError("Error: El servidor no devolvió los datos del usuario");
        return;
      }

      const cedulaStr = data.usuCedula?.toString() || "";
      const rawRoleId =
        data.rolSisIdFk ??
        data.rol_sis_ID_FK ??
        data.rol_sis_id_fk ??
        data.rolId ??
        data.rol_id;
      const roleIdStr =
        rawRoleId === undefined || rawRoleId === null
          ? ""
          : String(rawRoleId).trim();
      const fullNombre =
        `${data.usuNombres || ""} ${data.usuApellidos || ""}`.trim();

      console.log("📋 Datos parseados:", { cedulaStr, roleIdStr, fullNombre });

      // Guardar en LocalStorage
      localStorage.setItem("userCedula", cedulaStr);
      localStorage.setItem("userRoleId", roleIdStr);
      localStorage.setItem("userName", fullNombre);

      console.log("✅ Datos guardados en localStorage");

      // REDIRECCIÓN según rolSisIdFk
      const roleNum = parseInt(roleIdStr) || 0;
      console.log("🔍 ID de rol numérico:", roleNum);

      // 3 = coordinador/administrador, 2 = Instructor, 1 = Aprendiz
      if (roleNum === 3) {
        console.log(
          "🎯 Rol es Administrador (3) - Redirigiendo a /dashboard-administrador",
        );
        navigate("/dashboard-administrador");
      } else if (roleNum === 2) {
        console.log(
          "🎯 Rol es Instructor (2) - Redirigiendo a /dashboard-instructor",
        );
        navigate("/dashboard-instructor");
      } else if (roleNum === 1) {
        console.log("🎯 Rol es Aprendiz - Redirigiendo a /student-dashboard");
        navigate("/student-dashboard");
      } else {
        console.log(
          "🎯 Rol no identificado, redirigiendo a /dashboard para resolver por contexto",
        );
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("❌ Error en Login:", error);
      setError(error.message || "Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={senaLogo} alt="SENA Logo" className="sena-logo" />
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Gestión de proyectos formativos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cedula">Número de documento</label>
            <input
              type="number"
              id="cedula"
              name="cedula"
              className="form-control"
              placeholder="Ej: 1000000045"
              value={credentials.cedula}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <div className="forgot-password">
            <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-login">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
