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
  Pencil,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import senaLogo from "../../assets/sena.png";
import "./HistoriasUsuario.css";
import { API_URL } from "../../config/Api";

type HistoriaRow = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  puntaje: number | null;
  prioridad: string | null;
  estadoId?: number | null;
  estadoNombre?: string | null;
  responsableCedula?: number | null;
  responsableNombre?: string | null;
  creadorCedula?: number | null;
  creadorNombre?: string | null;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
  puedeCambiarResponsable?: boolean;
  esScrumMaster?: boolean;
};

type ResponsableOption = {
  cedula: number;
  nombre: string;
};

type SortKey = "id" | "titulo" | "puntaje" | "responsable" | "estado";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

const HistoriasUsuario: React.FC = () => {
  const [rows, setRows] = useState<HistoriaRow[]>([]);
  const [responsables, setResponsables] = useState<ResponsableOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayName, setDisplayName] = useState<string>("Usuario SENA");

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState("");

  const [como, setComo] = useState("");
  const [quiero, setQuiero] = useState("");
  const [para, setPara] = useState("");
  const [puntaje, setPuntaje] = useState("");
  const [estadoId, setEstadoId] = useState("1");
  const [responsableCedula, setResponsableCedula] = useState("");

  const [touched, setTouched] = useState({
    como: false,
    quiero: false,
    para: false,
    puntaje: false,
    responsableCedula: false,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-aprendiz" },
    { name: "Mi Proyecto", icon: Briefcase, path: "/aprendiz/mi-proyecto" },
    { name: "Historias de usuario", icon: ClipboardList, path: "/aprendiz/historias-usuario" },
    { name: "Criterios de aceptación", icon: CheckSquare, path: "/aprendiz/criterios-aceptacion" },
    { name: "Reuniones", icon: Calendar, path: "/aprendiz/reuniones" },
    { name: "Observaciones", icon: Eye, path: "/aprendiz/observaciones" },
  ];

  const isScrumMaster = rows.some((r) => r.esScrumMaster);

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const resetForm = () => {
    setComo("");
    setQuiero("");
    setPara("");
    setPuntaje("");
    setEstadoId("1");
    setResponsableCedula("");
    setTouched({
      como: false,
      quiero: false,
      para: false,
      puntaje: false,
      responsableCedula: false,
    });
    setEditingId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPage(1);
  };

  const parseDescripcion = (titulo: string | null, descripcion: string | null) => {
    const desc = (descripcion ?? "").trim();
    const lower = desc.toLowerCase();

    const iComo = lower.indexOf("como ");
    const iQuiero = lower.indexOf(" quiero ");
    const iPara = lower.indexOf(" para ");

    if (iComo !== -1 && iQuiero !== -1 && iPara !== -1 && iComo < iQuiero && iQuiero < iPara) {
      return {
        como: desc.substring(iComo + 5, iQuiero).trim(),
        quiero: desc.substring(iQuiero + 7, iPara).trim(),
        para: desc.substring(iPara + 6).trim(),
      };
    }

    return {
      como: "",
      quiero: titulo ?? "",
      para: desc,
    };
  };

  const getEstadoUI = (row: HistoriaRow) => {
    const nombre = (row.estadoNombre ?? "").trim().toLowerCase();
    const id = Number(row.estadoId ?? 0);

    if (nombre.includes("final")) {
      return { text: "Finalizado", cls: "estado-finalizado" };
    }
    if (nombre.includes("proceso") || nombre.includes("doing")) {
      return { text: "En proceso", cls: "estado-proceso" };
    }
    if (nombre.includes("pendiente") || nombre.includes("todo") || id === 1) {
      return { text: "Pendiente", cls: "estado-pendiente" };
    }

    return { text: row.estadoNombre ?? "Sin estado", cls: "estado-default" };
  };

  const fetchResponsables = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) return;

    try {
      const res = await fetch(`${API_URL}/aprendiz/historias-usuario/responsables?cedula=${cedula}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResponsables(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error("Error cargando responsables:", e);
      setResponsables([]);
    }
  };

  const fetchHistorias = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/aprendiz/historias-usuario?cedula=${cedula}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setRows(Array.isArray(json) ? (json as HistoriaRow[]) : []);
      setPage(1);
    } catch (e) {
      console.error("Error HistoriasUsuario:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName && storedName.trim()) setDisplayName(storedName);

    fetchResponsables();
    fetchHistorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) => {
      const idText = String(row.id ?? "").toLowerCase();
      const tituloText = (row.titulo ?? "").toLowerCase();
      const descripcionText = (row.descripcion ?? "").toLowerCase();
      const puntajeText = String(row.puntaje ?? "").toLowerCase();
      const responsableText = (row.responsableNombre ?? "").toLowerCase();
      const estadoText = (row.estadoNombre ?? "").toLowerCase();

      return (
        idText.includes(term) ||
        tituloText.includes(term) ||
        descripcionText.includes(term) ||
        puntajeText.includes(term) ||
        responsableText.includes(term) ||
        estadoText.includes(term)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      const va =
        sortKey === "id"
          ? a.id
          : sortKey === "puntaje"
          ? Number(a.puntaje ?? 0)
          : sortKey === "responsable"
          ? (a.responsableNombre ?? "").toLowerCase()
          : sortKey === "estado"
          ? (a.estadoNombre ?? "").toLowerCase()
          : (a.titulo ?? "").toLowerCase();

      const vb =
        sortKey === "id"
          ? b.id
          : sortKey === "puntaje"
          ? Number(b.puntaje ?? 0)
          : sortKey === "responsable"
          ? (b.responsableNombre ?? "").toLowerCase()
          : sortKey === "estado"
          ? (b.estadoNombre ?? "").toLowerCase()
          : (b.titulo ?? "").toLowerCase();

      if (va < (vb as any)) return -1 * dir;
      if (va > (vb as any)) return 1 * dir;
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
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const openCreateModal = () => {
    if (!isScrumMaster) {
      alert("Solo el Scrum Master puede crear historias de usuario.");
      return;
    }

    resetForm();
    setFormMode("create");
    setShowFormModal(true);
  };

  const openEditModal = (row: HistoriaRow) => {
    if (!row.puedeEditar) {
      alert("No tienes permiso para editar esta historia.");
      return;
    }

    const parsed = parseDescripcion(row.titulo, row.descripcion);

    setComo(parsed.como);
    setQuiero(parsed.quiero);
    setPara(parsed.para);
    setPuntaje(String(row.puntaje ?? ""));
    setEstadoId(String(row.estadoId ?? 1));
    setResponsableCedula(String(row.responsableCedula ?? ""));
    setEditingId(row.id);
    setTouched({
      como: false,
      quiero: false,
      para: false,
      puntaje: false,
      responsableCedula: false,
    });
    setFormMode("edit");
    setShowFormModal(true);
  };

  const askDelete = (row: HistoriaRow) => {
    if (!row.puedeEliminar) {
      alert("Solo el Scrum Master puede eliminar historias.");
      return;
    }

    setDeleteId(row.id);
    setShowDeleteModal(true);
  };

  const isEmpty = (v: string) => !v || !v.trim();

  const validate = () => {
    const scoreNum = Number(puntaje);
    const puntajeOk = Number.isFinite(scoreNum) && scoreNum >= 1 && scoreNum <= 10;

    return {
      como: !isEmpty(como),
      quiero: !isEmpty(quiero),
      para: !isEmpty(para),
      puntaje: puntajeOk,
      responsableCedula:
        formMode === "create" || isScrumMaster
          ? Number(responsableCedula) > 0
          : true,
    };
  };

  const onSave = async () => {
    const v = validate();
    setTouched({
      como: true,
      quiero: true,
      para: true,
      puntaje: true,
      responsableCedula: true,
    });

    if (!v.como || !v.quiero || !v.para || !v.puntaje || !v.responsableCedula) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    const titulo = quiero.trim();
    const descripcion = `Como ${como.trim()} quiero ${quiero.trim()} para ${para.trim()}`;

    try {
      if (formMode === "create") {
        const res = await fetch(`${API_URL}/historias-usuario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula: Number(cedula),
            titulo,
            descripcion,
            puntaje: Number(puntaje),
            prioridad: null,
            numeroSprint: null,
            estadoId: Number(estadoId),
            responsableCedula: Number(responsableCedula),
          }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `HTTP ${res.status}`);
        }

        setShowFormModal(false);
        resetForm();
        await fetchHistorias();
        setSuccessText("Historia creada correctamente.");
        setShowSuccessModal(true);
      } else {
        const payload: any = {
          titulo,
          descripcion,
          puntaje: Number(puntaje),
          estadoId: Number(estadoId),
        };

        if (isScrumMaster && Number(responsableCedula) > 0) {
          payload.responsableCedula = Number(responsableCedula);
        }

        const res = await fetch(`${API_URL}/historias-usuario/${editingId}?cedula=${cedula}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `HTTP ${res.status}`);
        }

        setShowFormModal(false);
        resetForm();
        await fetchHistorias();
        setSuccessText("Historia editada correctamente.");
        setShowSuccessModal(true);
      }
    } catch (e) {
      console.error("Error guardando HU:", e);
      alert("No tienes permisos o no se pudo guardar la historia.");
    }
  };

  const doDelete = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula || !deleteId) return;

    try {
      const res = await fetch(`${API_URL}/historias-usuario/${deleteId}?cedula=${cedula}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      setShowDeleteModal(false);
      setDeleteId(null);
      fetchHistorias();
    } catch (e) {
      console.error("Error eliminando HU:", e);
      alert("No tienes permisos o no se pudo eliminar la historia.");
    }
  };

  const v = validate();
  const hasActiveFilters = !!searchTerm.trim();

  if (loading) return <div className="loading-screen">Cargando...</div>;

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
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className={location.pathname === item.path ? "active" : ""}
              >
                <item.icon size={18} style={{ marginRight: "10px" }} />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>

        <div className="settings-footer" style={{ marginTop: "auto", padding: "10px 0" }}>
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
            onClick={() => navigate("/ayuda-soporte")}
          >
            <HelpCircle size={18} style={{ marginRight: "10px", color: "#39A900" }} />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Historias de usuario</h1>
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
                <li onClick={() => navigate("/mi-perfil")}>
                  <User size={16} style={{ marginRight: "8px" }} /> Mi Perfil
                </li>

                <li
                  className="logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} style={{ marginRight: "8px" }} /> Cerrar Sesión
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="vp-container">
          <section className="dashboard-content">
            <p className="welcome-subtitle">
              Cada historia refleja una necesidad del usuario y forma parte del Product Backlog.
              Aquí podrás consultarlas y darles seguimiento para asegurar que cada entrega aporte valor al proyecto.
            </p>

            <section className="box hu-modern-box">
              <div className="hu-table-header">
                <div>
                  <span className="hu-table-kicker">PRODUCT BACKLOG</span>
                  <h3 className="hu-table-title">Historias de usuario</h3>
                  <p className="hu-table-subtitle">
                    Gestiona, edita y organiza las historias de forma visual y profesional.
                  </p>
                </div>

                {isScrumMaster && (
                  <button className="hu-create-top-btn" onClick={openCreateModal}>
                    <Plus size={18} />
                    <span>Crear HU</span>
                  </button>
                )}
              </div>

              <div className="hu-filter-bar-compact">
                <div className="hu-filter-input-compact">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por ID, título, descripción, responsable, estado o puntaje"
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

              <div className="hu-modern-table-wrap">
                <table className="hu-modern-table">
                  <thead>
                    <tr>
                      <th className="th-sort col-id" onClick={() => toggleSort("id")}>
                        <span className="th-content">ID{sortArrow("id")}</span>
                      </th>

                      <th className="th-sort col-title" onClick={() => toggleSort("titulo")}>
                        <span className="th-content">TITULO{sortArrow("titulo")}</span>
                      </th>

                      <th className="col-desc">
                        <span className="th-content">DESCRIPCION</span>
                      </th>

                      <th className="th-sort col-responsable" onClick={() => toggleSort("responsable")}>
                        <span className="th-content">RESPONSABLE{sortArrow("responsable")}</span>
                      </th>

                      <th className="th-sort col-estado" onClick={() => toggleSort("estado")}>
                        <span className="th-content">ESTADO{sortArrow("estado")}</span>
                      </th>

                      <th className="th-sort col-score" onClick={() => toggleSort("puntaje")}>
                        <span className="th-content">PUNTAJE{sortArrow("puntaje")}</span>
                      </th>

                      <th className="col-actions">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="hu-empty-cell">
                          No hay historias para mostrar.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((r) => {
                        const estadoUI = getEstadoUI(r);

                        return (
                          <tr key={r.id}>
                            <td className="col-id">
                              <div className="hu-id-badge">{r.id}</div>
                            </td>

                            <td className="hu-title-cell" title={r.titulo ?? "-"}>
                              <div className="hu-title-block">
                                <span className="hu-title-main">{r.titulo ?? "-"}</span>
                                <span className="hu-title-mini">Historia de usuario</span>
                              </div>
                            </td>

                            <td className="hu-desc-cell" title={r.descripcion ?? "-"}>
                              <span className="hu-desc-text hu-desc-clamp">
                                {r.descripcion ?? "-"}
                              </span>
                            </td>

                            <td className="hu-responsable-cell" title={r.responsableNombre ?? "Sin asignar"}>
                              <span className="hu-responsable-name">
                                {r.responsableNombre ?? "Sin asignar"}
                              </span>
                            </td>

                            <td className="hu-estado-cell">
                              <span className={`hu-estado-badge ${estadoUI.cls}`}>
                                {estadoUI.text}
                              </span>
                            </td>

                            <td className="hu-score-cell">
                              <span className="hu-score-badge">{r.puntaje ?? "-"}</span>
                            </td>

                            <td className="hu-actions-cell">
                              <div className="hu-actions-inline">
                                {r.puedeEditar ? (
                                  <button
                                    className="hu-icon-btn hu-edit-btn"
                                    title="Editar historia"
                                    onClick={() => openEditModal(r)}
                                  >
                                    <Pencil size={18} />
                                  </button>
                                ) : null}

                                {r.puedeEliminar ? (
                                  <button
                                    className="hu-icon-btn hu-delete-btn"
                                    title="Eliminar historia"
                                    onClick={() => askDelete(r)}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                ) : null}

                                {!r.puedeEditar && !r.puedeEliminar ? (
                                  <div className="hu-no-access" title="Sin permiso">
                                    <Lock size={16} />
                                    <span>Sin permiso</span>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="hu-pagination hu-pagination-right">
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
            </section>
          </section>
        </div>
      </main>

      {showFormModal && (
        <div className="modal-overlay">
          <div className="hu-modal-card">
            <div className="hu-modal-header">
              <div>
                <span className="hu-modal-kicker">
                  {formMode === "create" ? "NUEVA HISTORIA" : "EDITAR HISTORIA"}
                </span>
                <h2>
                  {formMode === "create"
                    ? "Crear historia de usuario"
                    : "Editar historia de usuario"}
                </h2>
              </div>

              <button
                className="hu-close-btn"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p className="hu-modal-subtitle">
              Las historias de usuario se escriben con la fórmula “Como, quiero, para”.
            </p>

            <label className="hu-form-label">
              Como<span className="hu-required">*</span>
            </label>
            <input
              className="hu-form-input"
              value={como}
              onChange={(e) => setComo(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, como: true }))}
            />
            {touched.como && !v.como && <div className="hu-error">¡Por favor, llenar este campo!</div>}

            <label className="hu-form-label">
              Quiero<span className="hu-required">*</span>
            </label>
            <input
              className="hu-form-input"
              value={quiero}
              onChange={(e) => setQuiero(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, quiero: true }))}
            />
            {touched.quiero && !v.quiero && <div className="hu-error">¡Por favor, llenar este campo!</div>}

            <label className="hu-form-label">
              Para<span className="hu-required">*</span>
            </label>
            <textarea
              className="hu-form-input hu-form-textarea"
              value={para}
              onChange={(e) => setPara(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, para: true }))}
            />
            {touched.para && !v.para && <div className="hu-error">¡Por favor, llenar este campo!</div>}

            <label className="hu-form-label">
              Puntaje<span className="hu-required">*</span>
            </label>
            <input
              className="hu-form-input hu-score-input"
              type="number"
              min={1}
              max={10}
              placeholder="1-10"
              value={puntaje}
              onChange={(e) => setPuntaje(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, puntaje: true }))}
            />
            {touched.puntaje && !v.puntaje && (
              <div className="hu-error">El puntaje debe estar entre 1 y 10.</div>
            )}

            <label className="hu-form-label">
              Estado<span className="hu-required">*</span>
            </label>
            <select
              className="hu-form-input"
              value={estadoId}
              onChange={(e) => setEstadoId(e.target.value)}
            >
              <option value="1">Pendiente</option>
              <option value="2">En proceso</option>
              <option value="3">Finalizado</option>
            </select>

            {(formMode === "create" || isScrumMaster) && (
              <>
                <label className="hu-form-label">
                  Responsable<span className="hu-required">*</span>
                </label>
                <select
                  className="hu-form-input"
                  value={responsableCedula}
                  onChange={(e) => setResponsableCedula(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, responsableCedula: true }))}
                >
                  <option value="">Selecciona...</option>
                  {responsables.map((r) => (
                    <option key={r.cedula} value={r.cedula}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                {touched.responsableCedula && !v.responsableCedula && (
                  <div className="hu-error">Selecciona un responsable.</div>
                )}
              </>
            )}

            <div className="hu-modal-actions">
              <button
                className="hu-btn-cancel"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
              <button className="hu-btn-save" onClick={onSave}>
                {formMode === "create" ? "Guardar" : "Actualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CheckCircle2 size={52} color="#39A900" style={{ marginBottom: 14 }} />
            <h2 className="modal-title">Proceso completado</h2>
            <p className="success-text">{successText}</p>
            <div className="modal-buttons">
              <button className="btn-success-ok" onClick={() => setShowSuccessModal(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={45} color="#E74C3C" style={{ marginBottom: "15px" }} />
            <h2 className="modal-title">¿Eliminar historia?</h2>
            <p style={{ marginBottom: 14, color: "#555" }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={doDelete}>
                Sí, eliminar
              </button>
              <button className="btn-cancel-logout" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={45} color="#E74C3C" style={{ marginBottom: "15px" }} />
            <h2 className="modal-title">¿Estás seguro?</h2>
            <div className="modal-buttons">
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Sí, Cerrar
              </button>
              <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriasUsuario;
