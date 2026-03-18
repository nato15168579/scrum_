/**
 * RegistrarAprendiz
 * -----------------
 * Pantalla del flujo instructor para registrar un aprendiz de forma manual.
 *
 * API:
 * - POST /users (creacion de usuario)
 * - GET /stats (metricas generales del instructor)
 *
 * Nota:
 * Esta vista usa `axios` (otras pantallas usan `fetch`). Seria buena candidata a
 * estandarizar el cliente HTTP en una refactorizacion futura.
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Users,
  Plus,
  MapPin,
  Eye,
  List,
  FileText,
  User,
  ChevronDown,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import senaLogo from "../assets/sena.png";
import "./RegistrarAprendiz.css";
import { API_URL } from "../config/Api";

const API_USERS_URL = `${API_URL}/users`;
const API_STATS_URL = `${API_URL}/stats`;

interface FichaOption {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
}

const Sidebar = ({ navigate }: { navigate: (path: string) => void }) => {
  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard" },
    { name: "Lista de Aprendices", icon: Users, path: "/lista-aprendices" },
    { name: "Crear Proyecto", icon: Plus, path: "/crear-proyecto" },
    { name: "Asignar Proyectos", icon: MapPin, path: "/asignar-proyectos" },
    { name: "Ver Proyectos", icon: Eye, path: "/ver-proyectos" },
    {
      name: "Registrar Aprendiz",
      icon: List,
      active: true,
      path: "/registrar-aprendiz",
    },
  ];

  return (
    <aside className="side-card">
      <div className="brand-block">
        <img src={senaLogo} alt="Logo" className="logo-lg" />
        <h2>Gestion de proyectos</h2>
      </div>
      <nav className="menu">
        <p className="menu-title">MENU</p>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={item.active ? "active" : ""}
              onClick={() => item.path && navigate(item.path)}
            >
              <item.icon size={18} style={{ marginRight: "10px" }} />{" "}
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <div className="settings">
        <p className="menu-title">SETTINGS</p>
        <ul>
          <li onClick={() => navigate("/ayuda")}>
            <FileText size={18} style={{ marginRight: "10px" }} /> Ayuda /
            Soporte
          </li>
        </ul>
      </div>
    </aside>
  );
};

const RegistrarAprendiz: React.FC = () => {
  const navigate = useNavigate();

  const [instructorName, setInstructorName] = useState("Instructor");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modalStatus, setModalStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [fichasLoading, setFichasLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Verifica los datos o intenta mas tarde.",
  );
  const [fichas, setFichas] = useState<FichaOption[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    documento: "",
    ficha: "",
    correo: "",
    telefono: "",
    sexo: "Hombre",
    password: "",
  });

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    axios
      .get(`${API_STATS_URL}?cedula=${cedula}`)
      .then((res) => setInstructorName(res.data.instructor || "Usuario"))
      .catch(() => setInstructorName("Usuario"));

    axios
      .get(`${API_URL}/fichas`)
      .then((res) => {
        const payload = Array.isArray(res.data) ? res.data : [];
        setFichas(
          payload.map((item) => ({
            numero: String(item?.numero || ""),
            nombre: String(item?.nombre || "Sin nombre"),
            programa: String(item?.programa || "Sin programa"),
            estado: String(item?.estado || "Sin estado"),
          })),
        );
      })
      .catch((error) => {
        console.error("Error cargando fichas:", error);
        setFichas([]);
      })
      .finally(() => setFichasLoading(false));

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fichasActivas = fichas.filter((item) => item.estado === "Activa");
  const fichaSeleccionada =
    fichasActivas.find((item) => item.numero === formData.ficha) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.documento ||
      !formData.ficha ||
      !formData.correo ||
      !formData.password
    ) {
      alert("Por favor completa todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        cedula: formData.documento,
        nombre: formData.nombre,
        apellidos: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        ficha: formData.ficha,
        tipoDocumento: formData.tipoDocumento,
        sexo: formData.sexo,
        password: formData.password,
      };

      await axios.post(API_USERS_URL, payload);

      setModalStatus("success");
    } catch (error: unknown) {
      console.error("Error registrando:", error);
      if (axios.isAxiosError(error)) {
        const responseMessage = error.response?.data?.message;
        if (Array.isArray(responseMessage)) {
          setErrorMessage(responseMessage.join(", "));
        } else if (typeof responseMessage === "string") {
          setErrorMessage(responseMessage);
        } else {
          setErrorMessage("Verifica los datos o intenta mas tarde.");
        }
      } else {
        setErrorMessage("Verifica los datos o intenta mas tarde.");
      }
      setModalStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setModalStatus(null);
    setErrorMessage("Verifica los datos o intenta mas tarde.");
    if (modalStatus === "success") {
      setFormData({
        nombre: "",
        apellido: "",
        tipoDocumento: "CC",
        documento: "",
        ficha: "",
        correo: "",
        telefono: "",
        sexo: "Hombre",
        password: "",
      });
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar navigate={navigate} />

      <div className="main-content-area">
        <div className="content-wrapper">
          <header className="top-white-bar">
            <h1 className="header-title">Registro de cuentas</h1>

            <div
              className="profile-section"
              ref={menuRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=ccff00&color=333&bold=true`}
                className="profile-avatar"
                alt="Avatar"
              />
              <span className="profile-name">{instructorName}</span>
              <ChevronDown size={16} color="#333" />

              {isMenuOpen && (
                <ul className="profile-dropdown">
                  <li>
                    <User size={16} /> Mi Perfil
                  </li>
                  <li
                    onClick={() => {
                      localStorage.clear();
                      navigate("/");
                    }}
                    style={{ color: "red" }}
                  >
                    <LogOut size={16} /> Cerrar Sesion
                  </li>
                </ul>
              )}
            </div>
          </header>

          <div className="form-card">
            <div className="form-header-internal">
              <h2>Datos del Aprendiz:</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                  }}
                >
                  <div className="input-block">
                    <label className="label-text">
                      Nombre <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="input-field"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Juan"
                    />
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Apellido <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      className="input-field"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Perez"
                    />
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Tipo de documento <span className="required-mark">*</span>
                    </label>
                    <select
                      name="tipoDocumento"
                      className="input-field"
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                    >
                      <option value="CC">CC - Cedula de Ciudadania</option>
                      <option value="TI">TI - Tarjeta de Identidad</option>
                      <option value="CE">CE - Cedula de Extranjeria</option>
                      <option value="PEP">PEP - Permiso Especial</option>
                    </select>
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Documento <span className="required-mark">*</span>
                    </label>
                    <input
                      type="number"
                      name="documento"
                      className="input-field"
                      value={formData.documento}
                      onChange={handleChange}
                      required
                      placeholder="Ej: 1000123456"
                    />
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Contrasena <span className="required-mark">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="input-field"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Crea una contrasena segura"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px",
                  }}
                >
                  <div className="input-block">
                    <label className="label-text">
                      Ficha <span className="required-mark">*</span>
                    </label>
                    <select
                      name="ficha"
                      className="input-field"
                      value={formData.ficha}
                      onChange={handleChange}
                      required
                      disabled={fichasLoading || fichasActivas.length === 0}
                    >
                      <option value="">
                        {fichasLoading
                          ? "Cargando fichas..."
                          : fichasActivas.length > 0
                            ? "Selecciona una ficha"
                            : "No hay fichas activas"}
                      </option>
                      {fichasActivas.map((ficha) => (
                        <option key={ficha.numero} value={ficha.numero}>
                          {`${ficha.numero} - ${ficha.nombre} (${ficha.programa})`}
                        </option>
                      ))}
                    </select>
                    {fichaSeleccionada && (
                      <small
                        style={{
                          marginTop: "8px",
                          color: "#4b5563",
                          display: "block",
                        }}
                      >
                        {`Nombre: ${fichaSeleccionada.nombre} | Programa: ${fichaSeleccionada.programa}`}
                      </small>
                    )}
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Correo <span className="required-mark">*</span>
                    </label>
                    <input
                      type="email"
                      name="correo"
                      className="input-field"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                      placeholder="Ej: juan@soy.sena.edu.co"
                    />
                  </div>

                  <div className="input-block">
                    <label className="label-text">Telefono</label>
                    <input
                      type="number"
                      name="telefono"
                      className="input-field"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 3001234567"
                    />
                  </div>

                  <div className="input-block">
                    <label className="label-text">
                      Sexo <span className="required-mark">*</span>
                    </label>
                    <select
                      name="sexo"
                      className="input-field"
                      value={formData.sexo}
                      onChange={handleChange}
                    >
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-create" disabled={loading}>
                {loading ? "GUARDANDO..." : "CREAR"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {modalStatus === "success" && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div
              className="modal-icon-success"
              style={{ color: "#39A900", marginBottom: "20px" }}
            >
              <CheckCircle size={90} strokeWidth={1.5} />
            </div>
            <h2 className="modal-title">Registro Exitoso</h2>
            <button
              type="button"
              className="btn-modal-accept"
              onClick={closeAndReset}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {modalStatus === "error" && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div
              className="modal-icon-error"
              style={{ color: "#d32f2f", marginBottom: "20px" }}
            >
              <XCircle size={90} strokeWidth={1.5} />
            </div>
            <h2 className="modal-title">Registro fallido</h2>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              {errorMessage}
            </p>
            <button
              type="button"
              className="btn-modal-accept"
              onClick={() => setModalStatus(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarAprendiz;
