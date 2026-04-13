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
import { API_URL } from "../../config/Api";
import "./CriteriosAceptacion.css";

type CriterioRow = {
  id: number;
  hisId: number;
  descripcion: string;
  estado: string;
  estadoId?: number;
  tiempo: string;
  responsableCedula?: number | null;
  responsableNombre?: string | null;
};

type HuOption = {
  id: number;
  titulo: string;
  responsableCedula?: number | null;
  puedeCrear?: boolean;
};

type SortKey = "id" | "hisId";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

const parseDescripcion = (desc: string) => {
  return {
    contexto: (desc ?? "").replace(/^Contexto:\s*/i, "").trim(),
  };
};

const buildDescripcion = (contexto: string) => contexto.trim();

const CriteriosAceptacion: React.FC = () => {
  const [rows, setRows] = useState<CriterioRow[]>([]);
  const [huOptions, setHuOptions] = useState<HuOption[]>([]);
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

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionText, setPermissionText] = useState("");

  const [hisId, setHisId] = useState<string>("");
  const [contexto, setContexto] = useState("");
  const [estadoId, setEstadoId] = useState<string>("1");
  const [tiempo, setTiempo] = useState("");

  const [touched, setTouched] = useState({
    hisId: false,
    contexto: false,
    estadoId: false,
    tiempo: false,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const userCedula = Number(localStorage.getItem("userCedula") || 0);

  const menuItems = [
    { name: "Inicio", icon: Home, path: "/dashboard-aprendiz" },
    { name: "Mi Proyecto", icon: Briefcase, path: "/aprendiz/mi-proyecto" },
    { name: "Historias de usuario", icon: ClipboardList, path: "/aprendiz/historias-usuario" },
    { name: "Criterios de aceptación", icon: CheckSquare, path: "/aprendiz/criterios-aceptacion" },
    { name: "Reuniones", icon: Calendar, path: "/aprendiz/reuniones" },
    { name: "Observaciones", icon: Eye, path: "/aprendiz/observaciones" },
  ];

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const resetForm = () => {
    setHisId("");
    setContexto("");
    setEstadoId("1");
    setTiempo("");
    setTouched({
      hisId: false,
      contexto: false,
      estadoId: false,
      tiempo: false,
    });
    setEditingId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPage(1);
  };

  const getHuTitulo = (id: number) => {
    const hu = huOptions.find((h) => Number(h.id) === Number(id));
    return hu?.titulo ?? `HU ${id}`;
  };

  const getHuOption = (id: number) => {
    return huOptions.find((h) => Number(h.id) === Number(id));
  };

  const canManage = (row: CriterioRow) => {
    return Number(row.responsableCedula ?? 0) === userCedula;
  };

  const selectedHu = getHuOption(Number(hisId || 0));
  const canCreateOnSelectedHu = !!selectedHu?.puedeCrear;

  const fetchHuOptions = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) return;

    try {
      const res = await fetch(
        `${API_URL}/aprendiz/criterios-aceptacion/historias?cedula=${cedula}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      const normalized: HuOption[] = Array.isArray(json)
        ? json.map((h: any) => ({
            id: Number(h.id ?? 0),
            titulo: h.titulo ?? `HU ${h.id ?? ""}`,
            responsableCedula:
              h.responsableCedula !== undefined && h.responsableCedula !== null
                ? Number(h.responsableCedula)
                : null,
            puedeCrear: !!h.puedeCrear,
          }))
        : [];

      setHuOptions(normalized);
    } catch (e) {
      console.error("Error cargando HU para criterios:", e);
      setHuOptions([]);
    }
  };

  const fetchCriterios = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/aprendiz/criterios-aceptacion?cedula=${cedula}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      const normalized: CriterioRow[] = Array.isArray(json)
        ? json.map((r: any) => ({
            id: Number(r.id ?? 0),
            hisId: Number(r.hisId ?? 0),
            descripcion: r.descripcion ?? "",
            estado: r.estado ?? "-",
            estadoId: Number(r.estadoId ?? 1),
            tiempo: r.tiempo ?? "-",
            responsableCedula:
              r.responsableCedula !== undefined && r.responsableCedula !== null
                ? Number(r.responsableCedula)
                : null,
            responsableNombre: r.responsableNombre ?? null,
          }))
        : [];

      setRows(normalized);
      setPage(1);
    } catch (e) {
      console.error("Error criterios:", e);
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
    if (storedName?.trim()) setDisplayName(storedName);

    fetchHuOptions();
    fetchCriterios();
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
      const huIdText = String(row.hisId ?? "").toLowerCase();
      const huTituloText = getHuTitulo(row.hisId).toLowerCase();
      const descripcionText = (row.descripcion ?? "").toLowerCase();
      const estadoText = (row.estado ?? "").toLowerCase();
      const tiempoText = String(row.tiempo ?? "").toLowerCase();
      const responsableText = (row.responsableNombre ?? "").toLowerCase();

      return (
        idText.includes(term) ||
        huIdText.includes(term) ||
        huTituloText.includes(term) ||
        descripcionText.includes(term) ||
        estadoText.includes(term) ||
        tiempoText.includes(term) ||
        responsableText.includes(term)
      );
    });
  }, [rows, searchTerm, huOptions]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      const va = sortKey === "id" ? a.id : a.hisId;
      const vb = sortKey === "id" ? b.id : b.hisId;

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
    resetForm();
    setFormMode("create");
    setShowFormModal(true);
  };

  const openEditModal = async (row: CriterioRow) => {
    if (!canManage(row)) {
      setPermissionText("Solo el responsable puede editar este criterio.");
      setShowPermissionModal(true);
      return;
    }

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/criterios-aceptacion/${row.id}?cedula=${cedula}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const parsed = parseDescripcion(data.descripcion ?? row.descripcion ?? "");

      setHisId(String(data.hisId ?? row.hisId ?? ""));
      setContexto(parsed.contexto);
      setEstadoId(String(data.estadoId ?? "1"));
      setTiempo(String(data.tiempo ?? ""));
      setEditingId(row.id);
      setTouched({
        hisId: false,
        contexto: false,
        estadoId: false,
        tiempo: false,
      });
      setFormMode("edit");
      setShowFormModal(true);
    } catch (e) {
      console.error("Error cargando criterio:", e);
      setPermissionText("No se pudo cargar el criterio.");
      setShowPermissionModal(true);
    }
  };

  const askDelete = (row: CriterioRow) => {
    if (!canManage(row)) {
      setPermissionText("Solo el responsable puede eliminar este criterio.");
      setShowPermissionModal(true);
      return;
    }

    setDeleteId(row.id);
    setShowDeleteModal(true);
  };

  const isEmpty = (v: string) => !v || !v.trim();

  const validate = () => ({
    hisId: Number(hisId) > 0,
    contexto: !isEmpty(contexto),
    estadoId: ["1", "2", "3"].includes(estadoId),
    tiempo: !isEmpty(tiempo),
  });

  const onSave = async () => {
    const v = validate();
    setTouched({
      hisId: true,
      contexto: true,
      estadoId: true,
      tiempo: true,
    });

    if (!v.hisId || !v.contexto || !v.estadoId || !v.tiempo) return;

    const cedula = localStorage.getItem("userCedula");
    if (!cedula) {
      navigate("/");
      return;
    }

    if (formMode === "create" && !canCreateOnSelectedHu) {
      setPermissionText(
        "No puedes crear criterios de aceptación en esta historia de usuario porque no eres el responsable asignado."
      );
      setShowPermissionModal(true);
      return;
    }

    try {
      if (formMode === "create") {
        const res = await fetch(`${API_URL}/criterios-aceptacion?cedula=${cedula}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hisIdFk: Number(hisId),
            descripcion: buildDescripcion(contexto),
            estadoId: Number(estadoId),
            tiempo: tiempo.trim(),
          }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `HTTP ${res.status}`);
        }

        setShowFormModal(false);
        resetForm();
        await fetchHuOptions();
        await fetchCriterios();
        setSuccessText("Criterio creado correctamente.");
        setShowSuccessModal(true);
      } else {
        const res = await fetch(`${API_URL}/criterios-aceptacion/${editingId}?cedula=${cedula}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hisIdFk: Number(hisId),
            descripcion: buildDescripcion(contexto),
            estadoId: Number(estadoId),
            tiempo: tiempo.trim(),
          }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `HTTP ${res.status}`);
        }

        setShowFormModal(false);
        resetForm();
        await fetchHuOptions();
        await fetchCriterios();
        setSuccessText("Criterio editado correctamente.");
        setShowSuccessModal(true);
      }
    } catch (e) {
      console.error("Error guardando CA:", e);
      setPermissionText("No tienes permisos o no se pudo guardar el criterio.");
      setShowPermissionModal(true);
    }
  };

  const doDelete = async () => {
    const cedula = localStorage.getItem("userCedula");
    if (!cedula || !deleteId) return;

    try {
      const res = await fetch(`${API_URL}/criterios-aceptacion/${deleteId}?cedula=${cedula}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      setShowDeleteModal(false);
      setDeleteId(null);
      await fetchHuOptions();
      await fetchCriterios();
      setSuccessText("Criterio eliminado correctamente.");
      setShowSuccessModal(true);
    } catch (e) {
      console.error("Error eliminando criterio:", e);
      setPermissionText("No tienes permisos o no se pudo eliminar el criterio.");
      setShowPermissionModal(true);
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
            <h1>Criterios de aceptación</h1>
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
              Aquí podrás consultar tus criterios de aceptación del proyecto asignado.
            </p>

            <section className="box ca-modern-box">
              <div className="ca-table-header">
                <div>
                  <span className="ca-table-kicker">CALIDAD DEL PRODUCTO</span>
                  <h3 className="ca-table-title">Criterios de aceptación</h3>
                  <p className="ca-table-subtitle">
                    Gestiona condiciones, estados, responsables y tiempos asociados a cada historia de usuario.
                  </p>
                </div>

                <button className="ca-create-top-btn" onClick={openCreateModal}>
                  <Plus size={18} />
                  <span>Crear CA</span>
                </button>
              </div>

              <div className="hu-filter-bar-compact">
                <div className="hu-filter-input-compact">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por ID, historia, descripción, responsable, estado o tiempo"
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

              <div className="ca-modern-table-wrap">
                <table className="ca-modern-table">
                  <thead>
                    <tr>
                      <th className="th-sort col-id" onClick={() => toggleSort("id")}>
                        <span className="th-content">ID{sortArrow("id")}</span>
                      </th>

                      <th className="th-sort col-hu" onClick={() => toggleSort("hisId")}>
                        <span className="th-content">ID-HISTORIA{sortArrow("hisId")}</span>
                      </th>

                      <th className="col-desc">
                        <span className="th-content">DESCRIPCION</span>
                      </th>

                      <th className="col-responsable">
                        <span className="th-content">RESPONSABLE</span>
                      </th>

                      <th className="col-status">
                        <span className="th-content">ESTADO</span>
                      </th>

                      <th className="col-time">
                        <span className="th-content">TIEMPO</span>
                      </th>

                      <th className="col-actions">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="ca-empty-cell">
                          No hay criterios para mostrar.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((r) => {
                        const allowed = canManage(r);

                        return (
                          <tr key={r.id}>
                            <td className="col-id">
                              <div className="ca-id-badge">{r.id}</div>
                            </td>

                            <td className="ca-hu-cell">
                              <div className="ca-hu-block">
                                <span className="ca-hu-id">HU {r.hisId}</span>
                                <span className="ca-hu-mini">{getHuTitulo(r.hisId)}</span>
                              </div>
                            </td>

                            <td className="ca-desc-cell" title={r.descripcion || ""}>
                              <div className="ca-desc-tooltip-wrap">
                                <span className="ca-desc-text ca-desc-clamp">{r.descripcion}</span>
                              </div>
                            </td>

                            <td className="ca-responsable-cell">
                              <span className="ca-responsable-name">
                                {r.responsableNombre ?? "Sin asignar"}
                              </span>
                            </td>

                            <td className="ca-status-cell">
                              <span
                                className={`ca-status-badge ${
                                  r.estado.toLowerCase().includes("pend")
                                    ? "pending"
                                    : r.estado.toLowerCase().includes("proceso")
                                    ? "progress"
                                    : "done"
                                }`}
                              >
                                {r.estado}
                              </span>
                            </td>

                            <td className="ca-time-cell">
                              <span className="ca-time-badge">{r.tiempo}</span>
                            </td>

                            <td className="ca-actions-cell">
                              <div className="ca-actions-inline">
                                {allowed ? (
                                  <>
                                    <button
                                      className="ca-icon-btn ca-edit-btn"
                                      title="Editar criterio"
                                      onClick={() => openEditModal(r)}
                                    >
                                      <Pencil size={18} />
                                    </button>

                                    <button
                                      className="ca-icon-btn ca-delete-btn"
                                      title="Eliminar criterio"
                                      onClick={() => askDelete(r)}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                ) : (
                                  <div className="ca-no-access" title="Solo el responsable puede gestionar">
                                    <Lock size={16} />
                                    <span>Sin permiso</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ca-pagination ca-pagination-right">
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
          <div className="ca-modal-card">
            <div className="ca-modal-header">
              <div>
                <span className="ca-modal-kicker">
                  {formMode === "create" ? "NUEVO CRITERIO" : "EDITAR CRITERIO"}
                </span>
                <h2>
                  {formMode === "create"
                    ? "Crear criterio de aceptación"
                    : "Editar criterio de aceptación"}
                </h2>
              </div>

              <button
                className="ca-close-btn"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p className="ca-modal-subtitle">
              Define el contexto del criterio, su estado y el tiempo estimado.
            </p>

            <label className="ca-form-label">
              Historia de usuario<span className="ca-required">*</span>
            </label>
            <select
              className="ca-form-input"
              value={hisId}
              onChange={(e) => {
                const value = e.target.value;
                setHisId(value);

                const selected = huOptions.find((h) => String(h.id) === value);
                if (formMode === "create" && selected && !selected.puedeCrear) {
                  setPermissionText(
                    "No puedes crear criterios de aceptación en esta historia de usuario porque no eres el responsable asignado."
                  );
                  setShowPermissionModal(true);
                }
              }}
              onBlur={() => setTouched((t) => ({ ...t, hisId: true }))}
            >
              <option value="">Selecciona...</option>
              {huOptions.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} - {h.titulo}
                  {h.puedeCrear ? "" : " (sin permiso)"}
                </option>
              ))}
            </select>
            {touched.hisId && !v.hisId && <div className="ca-error">Selecciona una HU.</div>}

            {formMode === "create" && hisId && !canCreateOnSelectedHu && (
              <div className="ca-error">
                Solo el responsable de esa HU puede crear criterios de aceptación.
              </div>
            )}

            <label className="ca-form-label">
              Descripción<span className="ca-required">*</span>
            </label>
            <textarea
              className="ca-form-input ca-form-textarea"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, contexto: true }))}
            />
            {touched.contexto && !v.contexto && (
              <div className="ca-error">¡Por favor, llenar este campo!</div>
            )}

            <div className="ca-form-grid">
              <div>
                <label className="ca-form-label">
                  Estado<span className="ca-required">*</span>
                </label>
                <select
                  className="ca-form-input"
                  value={estadoId}
                  onChange={(e) => setEstadoId(e.target.value)}
                >
                  <option value="1">Pendiente</option>
                  <option value="2">En proceso</option>
                  <option value="3">Finalizado</option>
                </select>
              </div>

              <div>
                <label className="ca-form-label">
                  Tiempo<span className="ca-required">*</span>
                </label>
                <input
                  className="ca-form-input"
                  value={tiempo}
                  onChange={(e) => setTiempo(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, tiempo: true }))}
                  placeholder="Ej. 5 horas"
                />
                {touched.tiempo && !v.tiempo && <div className="ca-error">Ingresa el tiempo.</div>}
              </div>
            </div>

            <div className="ca-modal-actions">
              <button
                className="ca-btn-cancel"
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
              <button className="ca-btn-save" onClick={onSave}>
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
            <h2 className="modal-title">¿Eliminar criterio?</h2>
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

      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlertTriangle size={45} color="#E74C3C" style={{ marginBottom: "15px" }} />
            <h2 className="modal-title">Acceso no permitido</h2>
            <p style={{ marginBottom: 14, color: "#555", textAlign: "center" }}>
              {permissionText}
            </p>
            <div className="modal-buttons">
              <button className="btn-success-ok" onClick={() => setShowPermissionModal(false)}>
                Entendido
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

export default CriteriosAceptacion;
