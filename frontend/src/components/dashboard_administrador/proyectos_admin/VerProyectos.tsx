/**
 * Admin - Proyectos (navegacion jerarquica)
 *
 * Nivel 1: Programas
 * Nivel 2: Areas
 * Nivel 3: Fichas
 * Nivel 4: Proyectos por ficha
 * Nivel 5: Detalle del proyecto (incluye aprendices)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Filter, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../dashboard_instructor/Dashboard.css";
import "./VerProyectos.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../session/session";
import AdminTimedAlert from "../feedback/AdminTimedAlert";
import AdminSidebar from "../layout/AdminSidebar";
import AdminProfileMenu from "../layout/AdminProfileMenu";
import AdminLogoutModal from "../modals/AdminLogoutModal";
import { logoutAndRedirect, requireAdminAccess } from "../session/adminSession";
import { useClickOutside } from "../hooks/useClickOutside";

type ViewMode =
  | "programas"
  | "areas"
  | "fichas"
  | "proyectos"
  | "detalle"
  | "todas_fichas"
  | "todos_proyectos";

interface FichaItem {
  numero: string;
  nombre: string; // area
  programa: string;
  estado: string;
  fechaCreacion: string | null;
}

interface ProyectoApi {
  detParIdFk?: number;
  proId?: number;
  proCodigo?: string | null;
  proNombre?: string;
  proDescription?: string;
  proObjetivoGeneral?: string;
  proFechaInicio?: string;
  proFechaFin?: string;
  fichaNumero?: number | string | null;
}

interface ProyectoItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  status: string;
  fichaNumero: string | null;
  fichaPrograma: string;
  fichaArea: string;
}

interface ProyectoDetalleApi {
  proId?: number;
  proCodigo?: string | null;
  proNombre?: string | null;
  proDescription?: string | null;
  proObjetivoGeneral?: string | null;
  proObjetivosEspecificos?: string | null;
  proJustificacion?: string | null;
  detParIdFk?: number | null;
  estadoNombre?: string | null;
  fichaNumero?: number | string | null;
  fichaPrograma?: string | null;
  fichaArea?: string | null;
}

interface AprendizDetalleApi {
  cedula?: string | number | null;
  tipoDocumento?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
  telefono?: string | null;
  sexo?: string | null;
  estado?: string | null;
  fichaNumero?: string | number | null;
  fichaPrograma?: string | null;
  fichaArea?: string | null;
}

interface DetalleAdminResponse {
  proyecto: ProyectoDetalleApi;
  aprendices: AprendizDetalleApi[];
}

interface AreaRow {
  nombre: string;
  totalFichas: number;
}

type DeleteKind = "programa" | "area" | "ficha";

interface DeleteDialogState {
  kind: DeleteKind;
  label: string;
  programa?: string;
  fichaNumero?: string;
}

const normalizeText = (value: unknown) => String(value ?? "").trim();

const formatProjectCode = (code: string | null | undefined, id: number) => {
  const normalizedCode = String(code || "").trim();
  if (normalizedCode) return normalizedCode;
  return `PRO-${String(id).padStart(6, "0")}`;
};

const getEstadoTexto = (idEstado?: number | null) => {
  if (idEstado === 2) return "EN PROGRESO";
  if (idEstado === 3) return "HECHO";
  return "POR HACER";
};

const VerProyectosAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [view, setView] = useState<ViewMode>("programas");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [fichas, setFichas] = useState<FichaItem[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoItem[]>([]);

  const [selectedPrograma, setSelectedPrograma] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedFichaNumero, setSelectedFichaNumero] = useState<string | null>(
    null,
  );

  const [projectsReturnView, setProjectsReturnView] =
    useState<ViewMode>("fichas");
  const [detailReturnView, setDetailReturnView] =
    useState<ViewMode>("proyectos");

  const [detalle, setDetalle] = useState<DetalleAdminResponse | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const [editProgramaModal, setEditProgramaModal] = useState<{
    programaActual: string;
    programaNuevo: string;
  } | null>(null);
  const [editAreaModal, setEditAreaModal] = useState<{
    areaActual: string;
    areaNueva: string;
  } | null>(null);
  const [editFichaModal, setEditFichaModal] = useState<{
    numero: string;
    nombre: string;
    programa: string;
    estado: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  const [timedAlert, setTimedAlert] = useState<{
    id: number;
    title: string;
    description?: string;
  } | null>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const refreshData = () => setReloadKey((prev) => prev + 1);

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [fichasRes, proyectosRes, dashboardRes] = await Promise.all([
          fetch(`${API_URL}/fichas`),
          fetch(`${API_URL}/verpro`),
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
        ]);

        const fichasData = fichasRes.ok ? await fichasRes.json() : [];
        const proyectosData = proyectosRes.ok ? await proyectosRes.json() : [];
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;

        const validFichas = Array.isArray(fichasData) ? fichasData : [];
        const parsedFichas: FichaItem[] = validFichas.map((item) => ({
          numero: normalizeText(item?.numero),
          nombre: normalizeText(item?.nombre) || "Sin nombre",
          programa: normalizeText(item?.programa) || "Sin programa",
          estado: normalizeText(item?.estado) || "Sin estado",
          fechaCreacion: item?.fechaCreacion ?? null,
        }));

        const fichaByNumero = new Map(
          parsedFichas.map((item) => [item.numero, item]),
        );

        const validProyectos = Array.isArray(proyectosData) ? proyectosData : [];
        const parsedProyectos: ProyectoItem[] = validProyectos.map(
          (item: ProyectoApi) => {
            const id = Number(item.proId || 0);
            const rawFicha = item.fichaNumero ?? null;
            const fichaNumero =
              rawFicha === null || rawFicha === undefined
                ? null
                : normalizeText(rawFicha);
            const ficha = fichaNumero ? fichaByNumero.get(fichaNumero) : undefined;

            return {
              id,
              codigo: formatProjectCode(item.proCodigo, id),
              nombre: item.proNombre || "Sin nombre",
              descripcion:
                item.proDescription ||
                item.proObjetivoGeneral ||
                "Sin descripcion",
              fechaInicio: item.proFechaInicio
                ? new Date(item.proFechaInicio).toLocaleDateString("es-CO")
                : "--/--/--",
              fechaFin: item.proFechaFin
                ? new Date(item.proFechaFin).toLocaleDateString("es-CO")
                : "--/--/--",
              status: getEstadoTexto(item.detParIdFk),
              fichaNumero,
              fichaPrograma: ficha?.programa || "",
              fichaArea: ficha?.nombre || "",
            };
          },
        );

        setFichas(parsedFichas);
        setProyectos(parsedProyectos);
        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
      } catch (error) {
        console.error("Error cargando datos de admin proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [navigate, reloadKey]);

  const activeFichas = useMemo(
    () => fichas.filter((f) => f.estado.toLowerCase() === "activa"),
    [fichas],
  );

  const programas = useMemo(() => {
    const set = new Set<string>();
    activeFichas.forEach((ficha) => {
      if (!ficha.programa || ficha.programa === "Sin programa") return;
      set.add(ficha.programa);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [activeFichas]);

  const areasForPrograma = useMemo(() => {
    const byPrograma: Record<string, Map<string, number>> = {};

    activeFichas.forEach((ficha) => {
      const programa = ficha.programa;
      const area = ficha.nombre;

      if (!programa || programa === "Sin programa") return;
      if (!area || area === "Sin nombre") return;

      if (!byPrograma[programa]) {
        byPrograma[programa] = new Map();
      }

      byPrograma[programa].set(area, (byPrograma[programa].get(area) || 0) + 1);
    });

    return byPrograma;
  }, [activeFichas]);

  const term = searchTerm.toLowerCase().trim();

  const filteredProgramas = useMemo(() => {
    if (!term) return programas;

    return programas.filter((programa) => {
      const areas = Array.from(areasForPrograma[programa]?.keys() || []);
      const fichasNums = activeFichas
        .filter((f) => f.programa === programa)
        .map((f) => f.numero);

      const proyectosIds = proyectos
        .filter((p) => p.fichaPrograma === programa)
        .map((p) => String(p.id));

      const searchValue = [programa, ...areas, ...fichasNums, ...proyectosIds]
        .join(" ")
        .toLowerCase();

      return searchValue.includes(term);
    });
  }, [activeFichas, areasForPrograma, programas, proyectos, term]);

  const currentAreas = useMemo(() => {
    if (!selectedPrograma) return [];

    const areaMap = areasForPrograma[selectedPrograma] || new Map<string, number>();

    const rows: AreaRow[] = Array.from(areaMap.entries()).map(
      ([nombre, totalFichas]) => ({ nombre, totalFichas }),
    );

    rows.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    if (!term) return rows;

    return rows.filter((row) => {
      const fichasNums = activeFichas
        .filter((f) => f.programa === selectedPrograma && f.nombre === row.nombre)
        .map((f) => f.numero);

      const proyectosIds = proyectos
        .filter(
          (p) => p.fichaPrograma === selectedPrograma && p.fichaArea === row.nombre,
        )
        .map((p) => String(p.id));

      const searchValue = [row.nombre, ...fichasNums, ...proyectosIds]
        .join(" ")
        .toLowerCase();

      return searchValue.includes(term);
    });
  }, [activeFichas, areasForPrograma, proyectos, selectedPrograma, term]);

  const currentFichas = useMemo(() => {
    if (!selectedPrograma || !selectedArea) return [];

    const rows = activeFichas
      .filter((f) => f.programa === selectedPrograma && f.nombre === selectedArea)
      .sort((a, b) => Number(a.numero) - Number(b.numero));

    if (!term) return rows;

    return rows.filter((f) =>
      [f.numero, f.estado].join(" ").toLowerCase().includes(term),
    );
  }, [activeFichas, selectedArea, selectedPrograma, term]);

  const allFichasFiltered = useMemo(() => {
    const rows = [...fichas].sort((a, b) => Number(a.numero) - Number(b.numero));
    if (!term) return rows;

    return rows.filter((f) =>
      [f.numero, f.programa, f.nombre, f.estado].join(" ").toLowerCase().includes(term),
    );
  }, [fichas, term]);

  const allProyectosFiltered = useMemo(() => {
    const rows = [...proyectos].sort((a, b) => b.id - a.id);
    if (!term) return rows;

    return rows.filter((p) =>
      [
        p.id,
        p.codigo,
        p.nombre,
        p.status,
        p.fichaNumero || "",
        p.fichaPrograma,
        p.fichaArea,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [proyectos, term]);

  const proyectosByFicha = useMemo(() => {
    if (!selectedFichaNumero) return [];

    const rows = proyectos
      .filter((p) => p.fichaNumero === selectedFichaNumero)
      .sort((a, b) => b.id - a.id);

    if (!term) return rows;

    return rows.filter((p) =>
      [p.id, p.codigo, p.nombre, p.status].join(" ").toLowerCase().includes(term),
    );
  }, [proyectos, selectedFichaNumero, term]);

  const renderStatusBadge = (status: string) => {
    let className = "badge-por-hacer";
    if (status === "HECHO") className = "badge-hecho";
    else if (status === "EN PROGRESO") className = "badge-progreso";
    return <span className={`status-badge ${className}`}>{status}</span>;
  };

  const goBack = () => {
    setSearchTerm("");

    if (view === "areas") {
      setSelectedPrograma(null);
      setSelectedArea(null);
      setSelectedFichaNumero(null);
      setView("programas");
      return;
    }

    if (view === "fichas") {
      setSelectedArea(null);
      setSelectedFichaNumero(null);
      setView("areas");
      return;
    }

    if (view === "proyectos") {
      setSelectedFichaNumero(null);
      setView(projectsReturnView);
      return;
    }

    if (view === "detalle") {
      setDetalle(null);
      setView(detailReturnView);
      return;
    }

    if (view === "todas_fichas" || view === "todos_proyectos") {
      setView("programas");
    }
  };

  const openProyectoDetalle = async (id: number, returnView: ViewMode) => {
    setDetailReturnView(returnView);
    setDetalle(null);
    setDetalleLoading(true);
    setView("detalle");

    try {
      const response = await fetch(`${API_URL}/verpro/${id}/detalle-admin`);
      const payload = (await response.json().catch(() => null)) as
        | DetalleAdminResponse
        | null;

      if (!response.ok || !payload?.proyecto) {
        throw new Error("No fue posible cargar el detalle del proyecto.");
      }

      setDetalle(payload);
    } catch (error) {
      console.error("Error cargando detalle admin:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo cargar el detalle",
        description: "Intenta nuevamente en unos segundos.",
      });
      setView(returnView);
    } finally {
      setDetalleLoading(false);
    }
  };

  const tableTitle = (() => {
    if (view === "programas") return "Programas";
    if (view === "areas") return `Areas de ${selectedPrograma || ""}`.trim();
    if (view === "fichas") {
      return `Fichas de ${selectedPrograma || ""} / ${selectedArea || ""}`.trim();
    }
    if (view === "proyectos") {
      return `Proyectos de la ficha ${selectedFichaNumero || ""}`.trim();
    }
    if (view === "detalle") return "Detalle del proyecto";
    if (view === "todas_fichas") return "Todas las fichas";
    if (view === "todos_proyectos") return "Todos los proyectos";
    return "Proyectos";
  })();

  const searchPlaceholder = "Buscar por programa, area, ficha o ID del proyecto...";
  const actorCedula = normalizeText(localStorage.getItem("userCedula"));

  const renamePrograma = async () => {
    if (!editProgramaModal) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/catalogos/programas?actorCedula=${encodeURIComponent(actorCedula)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programaActual: editProgramaModal.programaActual,
            programaNuevo: editProgramaModal.programaNuevo,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          normalizeText(payload?.message) || "No fue posible actualizar el programa.";
        throw new Error(message);
      }

      if (selectedPrograma === editProgramaModal.programaActual) {
        setSelectedPrograma(editProgramaModal.programaNuevo);
      }

      setTimedAlert({
        id: Date.now(),
        title: "Programa actualizado",
        description: "Los cambios se guardaron correctamente.",
      });

      setEditProgramaModal(null);
      refreshData();
    } catch (error) {
      console.error("Error renombrando programa:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renameArea = async () => {
    if (!editAreaModal || !selectedPrograma) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/catalogos/areas?actorCedula=${encodeURIComponent(actorCedula)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programa: selectedPrograma,
            areaActual: editAreaModal.areaActual,
            areaNueva: editAreaModal.areaNueva,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          normalizeText(payload?.message) || "No fue posible actualizar el area.";
        throw new Error(message);
      }

      if (selectedArea === editAreaModal.areaActual) {
        setSelectedArea(editAreaModal.areaNueva);
      }

      setTimedAlert({
        id: Date.now(),
        title: "Area actualizada",
        description: "Los cambios se guardaron correctamente.",
      });

      setEditAreaModal(null);
      refreshData();
    } catch (error) {
      console.error("Error renombrando area:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFicha = async () => {
    if (!editFichaModal) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/fichas/${encodeURIComponent(editFichaModal.numero)}?actorCedula=${encodeURIComponent(actorCedula)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: editFichaModal.nombre,
            programa: editFichaModal.programa,
            estado: editFichaModal.estado,
          }),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          normalizeText(payload?.message) || "No fue posible actualizar la ficha.";
        throw new Error(message);
      }

      setTimedAlert({
        id: Date.now(),
        title: "Ficha actualizada",
        description: "Los cambios se guardaron correctamente.",
      });

      setEditFichaModal(null);
      refreshData();
    } catch (error) {
      console.error("Error actualizando ficha:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog || deleting) return;

    setDeleting(true);

    try {
      let response: Response;

      if (deleteDialog.kind === "programa") {
        response = await fetch(
          `${API_URL}/catalogos/programas/eliminar?actorCedula=${encodeURIComponent(actorCedula)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ programa: deleteDialog.label }),
          },
        );
      } else if (deleteDialog.kind === "area") {
        response = await fetch(
          `${API_URL}/catalogos/areas/eliminar?actorCedula=${encodeURIComponent(actorCedula)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              programa: deleteDialog.programa || null,
              area: deleteDialog.label,
            }),
          },
        );
      } else {
        response = await fetch(
          `${API_URL}/fichas/${encodeURIComponent(deleteDialog.fichaNumero || "")}?actorCedula=${encodeURIComponent(actorCedula)}`,
          { method: "DELETE" },
        );
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          normalizeText(payload?.message) || "No fue posible completar la accion.";
        throw new Error(message);
      }

      setTimedAlert({
        id: Date.now(),
        title: "Accion completada",
        description: "Se guardaron los cambios correctamente.",
      });

      if (deleteDialog.kind === "programa" && selectedPrograma === deleteDialog.label) {
        setSelectedPrograma(null);
        setSelectedArea(null);
        setSelectedFichaNumero(null);
        setView("programas");
      }

      if (deleteDialog.kind === "area" && selectedArea === deleteDialog.label) {
        setSelectedArea(null);
        setSelectedFichaNumero(null);
        setView("areas");
      }

      if (
        deleteDialog.kind === "ficha" &&
        selectedFichaNumero === deleteDialog.fichaNumero
      ) {
        setSelectedFichaNumero(null);
        setView(projectsReturnView);
      }

      setDeleteDialog(null);
      refreshData();
    } catch (error) {
      console.error("Error eliminando:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo eliminar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Cargando proyectos...</div>;
  }

  return (
    <div className="dashboard-page">
      <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Proyectos</h1>
          </div>
          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => setShowLogoutModal(true)}
            showProfileItem
          />
        </nav>

        <div className="vp-container">
          <div className="vp-header-row">
            <div className="vp-title-wrap">
              {view !== "programas" ? (
                <button type="button" className="vp-btn-back" onClick={goBack}>
                  <ArrowLeft size={16} />
                  Volver
                </button>
              ) : null}
              <h2 className="vp-table-title">{tableTitle}</h2>
            </div>

            <div className="vp-header-actions">
              {view === "programas" ? (
                <>
                  <button
                    type="button"
                    className="vp-btn-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedPrograma(null);
                      setSelectedArea(null);
                      setSelectedFichaNumero(null);
                      setView("todas_fichas");
                    }}
                  >
                    Ver todas las fichas
                  </button>
                  <button
                    type="button"
                    className="vp-btn-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedPrograma(null);
                      setSelectedArea(null);
                      setSelectedFichaNumero(null);
                      setView("todos_proyectos");
                    }}
                  >
                    Ver todos los proyectos
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className="vp-btn-secondary"
                onClick={refreshData}
                title="Actualizar"
              >
                <RefreshCcw size={16} />
                Actualizar
              </button>

              <button
                type="button"
                className="vp-btn-crear"
                onClick={() => navigate("/crear-proyecto")}
              >
                <Plus size={16} />
                Crear proyecto
              </button>

              <div className="vp-search-box">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Filter size={16} color="#555" />
              </div>
            </div>
          </div>

          {view === "programas" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>Programa</th>
                    <th>Areas</th>
                    <th>Fichas</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProgramas.length > 0 ? (
                    filteredProgramas.map((programa) => {
                      const totalAreas = areasForPrograma[programa]
                        ? areasForPrograma[programa].size
                        : 0;
                      const totalFichas = activeFichas.filter(
                        (f) => f.programa === programa,
                      ).length;

                      return (
                        <tr key={programa}>
                          <td className="vp-name-cell">{programa}</td>
                          <td>{totalAreas}</td>
                          <td>{totalFichas}</td>
                          <td className="vp-actions-cell">
                            <button
                              type="button"
                              className="vp-btn-ver-mas"
                              onClick={() => {
                                setSelectedPrograma(programa);
                                setSelectedArea(null);
                                setSelectedFichaNumero(null);
                                setView("areas");
                              }}
                            >
                              Ver mas
                            </button>
                            <button
                              type="button"
                              className="vp-btn-edit"
                              onClick={() =>
                                setEditProgramaModal({
                                  programaActual: programa,
                                  programaNuevo: programa,
                                })
                              }
                              title="Editar programa"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                            <button
                              type="button"
                              className="vp-btn-delete"
                              onClick={() =>
                                setDeleteDialog({
                                  kind: "programa",
                                  label: programa,
                                })
                              }
                              title="Eliminar programa"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="vp-empty-row">
                        No se encontraron programas con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "areas" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Fichas asociadas</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAreas.length > 0 ? (
                    currentAreas.map((area) => (
                      <tr key={area.nombre}>
                        <td className="vp-name-cell">{area.nombre}</td>
                        <td>{area.totalFichas}</td>
                        <td className="vp-actions-cell">
                          <button
                            type="button"
                            className="vp-btn-ver-mas"
                            onClick={() => {
                              setSelectedArea(area.nombre);
                              setSelectedFichaNumero(null);
                              setView("fichas");
                            }}
                          >
                            Ver mas
                          </button>
                          <button
                            type="button"
                            className="vp-btn-edit"
                            onClick={() =>
                              setEditAreaModal({
                                areaActual: area.nombre,
                                areaNueva: area.nombre,
                              })
                            }
                            title="Editar area"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="vp-btn-delete"
                            onClick={() =>
                              setDeleteDialog({
                                kind: "area",
                                label: area.nombre,
                                programa: selectedPrograma || undefined,
                              })
                            }
                            title="Eliminar area"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="vp-empty-row">
                        No se encontraron areas con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "fichas" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>Ficha</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFichas.length > 0 ? (
                    currentFichas.map((ficha) => (
                      <tr key={ficha.numero}>
                        <td className="vp-name-cell">{ficha.numero}</td>
                        <td>{ficha.estado}</td>
                        <td className="vp-actions-cell">
                          <button
                            type="button"
                            className="vp-btn-ver-mas"
                            onClick={() => {
                              setSelectedFichaNumero(ficha.numero);
                              setProjectsReturnView("fichas");
                              setView("proyectos");
                            }}
                          >
                            Ver mas
                          </button>
                          <button
                            type="button"
                            className="vp-btn-edit"
                            onClick={() =>
                              setEditFichaModal({
                                numero: ficha.numero,
                                nombre: ficha.nombre,
                                programa: ficha.programa,
                                estado: ficha.estado,
                              })
                            }
                            title="Editar ficha"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="vp-btn-delete"
                            onClick={() =>
                              setDeleteDialog({
                                kind: "ficha",
                                label: `Ficha ${ficha.numero}`,
                                fichaNumero: ficha.numero,
                              })
                            }
                            title="Eliminar ficha"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="vp-empty-row">
                        No se encontraron fichas con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "todas_fichas" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>Programa</th>
                    <th>Area</th>
                    <th>Ficha</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {allFichasFiltered.length > 0 ? (
                    allFichasFiltered.map((ficha) => (
                      <tr key={ficha.numero}>
                        <td>{ficha.programa}</td>
                        <td>{ficha.nombre}</td>
                        <td className="vp-name-cell">{ficha.numero}</td>
                        <td>{ficha.estado}</td>
                        <td className="vp-actions-cell">
                          <button
                            type="button"
                            className="vp-btn-ver-mas"
                            onClick={() => {
                              setSelectedFichaNumero(ficha.numero);
                              setProjectsReturnView("todas_fichas");
                              setView("proyectos");
                            }}
                            disabled={ficha.estado.toLowerCase() !== "activa"}
                            title={
                              ficha.estado.toLowerCase() === "activa"
                                ? "Ver proyectos"
                                : "La ficha esta inactiva"
                            }
                          >
                            Ver mas
                          </button>
                          <button
                            type="button"
                            className="vp-btn-edit"
                            onClick={() =>
                              setEditFichaModal({
                                numero: ficha.numero,
                                nombre: ficha.nombre,
                                programa: ficha.programa,
                                estado: ficha.estado,
                              })
                            }
                            title="Editar ficha"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className="vp-btn-delete"
                            onClick={() =>
                              setDeleteDialog({
                                kind: "ficha",
                                label: `Ficha ${ficha.numero}`,
                                fichaNumero: ficha.numero,
                              })
                            }
                            title="Eliminar ficha"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="vp-empty-row">
                        No se encontraron fichas con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "proyectos" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectosByFicha.length > 0 ? (
                    proyectosByFicha.map((proyecto) => (
                      <tr key={proyecto.id}>
                        <td>
                          <strong>{proyecto.codigo}</strong>
                        </td>
                        <td className="vp-name-cell">{proyecto.nombre}</td>
                        <td className="vp-desc-cell">{proyecto.descripcion}</td>
                        <td>{proyecto.fechaInicio}</td>
                        <td>{proyecto.fechaFin}</td>
                        <td>{renderStatusBadge(proyecto.status)}</td>
                        <td className="vp-actions-cell">
                          <button
                            type="button"
                            className="vp-btn-ver-mas"
                            onClick={() => void openProyectoDetalle(proyecto.id, "proyectos")}
                          >
                            Ver mas
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="vp-empty-row">
                        Esta ficha no tiene proyectos asignados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "todos_proyectos" ? (
            <div className="vp-table-card">
              <table className="vp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Ficha</th>
                    <th>Programa</th>
                    <th>Area</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {allProyectosFiltered.length > 0 ? (
                    allProyectosFiltered.map((proyecto) => (
                      <tr key={proyecto.id}>
                        <td className="vp-cell-muted">{proyecto.id}</td>
                        <td>
                          <strong>{proyecto.codigo}</strong>
                        </td>
                        <td className="vp-name-cell">{proyecto.nombre}</td>
                        <td>{proyecto.fichaNumero || "--"}</td>
                        <td>{proyecto.fichaPrograma || "--"}</td>
                        <td>{proyecto.fichaArea || "--"}</td>
                        <td>{renderStatusBadge(proyecto.status)}</td>
                        <td className="vp-actions-cell">
                          <button
                            type="button"
                            className="vp-btn-ver-mas"
                            onClick={() => void openProyectoDetalle(proyecto.id, "todos_proyectos")}
                          >
                            Ver mas
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="vp-empty-row">
                        No se encontraron proyectos con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "detalle" ? (
            <section className="vp-detail">
              {detalleLoading ? (
                <div className="vp-empty-row">Cargando detalle del proyecto...</div>
              ) : detalle ? (
                <>
                  <div className="vp-detail-grid">
                    <div className="vp-detail-card">
                      <h3>Datos del proyecto</h3>
                      <div className="vp-detail-meta">
                        <div>
                          <span className="vp-detail-label">Codigo</span>
                          <span className="vp-detail-value">
                            {formatProjectCode(
                              detalle.proyecto.proCodigo,
                              Number(detalle.proyecto.proId || 0),
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="vp-detail-label">Nombre</span>
                          <span className="vp-detail-value">
                            {normalizeText(detalle.proyecto.proNombre) || "Sin nombre"}
                          </span>
                        </div>
                        <div>
                          <span className="vp-detail-label">Estado</span>
                          <span className="vp-detail-value">
                            {normalizeText(detalle.proyecto.estadoNombre) ||
                              getEstadoTexto(detalle.proyecto.detParIdFk)}
                          </span>
                        </div>
                        <div>
                          <span className="vp-detail-label">Ficha</span>
                          <span className="vp-detail-value">
                            {detalle.proyecto.fichaNumero
                              ? normalizeText(detalle.proyecto.fichaNumero)
                              : "--"}
                          </span>
                        </div>
                        <div>
                          <span className="vp-detail-label">Programa</span>
                          <span className="vp-detail-value">
                            {normalizeText(detalle.proyecto.fichaPrograma) || "--"}
                          </span>
                        </div>
                        <div>
                          <span className="vp-detail-label">Area</span>
                          <span className="vp-detail-value">
                            {normalizeText(detalle.proyecto.fichaArea) || "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="vp-detail-card">
                      <h3>Descripcion y objetivos</h3>
                      <p className="vp-detail-paragraph">
                        <b>Descripcion:</b>{" "}
                        {normalizeText(detalle.proyecto.proDescription) || "Sin descripcion"}
                      </p>
                      <p className="vp-detail-paragraph">
                        <b>Objetivo general:</b>{" "}
                        {normalizeText(detalle.proyecto.proObjetivoGeneral) || "Sin objetivo"}
                      </p>
                      {normalizeText(detalle.proyecto.proObjetivosEspecificos) ? (
                        <p className="vp-detail-paragraph">
                          <b>Objetivos especificos:</b>{" "}
                          {normalizeText(detalle.proyecto.proObjetivosEspecificos)}
                        </p>
                      ) : null}
                      {normalizeText(detalle.proyecto.proJustificacion) ? (
                        <p className="vp-detail-paragraph">
                          <b>Justificacion:</b>{" "}
                          {normalizeText(detalle.proyecto.proJustificacion)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="vp-table-card" style={{ marginTop: 18 }}>
                    <table className="vp-table">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Tipo</th>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>Correo</th>
                          <th>Telefono</th>
                          <th>Sexo</th>
                          <th>Ficha</th>
                          <th>Programa</th>
                          <th>Area</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(detalle.aprendices) &&
                        detalle.aprendices.length > 0 ? (
                          detalle.aprendices.map((aprendiz, index) => (
                            <tr
                              key={`${normalizeText(aprendiz.cedula) || "apr"}-${index}`}
                            >
                              <td>{normalizeText(aprendiz.cedula) || "--"}</td>
                              <td>{normalizeText(aprendiz.tipoDocumento) || "--"}</td>
                              <td className="vp-name-cell">
                                {normalizeText(aprendiz.nombres) || "--"}
                              </td>
                              <td className="vp-name-cell">
                                {normalizeText(aprendiz.apellidos) || "--"}
                              </td>
                              <td>{normalizeText(aprendiz.correo) || "--"}</td>
                              <td>{normalizeText(aprendiz.telefono) || "--"}</td>
                              <td>{normalizeText(aprendiz.sexo) || "--"}</td>
                              <td>
                                {aprendiz.fichaNumero
                                  ? normalizeText(aprendiz.fichaNumero)
                                  : "--"}
                              </td>
                              <td>{normalizeText(aprendiz.fichaPrograma) || "--"}</td>
                              <td>{normalizeText(aprendiz.fichaArea) || "--"}</td>
                              <td>{normalizeText(aprendiz.estado) || "--"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={11} className="vp-empty-row">
                              Este proyecto no tiene aprendices asignados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="vp-empty-row">No se encontro informacion del proyecto.</div>
              )}
            </section>
          ) : null}
        </div>
      </main>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        title="Cerrar sesion"
        confirmLabel="Si, salir"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />

      <AdminLogoutModal
        isOpen={Boolean(deleteDialog)}
        title={
          deleteDialog?.kind === "programa"
            ? `Eliminar programa "${deleteDialog.label}"`
            : deleteDialog?.kind === "area"
              ? `Eliminar area "${deleteDialog.label}"`
              : deleteDialog?.label || "Eliminar"
        }
        description="Esta accion no se puede deshacer."
        confirmLabel={deleting ? "Eliminando..." : "Si, eliminar"}
        onCancel={() => {
          if (deleting) return;
          setDeleteDialog(null);
        }}
        onConfirm={() => void confirmDelete()}
      />

      {editProgramaModal ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal">
            <h2 className="modal-title">Editar programa</h2>
            <div className="vp-edit-field">
              <label>Programa</label>
              <input
                type="text"
                value={editProgramaModal.programaNuevo}
                onChange={(e) =>
                  setEditProgramaModal((prev) =>
                    prev ? { ...prev, programaNuevo: e.target.value } : prev,
                  )
                }
                disabled={saving}
              />
            </div>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => void renamePrograma()}
                disabled={saving || !editProgramaModal.programaNuevo.trim()}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => {
                  if (saving) return;
                  setEditProgramaModal(null);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editAreaModal ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal">
            <h2 className="modal-title">Editar area</h2>
            <div className="vp-edit-field">
              <label>Area</label>
              <input
                type="text"
                value={editAreaModal.areaNueva}
                onChange={(e) =>
                  setEditAreaModal((prev) =>
                    prev ? { ...prev, areaNueva: e.target.value } : prev,
                  )
                }
                disabled={saving}
              />
            </div>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => void renameArea()}
                disabled={saving || !editAreaModal.areaNueva.trim()}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => {
                  if (saving) return;
                  setEditAreaModal(null);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editFichaModal ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal">
            <h2 className="modal-title">Editar ficha {editFichaModal.numero}</h2>
            <div className="vp-edit-grid">
              <div className="vp-edit-field">
                <label>Programa</label>
                <input
                  type="text"
                  value={editFichaModal.programa}
                  list="vp-programas-list"
                  onChange={(e) =>
                    setEditFichaModal((prev) =>
                      prev ? { ...prev, programa: e.target.value } : prev,
                    )
                  }
                  disabled={saving}
                />
                <datalist id="vp-programas-list">
                  {Array.from(new Set(fichas.map((f) => f.programa)))
                    .filter((value) => value && value !== "Sin programa")
                    .sort((a, b) => a.localeCompare(b, "es"))
                    .map((value) => (
                      <option key={value} value={value} />
                    ))}
                </datalist>
              </div>

              <div className="vp-edit-field">
                <label>Area</label>
                <input
                  type="text"
                  value={editFichaModal.nombre}
                  list="vp-areas-list"
                  onChange={(e) =>
                    setEditFichaModal((prev) =>
                      prev ? { ...prev, nombre: e.target.value } : prev,
                    )
                  }
                  disabled={saving}
                />
                <datalist id="vp-areas-list">
                  {Array.from(new Set(fichas.map((f) => f.nombre)))
                    .filter((value) => value && value !== "Sin nombre")
                    .sort((a, b) => a.localeCompare(b, "es"))
                    .map((value) => (
                      <option key={value} value={value} />
                    ))}
                </datalist>
              </div>

              <div className="vp-edit-field">
                <label>Estado</label>
                <select
                  value={editFichaModal.estado}
                  onChange={(e) =>
                    setEditFichaModal((prev) =>
                      prev ? { ...prev, estado: e.target.value } : prev,
                    )
                  }
                  disabled={saving}
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>

              <div className="vp-edit-field">
                <label>Ficha</label>
                <input type="text" value={editFichaModal.numero} disabled readOnly />
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => void updateFicha()}
                disabled={
                  saving ||
                  !editFichaModal.programa.trim() ||
                  !editFichaModal.nombre.trim()
                }
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => {
                  if (saving) return;
                  setEditFichaModal(null);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {timedAlert ? (
        <AdminTimedAlert
          key={timedAlert.id}
          title={timedAlert.title}
          description={timedAlert.description}
          durationMs={5000}
          zIndex={2800}
          onClose={() => setTimedAlert(null)}
        />
      ) : null}
    </div>
  );
};

export default VerProyectosAdmin;
