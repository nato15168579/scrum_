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
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./Login.css";
import { API_LOGIN } from "../../config/Api";

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({ cedula: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      console.log("Iniciando login con cedula:", credentials.cedula);

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
        throw new Error("Cedula o contrasena incorrectas");
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data);

      if (!data.usuCedula) {
        console.error("El servidor no envio usuCedula");
        setError("Error: El servidor no devolvio los datos del usuario");
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

      console.log("Datos parseados:", { cedulaStr, roleIdStr, fullNombre });

      localStorage.setItem("userCedula", cedulaStr);
      localStorage.setItem("userRoleId", roleIdStr);
      localStorage.setItem("userName", fullNombre);

      console.log("Datos guardados en localStorage");

      const roleNum = parseInt(roleIdStr) || 0;
      console.log("ID de rol numerico:", roleNum);

      if (roleNum === 3) {
        navigate("/dashboard-administrador");
      } else if (roleNum === 2) {
        navigate("/dashboard-instructor");
      } else if (roleNum === 1) {
        navigate("/dashboard-aprendiz");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const nextError = err instanceof Error ? err : new Error(String(err));
      console.error("Error en Login:", nextError);
      setError(nextError.message || "Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={senaLogo} alt="SENA Logo" className="sena-logo" />
          <h2>Iniciar sesion</h2>
          <p className="login-subtitle">Gestion de proyectos formativos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cedula">Numero de documento</label>
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
            <label htmlFor="password">Contrasena</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control password-control"
                placeholder="********"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                }
                aria-pressed={showPassword}
                title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <Link to="/recuperar-contrasena">Olvidaste tu contrasena?</Link>
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
