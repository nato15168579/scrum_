/**
 * Lista administrativa de instructores.
 *
 * Esta pantalla concentra:
 * - consulta y filtrado de instructores
 * - visualizacion de fichas a cargo
 * - edicion de datos personales y reasignacion de fichas
 * - eliminacion con resumen previo
 *
 * El archivo contiene bastante logica de compatibilidad porque el backend y la
 * base de datos manejan relaciones instructor-ficha que han evolucionado con el
 * tiempo y pueden llegar con formas ligeramente distintas.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ListaInstructores.css";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../session/session";
import AdminLogoutModal from "../modals/AdminLogoutModal";
import AdminTimedAlert from "../feedback/AdminTimedAlert";
import AdminProfileMenu from "../layout/AdminProfileMenu";
import AdminSidebar from "../layout/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "../session/adminSession";
import { useClickOutside } from "../hooks/useClickOutside";
import { normalizeText } from "../utils/text";

interface FichaDetalle {
  ficha: string;
  nombre: string;
  programa: string;
  estado?: string | null;
  fechaCreacion?: string | null;
}

type EstadoInstructor = "Activo" | "Inactivo";

interface Instructor {
  documento: string;
  tipoDocumento: string;
  especializacion: string;
  fichasCargo?: string[] | null;
  fichasDetalle?: FichaDetalle[] | null;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string | null;
  estado: EstadoInstructor;
}

interface FichaDisponible {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
  fechaCreacion?: string | null;
}

interface FichasModalData {
  instructorNombre: string;
  fichas: FichaDetalle[];
}

interface EditInstructorForm {
  documento: string;
  tipoDocumento: string;
  nombre: string;
  apellido: string;
  especializacion: string;
  sexo: string;
  email: string;
  telefono: string;
  fechaInscripcion: string;
  estado: EstadoInstructor;
  fichasSeleccionadas: string[];
}

interface StyledModalState {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  iconBackgroundColor?: string;
  showCancelButton?: boolean;
  zIndex?: number;
}

type FilterKey =
  | "todos"
  | "documento"
  | "especializacion"
  | "nombre"
  | "apellido"
  | "telefono"
  | "email"
  | "estado"
  | "fechaRegistro"
  | "fichasCargo";

const ITEMS_PER_PAGE = 10;
const ROW_FADE_DURATION_MS = 420;

// ---------------------------------------------------------------------------
// Normalizadores y helpers de compatibilidad
// ---------------------------------------------------------------------------

const formatFechaRegistro = (value?: string | null) => {
  if (!value) return "Sin registro";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Sin registro";

  return parsedDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const normalizeEstado = (estado?: string | null): EstadoInstructor =>
  normalizeText(estado) === "Inactivo" ? "Inactivo" : "Activo";

const normalizeFichasCargo = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => normalizeText(item))
          .filter(Boolean),
      ),
    );
  }

  const raw = normalizeText(value);
  if (!raw) return [];

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
};

const normalizeFichasDetalle = (value: unknown): FichaDetalle[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      ficha: normalizeText((item as FichaDetalle)?.ficha),
      nombre: normalizeText((item as FichaDetalle)?.nombre) || "Sin nombre",
      programa:
        normalizeText((item as FichaDetalle)?.programa) || "Sin programa",
      estado: normalizeText((item as FichaDetalle)?.estado) || null,
      fechaCreacion: (item as FichaDetalle)?.fechaCreacion || null,
    }))
    .filter((item) => item.ficha);
};

const extractApiMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string") {
    return payload.trim() || fallback;
  }

  if (Array.isArray((payload as { message?: unknown })?.message)) {
    return (
      (payload as { message?: string[] }).message
        ?.map((item) => normalizeText(item))
        .filter(Boolean)
        .join(", ") || fallback
    );
  }

  const message = normalizeText((payload as { message?: unknown })?.message);
  return message || fallback;
};

const parseApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text.trim() || null;
};

const getFichaSelectionChanges = (currentFichas: string[], nextFichas: string[]) => {
  const currentSet = new Set(currentFichas);
  const nextSet = new Set(nextFichas);

  return {
    added: nextFichas.filter((item) => !currentSet.has(item)),
    removed: currentFichas.filter((item) => !nextSet.has(item)),
  };
};

const isUnsupportedUpdateMethod = (
  response: Response,
  payload: unknown,
  method: "PATCH" | "PUT" | "POST",
) => {
  if (response.ok || ![404, 405].includes(response.status)) {
    return false;
  }

  const message = extractApiMessage(payload, "").toLowerCase();
  return (
    !message ||
    message.includes(`cannot ${method.toLowerCase()}`) ||
    message.includes("method not allowed")
  );
};

const buildFichaSearchValue = (item: Instructor) => {
  const fichas = normalizeFichasDetalle(item.fichasDetalle);
  if (fichas.length > 0) {
    return fichas
      .map((ficha) =>
        `${ficha.ficha} ${ficha.nombre} ${ficha.programa}`.toLowerCase(),
      )
      .join(" ");
  }

  return normalizeFichasCargo(item.fichasCargo).join(" ").toLowerCase();
};

const getInstructorFichas = (item: Instructor) => {
  const fichasDetalle = normalizeFichasDetalle(item.fichasDetalle);

  if (fichasDetalle.length > 0) {
    return fichasDetalle;
  }

  return normalizeFichasCargo(item.fichasCargo).map((ficha) => ({
    ficha,
    nombre: "Sin nombre",
    programa: "Sin programa",
    estado: null,
    fechaCreacion: null,
  }));
};

const getInstructorDetailFields = (instructor: Instructor) => [
  { label: "Documento", value: instructor.documento || "Sin documento" },
  {
    label: "Tipo de documento",
    value: instructor.tipoDocumento || "Sin tipo de documento",
  },
  { label: "Nombre", value: instructor.nombre || "Sin nombre" },
  { label: "Apellido", value: instructor.apellido || "Sin apellido" },
  {
    label: "Especializacion",
    value: instructor.especializacion || "Sin especializacion",
  },
  { label: "Sexo", value: instructor.sexo || "Sin sexo" },
  { label: "Email", value: instructor.email || "Sin email" },
  { label: "Telefono", value: instructor.telefono || "Sin telefono" },
  { label: "Estado", value: instructor.estado || "Activo" },
  {
    label: "Fecha de registro",
    value: formatFechaRegistro(instructor.fechaInscripcion),
  },
];

const getInstructorDeleteFields = (instructor: Instructor) => [
  { label: "Documento", value: instructor.documento || "Sin documento" },
  {
    label: "Tipo de documento",
    value: instructor.tipoDocumento || "Sin tipo de documento",
  },
  { label: "Nombre", value: instructor.nombre || "Sin nombre" },
  { label: "Apellido", value: instructor.apellido || "Sin apellido" },
  {
    label: "Especializacion",
    value: instructor.especializacion || "Sin especializacion",
  },
  { label: "Email", value: instructor.email || "Sin email" },
  { label: "Estado", value: instructor.estado || "Activo" },
];

const FILTER_OPTIONS: { key: FilterKey; label: string; placeholder: string }[] = [
  {
    key: "todos",
    label: "Todos los campos",
    placeholder: "Buscar",
  },
  {
    key: "documento",
    label: "Documento",
    placeholder: "Buscar por documento",
  },
  {
    key: "especializacion",
    label: "Especializacion",
    placeholder: "Buscar por especializacion",
  },
  { key: "nombre", label: "Nombre", placeholder: "Buscar por nombre" },
  { key: "apellido", label: "Apellido", placeholder: "Buscar por apellido" },
  { key: "telefono", label: "Telefono", placeholder: "Buscar por telefono" },
  { key: "email", label: "Email", placeholder: "Buscar por email" },
  { key: "estado", label: "Estado", placeholder: "Buscar Activo/Inactivo" },
  {
    key: "fechaRegistro",
    label: "Fecha de registro",
    placeholder: "Buscar por fecha de registro",
  },
  {
    key: "fichasCargo",
    label: "Fichas a cargo",
    placeholder: "Buscar por fichas a cargo",
  },
];

const ListaInstructoresAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [fichasDisponibles, setFichasDisponibles] = useState<FichaDisponible[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [adminCedula, setAdminCedula] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fichasModalData, setFichasModalData] =
    useState<FichasModalData | null>(null);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(
    null,
  );
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );
  const [instructorToDelete, setInstructorToDelete] =
    useState<Instructor | null>(null);
  const [editForm, setEditForm] = useState<EditInstructorForm | null>(null);
  const [editFichaSearchTerm, setEditFichaSearchTerm] = useState("");
  const [isSavingInstructor, setIsSavingInstructor] = useState(false);
  const [isDeletingInstructor, setIsDeletingInstructor] = useState(false);
  const [saveConfirmationModal, setSaveConfirmationModal] =
    useState<StyledModalState | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<StyledModalState | null>(
    null,
  );
  const [timedAlert, setTimedAlert] = useState<{
    id: number;
    title: string;
    description?: string;
  } | null>(null);
  const [pendingRowRemovalDocumento, setPendingRowRemovalDocumento] =
    useState<string | null>(null);
  const [rowsLeaving, setRowsLeaving] = useState<Record<string, boolean>>({});
  const rowRemovalTimeoutsRef = useRef<Record<string, number>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const timeouts = rowRemovalTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    setAdminCedula(cedula);

    // Se cargan instructores, dashboard y catalogo de fichas en paralelo porque
    // la vista necesita las tres fuentes para mostrar perfil, tabla y modales.
    const fetchData = async () => {
      try {
        const [instructoresRes, dashboardRes, fichasRes] = await Promise.all([
          fetch(`${API_URL}/instructores?cedula=${cedula}`),
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
          fetch(`${API_URL}/fichas`),
        ]);

        const instructoresData = instructoresRes.ok
          ? await instructoresRes.json()
          : [];
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;
        const fichasData = fichasRes.ok ? await fichasRes.json() : [];

        const validData = (Array.isArray(instructoresData)
          ? instructoresData
        : []
        ).map((item) => ({
          documento: normalizeText(item?.documento),
          tipoDocumento: normalizeText(item?.tipoDocumento) || "CC",
          especializacion:
            normalizeText(item?.especializacion) || "Sin especializacion",
          fichasCargo: normalizeFichasCargo(item?.fichasCargo ?? item?.ficha),
          fichasDetalle: normalizeFichasDetalle(item?.fichasDetalle),
          nombre: normalizeText(item?.nombre),
          apellido: normalizeText(item?.apellido),
          sexo: normalizeText(item?.sexo),
          telefono: normalizeText(item?.telefono),
          email: normalizeText(item?.email),
          fechaInscripcion: item?.fechaInscripcion || null,
          estado: normalizeEstado(item?.estado),
        }));
        const validFichas = (Array.isArray(fichasData) ? fichasData : []).map(
          (item) => ({
            numero: normalizeText(item?.numero),
            nombre: normalizeText(item?.nombre) || "Sin nombre",
            programa: normalizeText(item?.programa) || "Sin programa",
            estado: normalizeText(item?.estado) || "Sin estado",
            fechaCreacion: item?.fechaCreacion || null,
          }),
        );

        setInstructores(validData);
        setFichasDisponibles(validFichas);
        setAdminName(resolveUserName(dashboardData?.instructor, "Usuario"));
      } catch (err) {
        console.error("Error cargando lista de instructores:", err);
        setAdminName(resolveUserName(undefined, "Usuario"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return instructores;

    const searchableFields: Record<
      Exclude<FilterKey, "todos">,
      (item: Instructor) => string
    > = {
      documento: (item) => item.documento.toLowerCase(),
      especializacion: (item) => item.especializacion.toLowerCase(),
      nombre: (item) => item.nombre.toLowerCase(),
      apellido: (item) => item.apellido.toLowerCase(),
      telefono: (item) => item.telefono.toLowerCase(),
      email: (item) => item.email.toLowerCase(),
      estado: (item) => item.estado.toLowerCase(),
      fechaRegistro: (item) =>
        formatFechaRegistro(item.fechaInscripcion).toLowerCase(),
      fichasCargo: (item) => buildFichaSearchValue(item),
    };

    return instructores.filter((item) => {
      if (activeFilter === "todos") {
        return Object.values(searchableFields).some((getter) =>
          getter(item).includes(query),
        );
      }

      return searchableFields[activeFilter](item).includes(query);
    });
  }, [instructores, searchTerm, activeFilter]);

  const startRowRemovalAnimation = (documento: string) => {
    setRowsLeaving((prev) =>
      prev[documento] ? prev : { ...prev, [documento]: true },
    );

    if (rowRemovalTimeoutsRef.current[documento]) {
      window.clearTimeout(rowRemovalTimeoutsRef.current[documento]);
    }

    rowRemovalTimeoutsRef.current[documento] = window.setTimeout(() => {
      setInstructores((prev) =>
        prev.filter((item) => item.documento !== documento),
      );
      setRowsLeaving((prev) => {
        if (!prev[documento]) return prev;
        const next = { ...prev };
        delete next[documento];
        return next;
      });
      delete rowRemovalTimeoutsRef.current[documento];
    }, ROW_FADE_DURATION_MS);
  };

  const closeTimedAlert = () => {
    setTimedAlert(null);

    if (pendingRowRemovalDocumento) {
      const documento = pendingRowRemovalDocumento;
      setPendingRowRemovalDocumento(null);
      startRowRemovalAnimation(documento);
    }
  };

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const displayData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const activeFilterOption =
    FILTER_OPTIONS.find((option) => option.key === activeFilter) ||
    FILTER_OPTIONS[0];

  const closeViewModal = () => setViewingInstructor(null);

  const openFichasModal = (instructor: Instructor) => {
    const fichas = getInstructorFichas(instructor);
    const instructorNombre = `${instructor.nombre} ${instructor.apellido}`.trim();

    setFichasModalData({
      instructorNombre: instructorNombre || `Instructor ${instructor.documento}`,
      fichas,
    });
  };

  const openEditModal = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setEditFichaSearchTerm("");
    setEditForm({
      documento: instructor.documento,
      tipoDocumento: instructor.tipoDocumento || "CC",
      nombre: instructor.nombre || "",
      apellido: instructor.apellido || "",
      especializacion: instructor.especializacion || "",
      sexo: instructor.sexo || "",
      email: instructor.email || "",
      telefono: instructor.telefono || "",
      fechaInscripcion: formatFechaRegistro(instructor.fechaInscripcion),
      estado: instructor.estado || "Activo",
      fichasSeleccionadas: getInstructorFichas(instructor).map(
        (item) => item.ficha,
      ),
    });
  };

  const closeEditModal = () => {
    setEditingInstructor(null);
    setEditForm(null);
    setEditFichaSearchTerm("");
    setSaveConfirmationModal(null);
  };

  const openDeleteModal = (instructor: Instructor) => {
    setInstructorToDelete(instructor);
  };

  const closeDeleteModal = () => setInstructorToDelete(null);

  const handleEditFieldChange = (
    field: keyof EditInstructorForm,
    value: string,
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleFichaSelectionChange = (fichaNumero: string, checked: boolean) => {
    setEditForm((prev) => {
      if (!prev) return prev;

      const nextFichas = checked
        ? Array.from(new Set([...prev.fichasSeleccionadas, fichaNumero]))
        : prev.fichasSeleccionadas.filter((item) => item !== fichaNumero);

      return {
        ...prev,
        fichasSeleccionadas: nextFichas,
      };
    });
  };

  const filteredFichasDisponibles = useMemo(() => {
    const query = editFichaSearchTerm.trim().toLowerCase();

    if (!query) {
      return fichasDisponibles;
    }

    return fichasDisponibles.filter((ficha) =>
      [ficha.numero, ficha.nombre, ficha.programa]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [editFichaSearchTerm, fichasDisponibles]);

  const submitInstructorEdit = async () => {
    if (!editingInstructor || !editForm) {
      return;
    }

    // Se intenta PATCH primero por semantica REST. Si la instancia activa del
    // backend no expone ese verbo, la vista cae a PUT y luego POST para no
    // bloquear la operacion en despliegues heredados o proxies restrictivos.
    setIsSavingInstructor(true);

    try {
      const payload = {
        nombre: editForm.nombre,
        apellidos: editForm.apellido,
        correo: editForm.email,
        telefono: editForm.telefono,
        sexo: editForm.sexo,
        especializacion: editForm.especializacion,
        estado: editForm.estado,
        fichas: editForm.fichasSeleccionadas,
      };
      const endpointBase = `${API_URL}/instructores/${editingInstructor.documento}`;
      const endpoint = adminCedula
        ? `${endpointBase}?actorCedula=${encodeURIComponent(adminCedula)}`
        : endpointBase;

      const methods: Array<"PATCH" | "PUT" | "POST"> = ["PATCH", "PUT", "POST"];
      let response: Response | null = null;
      let data: unknown = null;

      for (const method of methods) {
        response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        data = await parseApiResponse(response);

        if (response.ok || !isUnsupportedUpdateMethod(response, data, method)) {
          break;
        }
      }
      
      if (!response) {
        throw new Error("No se pudo establecer comunicacion con el servidor.");
      }

      if (!response.ok) {
        throw new Error(
          extractApiMessage(
            data,
            "No se pudo actualizar la informacion del instructor.",
          ),
        );
      }

      const updatedInstructor = (data as { instructor?: Partial<Instructor> } | null)
        ?.instructor;

      // El estado local se sincroniza con la respuesta final para que la tabla,
      // el modal de fichas y futuras ediciones trabajen sobre la misma fuente.
      setInstructores((prev) =>
        prev.map((item) =>
          item.documento === editingInstructor.documento
            ? {
                ...item,
                nombre: normalizeText(updatedInstructor?.nombre) || editForm.nombre,
                apellido:
                  normalizeText(updatedInstructor?.apellido) || editForm.apellido,
                especializacion:
                  normalizeText(updatedInstructor?.especializacion) ||
                  editForm.especializacion,
                sexo: normalizeText(updatedInstructor?.sexo) || editForm.sexo,
                telefono:
                  normalizeText(updatedInstructor?.telefono) || editForm.telefono,
                email: normalizeText(updatedInstructor?.email) || editForm.email,
                tipoDocumento:
                  normalizeText(updatedInstructor?.tipoDocumento) ||
                  item.tipoDocumento,
                fechaInscripcion:
                  updatedInstructor?.fechaInscripcion || item.fechaInscripcion,
                estado: normalizeEstado(updatedInstructor?.estado) || editForm.estado,
                fichasCargo: normalizeFichasCargo(updatedInstructor?.fichasCargo),
                fichasDetalle: normalizeFichasDetalle(
                  updatedInstructor?.fichasDetalle,
                ),
              }
            : item,
        ),
      );

      closeEditModal();
      setTimedAlert({
        id: Date.now(),
        title: "Cambios guardados correctamente",
        description: extractApiMessage(
          data,
          "La informacion del instructor y sus fichas a cargo se guardaron correctamente.",
        ),
      });
    } catch (error) {
      setFeedbackModal({
        title: "No se pudo actualizar",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el instructor.",
        confirmLabel: "Cerrar",
        iconBackgroundColor: "#d9534f",
        showCancelButton: false,
        zIndex: 2600,
      });
    } finally {
      setIsSavingInstructor(false);
    }
  };

  const handleSaveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingInstructor || !editForm) {
      return;
    }

    const currentFichas = getInstructorFichas(editingInstructor).map(
      (item) => item.ficha,
    );
    const { added, removed } = getFichaSelectionChanges(
      currentFichas,
      editForm.fichasSeleccionadas,
    );

    // Si hubo cambios en fichas, se exige confirmacion explicita porque esa
    // relacion define el alcance operativo del instructor dentro del sistema.
    if (added.length === 0 && removed.length === 0) {
      void submitInstructorEdit();
      return;
    }

    const description = [
      "Se actualizaran las fichas a cargo del instructor.",
      added.length > 0 ? `Agregar: ${added.join(", ")}` : "",
      removed.length > 0 ? `Retirar: ${removed.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSaveConfirmationModal({
      title: "Deseas guardar los cambios?",
      description,
      confirmLabel: "Si, guardar",
      cancelLabel: "Cancelar",
      iconBackgroundColor: "#39A900",
      zIndex: 2600,
    });
  };

  const handleDeleteInstructor = async () => {
    if (!instructorToDelete) {
      return;
    }

    // La eliminacion muestra feedback modal para no mezclar alertas nativas con
    // el resto del sistema de overlays administrativos.
    setIsDeletingInstructor(true);

    try {
      const response = await fetch(
        adminCedula
          ? `${API_URL}/instructores/${instructorToDelete.documento}?actorCedula=${encodeURIComponent(adminCedula)}`
          : `${API_URL}/instructores/${instructorToDelete.documento}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo eliminar el instructor.");
      }

      const deletedDocumento = instructorToDelete.documento;
      const deletedName = `${instructorToDelete.nombre} ${instructorToDelete.apellido}`.trim();
      closeDeleteModal();
      setPendingRowRemovalDocumento(deletedDocumento);
      setTimedAlert({
        id: Date.now(),
        title: "Usuario eliminado correctamente",
        description: extractApiMessage(
          data,
          deletedName
            ? `El usuario ${deletedName} se ha eliminado correctamente.`
            : "El usuario se ha eliminado correctamente.",
        ),
      });
    } catch (error) {
      setFeedbackModal({
        title: "No se pudo eliminar",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el instructor.",
        confirmLabel: "Cerrar",
        iconBackgroundColor: "#d9534f",
        showCancelButton: false,
        zIndex: 2600,
      });
    } finally {
      setIsDeletingInstructor(false);
    }
  };

  const viewingInstructorFichas = viewingInstructor
    ? getInstructorFichas(viewingInstructor)
    : [];
  const deleteInstructorFichas = instructorToDelete
    ? getInstructorFichas(instructorToDelete)
    : [];

  if (loading) {
    return <div className="loading-screen">Cargando lista de instructores...</div>;
  }

  return (
    <div className="dashboard-page">
      <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Lista de Instructores</h1>
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

        <div className="lista-container">
          <section className="table-card">
            <div className="table-header">
              <div className="table-header-top">
                <div>
                  <h2>Instructores Registrados</h2>
                  <span className="table-subtitle">
                    Listado oficial de instructores registrados en el sistema.
                  </span>
                </div>

                <div className="minimal-search">
                  <div className="minimal-search-input-wrapper">
                    <Search size={15} className="minimal-search-icon" />
                    <input
                      type="text"
                      className="minimal-search-input"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={activeFilterOption.placeholder}
                    />
                  </div>

                  <div className="minimal-select-wrapper">
                    <span className="minimal-select-label">
                      {activeFilterOption.label}
                    </span>
                    <select
                      className="minimal-filter-select"
                      value={activeFilter}
                      onChange={(e) => {
                        setActiveFilter(e.target.value as FilterKey);
                        setCurrentPage(1);
                      }}
                      aria-label="Opciones de filtrado"
                    >
                      {FILTER_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="minimal-select-icon" />
                  </div>
                </div>
              </div>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Especializacion</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Fichas a cargo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((row) => {
                    const fichas = getInstructorFichas(row);
                    const totalFichas = fichas.length;

                    return (
                      <tr
                        key={row.documento}
                        className={
                          rowsLeaving[row.documento] ? "row-fade-out" : undefined
                        }
                      >
                        <td>{row.documento}</td>
                        <td>{row.nombre || "Sin nombre"}</td>
                        <td>{row.apellido || "Sin apellido"}</td>
                        <td>{row.especializacion || "Sin especializacion"}</td>
                        <td>{row.email || "Sin email"}</td>
                        <td>
                          <span
                            className={`status-badge ${row.estado === "Activo" ? "status-active" : "status-inactive"}`}
                          >
                            {row.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-fichas-modal"
                            onClick={() => openFichasModal(row)}
                            disabled={totalFichas === 0}
                          >
                            {totalFichas > 0
                              ? `Fichas a Cargo (${totalFichas})`
                              : "Sin Fichas a Cargo"}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action-button action-view"
                              onClick={() => setViewingInstructor(row)}
                              aria-label={`Ver mas de ${row.nombre} ${row.apellido}`}
                              title="Ver mas"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              className="table-action-button action-edit"
                              onClick={() => openEditModal(row)}
                              aria-label={`Editar a ${row.nombre} ${row.apellido}`}
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              className="table-action-button action-delete"
                              onClick={() => openDeleteModal(row)}
                              aria-label={`Eliminar a ${row.nombre} ${row.apellido}`}
                              title="Eliminar"
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
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#777",
                      }}
                    >
                      No se encontraron instructores con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="btn-page"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="pagination-info">
                  Pagina {currentPage} de {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="btn-page"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />
      <AdminLogoutModal
        isOpen={Boolean(saveConfirmationModal)}
        title={saveConfirmationModal?.title}
        description={saveConfirmationModal?.description}
        confirmLabel={saveConfirmationModal?.confirmLabel}
        cancelLabel={saveConfirmationModal?.cancelLabel}
        iconBackgroundColor={saveConfirmationModal?.iconBackgroundColor}
        zIndex={saveConfirmationModal?.zIndex}
        onCancel={() => setSaveConfirmationModal(null)}
        onConfirm={() => {
          setSaveConfirmationModal(null);
          void submitInstructorEdit();
        }}
      />
      <AdminLogoutModal
        isOpen={Boolean(feedbackModal)}
        title={feedbackModal?.title}
        description={feedbackModal?.description}
        confirmLabel={feedbackModal?.confirmLabel}
        cancelLabel={feedbackModal?.cancelLabel}
        iconBackgroundColor={feedbackModal?.iconBackgroundColor}
        showCancelButton={feedbackModal?.showCancelButton}
        zIndex={feedbackModal?.zIndex}
        onCancel={() => setFeedbackModal(null)}
        onConfirm={() => setFeedbackModal(null)}
      />

      {timedAlert ? (
        <AdminTimedAlert
          key={timedAlert.id}
          title={timedAlert.title}
          description={timedAlert.description}
          durationMs={5000}
          zIndex={2600}
          onClose={closeTimedAlert}
        />
      ) : null}

      {fichasModalData && (
        <div
          className="fichas-modal-overlay"
          onClick={() => setFichasModalData(null)}
        >
          <div
            className="fichas-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fichas-modal-header">
              <h3>Fichas a Cargo</h3>
              <button
                type="button"
                className="fichas-modal-close"
                onClick={() => setFichasModalData(null)}
              >
                x
              </button>
            </div>

            <p className="fichas-modal-subtitle">
              {fichasModalData.instructorNombre}
            </p>

            {fichasModalData.fichas.length > 0 ? (
              <div className="fichas-modal-table-wrapper">
                <table className="fichas-modal-table">
                  <thead>
                    <tr>
                      <th>Ficha</th>
                      <th>Area</th>
                      <th>Programa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichasModalData.fichas.map((item) => (
                      <tr key={`${item.ficha}-${item.programa}`}>
                        <td>{item.ficha}</td>
                        <td>{item.nombre}</td>
                        <td>{item.programa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="fichas-modal-empty">
                Este instructor no tiene Fichas a Cargo.
              </p>
            )}
          </div>
        </div>
      )}

      {viewingInstructor && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div
            className="detail-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div>
                <h2>Informacion completa del instructor</h2>
                <p>
                  Consulta los datos registrados para{" "}
                  {viewingInstructor.nombre || "este instructor"}.
                </p>
              </div>
            </div>

            <div className="instructor-modal-layout">
              <div className="instructor-modal-panel instructor-modal-panel-info">
                <div className="detail-grid">
                  {getInstructorDetailFields(viewingInstructor).map((field) => (
                    <div key={field.label} className="detail-field">
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="instructor-modal-panel instructor-modal-panel-fichas">
                <div className="detail-fichas-section">
                  <div className="detail-fichas-header">
                    <h3>Fichas a Cargo</h3>
                    <span>{viewingInstructorFichas.length}</span>
                  </div>

                  {viewingInstructorFichas.length > 0 ? (
                    <div className="fichas-modal-table-wrapper detail-fichas-table">
                      <table className="fichas-modal-table">
                        <thead>
                          <tr>
                            <th>Ficha</th>
                            <th>Area</th>
                            <th>Programa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingInstructorFichas.map((item) => (
                            <tr key={`${item.ficha}-${item.programa}`}>
                              <td>{item.ficha}</td>
                              <td>{item.nombre}</td>
                              <td>{item.programa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="fichas-modal-empty">
                      Este instructor no tiene Fichas a Cargo.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel-logout" onClick={closeViewModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingInstructor && editForm && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="edit-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div>
                <h2>Editar instructor</h2>
                <p>
                  Actualiza la informacion del instructor. El documento, el tipo
                  de documento y la fecha de registro son solo de consulta.
                </p>
              </div>
            </div>

            <form className="edit-aprendiz-form" onSubmit={handleSaveEdit}>
              <div className="instructor-modal-layout">
                <div className="instructor-modal-panel instructor-modal-panel-info">
                  <div className="edit-form-grid">
                    <label className="edit-form-field">
                      <span>Documento</span>
                      <input type="text" value={editForm.documento} disabled />
                    </label>

                    <label className="edit-form-field">
                      <span>Tipo de documento</span>
                      <input type="text" value={editForm.tipoDocumento} disabled />
                    </label>

                    <label className="edit-form-field">
                      <span>Nombre</span>
                      <input
                        type="text"
                        value={editForm.nombre}
                        onChange={(e) =>
                          handleEditFieldChange("nombre", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="edit-form-field">
                      <span>Apellido</span>
                      <input
                        type="text"
                        value={editForm.apellido}
                        onChange={(e) =>
                          handleEditFieldChange("apellido", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="edit-form-field">
                      <span>Especializacion</span>
                      <input
                        type="text"
                        value={editForm.especializacion}
                        onChange={(e) =>
                          handleEditFieldChange("especializacion", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="edit-form-field">
                      <span>Sexo</span>
                      <select
                        value={editForm.sexo}
                        onChange={(e) =>
                          handleEditFieldChange("sexo", e.target.value)
                        }
                      >
                        <option value="">Seleccione una opcion</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    </label>

                    <label className="edit-form-field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          handleEditFieldChange("email", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="edit-form-field">
                      <span>Telefono</span>
                      <input
                        type="text"
                        value={editForm.telefono}
                        onChange={(e) =>
                          handleEditFieldChange("telefono", e.target.value)
                        }
                      />
                    </label>

                    <label className="edit-form-field edit-form-field-full">
                      <span>Fecha de registro</span>
                      <input
                        type="text"
                        value={editForm.fechaInscripcion}
                        disabled
                      />
                    </label>

                    <label className="edit-form-field">
                      <span>Estado</span>
                      <select
                        value={editForm.estado}
                        onChange={(e) =>
                          handleEditFieldChange("estado", e.target.value)
                        }
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="instructor-modal-panel instructor-modal-panel-fichas">
                  <div className="detail-fichas-header">
                    <h3>Fichas a Cargo</h3>
                    <span>{editForm.fichasSeleccionadas.length}</span>
                  </div>

                  <div className="edit-fichas-search">
                    <Search size={16} className="edit-fichas-search-icon" />
                    <input
                      type="text"
                      value={editFichaSearchTerm}
                      onChange={(e) => setEditFichaSearchTerm(e.target.value)}
                      placeholder="Buscar por ficha, area o programa"
                    />
                  </div>

                  <div className="edit-fichas-selector">
                    {filteredFichasDisponibles.length > 0 ? (
                      filteredFichasDisponibles.map((ficha) => {
                        const isSelected =
                          editForm.fichasSeleccionadas.includes(ficha.numero);

                        return (
                          <label
                            key={ficha.numero}
                            className={`edit-ficha-option ${isSelected ? "selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleFichaSelectionChange(
                                  ficha.numero,
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="edit-ficha-option-content">
                              <strong>Ficha {ficha.numero}</strong>
                              <span>{ficha.nombre}</span>
                              <small>
                                {ficha.programa}
                                {ficha.estado ? ` | ${ficha.estado}` : ""}
                              </small>
                            </div>
                          </label>
                        );
                      })
                    ) : fichasDisponibles.length > 0 ? (
                      <p className="empty-chip-text">
                        No hay fichas que coincidan con la busqueda.
                      </p>
                    ) : (
                      <p className="empty-chip-text">
                        No hay fichas disponibles para asignar.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel-logout"
                  onClick={closeEditModal}
                  disabled={isSavingInstructor}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-confirm-logout"
                  disabled={isSavingInstructor}
                >
                  {isSavingInstructor ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {instructorToDelete && (
        <div
          className="modal-overlay delete-instructor-overlay"
          onClick={closeDeleteModal}
        >
          <div
            className="detail-modal-content delete-instructor-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="instructor-modal-layout">
              <div className="instructor-modal-panel instructor-modal-panel-info">
                <div className="warning-icon-container delete-warning-icon">
                  <AlertTriangle size={45} color="white" />
                </div>
                <h2 className="modal-title">Desea eliminar este instructor?</h2>
                <p className="modal-subtitle">
                  Esta accion eliminara a {instructorToDelete.nombre}{" "}
                  {instructorToDelete.apellido} del sistema.
                </p>

                <div className="delete-summary-grid">
                  {getInstructorDeleteFields(instructorToDelete).map((field) => (
                    <div key={field.label} className="detail-field">
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="instructor-modal-panel instructor-modal-panel-fichas">
                <div className="detail-fichas-header">
                  <h3>Fichas a Cargo</h3>
                  <span>{deleteInstructorFichas.length}</span>
                </div>

                {deleteInstructorFichas.length > 0 ? (
                  <div className="fichas-modal-table-wrapper detail-fichas-table">
                    <table className="fichas-modal-table">
                      <thead>
                        <tr>
                          <th>Ficha</th>
                          <th>Area</th>
                          <th>Programa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deleteInstructorFichas.map((item) => (
                          <tr key={`${item.ficha}-${item.programa}`}>
                            <td>{item.ficha}</td>
                            <td>{item.nombre}</td>
                            <td>{item.programa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="fichas-modal-empty">
                    Este instructor no tiene Fichas a Cargo.
                  </p>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-confirm-logout btn-delete-confirm"
                onClick={handleDeleteInstructor}
                disabled={isDeletingInstructor}
              >
                {isDeletingInstructor ? "Eliminando..." : "Si, eliminar"}
              </button>
              <button
                className="btn-cancel-logout"
                onClick={closeDeleteModal}
                disabled={isDeletingInstructor}
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

export default ListaInstructoresAdmin;
