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
import {
  ArrowLeft,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../dashboard_instructor/Dashboard.css";
import "./VerProyectos.css";
import DetalleCriteriosView from "./detail_views/DetalleCriteriosView";
import DetalleHistoriasView from "./detail_views/DetalleHistoriasView";
import DetalleSugerenciasView from "./detail_views/DetalleSugerenciasView";
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

type DetailSubview = "historias" | "criterios" | "sugerencias";

type EditableProjectFieldKey =
  | "proDescription"
  | "proObjetivoGeneral"
  | "proObjetivosEspecificos"
  | "proJustificacion";

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

interface HistoriaUsuarioDetalleItem {
  hisId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  puntaje?: number | null;
  numeroSprint?: number | null;
  responsable?: string | null;
}

interface CriterioAceptacionDetalleItem {
  criId?: number | null;
  tiempo?: string | null;
  descripcion?: string | null;
  responsable?: string | null;
}

interface SugerenciaDetalleItem {
  obsId?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
}

interface DetalleAdminResponse {
  proyecto: ProyectoDetalleApi;
  aprendices: AprendizDetalleApi[];
  historiasUsuario: HistoriaUsuarioDetalleItem[];
  criteriosAceptacion: CriterioAceptacionDetalleItem[];
  sugerencias: SugerenciaDetalleItem[];
}

interface RolScrumOption {
  detParId: number;
  descripcion: string;
}

interface AprendizProyectoEditorItem extends AprendizDetalleApi {
  detParId?: number | null;
  rolScrum?: string | null;
  proId?: number | null;
}

interface AprendizFichaEditorItem extends AprendizProyectoEditorItem {
  asignadoProyectoActual?: boolean | number | null;
  detParIdActual?: number | null;
  rolScrumActual?: string | null;
  otroProyectoId?: number | null;
  otroProyectoNombre?: string | null;
  otroRolScrum?: string | null;
}

interface ProyectoAprendicesEditorResponse {
  proyecto: {
    proId: number;
    proNombre?: string | null;
    fichaNumero?: string | number | null;
  };
  aprendicesProyecto: AprendizProyectoEditorItem[];
  aprendicesFicha: AprendizFichaEditorItem[];
  rolesScrum: RolScrumOption[];
}

type MembershipChange = "none" | "add" | "remove";

interface ProyectoAprendizDisplayItem extends AprendizProyectoEditorItem {
  membershipChange: MembershipChange;
  isPendingNew?: boolean;
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

const getAprendizNombreCompleto = (
  aprendiz?: Partial<AprendizDetalleApi> | null,
) => {
  const fullName = `${normalizeText(aprendiz?.nombres)} ${normalizeText(aprendiz?.apellidos)}`
    .replace(/\s+/g, " ")
    .trim();

  if (fullName) return fullName;
  return normalizeText(aprendiz?.cedula) || "Aprendiz";
};

const buildMembershipPreviewText = (added: string[], removed: string[]) => {
  const parts: string[] = [];

  if (added.length) {
    parts.push(
      `${added.length === 1 ? "Se agregara" : "Se agregaran"} ${added.join(", ")}.`,
    );
  }

  if (removed.length) {
    parts.push(
      `${removed.length === 1 ? "Se eliminara" : "Se eliminaran"} ${removed.join(", ")}.`,
    );
  }

  return parts.join(" ");
};

const buildMembershipAppliedText = (added: string[], removed: string[]) => {
  const parts: string[] = [];

  if (added.length) {
    parts.push(
      `${added.length === 1 ? "Se agrego" : "Se agregaron"} ${added.join(", ")}.`,
    );
  }

  if (removed.length) {
    parts.push(
      `${removed.length === 1 ? "Se retiro" : "Se retiraron"} ${removed.join(", ")}.`,
    );
  }

  return parts.join(" ");
};

const formatProjectCode = (code: string | null | undefined, id: number) => {
  const normalizedCode = String(code || "").trim();
  if (normalizedCode) return normalizedCode;
  return `PRO-${String(id).padStart(6, "0")}`;
};

const PROJECT_FIELD_CONFIG: Record<
  EditableProjectFieldKey,
  { label: string; maxLength: number; rows: number }
> = {
  proDescription: {
    label: "Descripcion",
    maxLength: 200,
    rows: 5,
  },
  proObjetivoGeneral: {
    label: "Objetivo general",
    maxLength: 500,
    rows: 6,
  },
  proObjetivosEspecificos: {
    label: "Objetivos especificos",
    maxLength: 500,
    rows: 6,
  },
  proJustificacion: {
    label: "Justificacion",
    maxLength: 500,
    rows: 6,
  },
};

const PROJECT_TEXT_FIELDS = Object.keys(
  PROJECT_FIELD_CONFIG,
) as EditableProjectFieldKey[];

const createProjectTextDraft = (
  proyecto?: ProyectoDetalleApi | null,
): Record<EditableProjectFieldKey, string> => ({
  proDescription: normalizeText(proyecto?.proDescription),
  proObjetivoGeneral: normalizeText(proyecto?.proObjetivoGeneral),
  proObjetivosEspecificos: normalizeText(proyecto?.proObjetivosEspecificos),
  proJustificacion: normalizeText(proyecto?.proJustificacion),
});

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
  const [detailSubview, setDetailSubview] = useState<DetailSubview | null>(null);
  const [editProjectContentModal, setEditProjectContentModal] = useState<
    Record<EditableProjectFieldKey, string> | null
  >(null);
  const [savingProjectField, setSavingProjectField] = useState(false);

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
  const [isAprendicesEditorOpen, setIsAprendicesEditorOpen] = useState(false);
  const [aprendicesEditorLoading, setAprendicesEditorLoading] = useState(false);
  const [aprendicesEditorData, setAprendicesEditorData] =
    useState<ProyectoAprendicesEditorResponse | null>(null);
  const [showAgregarAprendizPanel, setShowAgregarAprendizPanel] =
    useState(false);
  const [aprendicesFichaSearchTerm, setAprendicesFichaSearchTerm] =
    useState("");
  const [viewingProjectAprendiz, setViewingProjectAprendiz] =
    useState<AprendizProyectoEditorItem | null>(null);
  const [editingProjectAprendizRole, setEditingProjectAprendizRole] = useState<{
    cedula: string;
    nombre: string;
    detParId: number | null;
  } | null>(null);
  const [pendingAprendizAdds, setPendingAprendizAdds] = useState<string[]>([]);
  const [pendingAprendizRemovals, setPendingAprendizRemovals] = useState<
    string[]
  >([]);
  const [isConfirmingAprendizChanges, setIsConfirmingAprendizChanges] =
    useState(false);
  const [isSavingProjectAprendiz, setIsSavingProjectAprendiz] = useState(false);

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

  const proyectosSinFichaCount = useMemo(
    () => proyectos.filter((item) => !normalizeText(item.fichaNumero)).length,
    [proyectos],
  );

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
      if (detailSubview) {
        setDetailSubview(null);
        return;
      }

      setDetalle(null);
      setEditProjectContentModal(null);
      setView(detailReturnView);
      return;
    }

    if (view === "todas_fichas" || view === "todos_proyectos") {
      setView("programas");
    }
  };

  const loadProyectoDetalle = async (id: number) => {
    const response = await fetch(`${API_URL}/verpro/${id}/detalle-admin`);
    const payload = (await response.json().catch(() => null)) as
      | DetalleAdminResponse
      | null;

    if (!response.ok || !payload?.proyecto) {
      throw new Error("No fue posible cargar el detalle del proyecto.");
    }

    setDetalle(payload);
    return payload;
  };

  const loadAprendicesEditor = async (id: number) => {
    setAprendicesEditorLoading(true);

    try {
      const response = await fetch(`${API_URL}/verpro/${id}/aprendices-edicion`);
      const payload = (await response.json().catch(() => null)) as
        | ProyectoAprendicesEditorResponse
        | null;

      if (!response.ok || !payload?.proyecto) {
        throw new Error("No fue posible cargar la edicion de aprendices.");
      }

      setAprendicesEditorData(payload);
      return payload;
    } finally {
      setAprendicesEditorLoading(false);
    }
  };

  const openProyectoDetalle = async (id: number, returnView: ViewMode) => {
    setDetailReturnView(returnView);
    setDetalle(null);
    setDetailSubview(null);
    setEditProjectContentModal(null);
    setDetalleLoading(true);
    setView("detalle");

    try {
      await loadProyectoDetalle(id);
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

  const openProjectContentEditor = () => {
    if (!detalle) return;

    setEditProjectContentModal(createProjectTextDraft(detalle.proyecto));
  };

  const goToProgramas = () => {
    setSearchTerm("");
    setSelectedPrograma(null);
    setSelectedArea(null);
    setSelectedFichaNumero(null);
    setDetalle(null);
    setView("programas");
  };

  const goToAreas = () => {
    if (!selectedPrograma) {
      goToProgramas();
      return;
    }

    setSearchTerm("");
    setSelectedArea(null);
    setSelectedFichaNumero(null);
    setDetalle(null);
    setView("areas");
  };

  const goToFichas = () => {
    if (!selectedPrograma) {
      goToProgramas();
      return;
    }

    if (!selectedArea) {
      goToAreas();
      return;
    }

    setSearchTerm("");
    setSelectedFichaNumero(null);
    setDetalle(null);
    setView("fichas");
  };

  const goToTodasFichas = () => {
    setSearchTerm("");
    setSelectedPrograma(null);
    setSelectedArea(null);
    setSelectedFichaNumero(null);
    setDetalle(null);
    setView("todas_fichas");
  };

  const goToTodosProyectos = () => {
    setSearchTerm("");
    setSelectedPrograma(null);
    setSelectedArea(null);
    setSelectedFichaNumero(null);
    setDetalle(null);
    setView("todos_proyectos");
  };

  const goToProyectos = () => {
    setSearchTerm("");
    setDetalle(null);
    setView("proyectos");
  };

  const breadcrumbItems: { label: string; onClick?: () => void }[] = (() => {
    const items: { label: string; onClick?: () => void }[] = [
      { label: "Proyectos", onClick: view !== "programas" ? goToProgramas : undefined },
    ];

    switch (view) {
      case "programas":
        items.push({ label: "Programas" });
        return items;

      case "todas_fichas":
        items.push({ label: "Fichas" });
        return items;

      case "todos_proyectos":
        items.push({ label: "Todos los proyectos" });
        return items;

      case "areas":
        items.push({ label: "Programas", onClick: goToProgramas });
        items.push({ label: "Areas" });
        return items;

      case "fichas":
        items.push({ label: "Programas", onClick: goToProgramas });
        items.push({ label: "Areas", onClick: goToAreas });
        items.push({ label: "Fichas" });
        return items;

      case "proyectos": {
        if (projectsReturnView === "todas_fichas") {
          items.push({ label: "Fichas", onClick: goToTodasFichas });
          items.push({ label: "Proyectos" });
          return items;
        }

        items.push({ label: "Programas", onClick: goToProgramas });
        items.push({ label: "Areas", onClick: goToAreas });
        items.push({ label: "Fichas", onClick: goToFichas });
        items.push({ label: "Proyectos" });
        return items;
      }

      case "detalle": {
        if (detailReturnView === "todos_proyectos") {
          items.push({ label: "Todos los proyectos", onClick: goToTodosProyectos });
          items.push({ label: "Detalle" });
          return items;
        }

        if (projectsReturnView === "todas_fichas") {
          items.push({ label: "Fichas", onClick: goToTodasFichas });
          items.push({ label: "Proyectos", onClick: goToProyectos });
          items.push({ label: "Detalle" });
          return items;
        }

        items.push({ label: "Programas", onClick: goToProgramas });
        items.push({ label: "Areas", onClick: goToAreas });
        items.push({ label: "Fichas", onClick: goToFichas });
        items.push({ label: "Proyectos", onClick: goToProyectos });
        items.push({ label: "Detalle" });
        return items;
      }

      default:
        return items;
    }
  })();

  const openAprendicesEditor = async () => {
    const projectId = Number(detalle?.proyecto.proId || 0);
    if (!projectId) return;

    setIsAprendicesEditorOpen(true);
    setAprendicesFichaSearchTerm("");
    setShowAgregarAprendizPanel(false);
    setViewingProjectAprendiz(null);
    setEditingProjectAprendizRole(null);
    setPendingAprendizAdds([]);
    setPendingAprendizRemovals([]);
    setIsConfirmingAprendizChanges(false);

    try {
      await loadAprendicesEditor(projectId);
    } catch (error) {
      console.error("Error cargando editor de aprendices:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo cargar la edicion",
        description: "Intenta nuevamente en unos segundos.",
      });
      setIsAprendicesEditorOpen(false);
    }
  };

  const closeAprendicesEditor = () => {
    if (isSavingProjectAprendiz) return;

    setIsAprendicesEditorOpen(false);
    setAprendicesFichaSearchTerm("");
    setShowAgregarAprendizPanel(false);
    setViewingProjectAprendiz(null);
    setEditingProjectAprendizRole(null);
    setPendingAprendizAdds([]);
    setPendingAprendizRemovals([]);
    setIsConfirmingAprendizChanges(false);
    setAprendicesEditorData(null);
  };

  const refreshDetalleAndAprendicesEditor = async () => {
    const projectId = Number(detalle?.proyecto.proId || 0);
    if (!projectId) return;

    await Promise.all([
      loadProyectoDetalle(projectId),
      isAprendicesEditorOpen ? loadAprendicesEditor(projectId) : Promise.resolve(),
    ]);
  };

  const saveProjectContent = async () => {
    const projectId = Number(detalle?.proyecto.proId || 0);
    if (!projectId || !editProjectContentModal) return;

    setSavingProjectField(true);

    try {
      const response = await fetch(`${API_URL}/verpro/${projectId}/detalle-admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProjectContentModal),
      });

      const payload = (await response.json().catch(() => null)) as
        | DetalleAdminResponse
        | { message?: string | string[] }
        | null;

      if (!response.ok || !payload || !("proyecto" in payload)) {
        const errorMessage =
          payload && "message" in payload ? payload.message : undefined;
        const message = Array.isArray(errorMessage)
          ? errorMessage.join(". ")
          : normalizeText(errorMessage);

        throw new Error(message || "No fue posible actualizar la informacion.");
      }

      setDetalle(payload);
      setEditProjectContentModal(null);
      setTimedAlert({
        id: Date.now(),
        title: "Proyecto actualizado",
        description: "La descripcion y los objetivos se guardaron correctamente.",
      });
    } catch (error) {
      console.error("Error actualizando detalle del proyecto:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setSavingProjectField(false);
    }
  };

  const projectAprendicesByCedula = useMemo(() => {
    const rows = aprendicesEditorData?.aprendicesProyecto || [];
    return new Map(
      rows
        .map((aprendiz) => [normalizeText(aprendiz.cedula), aprendiz] as const)
        .filter(([cedula]) => Boolean(cedula)),
    );
  }, [aprendicesEditorData?.aprendicesProyecto]);

  const fichaAprendicesByCedula = useMemo(() => {
    const rows = aprendicesEditorData?.aprendicesFicha || [];
    return new Map(
      rows
        .map((aprendiz) => [normalizeText(aprendiz.cedula), aprendiz] as const)
        .filter(([cedula]) => Boolean(cedula)),
    );
  }, [aprendicesEditorData?.aprendicesFicha]);

  const currentProjectCedulas = useMemo(
    () => new Set(Array.from(projectAprendicesByCedula.keys())),
    [projectAprendicesByCedula],
  );

  const pendingAddSet = useMemo(
    () => new Set(pendingAprendizAdds),
    [pendingAprendizAdds],
  );

  const pendingRemoveSet = useMemo(
    () => new Set(pendingAprendizRemovals),
    [pendingAprendizRemovals],
  );

  const defaultRolScrum = useMemo(() => {
    const roles = aprendicesEditorData?.rolesScrum || [];

    return (
      roles.find((role) =>
        normalizeText(role.descripcion).toLowerCase().includes("scrum team"),
      ) ||
      roles.find((role) =>
        normalizeText(role.descripcion).toLowerCase().includes("team"),
      ) ||
      roles[0] ||
      null
    );
  }, [aprendicesEditorData?.rolesScrum]);

  const displayedProyectoAprendices = useMemo<ProyectoAprendizDisplayItem[]>(
    () => {
      const currentRows = (aprendicesEditorData?.aprendicesProyecto || []).map(
        (aprendiz) => ({
          ...aprendiz,
          membershipChange: (
            pendingRemoveSet.has(normalizeText(aprendiz.cedula))
              ? "remove"
              : "none"
          ) as MembershipChange,
          isPendingNew: false,
        }),
      );

      const stagedRows = pendingAprendizAdds
        .filter((cedula) => cedula && !currentProjectCedulas.has(cedula))
        .map((cedula) => {
          const aprendiz = fichaAprendicesByCedula.get(cedula);

          return {
            ...(aprendiz || { cedula }),
            detParId: defaultRolScrum?.detParId ?? aprendiz?.detParId ?? null,
            rolScrum:
              normalizeText(defaultRolScrum?.descripcion) ||
              normalizeText(aprendiz?.rolScrum) ||
              "Scrum Team",
            membershipChange: "add" as const,
            isPendingNew: true,
          };
        });

      return [...currentRows, ...stagedRows];
    },
    [
      aprendicesEditorData?.aprendicesProyecto,
      currentProjectCedulas,
      defaultRolScrum?.descripcion,
      defaultRolScrum?.detParId,
      fichaAprendicesByCedula,
      pendingAprendizAdds,
      pendingRemoveSet,
    ],
  );

  const pendingAddNames = useMemo(
    () =>
      pendingAprendizAdds.map((cedula) =>
        getAprendizNombreCompleto(fichaAprendicesByCedula.get(cedula)),
      ),
    [fichaAprendicesByCedula, pendingAprendizAdds],
  );

  const pendingRemoveNames = useMemo(
    () =>
      pendingAprendizRemovals.map((cedula) =>
        getAprendizNombreCompleto(projectAprendicesByCedula.get(cedula)),
      ),
    [pendingAprendizRemovals, projectAprendicesByCedula],
  );

  const hasPendingAprendizChanges =
    pendingAprendizAdds.length > 0 || pendingAprendizRemovals.length > 0;

  const filteredAprendicesFicha = useMemo(() => {
    const rows = aprendicesEditorData?.aprendicesFicha || [];
    const query = normalizeText(aprendicesFichaSearchTerm).toLowerCase();

    if (!query) return rows;

    return rows.filter((aprendiz) => {
      const cedula = normalizeText(aprendiz.cedula);
      const inCurrentProject = currentProjectCedulas.has(cedula);
      const inOtherProject =
        !inCurrentProject && Boolean(Number(aprendiz.otroProyectoId || 0));
      const pendingAdd = pendingAddSet.has(cedula);
      const pendingRemove = pendingRemoveSet.has(cedula);

      const disponibilidad = pendingAdd
        ? "se agregara"
        : pendingRemove
          ? "se eliminara"
          : inOtherProject
            ? normalizeText(aprendiz.otroProyectoNombre) ||
              "asignado a otro proyecto"
            : inCurrentProject
              ? "ya esta en este proyecto"
              : "disponible";

      const searchValue = [
        aprendiz.nombres,
        aprendiz.apellidos,
        aprendiz.cedula,
        aprendiz.estado,
        disponibilidad,
      ]
        .map((value) => normalizeText(value).toLowerCase())
        .join(" ");

      return searchValue.includes(query);
    });
  }, [
    aprendicesEditorData?.aprendicesFicha,
    aprendicesFichaSearchTerm,
    currentProjectCedulas,
    pendingAddSet,
    pendingRemoveSet,
  ]);

  const stageAprendizAddition = (aprendiz: AprendizFichaEditorItem) => {
    const cedula = normalizeText(aprendiz.cedula);
    if (!cedula) return;

    const inCurrentProject = currentProjectCedulas.has(cedula);
    const inOtherProject =
      !inCurrentProject && Boolean(Number(aprendiz.otroProyectoId || 0));

    if (inOtherProject || pendingAddSet.has(cedula)) {
      return;
    }

    if (inCurrentProject) {
      setPendingAprendizRemovals((prev) =>
        prev.filter((currentCedula) => currentCedula !== cedula),
      );
      return;
    }

    setPendingAprendizAdds((prev) =>
      prev.includes(cedula) ? prev : [...prev, cedula],
    );
  };

  const saveAprendizProyectoRole = async () => {
    const projectId = Number(detalle?.proyecto.proId || 0);
    if (!projectId || !editingProjectAprendizRole?.cedula) return;

    if (!editingProjectAprendizRole.detParId) {
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo guardar la edicion",
        description: "Selecciona un rol Scrum para continuar.",
      });
      return;
    }

    setIsSavingProjectAprendiz(true);

    try {
      const response = await fetch(
        `${API_URL}/verpro/${projectId}/aprendices/${encodeURIComponent(editingProjectAprendizRole.cedula)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ detParId: editingProjectAprendizRole.detParId }),
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          normalizeText(payload?.message) ||
            "No fue posible actualizar el rol Scrum del aprendiz.",
        );
      }

      await refreshDetalleAndAprendicesEditor();
      setEditingProjectAprendizRole(null);
      setTimedAlert({
        id: Date.now(),
        title: "Edicion exitosa",
        description: "El rol Scrum del aprendiz se actualizo correctamente.",
      });
    } catch (error) {
      console.error("Error actualizando rol Scrum:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo guardar la edicion",
        description:
          error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setIsSavingProjectAprendiz(false);
    }
  };

  const toggleAprendizMembershipFromProject = (
    aprendiz: ProyectoAprendizDisplayItem,
  ) => {
    const cedula = normalizeText(aprendiz.cedula);
    if (!cedula) return;

    if (pendingAddSet.has(cedula)) {
      setPendingAprendizAdds((prev) =>
        prev.filter((currentCedula) => currentCedula !== cedula),
      );
      return;
    }

    if (!currentProjectCedulas.has(cedula)) return;

    setPendingAprendizRemovals((prev) =>
      prev.includes(cedula)
        ? prev.filter((currentCedula) => currentCedula !== cedula)
        : [...prev, cedula],
    );
  };

  const savePendingAprendizChanges = async () => {
    const projectId = Number(detalle?.proyecto.proId || 0);
    if (!projectId || !hasPendingAprendizChanges) return;

    setIsSavingProjectAprendiz(true);

    try {
      const response = await fetch(`${API_URL}/verpro/${projectId}/aprendices/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addCedulas: pendingAprendizAdds,
          removeCedulas: pendingAprendizRemovals,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          normalizeText(payload?.message) ||
            "No fue posible guardar los cambios de aprendices.",
        );
      }

      const added = Array.isArray(payload?.added)
        ? payload.added.map((item: unknown) => normalizeText(item)).filter(Boolean)
        : pendingAddNames;
      const removed = Array.isArray(payload?.removed)
        ? payload.removed
            .map((item: unknown) => normalizeText(item))
            .filter(Boolean)
        : pendingRemoveNames;

      await refreshDetalleAndAprendicesEditor();
      setPendingAprendizAdds([]);
      setPendingAprendizRemovals([]);
      setIsConfirmingAprendizChanges(false);
      setTimedAlert({
        id: Date.now(),
        title: "Edicion exitosa",
        description:
          buildMembershipAppliedText(added, removed) ||
          "Los cambios se guardaron correctamente.",
      });
    } catch (error) {
      console.error("Error guardando aprendices del proyecto:", error);
      setTimedAlert({
        id: Date.now(),
        title: "No se pudo guardar la edicion",
        description:
          error instanceof Error ? error.message : "Intenta nuevamente.",
      });
    } finally {
      setIsSavingProjectAprendiz(false);
    }
  };

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
            <h1 className="vp-breadcrumb-title">
              {breadcrumbItems.map((item, index) => (
                <span key={`${item.label}-${index}`} className="vp-breadcrumb-segment">
                  {index > 0 ? <span className="vp-breadcrumb-sep">/</span> : null}
                  {item.onClick ? (
                    <button
                      type="button"
                      className="vp-breadcrumb-link"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="vp-breadcrumb-current">{item.label}</span>
                  )}
                </span>
              ))}
            </h1>
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

              {view !== "detalle" ? (
                <div className="vp-search-box">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Filter size={16} color="#555" />
                </div>
              ) : null}
            </div>
          </div>

          {view === "detalle" && detalle ? (
            <div className="vp-detail-tab-list vp-detail-subview-nav">
              <button
                type="button"
                className={`vp-detail-tab${detailSubview === "historias" ? " is-active" : ""}`}
                onClick={() =>
                  setDetailSubview((current) =>
                    current === "historias" ? null : "historias",
                  )
                }
              >
                Historias de usuario
                <span className="vp-detail-tab-count">
                  {detalle.historiasUsuario.length}
                </span>
              </button>
              <button
                type="button"
                className={`vp-detail-tab${detailSubview === "criterios" ? " is-active" : ""}`}
                onClick={() =>
                  setDetailSubview((current) =>
                    current === "criterios" ? null : "criterios",
                  )
                }
              >
                Criterios de aceptacion
                <span className="vp-detail-tab-count">
                  {detalle.criteriosAceptacion.length}
                </span>
              </button>
              <button
                type="button"
                className={`vp-detail-tab${detailSubview === "sugerencias" ? " is-active" : ""}`}
                onClick={() =>
                  setDetailSubview((current) =>
                    current === "sugerencias" ? null : "sugerencias",
                  )
                }
              >
                Sugerencias
                <span className="vp-detail-tab-count">
                  {detalle.sugerencias.length}
                </span>
              </button>
            </div>
          ) : null}

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
                            <div className="vp-table-actions">
                              <button
                                type="button"
                                className="vp-action-button action-view"
                                onClick={() => {
                                  setSelectedPrograma(programa);
                                  setSelectedArea(null);
                                  setSelectedFichaNumero(null);
                                  setView("areas");
                                }}
                                aria-label={`Ver areas del programa ${programa}`}
                                title="Ver areas"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                type="button"
                                className="vp-action-button action-edit"
                                onClick={() =>
                                  setEditProgramaModal({
                                    programaActual: programa,
                                    programaNuevo: programa,
                                  })
                                }
                                aria-label={`Editar programa ${programa}`}
                                title="Editar programa"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                type="button"
                                className="vp-action-button action-delete"
                                onClick={() =>
                                  setDeleteDialog({
                                    kind: "programa",
                                    label: programa,
                                  })
                                }
                                aria-label={`Eliminar programa ${programa}`}
                                title="Eliminar programa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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
                          <div className="vp-table-actions">
                            <button
                              type="button"
                              className="vp-action-button action-view"
                              onClick={() => {
                                setSelectedArea(area.nombre);
                                setSelectedFichaNumero(null);
                                setView("fichas");
                              }}
                              aria-label={`Ver fichas del area ${area.nombre}`}
                              title="Ver fichas"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-edit"
                              onClick={() =>
                                setEditAreaModal({
                                  areaActual: area.nombre,
                                  areaNueva: area.nombre,
                                })
                              }
                              aria-label={`Editar area ${area.nombre}`}
                              title="Editar area"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-delete"
                              onClick={() =>
                                setDeleteDialog({
                                  kind: "area",
                                  label: area.nombre,
                                  programa: selectedPrograma || undefined,
                                })
                              }
                              aria-label={`Eliminar area ${area.nombre}`}
                              title="Eliminar area"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
                          <div className="vp-table-actions">
                            <button
                              type="button"
                              className="vp-action-button action-view"
                              onClick={() => {
                                setSelectedFichaNumero(ficha.numero);
                                setProjectsReturnView("fichas");
                                setView("proyectos");
                              }}
                              aria-label={`Ver proyectos de la ficha ${ficha.numero}`}
                              title="Ver proyectos"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-edit"
                              onClick={() =>
                                setEditFichaModal({
                                  numero: ficha.numero,
                                  nombre: ficha.nombre,
                                  programa: ficha.programa,
                                  estado: ficha.estado,
                                })
                              }
                              aria-label={`Editar ficha ${ficha.numero}`}
                              title="Editar ficha"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-delete"
                              onClick={() =>
                                setDeleteDialog({
                                  kind: "ficha",
                                  label: `Ficha ${ficha.numero}`,
                                  fichaNumero: ficha.numero,
                                })
                              }
                              aria-label={`Eliminar ficha ${ficha.numero}`}
                              title="Eliminar ficha"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
                          <div className="vp-table-actions">
                            <button
                              type="button"
                              className="vp-action-button action-view"
                              onClick={() => {
                                setSelectedFichaNumero(ficha.numero);
                                setProjectsReturnView("todas_fichas");
                                setView("proyectos");
                              }}
                              disabled={ficha.estado.toLowerCase() !== "activa"}
                              aria-label={`Ver proyectos de la ficha ${ficha.numero}`}
                              title={
                                ficha.estado.toLowerCase() === "activa"
                                  ? "Ver proyectos"
                                  : "La ficha esta inactiva"
                              }
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-edit"
                              onClick={() =>
                                setEditFichaModal({
                                  numero: ficha.numero,
                                  nombre: ficha.nombre,
                                  programa: ficha.programa,
                                  estado: ficha.estado,
                                })
                              }
                              aria-label={`Editar ficha ${ficha.numero}`}
                              title="Editar ficha"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              className="vp-action-button action-delete"
                              onClick={() =>
                                setDeleteDialog({
                                  kind: "ficha",
                                  label: `Ficha ${ficha.numero}`,
                                  fichaNumero: ficha.numero,
                                })
                              }
                              aria-label={`Eliminar ficha ${ficha.numero}`}
                              title="Eliminar ficha"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
                          <div className="vp-table-actions">
                            <button
                              type="button"
                              className="vp-action-button action-view"
                              onClick={() =>
                                void openProyectoDetalle(proyecto.id, "proyectos")
                              }
                              aria-label={`Ver detalle del proyecto ${proyecto.codigo}`}
                              title="Ver detalle"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="vp-empty-row">
                        <div className="vp-empty-state-stack">
                          <span>Esta ficha no tiene proyectos asignados.</span>
                          {proyectosSinFichaCount > 0 ? (
                            <>
                              <span className="vp-empty-state-note">
                                Hay {proyectosSinFichaCount} proyecto
                                {proyectosSinFichaCount === 1 ? "" : "s"} sin ficha
                                asociada. Esos no aparecen en esta vista hasta que
                                queden vinculados a una ficha.
                              </span>
                              <button
                                type="button"
                                className="vp-btn-secondary"
                                onClick={() => {
                                  setSearchTerm("");
                                  setView("todos_proyectos");
                                }}
                              >
                                Ver todos los proyectos
                              </button>
                            </>
                          ) : null}
                        </div>
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
                          <div className="vp-table-actions">
                            <button
                              type="button"
                              className="vp-action-button action-view"
                              onClick={() =>
                                void openProyectoDetalle(proyecto.id, "todos_proyectos")
                              }
                              aria-label={`Ver detalle del proyecto ${proyecto.codigo}`}
                              title="Ver detalle"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
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
                      <div className="vp-detail-card-header">
                        <h3>Aprendices</h3>
                        <button
                          type="button"
                          className="vp-btn-secondary"
                          onClick={() => void openAprendicesEditor()}
                        >
                          Editar aprendices
                        </button>
                      </div>
                      <div className="vp-detail-table-wrap">
                        <table className="vp-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Apellido</th>
                              <th>Documento</th>
                              <th>Tipo</th>
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
                                  <td className="vp-name-cell">
                                    {normalizeText(aprendiz.nombres) || "--"}
                                  </td>
                                  <td className="vp-name-cell">
                                    {normalizeText(aprendiz.apellidos) || "--"}
                                  </td>
                                  <td>{normalizeText(aprendiz.cedula) || "--"}</td>
                                  <td>{normalizeText(aprendiz.tipoDocumento) || "--"}</td>
                                  <td>{normalizeText(aprendiz.estado) || "--"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="vp-empty-row">
                                  Este proyecto no tiene aprendices asignados.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="vp-detail-card">
                    <div className="vp-detail-card-header">
                      <div>
                        <h3>Descripcion y objetivos</h3>
                        <p className="vp-detail-helper">
                          Consulta toda la informacion base del proyecto en un solo
                          bloque.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="vp-btn-secondary vp-btn-secondary-compact"
                        onClick={openProjectContentEditor}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    </div>
                    <div className="vp-detail-content-stack">
                      {(
                        [
                          {
                            key: "proDescription",
                            title: "Descripcion",
                            value:
                              normalizeText(detalle.proyecto.proDescription) ||
                              "Sin descripcion",
                          },
                          {
                            key: "proObjetivoGeneral",
                            title: "Objetivo general",
                            value:
                              normalizeText(detalle.proyecto.proObjetivoGeneral) ||
                              "Sin objetivo",
                          },
                          {
                            key: "proObjetivosEspecificos",
                            title: "Objetivos especificos",
                            value:
                              normalizeText(
                                detalle.proyecto.proObjetivosEspecificos,
                              ) || "Sin objetivos especificos",
                          },
                          {
                            key: "proJustificacion",
                            title: "Justificacion",
                            value:
                              normalizeText(detalle.proyecto.proJustificacion) ||
                              "Sin justificacion",
                          },
                        ] as Array<{
                          key: EditableProjectFieldKey;
                          title: string;
                          value: string;
                        }>
                      ).map((section) => (
                        <article key={section.key} className="vp-detail-content-block">
                          <span className="vp-detail-label">{section.title}</span>
                          <p className="vp-detail-paragraph vp-detail-paragraph-prewrap">
                            {section.value}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  {detailSubview === "historias" ? (
                    <DetalleHistoriasView items={detalle.historiasUsuario} />
                  ) : null}

                  {detailSubview === "criterios" ? (
                    <DetalleCriteriosView items={detalle.criteriosAceptacion} />
                  ) : null}

                  {detailSubview === "sugerencias" ? (
                    <DetalleSugerenciasView items={detalle.sugerencias} />
                  ) : null}
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

      {editProjectContentModal ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal vp-text-edit-modal">
            <h2 className="modal-title">Editar descripcion y objetivos</h2>
            <p className="modal-subtitle">
              Actualiza desde un solo formulario la informacion principal del
              proyecto.
            </p>
            <div className="vp-edit-stack">
              {PROJECT_TEXT_FIELDS.map((fieldKey) => {
                const fieldConfig = PROJECT_FIELD_CONFIG[fieldKey];

                return (
                  <div key={fieldKey} className="vp-edit-field">
                    <label>{fieldConfig.label}</label>
                    <textarea
                      value={editProjectContentModal[fieldKey]}
                      onChange={(e) =>
                        setEditProjectContentModal((prev) =>
                          prev
                            ? { ...prev, [fieldKey]: e.target.value }
                            : prev,
                        )
                      }
                      rows={fieldConfig.rows}
                      maxLength={fieldConfig.maxLength}
                      disabled={savingProjectField}
                    />
                    <span className="vp-edit-counter">
                      {editProjectContentModal[fieldKey].length}/
                      {fieldConfig.maxLength}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => void saveProjectContent()}
                disabled={savingProjectField}
              >
                {savingProjectField ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => {
                  if (savingProjectField) return;
                  setEditProjectContentModal(null);
                }}
                disabled={savingProjectField}
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

      {isAprendicesEditorOpen ? (
        <div className="modal-overlay">
          <div className="modal-content vp-manage-modal">
            <div className="vp-modal-header">
              <div>
                <h2 className="modal-title">Editar aprendices</h2>
                <p className="modal-subtitle">
                  Gestiona los aprendices del proyecto{" "}
                  {normalizeText(aprendicesEditorData?.proyecto.proNombre) || "--"}.
                </p>
              </div>
              <button
                type="button"
                className="vp-btn-secondary"
                onClick={() => setShowAgregarAprendizPanel((prev) => !prev)}
                disabled={aprendicesEditorLoading || isSavingProjectAprendiz}
              >
                <Plus size={16} />
                {showAgregarAprendizPanel ? "Ocultar lista" : "Agregar aprendiz"}
              </button>
            </div>

            {aprendicesEditorLoading ? (
              <div className="vp-empty-row">Cargando aprendices del proyecto...</div>
            ) : (
              <div
                className={`vp-manage-body${showAgregarAprendizPanel ? " is-split" : ""}`}
              >
                {showAgregarAprendizPanel ? (
                  <section className="vp-manage-section vp-manage-section-split">
                    <div className="vp-manage-section-title">
                      <div>
                        <h3>Aprendices de la ficha</h3>
                        <p>
                          A la izquierda seleccionas quien entrara al grupo y a la
                          derecha revisas los cambios antes de guardar.
                        </p>
                      </div>
                      <div className="vp-modal-search">
                        <Search size={16} className="vp-modal-search-icon" />
                        <input
                          type="text"
                          value={aprendicesFichaSearchTerm}
                          onChange={(e) =>
                            setAprendicesFichaSearchTerm(e.target.value)
                          }
                          placeholder="Buscar por nombre, apellido o documento..."
                          disabled={isSavingProjectAprendiz}
                        />
                      </div>
                    </div>
                    <div className="vp-detail-table-wrap vp-list-scroll">
                      <table className="vp-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Documento</th>
                            <th>Estado</th>
                            <th>Disponibilidad</th>
                            <th style={{ textAlign: "center" }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAprendicesFicha.length ? (
                            filteredAprendicesFicha.map((aprendiz, index) => {
                              const cedula = normalizeText(aprendiz.cedula);
                              const inCurrentProject = currentProjectCedulas.has(cedula);
                              const inOtherProject =
                                !inCurrentProject &&
                                Boolean(Number(aprendiz.otroProyectoId || 0));
                              const pendingAdd = pendingAddSet.has(cedula);
                              const pendingRemove = pendingRemoveSet.has(cedula);
                              const rowClassName = inOtherProject
                                ? "vp-disabled-row"
                                : pendingRemove
                                  ? "vp-pending-remove-row"
                                  : pendingAdd
                                    ? "vp-pending-add-row"
                                    : inCurrentProject
                                  ? "vp-muted-row"
                                  : "";
                              const canRestoreToProject =
                                inCurrentProject && pendingRemove;

                              return (
                                <tr
                                  key={`${cedula || "cand"}-${index}`}
                                  className={rowClassName}
                                >
                                  <td className="vp-name-cell">
                                    {normalizeText(aprendiz.nombres) || "--"}
                                  </td>
                                  <td className="vp-name-cell">
                                    {normalizeText(aprendiz.apellidos) || "--"}
                                  </td>
                                  <td>{normalizeText(aprendiz.cedula) || "--"}</td>
                                  <td>{normalizeText(aprendiz.estado) || "--"}</td>
                                  <td>
                                    {pendingAdd ? (
                                      <span className="vp-inline-note vp-note-pending-add">
                                        Se agregara
                                      </span>
                                    ) : pendingRemove ? (
                                      <span className="vp-inline-note vp-note-pending-remove">
                                        Se eliminara
                                      </span>
                                    ) : inOtherProject ? (
                                      <span className="vp-inline-note vp-note-muted">
                                        {normalizeText(aprendiz.otroProyectoNombre)
                                          ? `En ${normalizeText(aprendiz.otroProyectoNombre)}`
                                          : "Asignado a otro proyecto"}
                                      </span>
                                    ) : inCurrentProject ? (
                                      <span className="vp-inline-note vp-note-current">
                                        Ya esta en este proyecto
                                      </span>
                                    ) : (
                                      <span className="vp-inline-note vp-note-available">
                                        Disponible
                                      </span>
                                    )}
                                  </td>
                                  <td className="vp-actions-cell">
                                    <div className="vp-table-actions">
                                      <button
                                        type="button"
                                        className="vp-action-button action-add"
                                        onClick={() => stageAprendizAddition(aprendiz)}
                                        aria-label={`Agregar a ${normalizeText(aprendiz.nombres)} ${normalizeText(aprendiz.apellidos)}`}
                                        title={
                                          pendingAdd
                                            ? "Este aprendiz ya se agregara al proyecto"
                                            : inOtherProject
                                            ? "Este aprendiz ya esta en otro proyecto"
                                            : canRestoreToProject
                                              ? "Cancelar salida del proyecto"
                                              : inCurrentProject
                                              ? "Este aprendiz ya esta en este proyecto"
                                              : "Agregar aprendiz"
                                        }
                                        disabled={
                                          isSavingProjectAprendiz ||
                                          inOtherProject ||
                                          pendingAdd ||
                                          (inCurrentProject && !canRestoreToProject)
                                        }
                                      >
                                        <Plus size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="vp-empty-row">
                                {aprendicesFichaSearchTerm.trim()
                                  ? "No se encontraron aprendices con esa busqueda."
                                  : "No hay aprendices disponibles para esta ficha."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="vp-inline-helper">
                      Los cambios no se aplican hasta que presiones Guardar. Los
                      nuevos ingresos usaran{" "}
                      {normalizeText(defaultRolScrum?.descripcion) || "Scrum Team"} por
                      defecto.
                    </p>
                  </section>
                ) : null}

                <section
                  className={`vp-manage-section${showAgregarAprendizPanel ? " vp-manage-section-split" : ""}`}
                >
                  <div className="vp-manage-section-title">
                    <div>
                      <h3>Aprendices del grupo</h3>
                      <p>
                        Azul: ingreso pendiente. Rojo: salida pendiente. Los cambios
                        se guardan al final.
                      </p>
                    </div>
                    {hasPendingAprendizChanges ? (
                      <span className="vp-inline-note vp-note-current">
                        {pendingAprendizAdds.length + pendingAprendizRemovals.length}{" "}
                        cambio
                        {pendingAprendizAdds.length + pendingAprendizRemovals.length === 1
                          ? ""
                          : "s"}{" "}
                        pendiente
                        {pendingAprendizAdds.length + pendingAprendizRemovals.length === 1
                          ? ""
                          : "s"}
                      </span>
                    ) : null}
                  </div>
                  <div className="vp-detail-table-wrap vp-list-scroll">
                    <table className="vp-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Apellido</th>
                          <th>Documento</th>
                          <th>Rol Scrum</th>
                          <th>Estado</th>
                          <th>Cambio</th>
                          <th style={{ textAlign: "center" }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedProyectoAprendices.length ? (
                          displayedProyectoAprendices.map((aprendiz, index) => (
                            <tr
                              key={`${normalizeText(aprendiz.cedula) || "proj"}-${index}`}
                              className={
                                aprendiz.membershipChange === "add"
                                  ? "vp-pending-add-row"
                                  : aprendiz.membershipChange === "remove"
                                    ? "vp-pending-remove-row"
                                    : ""
                              }
                            >
                              <td className="vp-name-cell">
                                {normalizeText(aprendiz.nombres) || "--"}
                              </td>
                              <td className="vp-name-cell">
                                {normalizeText(aprendiz.apellidos) || "--"}
                              </td>
                              <td>{normalizeText(aprendiz.cedula) || "--"}</td>
                              <td>{normalizeText(aprendiz.rolScrum) || "--"}</td>
                              <td>{normalizeText(aprendiz.estado) || "--"}</td>
                              <td>
                                {aprendiz.membershipChange === "add" ? (
                                  <span className="vp-inline-note vp-note-pending-add">
                                    Se agregara
                                  </span>
                                ) : aprendiz.membershipChange === "remove" ? (
                                  <span className="vp-inline-note vp-note-pending-remove">
                                    Se eliminara
                                  </span>
                                ) : (
                                  <span className="vp-inline-note vp-note-neutral">
                                    Sin cambios
                                  </span>
                                )}
                              </td>
                              <td className="vp-actions-cell">
                                <div className="vp-table-actions">
                                  <button
                                    type="button"
                                    className="vp-action-button action-view"
                                    onClick={() => setViewingProjectAprendiz(aprendiz)}
                                    aria-label={`Ver mas de ${normalizeText(aprendiz.nombres)} ${normalizeText(aprendiz.apellidos)}`}
                                    title="Ver mas"
                                    disabled={isSavingProjectAprendiz}
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    className="vp-action-button action-edit"
                                    onClick={() =>
                                      setEditingProjectAprendizRole({
                                        cedula: normalizeText(aprendiz.cedula),
                                        nombre: `${normalizeText(aprendiz.nombres)} ${normalizeText(aprendiz.apellidos)}`.trim(),
                                        detParId: aprendiz.detParId
                                          ? Number(aprendiz.detParId)
                                          : null,
                                      })
                                    }
                                    aria-label={`Editar rol de ${normalizeText(aprendiz.nombres)} ${normalizeText(aprendiz.apellidos)}`}
                                    title={
                                      aprendiz.membershipChange === "none"
                                        ? "Editar rol Scrum"
                                        : "Guarda primero los cambios de integrantes"
                                    }
                                    disabled={
                                      isSavingProjectAprendiz ||
                                      aprendiz.membershipChange !== "none"
                                    }
                                  >
                                    <Pencil size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    className="vp-action-button action-delete"
                                    onClick={() =>
                                      toggleAprendizMembershipFromProject(aprendiz)
                                    }
                                    aria-label={`Quitar a ${normalizeText(aprendiz.nombres)} ${normalizeText(aprendiz.apellidos)}`}
                                    title={
                                      aprendiz.membershipChange === "add"
                                        ? "Cancelar ingreso al grupo"
                                        : aprendiz.membershipChange === "remove"
                                          ? "Deshacer retiro del proyecto"
                                          : "Marcar para eliminar"
                                    }
                                    disabled={isSavingProjectAprendiz}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="vp-empty-row">
                              Este proyecto aun no tiene aprendices asignados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => {
                  if (!hasPendingAprendizChanges) {
                    setTimedAlert({
                      id: Date.now(),
                      title: "No hay cambios pendientes",
                      description:
                        "Primero agrega o marca aprendices para eliminar.",
                    });
                    return;
                  }

                  setIsConfirmingAprendizChanges(true);
                }}
                disabled={isSavingProjectAprendiz}
              >
                {isSavingProjectAprendiz ? "Guardando..." : "Guardar"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={closeAprendicesEditor}
                disabled={isSavingProjectAprendiz}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewingProjectAprendiz ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal vp-view-modal">
            <h2 className="modal-title">Informacion del aprendiz</h2>
            <div className="vp-view-grid">
              <div className="vp-view-item">
                <span>Nombre</span>
                <strong>{normalizeText(viewingProjectAprendiz.nombres) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Apellido</span>
                <strong>{normalizeText(viewingProjectAprendiz.apellidos) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Documento</span>
                <strong>{normalizeText(viewingProjectAprendiz.cedula) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Tipo de documento</span>
                <strong>
                  {normalizeText(viewingProjectAprendiz.tipoDocumento) || "--"}
                </strong>
              </div>
              <div className="vp-view-item">
                <span>Correo</span>
                <strong>{normalizeText(viewingProjectAprendiz.correo) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Telefono</span>
                <strong>{normalizeText(viewingProjectAprendiz.telefono) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Sexo</span>
                <strong>{normalizeText(viewingProjectAprendiz.sexo) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Rol Scrum</span>
                <strong>{normalizeText(viewingProjectAprendiz.rolScrum) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Estado</span>
                <strong>{normalizeText(viewingProjectAprendiz.estado) || "--"}</strong>
              </div>
              <div className="vp-view-item">
                <span>Ficha</span>
                <strong>
                  {viewingProjectAprendiz.fichaNumero
                    ? normalizeText(viewingProjectAprendiz.fichaNumero)
                    : "--"}
                </strong>
              </div>
            </div>
            <div className="modal-buttons">
              <button
                className="btn-cancel-logout"
                onClick={() => setViewingProjectAprendiz(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingProjectAprendizRole ? (
        <div className="modal-overlay">
          <div className="modal-content vp-edit-modal">
            <h2 className="modal-title">Editar rol del aprendiz</h2>
            <div className="vp-edit-field">
              <label>Aprendiz</label>
              <input
                type="text"
                value={editingProjectAprendizRole.nombre}
                disabled
                readOnly
              />
            </div>
            <div className="vp-edit-field">
              <label>Rol Scrum</label>
              <select
                value={editingProjectAprendizRole.detParId || ""}
                onChange={(e) =>
                  setEditingProjectAprendizRole((prev) =>
                    prev
                      ? {
                          ...prev,
                          detParId: e.target.value ? Number(e.target.value) : null,
                        }
                      : prev,
                  )
                }
                disabled={isSavingProjectAprendiz}
              >
                <option value="">Selecciona un rol</option>
                {(aprendicesEditorData?.rolesScrum || []).map((role) => (
                  <option key={role.detParId} value={role.detParId}>
                    {normalizeText(role.descripcion) || `Rol ${role.detParId}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button
                className="btn-confirm-logout"
                onClick={() => void saveAprendizProyectoRole()}
                disabled={
                  isSavingProjectAprendiz || !editingProjectAprendizRole.detParId
                }
              >
                {isSavingProjectAprendiz ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={() => {
                  if (isSavingProjectAprendiz) return;
                  setEditingProjectAprendizRole(null);
                }}
                disabled={isSavingProjectAprendiz}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminLogoutModal
        isOpen={isConfirmingAprendizChanges}
        title="Confirmar cambios en aprendices"
        description={
          buildMembershipPreviewText(pendingAddNames, pendingRemoveNames) ||
          "No hay cambios por guardar."
        }
        confirmLabel={isSavingProjectAprendiz ? "Guardando..." : "Si, guardar"}
        onCancel={() => {
          if (isSavingProjectAprendiz) return;
          setIsConfirmingAprendizChanges(false);
        }}
        onConfirm={() => void savePendingAprendizChanges()}
        zIndex={2900}
      />

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
