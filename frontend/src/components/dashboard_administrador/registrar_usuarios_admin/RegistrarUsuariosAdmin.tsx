import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  LogOut,
  User,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../../assets/sena.png";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../utils/session";
import { ADMIN_MENU_ITEMS } from "../AdminMenuItems";
import "../AdminDashboard.css";
import "./RegistrarUsuariosAdmin.css";

type RegisterMode = "instructor" | "aprendiz";

interface FichaOption {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
}

interface InstructorFormState {
  documento: string;
  tipoDocumento: string;
  nombre: string;
  apellido: string;
  especializacion: string;
  telefono: string;
  correo: string;
  password: string;
}

interface AprendizFormState {
  documento: string;
  tipoDocumento: string;
  nombre: string;
  apellido: string;
  ficha: string;
  programa: string;
  correo: string;
  telefono: string;
  sexo: string;
  password: string;
}

interface FeedbackState {
  type: "success" | "error";
  title: string;
  message: string;
}

const DOCUMENT_OPTIONS = [
  { value: "CC", label: "CC - Cedula de Ciudadania" },
  { value: "TI", label: "TI - Tarjeta de Identidad" },
  { value: "CE", label: "CE - Cedula de Extranjeria" },
  { value: "PEP", label: "PEP - Permiso Especial de Permanencia" },
  { value: "PPT", label: "PPT - Permiso por Proteccion Temporal" },
];

const INITIAL_INSTRUCTOR_FORM: InstructorFormState = {
  documento: "",
  tipoDocumento: "CC",
  nombre: "",
  apellido: "",
  especializacion: "",
  telefono: "",
  correo: "",
  password: "",
};

const INITIAL_APRENDIZ_FORM: AprendizFormState = {
  documento: "",
  tipoDocumento: "CC",
  nombre: "",
  apellido: "",
  ficha: "",
  programa: "",
  correo: "",
  telefono: "",
  sexo: "",
  password: "",
};

const extractErrorMessage = (
  payload: unknown,
  fallback: string,
): string => {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    Array.isArray((payload as { message?: unknown }).message)
  ) {
    return ((payload as { message: string[] }).message || []).join(", ");
  }

  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }

  return fallback;
};

const RegistrarUsuariosAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [mode, setMode] = useState<RegisterMode>("instructor");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [stats, setStats] = useState({ instructores: 0, aprendices: 0 });
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [instructorForm, setInstructorForm] = useState<InstructorFormState>(
    INITIAL_INSTRUCTOR_FORM,
  );
  const [aprendizForm, setAprendizForm] = useState<AprendizFormState>(
    INITIAL_APRENDIZ_FORM,
  );

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    const roleId = (localStorage.getItem("userRoleId") || "").trim();

    if (!cedula) {
      navigate("/");
      return;
    }

    if (roleId === "2") {
      navigate("/dashboard-instructor");
      return;
    }

    if (roleId && roleId !== "3") {
      navigate("/student-dashboard");
      return;
    }

    const loadData = async () => {
      try {
        const [
          dashboardResponse,
          aprendicesResponse,
          instructoresResponse,
          fichasResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
          fetch(`${API_URL}/aprendices?cedula=${cedula}`),
          fetch(`${API_URL}/instructores?cedula=${cedula}`),
          fetch(`${API_URL}/fichas`),
        ]);

        const dashboardData = dashboardResponse.ok
          ? await dashboardResponse.json()
          : null;
        const aprendicesData = aprendicesResponse.ok
          ? await aprendicesResponse.json()
          : [];
        const instructoresData = instructoresResponse.ok
          ? await instructoresResponse.json()
          : [];
        const fichasData = fichasResponse.ok ? await fichasResponse.json() : [];

        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
        setStats({
          instructores: Array.isArray(instructoresData)
            ? instructoresData.length
            : 0,
          aprendices: Array.isArray(aprendicesData) ? aprendicesData.length : 0,
        });
        setFichas(
          (Array.isArray(fichasData) ? fichasData : []).map((item) => ({
            numero: String(item?.numero || ""),
            nombre: String(item?.nombre || "Sin area"),
            programa: String(item?.programa || "Sin programa"),
            estado: String(item?.estado || "Sin estado"),
          })),
        );
      } catch (error) {
        console.error("Error cargando datos de registro:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fichasActivas = useMemo(
    () => fichas.filter((item) => item.estado === "Activa"),
    [fichas],
  );

  const fichaSeleccionada = useMemo(
    () => fichasActivas.find((item) => item.numero === aprendizForm.ficha) || null,
    [aprendizForm.ficha, fichasActivas],
  );

  useEffect(() => {
    if (!fichaSeleccionada && aprendizForm.ficha) {
      setAprendizForm((prev) => ({ ...prev, programa: "" }));
      return;
    }

    if (fichaSeleccionada) {
      setAprendizForm((prev) => ({
        ...prev,
        programa: fichaSeleccionada.programa,
      }));
    }
  }, [aprendizForm.ficha, fichaSeleccionada]);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const resetActiveForm = (selectedMode: RegisterMode) => {
    if (selectedMode === "instructor") {
      setInstructorForm(INITIAL_INSTRUCTOR_FORM);
      return;
    }

    setAprendizForm(INITIAL_APRENDIZ_FORM);
  };

  const updateCounters = (selectedMode: RegisterMode) => {
    setStats((prev) => ({
      ...prev,
      [selectedMode === "instructor" ? "instructores" : "aprendices"]:
        prev[selectedMode === "instructor" ? "instructores" : "aprendices"] + 1,
    }));
  };

  const handleInstructorChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setInstructorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAprendizChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setAprendizForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "ficha"
        ? {
            programa:
              fichasActivas.find((item) => item.numero === value)?.programa || "",
          }
        : {}),
    }));
  };

  const submitInstructor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !instructorForm.documento.trim() ||
      !instructorForm.nombre.trim() ||
      !instructorForm.apellido.trim() ||
      !instructorForm.especializacion.trim() ||
      !instructorForm.telefono.trim() ||
      !instructorForm.correo.trim() ||
      !instructorForm.password.trim()
    ) {
      setFeedback({
        type: "error",
        title: "Registro incompleto",
        message: "Completa todos los campos obligatorios del instructor.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipoUsuario: "instructor",
          cedula: instructorForm.documento,
          tipoDocumento: instructorForm.tipoDocumento,
          nombre: instructorForm.nombre,
          apellidos: instructorForm.apellido,
          especializacion: instructorForm.especializacion,
          telefono: instructorForm.telefono,
          correo: instructorForm.correo,
          password: instructorForm.password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(
            payload,
            "No fue posible registrar el instructor.",
          ),
        );
      }

      updateCounters("instructor");
      resetActiveForm("instructor");
      setFeedback({
        type: "success",
        title: "Instructor registrado",
        message: "La cuenta del instructor fue creada correctamente.",
      });
    } catch (error) {
      console.error("Error registrando instructor:", error);
      setFeedback({
        type: "error",
        title: "Registro fallido",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible registrar el instructor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAprendiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !aprendizForm.documento.trim() ||
      !aprendizForm.nombre.trim() ||
      !aprendizForm.apellido.trim() ||
      !aprendizForm.ficha.trim() ||
      !aprendizForm.password.trim()
    ) {
      setFeedback({
        type: "error",
        title: "Registro incompleto",
        message:
          "Documento, nombre, apellido, ficha y contrasena son obligatorios para el aprendiz.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipoUsuario: "aprendiz",
          cedula: aprendizForm.documento,
          tipoDocumento: aprendizForm.tipoDocumento,
          nombre: aprendizForm.nombre,
          apellidos: aprendizForm.apellido,
          ficha: aprendizForm.ficha,
          correo: aprendizForm.correo,
          telefono: aprendizForm.telefono,
          sexo: aprendizForm.sexo,
          password: aprendizForm.password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(payload, "No fue posible registrar el aprendiz."),
        );
      }

      updateCounters("aprendiz");
      resetActiveForm("aprendiz");
      setFeedback({
        type: "success",
        title: "Aprendiz registrado",
        message: "La cuenta del aprendiz fue creada correctamente.",
      });
    } catch (error) {
      console.error("Error registrando aprendiz:", error);
      setFeedback({
        type: "error",
        title: "Registro fallido",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible registrar el aprendiz.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return <div className="register-users-loading">Cargando formulario...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container-dashboard">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
          <h2>Gestion de proyectos</h2>
        </div>

        <nav className="menu">
          <p className="menu-title">MENU</p>
          <ul>
            {ADMIN_MENU_ITEMS.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={
                  item.path === "/dashboard"
                    ? ["/dashboard", "/dashboard-administrador"].includes(
                        location.pathname,
                      )
                      ? "active"
                      : ""
                    : location.pathname === item.path
                      ? "active"
                      : ""
                }
              >
                <item.icon size={18} style={{ marginRight: "10px" }} />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="settings-footer"
          style={{ marginTop: "auto", padding: "10px 0" }}
        >
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
              color: "#555",
            }}
            onClick={() => navigate("/ayuda")}
          >
            <HelpCircle
              size={18}
              style={{ marginRight: "10px", color: "#39A900" }}
            />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Registrar usuarios</h1>
          </div>

          <div
            className="profile-menu"
            ref={menuRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=39A900&color=fff`}
              alt="Avatar"
              className="profile-img"
            />
            <span className="profile-name">{adminName}</span>
            <ChevronDown size={18} />

            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li>
                  <User size={16} style={{ marginRight: "8px" }} />
                  Mi perfil
                </li>
                <li
                  className="logout"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} style={{ marginRight: "8px" }} />
                  Cerrar sesion
                </li>
              </ul>
            )}
          </div>
        </nav>

        <section className="dashboard-content register-users-content">
        <div className="register-users-intro">
          <p className="register-users-kicker">Administrador</p>
          <h2>Registrar usuarios</h2>
          <p className="register-users-intro-text">
            Selecciona si vas a crear una cuenta de instructor o de aprendiz y
            completa el formulario correspondiente.
          </p>
        </div>

        <section className="register-users-selector">
          <button
            type="button"
            className={`register-users-selector-card ${mode === "instructor" ? "active" : ""}`}
            onClick={() => setMode("instructor")}
          >
            <div className="selector-card-icon">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="selector-card-label">Formulario</span>
              <strong>Instructor</strong>
              <p>{stats.instructores} instructores registrados</p>
            </div>
          </button>

          <button
            type="button"
            className={`register-users-selector-card ${mode === "aprendiz" ? "active" : ""}`}
            onClick={() => setMode("aprendiz")}
          >
            <div className="selector-card-icon secondary">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="selector-card-label">Formulario</span>
              <strong>Aprendiz</strong>
              <p>{stats.aprendices} aprendices registrados</p>
            </div>
          </button>
        </section>

        <section className="register-users-card">
          <div className="register-users-card-header">
            <div>
              <p className="register-users-card-kicker">
                {mode === "instructor"
                  ? "Cuenta administrativa de formacion"
                  : "Cuenta academica del aprendiz"}
              </p>
              <h2>
                {mode === "instructor"
                  ? "Registrar instructor"
                  : "Registrar aprendiz"}
              </h2>
            </div>
            <div className="register-users-chip">
              <UserPlus size={16} />
              <span>{mode === "instructor" ? "Instructor" : "Aprendiz"}</span>
            </div>
          </div>

          {mode === "instructor" ? (
            <form className="register-users-form" onSubmit={submitInstructor}>
              <div className="register-users-grid">
                <label className="register-users-field">
                  <span>Documento</span>
                  <input
                    type="number"
                    name="documento"
                    value={instructorForm.documento}
                    onChange={handleInstructorChange}
                    placeholder="Ej: 1000123456"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Tipo de documento</span>
                  <select
                    name="tipoDocumento"
                    value={instructorForm.tipoDocumento}
                    onChange={handleInstructorChange}
                  >
                    {DOCUMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="register-users-field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    name="nombre"
                    value={instructorForm.nombre}
                    onChange={handleInstructorChange}
                    placeholder="Ej: Laura"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Apellido</span>
                  <input
                    type="text"
                    name="apellido"
                    value={instructorForm.apellido}
                    onChange={handleInstructorChange}
                    placeholder="Ej: Mendoza"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Especializacion</span>
                  <input
                    type="text"
                    name="especializacion"
                    value={instructorForm.especializacion}
                    onChange={handleInstructorChange}
                    placeholder="Ej: Desarrollo de software"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Telefono</span>
                  <input
                    type="text"
                    name="telefono"
                    value={instructorForm.telefono}
                    onChange={handleInstructorChange}
                    placeholder="Ej: 3001234567"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Correo</span>
                  <input
                    type="email"
                    name="correo"
                    value={instructorForm.correo}
                    onChange={handleInstructorChange}
                    placeholder="Ej: instructor@sena.edu.co"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Contrasena</span>
                  <input
                    type="password"
                    name="password"
                    value={instructorForm.password}
                    onChange={handleInstructorChange}
                    placeholder="Minimo 4 caracteres"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="register-users-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Crear instructor"}
              </button>
            </form>
          ) : (
            <form className="register-users-form" onSubmit={submitAprendiz}>
              <div className="register-users-grid">
                <label className="register-users-field">
                  <span>Documento</span>
                  <input
                    type="number"
                    name="documento"
                    value={aprendizForm.documento}
                    onChange={handleAprendizChange}
                    placeholder="Ej: 1000123456"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Tipo de documento</span>
                  <select
                    name="tipoDocumento"
                    value={aprendizForm.tipoDocumento}
                    onChange={handleAprendizChange}
                  >
                    {DOCUMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="register-users-field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    name="nombre"
                    value={aprendizForm.nombre}
                    onChange={handleAprendizChange}
                    placeholder="Ej: Andres"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Apellido</span>
                  <input
                    type="text"
                    name="apellido"
                    value={aprendizForm.apellido}
                    onChange={handleAprendizChange}
                    placeholder="Ej: Perez"
                    required
                  />
                </label>

                <label className="register-users-field">
                  <span>Ficha</span>
                  <select
                    name="ficha"
                    value={aprendizForm.ficha}
                    onChange={handleAprendizChange}
                    required
                  >
                    <option value="">Selecciona una ficha activa</option>
                    {fichasActivas.map((item) => (
                      <option key={item.numero} value={item.numero}>
                        {item.numero} - {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="register-users-field">
                  <span>Programa</span>
                  <input
                    type="text"
                    name="programa"
                    value={aprendizForm.programa}
                    readOnly
                    placeholder="Se completa al elegir ficha"
                  />
                </label>

                <label className="register-users-field">
                  <span>Correo</span>
                  <input
                    type="email"
                    name="correo"
                    value={aprendizForm.correo}
                    onChange={handleAprendizChange}
                    placeholder="Opcional"
                  />
                </label>

                <label className="register-users-field">
                  <span>Telefono</span>
                  <input
                    type="text"
                    name="telefono"
                    value={aprendizForm.telefono}
                    onChange={handleAprendizChange}
                    placeholder="Opcional"
                  />
                </label>

                <label className="register-users-field">
                  <span>Sexo</span>
                  <select
                    name="sexo"
                    value={aprendizForm.sexo}
                    onChange={handleAprendizChange}
                  >
                    <option value="">Selecciona una opcion</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </label>

                <label className="register-users-field">
                  <span>Contrasena</span>
                  <input
                    type="password"
                    name="password"
                    value={aprendizForm.password}
                    onChange={handleAprendizChange}
                    placeholder="Minimo 4 caracteres"
                    required
                  />
                </label>
              </div>

              {fichaSeleccionada && (
                <p className="register-users-form-hint">
                  Area asociada: <strong>{fichaSeleccionada.nombre}</strong>
                </p>
              )}

              <button
                type="submit"
                className="register-users-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Crear aprendiz"}
              </button>
            </form>
          )}
        </section>
        </section>
      </main>
      </div>

      {feedback && (
        <div className="register-users-modal-overlay">
          <div className="register-users-modal-card">
            <div
              className={`register-users-modal-icon ${feedback.type === "success" ? "success" : "error"}`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={56} />
              ) : (
                <XCircle size={56} />
              )}
            </div>
            <h2>{feedback.title}</h2>
            <p>{feedback.message}</p>
            <button
              type="button"
              className="register-users-modal-button"
              onClick={() => setFeedback(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon-container">
              <AlertTriangle size={45} color="white" strokeWidth={3} />
            </div>
            <h2 className="modal-title">Estas seguro?</h2>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={confirmLogout}
              >
                Si, Cerrar
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarUsuariosAdmin;
