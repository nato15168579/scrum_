import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import senaLogo from '../../assets/sena.png'; 
import './Login.css'; 
import { API_LOGIN } from '../../config/api'; 

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({ cedula: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.cedula || !credentials.password) {
      setError('Por favor ingrese todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${API_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: parseInt(credentials.cedula), 
          pass: credentials.password            
        }),
      });

      if (!response.ok) {
        throw new Error('Cédula o contraseña incorrectas');
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data);

      // --- MODIFICACIONES AQUÍ ---
      // Usamos los nombres que TypeORM generó automáticamente (camelCase)
      // Añadimos una validación opcional (?.) y valores por defecto para evitar el error .toString()
      
      const cedulaStr = data.usuCedula?.toString() || "";
      const roleIdStr = data.rolSisIdFk?.toString() || "";
      const fullNombre = `${data.usuNombres || ''} ${data.usuApellidos || ''}`.trim();

      if (!cedulaStr) {
        console.error("Error: El servidor no envió la cédula correctamente");
        setError("Error en los datos del servidor");
        return;
      }

      // Guardar en LocalStorage
      localStorage.setItem('userCedula', cedulaStr);
      localStorage.setItem('userRoleId', roleIdStr);
      localStorage.setItem('userName', fullNombre);

      // 4. REDIRECCIÓN según rolSisIdFk (2 = Instructor)
      if (parseInt(roleIdStr) === 2) {
          navigate('/dashboard'); 
      } else {
          navigate('/mi-proyecto'); // modificar cuando este lista la vista de aprendiz
      }

    } catch (err: any) {
      console.error("Error en Login:", err);
      setError(err.message || 'Error al conectar con el servidor');
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

          <button type="submit" className="btn-login">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;