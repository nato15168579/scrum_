import React, { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  Home,
  Briefcase,
  ClipboardList,
  CheckSquare,
  Calendar,
  Eye,
  HelpCircle,
  AlertTriangle,
  Plus,
  X,
  CheckCircle2,
  Search,
  FileText,
  Users,
  SquarePen,
  FilePenLine,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import { API_URL } from "../../config/Api";
import "./Reuniones.css";

type AsistenteDetalle = {
  cedula: string;
  nombre: string;
};

type AprendizOption = {
  cedula: string;
  nombre: string;
};

type ReunionRow = {
  descripcion: string;
  id: number;
  tipo: string;
  fecha: string | null;
  hora: string | null;
  responsable: string;
  responsableCedula: number | null;
  asistentes: string[];
  asistentesDetalle: AsistenteDetalle[];
  cantidadAsistentes: number;
  lugar: string;
  estado: string;
  informe: string | null;
  puedeGestionarInforme: boolean;
  puedeEditar: boolean;
};

type SortKey =
  | "tipo"
  | "fecha"
  | "hora"
  | "responsable"
  | "lugar"
  | "estado";

type SortDir = "asc" | "desc";

type Option = {
  id: number;
  label: string;
};

type FormState = {
  id?: number;
  sprIdFk: string;
  detParIdTipoFk: string;
  detParIdEstadoFk: string;
  reuFecha: string;
  reuHora: string;
  reuLugar: string;
  reuDescripcion: string;
};

const PAGE_SIZE = 5;

const initialForm: FormState = {
  sprIdFk: "",
  detParIdTipoFk: "",
  detParIdEstadoFk: "",
  reuFecha: "",
  reuHora: "",
  reuLugar: "",
  reuDescripcion: "",
};

const Reuniones: React.FC = () => {
  const [rows, setRows] = useState<ReunionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  const [searchTerm, setSearchTerm] = useState("");

  const [showInformeModal, setShowInformeModal] = useState(false);
  const [showEditarInformeModal, setShowEditarInformeModal] = useState(false);
  const [showAsistentesModal, setShowAsistentesModal] = useState(false);

  const [selectedReunion, setSelectedReunion] = useState<ReunionRow | null>(null);
  const [informeText, setInformeText] = useState("");
  const [informeError, setInformeError] = useState("");
  const [savingInforme, setSavingInforme] = useState(false);

  const [aprendicesProyecto, setAprendicesProyecto] = useState<AprendizOption[]>([]);
  const [selectedAsistentes, setSelectedAsistentes] = useState<string[]>([]);
  const [loadingAprendices, setLoadingAprendices] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isReunionesActive =
    location.pathname === "/aprendiz/reuniones" ||
    location.pathname.startsWith("/aprendiz/reuniones/");

  const tipoOptions: Option[] = [
    { id: 10, label: "Planificación del sprint" },
    { id: 11, label: "Scrum diario" },
    { id: 12, label: "Revisión del sprint" },
    { id: 13, label: "Retrospectiva del sprint" },
  ];

  const estadoOptions: Option[] = [
    { id: 30, label: "Pendiente" },
    { id: 3, label: "Hecho" },
    { id: 31, label: "Cancelada" },
  ];

  const sprintOptions: Option[] = [
    { id: 1, label: "Sprint 1" },
    { id: 2, label: "Sprint 2" },
    { id: 3, label: "Sprint 3" },
  ];

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-aprendiz" },
    { name: "Mi Proyecto", icon: Briefcase, path: "/aprendiz/mi-proyecto" },
    {
      name: "Historias de usuario",
      icon: ClipboardList,
      path: "/aprendiz/historias-usuario",
    },
    {
      name: "Criterios de aceptación",
      icon: CheckSquare,
      path: "/aprendiz/criterios-aceptacion",
    },
    { name: "Reuniones", icon: Calendar, path: "/aprendiz/reuniones" },
    { name: "Observaciones", icon: Eye, path: "/aprendiz/observaciones" },
  ];

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPage(1);
  };

  const normalizeReunionRow = (r: any): ReunionRow => ({
    id: Number(r.id ?? 0),
    tipo: r.tipo ?? "-",
    fecha: r.fecha ?? null,
    hora: r.hora ?? null,
    responsable: r.responsable ?? "-",
    responsableCedula: r.responsableCedula ?? null,
    asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
    asistentesDetalle: Array.isArray(r.asistentesDetalle)
      ? r.asistentesDetalle.map((a: any) => ({
          cedula: String(a.cedula ?? ""),
          nombre: a.nombre ?? "-",
        }))
      : [],
    cantidadAsistentes: Number(r.cantidadAsistentes ?? 0),
    lugar: r.lugar ?? "-",
    estado: r.estado ?? "-",
    descripcion: r.descripcion ?? "",
    informe: r.informe ?? null,
    puedeGestionarInforme: !!r.puedeGestionarInforme,
    puedeEditar: !!r.puedeEditar,
  });

  const fetchReuniones = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/aprendiz/reuniones?cedula=${cedula}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const normalized: ReunionRow[] = Array.isArray(json)
        ? json.map(normalizeReunionRow)
        : [];

      setRows(normalized);
      setPage(1);
    } catch (error) {
      console.error("Error cargando reuniones:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAprendicesProyecto = async (reunionId: number) => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setLoadingAprendices(true);

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/reuniones/${reunionId}/aprendices?cedula=${cedula}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      const opciones: AprendizOption[] = Array.isArray(json)
        ? json.map((item: any) => ({
            cedula: String(item.cedula ?? ""),
            nombre: item.nombre ?? "-",
          }))
        : [];

      setAprendicesProyecto(opciones);
    } catch (error) {
      console.error("Error cargando aprendices del proyecto:", error);
      setAprendicesProyecto([]);
    } finally {
      setLoadingAprendices(false);
    }
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim()) {
      setDisplayName(storedName);
    }

    fetchReuniones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (hora: string | null) => {
    if (!hora) return "-";
    return hora.length >= 5 ? hora.slice(0, 5) : hora;
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) => {
      const tipoText = (row.tipo ?? "").toLowerCase();
      const fechaText = formatFecha(row.fecha).toLowerCase();
      const responsableText = (row.responsable ?? "").toLowerCase();
      const asistentesText = row.asistentes.join(", ").toLowerCase();
      const lugarText = (row.lugar ?? "").toLowerCase();
      const estadoText = (row.estado ?? "").toLowerCase();

      return (
        tipoText.includes(term) ||
        fechaText.includes(term) ||
        responsableText.includes(term) ||
        asistentesText.includes(term) ||
        lugarText.includes(term) ||
        estadoText.includes(term)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      const getValue = (row: ReunionRow): string => {
        switch (sortKey) {
          case "tipo":
            return row.tipo.toLowerCase();
          case "fecha":
            return row.fecha ?? "";
          case "hora":
            return row.hora ?? "";
          case "responsable":
            return row.responsable.toLowerCase();
          case "lugar":
            return row.lugar.toLowerCase();
          case "estado":
            return row.estado.toLowerCase();
          default:
            return "";
        }
      };

      const va = getValue(a);
      const vb = getValue(b);

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return copy;
  }, [filteredRows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safePage]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [safePage, totalPages]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const normalizeDateForInput = (fecha: string | null) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toISOString().slice(0, 10);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openCreateModal = () => {
    setFormError("");
    setForm(initialForm);
    setShowCreateModal(true);
  };

  const openEditModal = (row: ReunionRow) => {
    if (!row.puedeEditar) return;

    setFormError("");
    setForm({
      id: row.id,
      sprIdFk: "1",
      detParIdTipoFk:
        tipoOptions.find((t) => t.label.toLowerCase() === row.tipo.toLowerCase())?.id.toString() ||
        "",
      reuFecha: normalizeDateForInput(row.fecha),
      reuHora: row.hora ? row.hora.slice(0, 5) : "",
      reuLugar: row.lugar === "-" ? "" : row.lugar,
      detParIdEstadoFk:
        estadoOptions.find((e) => e.label.toLowerCase() === row.estado.toLowerCase())?.id.toString() ||
        "",
      reuDescripcion: row.descripcion || "",
    });
    setShowEditModal(true);
  };

  const closeFormModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setForm(initialForm);
    setFormError("");
  };

  const openInformeModal = (row: ReunionRow) => {
    setSelectedReunion(row);
    setShowInformeModal(true);
  };

  const closeInformeModal = () => {
    setSelectedReunion(null);
    setShowInformeModal(false);
  };

  const openEditarInformeModal = async (row: ReunionRow) => {
    setSelectedReunion(row);
    setInformeText(row.informe || "");
    setInformeError("");
    setSelectedAsistentes(
      Array.isArray(row.asistentesDetalle)
        ? row.asistentesDetalle.map((a) => String(a.cedula))
        : []
    );
    setShowEditarInformeModal(true);
    await fetchAprendicesProyecto(row.id);
  };

  const closeEditarInformeModal = () => {
    setSelectedReunion(null);
    setInformeText("");
    setInformeError("");
    setAprendicesProyecto([]);
    setSelectedAsistentes([]);
    setShowEditarInformeModal(false);
  };

  const openAsistentesModal = (row: ReunionRow) => {
    setSelectedReunion(row);
    setShowAsistentesModal(true);
  };

  const closeAsistentesModal = () => {
    setSelectedReunion(null);
    setShowAsistentesModal(false);
  };

  const toggleAsistenteSelection = (cedula: string) => {
    setSelectedAsistentes((prev) =>
      prev.includes(cedula)
        ? prev.filter((item) => item !== cedula)
        : [...prev, cedula]
    );
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    if (!form.sprIdFk || !form.detParIdTipoFk || !form.reuFecha) {
      setFormError("Completa los campos obligatorios.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/aprendiz/reuniones?cedula=${cedula}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprIdFk: Number(form.sprIdFk),
          detParIdTipoFk: Number(form.detParIdTipoFk),
          detParIdEstadoFk: form.detParIdEstadoFk
            ? Number(form.detParIdEstadoFk)
            : null,
          reuFecha: form.reuFecha,
          reuHora: form.reuHora || null,
          reuLugar: form.reuLugar || null,
          reuDescripcion: form.reuDescripcion || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo crear la reunión.");
      }

      closeFormModals();
      await fetchReuniones();
      setSuccessText("La reunión se creó con éxito.");
      setShowSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message || "Ocurrió un error al crear la reunión.");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    if (!form.id) {
      setFormError("No se encontró la reunión a editar.");
      return;
    }

    if (!form.sprIdFk || !form.detParIdTipoFk || !form.reuFecha) {
      setFormError("Completa los campos obligatorios.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/reuniones/${form.id}?cedula=${cedula}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sprIdFk: Number(form.sprIdFk),
            detParIdTipoFk: Number(form.detParIdTipoFk),
            reuFecha: form.reuFecha,
            reuHora: form.reuHora || null,
            reuLugar: form.reuLugar || null,
            detParIdEstadoFk: form.detParIdEstadoFk
              ? Number(form.detParIdEstadoFk)
              : null,
            reuDescripcion: form.reuDescripcion || null,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo editar la reunión.");
      }

      closeFormModals();
      await fetchReuniones();
      setSuccessText("La reunión se actualizó con éxito.");
      setShowSuccessModal(true);
    } catch (err: any) {
      setFormError(err.message || "Ocurrió un error al editar la reunión.");
    } finally {
      setSaving(false);
    }
  };

  const submitInforme = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReunion) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    if (!informeText.trim()) {
      setInformeError("El informe no puede estar vacío.");
      return;
    }

    setSavingInforme(true);
    setInformeError("");

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/reuniones/${selectedReunion.id}/informe?cedula=${cedula}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reuInforme: informeText.trim(),
            asistentesCedulas: selectedAsistentes,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "No se pudo guardar el informe.");
      }

      const updatedRow = normalizeReunionRow(data);

      setRows((prev) =>
        prev.map((r) => (r.id === selectedReunion.id ? updatedRow : r))
      );

      closeEditarInformeModal();
      setSuccessText("El informe de la reunión se guardó con éxito.");
      setShowSuccessModal(true);
      await fetchReuniones();
    } catch (err: any) {
      setInformeError(err.message || "Ocurrió un error al guardar el informe.");
    } finally {
      setSavingInforme(false);
    }
  };

  const getEstadoClass = (estado: string) => {
    const value = estado.toLowerCase().trim();

    if (value === "hecho") return "estado-finalizado";
    if (value === "pendiente") return "estado-pendiente";
    if (value === "cancelada" || value === "cancelado") return "estado-default";

    return "estado-default";
  };

  const hasActiveFilters = !!searchTerm.trim();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <div className="dashboard-aprendiz">
      <aside className="side-card">
        <div className="brand-block">
          <img src={senaLogo} alt="Logo SENA" className="logo-lg" />
          <h2>Gestión de proyectos</h2>
        </div>

        <nav className="menu">
          <p className="menu-title">MENÚ</p>
          <ul>
            {menuItems.map((item) => {
              const active =
                item.name === "Reuniones"
                  ? isReunionesActive
                  : location.pathname === item.path;

              return (
                <li
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={active ? "active" : ""}
                >
                  <item.icon size={18} style={{ marginRight: 10 }} />
                  {item.name}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="settings-footer">
          <p className="menu-title">SETTINGS</p>
          <div
            className="support-item"
            onClick={() => navigate("/ayuda-soporte")}
          >
            <HelpCircle size={18} style={{ marginRight: 10, color: "#39A900" }} />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Reuniones</h1>
          </div>

          <div className="profile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{displayName}</span>
            <ChevronDown size={18} />

            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/mi-perfil");
                  }}
                >
                  <User size={16} style={{ marginRight: 8 }} />
                  Mi Perfil
                </li>
                <li
                  className="logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <div className="reu-topbar">
              <div>
                <p className="reu-eyebrow">SCRUM EVENTS</p>
                <h2 className="reu-heading">Reuniones</h2>
                <p className="welcome-subtitle">
                  Gestiona, crea y edita las reuniones del proyecto de forma visual y profesional.
                </p>
              </div>

              <button className="btn-crear-reunion top" onClick={openCreateModal}>
                <Plus size={16} style={{ marginRight: 8 }} />
                Crear reunión
              </button>
            </div>

            <section className="reu-box">
              <div className="hu-filter-bar-compact">
                <div className="hu-filter-input-compact">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por tipo, fecha, responsable, asistentes, lugar o estado"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="hu-filter-actions-compact">
                  <span className="hu-results-counter compact">
                    {filteredRows.length} resultado{filteredRows.length !== 1 ? "s" : ""}
                  </span>

                  <button
                    className={`hu-clear-filters-btn compact ${hasActiveFilters ? "active" : ""}`}
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <X size={14} />
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="compact-table-wrap pro-wrap">
                <table className="compact-table pro-table">
                  <thead>
                    <tr>
                      <th className="col-tipo">TIPO</th>
                      <th className="col-fecha" onClick={() => toggleSort("fecha")}>
                        FECHA{sortArrow("fecha")}
                      </th>
                      <th className="col-hora" onClick={() => toggleSort("hora")}>
                        HORA{sortArrow("hora")}
                      </th>
                      <th className="col-responsable" onClick={() => toggleSort("responsable")}>
                        RESPONSABLE{sortArrow("responsable")}
                      </th>
                      <th className="col-lugar" onClick={() => toggleSort("lugar")}>
                        LUGAR{sortArrow("lugar")}
                      </th>
                      <th className="col-estado" onClick={() => toggleSort("estado")}>
                        ESTADO{sortArrow("estado")}
                      </th>
                      <th className="col-accion icon-head">ASIS.</th>
                      <th className="col-accion icon-head">EDITAR</th>
                      <th className="col-accion icon-head">INFORME</th>
                      <th className="col-accion icon-head">VER</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="empty-cell">
                          No hay reuniones para mostrar.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <div className="reu-main-info compact">
                              <span className="reu-title">{r.tipo}</span>
                              <span className="reu-subtext">Reunión Scrum</span>
                            </div>
                          </td>

                          <td>{formatFecha(r.fecha)}</td>
                          <td>{formatHora(r.hora)}</td>
                          <td className="td-responsable">{r.responsable}</td>
                          <td>{r.lugar}</td>

                          <td className="td-estado">
                            <span className={`reu-estado-pill compact-pill ${getEstadoClass(r.estado)}`}>
                              {r.estado}
                            </span>
                          </td>

                          <td className="td-action">
                            <button
                              className="icon-btn small asistentes with-badge"
                              title="Ver asistentes"
                              onClick={() => openAsistentesModal(r)}
                            >
                              <Users size={15} strokeWidth={2.1} />
                              <span className="icon-badge">
                                {r.cantidadAsistentes || 0}
                              </span>
                            </button>
                          </td>

                          <td className="td-action">
                            <button
                              className={`icon-btn small edit ${!r.puedeEditar ? "disabled-btn" : ""}`}
                              title={
                                r.puedeEditar
                                  ? "Editar reunión"
                                  : "Solo el responsable que creó la reunión puede editarla"
                              }
                              onClick={() => r.puedeEditar && openEditModal(r)}
                              disabled={!r.puedeEditar}
                            >
                              <SquarePen size={15} strokeWidth={2.1} />
                            </button>
                          </td>

                          <td className="td-action">
                            <button
                              className={`icon-btn small report ${!r.puedeGestionarInforme ? "disabled-btn" : ""}`}
                              title={
                                !r.puedeGestionarInforme
                                  ? "Solo el responsable puede crear o editar el informe"
                                  : r.informe?.trim()
                                  ? "Editar informe"
                                  : "Crear informe"
                              }
                              onClick={() =>
                                r.puedeGestionarInforme && openEditarInformeModal(r)
                              }
                              disabled={!r.puedeGestionarInforme}
                            >
                              {r.informe?.trim() ? (
                                <FilePenLine size={15} strokeWidth={2.1} />
                              ) : (
                                <FileText size={15} strokeWidth={2.1} />
                              )}
                            </button>
                          </td>

                          <td className="td-action">
                            <button
                              className="icon-btn small view"
                              title="Ver informe"
                              onClick={() => openInformeModal(r)}
                            >
                              <Eye size={15} strokeWidth={2.1} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="reu-footer">
                <div />
                <div className="reu-pagination">
                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    Anterior
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pg-btn ${n === safePage ? "active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="pg-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>

      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay">
          <div
            className={`reu-modal compact-form-modal ${
              showCreateModal ? "create-modal-compact" : "edit-modal-compact"
            }`}
          >
            <div className="reu-modal-header compact-header compact-form-header">
              <div>
                <h2>{showCreateModal ? "Crear reunión" : "Editar reunión"}</h2>
                <p>
                  {showCreateModal
                    ? "Registra una nueva reunión del proyecto."
                    : "Actualiza la información de la reunión seleccionada."}
                </p>
              </div>

              <button className="close-modal-btn compact-close-btn" onClick={closeFormModals}>
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={showCreateModal ? submitCreate : submitEdit}
              className="reu-modal-form compact-form-body"
            >
              <div className="reu-form-grid compact-form-grid">
                <div className="form-group compact-form-group">
                  <label>Sprint *</label>
                  <select name="sprIdFk" value={form.sprIdFk} onChange={handleInputChange}>
                    <option value="">Selecciona un sprint</option>
                    {sprintOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group compact-form-group">
                  <label>Tipo de reunión *</label>
                  <select
                    name="detParIdTipoFk"
                    value={form.detParIdTipoFk}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona un tipo</option>
                    {tipoOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group compact-form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="reuFecha"
                    value={form.reuFecha}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group compact-form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    name="reuHora"
                    value={form.reuHora}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group compact-form-group">
                  <label>Lugar</label>
                  <input
                    type="text"
                    name="reuLugar"
                    placeholder="Ej: Virtual, Biblioteca"
                    value={form.reuLugar}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group compact-form-group">
                  <label>Estado</label>
                  <select
                    name="detParIdEstadoFk"
                    value={form.detParIdEstadoFk}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona un estado</option>
                    {estadoOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width compact-form-group compact-form-section">
                <label>Descripcion</label>
                <textarea
                  name="reuDescripcion"
                  rows={3}
                  className="compact-form-textarea"
                  placeholder="Describe el objetivo o descripcion de la reunión"
                  value={form.reuDescripcion}
                  onChange={handleInputChange}
                />
              </div>

              {formError && <div className="msg error">{formError}</div>}

              <div className="reu-modal-actions compact-actions compact-form-actions">
                <button type="button" className="btn-secondary" onClick={closeFormModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving
                    ? "Guardando..."
                    : showCreateModal
                    ? "Crear reunión"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAsistentesModal && selectedReunion && (
        <div className="modal-overlay">
          <div className="reu-modal asistentes-modal compact-info-modal">
            <div className="reu-modal-header compact-header">
              <div>
                <h2>Asistentes de la reunión</h2>
                <p>Lista de asistentes registrados para esta reunión.</p>
              </div>

              <button className="close-modal-btn" onClick={closeAsistentesModal}>
                <X size={18} />
              </button>
            </div>

            <div className="informe-detalle-grid compact-detail-grid asistentes-info-grid">
              <div className="informe-item compact-item">
                <span className="informe-label">Tipo</span>
                <span className="informe-value">{selectedReunion.tipo}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Fecha</span>
                <span className="informe-value">{formatFecha(selectedReunion.fecha)}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Hora</span>
                <span className="informe-value">{formatHora(selectedReunion.hora)}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Responsable</span>
                <span className="informe-value">{selectedReunion.responsable}</span>
              </div>
            </div>

            <div className="form-group full-width compact-section">
              <label>Asistentes ({selectedReunion.cantidadAsistentes || 0})</label>

              {selectedReunion.asistentesDetalle.length ? (
                <div className="asistentes-list compact-asistentes-list">
                  {selectedReunion.asistentesDetalle.map((asistente, index) => (
                    <div key={`${asistente.cedula}-${index}`} className="asistente-chip compact-asistente-chip">
                      <Users size={14} />
                      <span>{asistente.nombre}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="informe-view-box compact-view-box">
                  No hay asistentes registrados para esta reunión.
                </div>
              )}
            </div>

            <div className="reu-modal-actions compact-actions">
              <button type="button" className="btn-secondary" onClick={closeAsistentesModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showInformeModal && selectedReunion && (
        <div className="modal-overlay">
          <div className="reu-modal informe-modal compact-info-modal">
            <div className="reu-modal-header compact-header">
              <div>
                <h2>Detalle del informe</h2>
                <p>Consulta la información registrada de la reunión.</p>
              </div>

              <button className="close-modal-btn" onClick={closeInformeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="informe-detalle-grid compact-detail-grid">
              <div className="informe-item compact-item">
                <span className="informe-label">Tipo</span>
                <span className="informe-value">{selectedReunion.tipo}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Fecha</span>
                <span className="informe-value">{formatFecha(selectedReunion.fecha)}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Hora</span>
                <span className="informe-value">{formatHora(selectedReunion.hora)}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Responsable</span>
                <span className="informe-value">{selectedReunion.responsable}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Lugar</span>
                <span className="informe-value">{selectedReunion.lugar}</span>
              </div>

              <div className="informe-item compact-item">
                <span className="informe-label">Estado</span>
                <span className="informe-value">{selectedReunion.estado}</span>
              </div>
            </div>

            <div className="form-group full-width compact-section">
              <label>Informe</label>
              <div className="informe-view-box compact-view-box">
                {selectedReunion.informe?.trim()
                  ? selectedReunion.informe
                  : "Esta reunión todavía no tiene informe registrado."}
              </div>
            </div>

            <div className="reu-modal-actions compact-actions">
              <button type="button" className="btn-secondary" onClick={closeInformeModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditarInformeModal && selectedReunion && (
        <div className="modal-overlay">
          <div className="reu-modal informe-modal compact-edit-modal compact-report-modal">
            <div className="reu-modal-header compact-header compact-report-header">
              <div>
                <h2>{selectedReunion.informe?.trim() ? "Editar informe" : "Crear informe"}</h2>
                <p>Solo el responsable de la reunión puede registrar o editar el informe.</p>
              </div>

              <button className="close-modal-btn compact-close-btn" onClick={closeEditarInformeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitInforme} className="reu-modal-form compact-form-body">
              <div className="informe-detalle-grid compact-detail-grid compact-report-grid">
                <div className="informe-item compact-item">
                  <span className="informe-label">Tipo</span>
                  <span className="informe-value">{selectedReunion.tipo}</span>
                </div>

                <div className="informe-item compact-item">
                  <span className="informe-label">Fecha</span>
                  <span className="informe-value">{formatFecha(selectedReunion.fecha)}</span>
                </div>

                <div className="informe-item compact-item">
                  <span className="informe-label">Hora</span>
                  <span className="informe-value">{formatHora(selectedReunion.hora)}</span>
                </div>

                <div className="informe-item compact-item">
                  <span className="informe-label">Lugar</span>
                  <span className="informe-value">{selectedReunion.lugar}</span>
                </div>
              </div>

              <div className="form-group full-width compact-section">
                <label>Informe de la reunión *</label>
                <textarea
                  className="compact-textarea compact-report-textarea"
                  rows={4}
                  placeholder="Escribe aquí el informe detallado de la reunión"
                  value={informeText}
                  onChange={(e) => setInformeText(e.target.value)}
                />
              </div>

              <div className="form-group full-width compact-section">
                <label>Seleccionar asistentes</label>

                {loadingAprendices ? (
                  <div className="informe-view-box compact-view-box">
                    Cargando integrantes del proyecto...
                  </div>
                ) : aprendicesProyecto.length ? (
                  <div className="asistentes-list compact-asistentes-list compact-check-list">
                    {aprendicesProyecto.map((aprendiz) => {
                      const checked = selectedAsistentes.includes(aprendiz.cedula);

                      return (
                        <label
                          key={aprendiz.cedula}
                          className="asistente-chip compact-asistente-chip compact-check-chip"
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAsistenteSelection(aprendiz.cedula)}
                          />
                          <span>{aprendiz.nombre}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="informe-view-box compact-view-box">
                    No se encontraron integrantes del proyecto para esta reunión.
                  </div>
                )}
              </div>

              {informeError && <div className="msg error">{informeError}</div>}

              <div className="reu-modal-actions compact-actions compact-form-actions">
                <button type="button" className="btn-secondary" onClick={closeEditarInformeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={savingInforme}>
                  {savingInforme ? "Guardando..." : "Guardar informe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CheckCircle2
              size={52}
              color="#39A900"
              style={{ marginBottom: 14 }}
            />
            <h2 className="modal-title">Proceso completado</h2>
            <p className="success-text">{successText}</p>
            <div className="modal-buttons">
              <button
                className="btn-success-ok"
                onClick={() => setShowSuccessModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle
              size={45}
              color="#E74C3C"
              style={{ marginBottom: 15 }}
            />
            <h2 className="modal-title">¿Estás seguro?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Sí, Cerrar
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

export default Reuniones;