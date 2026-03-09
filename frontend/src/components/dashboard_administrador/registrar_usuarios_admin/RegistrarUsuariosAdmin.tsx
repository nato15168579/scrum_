/**
 * Registro administrativo de usuarios y manejo de importacion masiva.
 *
 * Este archivo combina dos flujos manuales (instructor y aprendiz) con un
 * tercer flujo mas complejo de importacion desde Excel. La dificultad principal
 * esta en reconciliar datos incompletos de fichas antes de insertar usuarios y
 * mantener sincronizados formularios, modales y catalogos del backend.
 */
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { API_URL } from "../../../config/Api";
import { resolveUserName } from "../../../utils/session";
import "../AdminDashboard.css";
import "./RegistrarUsuariosAdmin.css";
import AdminLogoutModal from "../shared/AdminLogoutModal";
import AdminProfileMenu from "../shared/AdminProfileMenu";
import AdminSidebar from "../shared/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "../shared/adminSession";
import { useClickOutside } from "../shared/useClickOutside";

type RegisterMode = "instructor" | "aprendiz";

interface FichaOption {
  numero: string;
  nombre: string;
  programa: string;
  estado: string;
}

interface FichaCatalogOptions {
  areas: string[];
  programas: string[];
  areasByPrograma: Record<string, string[]>;
}

interface InstructorFormState {
  documento: string;
  tipoDocumento: string;
  nombre: string;
  apellido: string;
  ficha: string;
  especializacion: string;
  telefono: string;
  correo: string;
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
}

type ImportedUserType = "aprendiz" | "instructor";

interface ImportUserRow {
  documento: string;
  tipoDocumento: string;
  ficha: string;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  email: string;
  especializacion: string;
  tipoUsuario: ImportedUserType;
}

interface SkippedImportRow {
  fila: number;
  motivo: string;
}

interface MissingFichaDraft {
  numero: string;
  nombre: string;
  programa: string;
  estado: "Activa" | "Inactiva";
  manualEntry: boolean;
}

interface PendingImportState {
  fileName: string;
  usuarios: ImportUserRow[];
  skippedRows: SkippedImportRow[];
  missingFichas: MissingFichaDraft[];
}

interface ImportedUserSummary {
  documento: string;
  tipoUsuario: ImportedUserType;
  nombre: string;
  apellido: string;
  ficha: string;
  email: string;
  detalle: string;
  passwordTemporal: string;
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
  ficha: "",
  especializacion: "",
  telefono: "",
  correo: "",
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
};

const IMPORT_REQUIRED_HEADERS = [
  "DOCUMENTO",
  "TIPO DE DOCUMENTO",
  "FICHA",
  "NOMBRE",
  "APELLIDO",
  "SEXO",
  "TELEFONO",
  "EMAIL",
  "TIPO DE USUARIO",
];

// ---------------------------------------------------------------------------
// Helpers de normalizacion para formularios e importacion XLSX
// ---------------------------------------------------------------------------

const normalizeTextValue = (value: unknown) =>
  String(value ?? "").trim();

const normalizeExcelHeader = (value: unknown) =>
  normalizeTextValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const normalizeSexoValue = (value: unknown) => {
  const normalized = normalizeTextValue(value).toLowerCase();

  if (normalized === "hombre") return "Hombre";
  if (normalized === "mujer") return "Mujer";

  return "";
};

const normalizeImportedUserType = (value: unknown): ImportedUserType | null => {
  const normalized = normalizeExcelHeader(value);

  if (normalized === "APRENDIZ") return "aprendiz";
  if (normalized === "INSTRUCTOR") return "instructor";

  return null;
};

const isFichaNameIncomplete = (value: unknown) => {
  const normalized = normalizeTextValue(value).toLowerCase();
  return !normalized || normalized === "sin area" || normalized === "sin nombre";
};

const isFichaProgramIncomplete = (value: unknown) => {
  const normalized = normalizeTextValue(value).toLowerCase();
  return !normalized || normalized === "sin programa";
};

const buildDefaultPassword = (name: string) => {
  const firstName = normalizeTextValue(name)
    .split(/\s+/)
    .find(Boolean)
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

  return `${firstName || "usuario"}123`;
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

const buildFichaCatalogOptions = (payload: unknown): FichaCatalogOptions => ({
  areas:
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { areas?: unknown }).areas)
      ? (payload as { areas: unknown[] }).areas.map((item) => String(item || ""))
      : [],
  programas:
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { programas?: unknown }).programas)
      ? (payload as { programas: unknown[] }).programas.map((item) =>
          String(item || ""),
        )
      : [],
  areasByPrograma:
    payload &&
    typeof payload === "object" &&
    (payload as { areasByPrograma?: unknown }).areasByPrograma &&
    typeof (payload as { areasByPrograma?: unknown }).areasByPrograma === "object"
      ? Object.fromEntries(
          Object.entries(
            (payload as { areasByPrograma: Record<string, unknown> }).areasByPrograma,
          ).map(([programa, areas]) => [
            programa,
            Array.isArray(areas)
              ? areas.map((item) => String(item || ""))
              : [],
          ]),
        )
      : {},
});

const RegistrarUsuariosAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [adminName, setAdminName] = useState(() =>
    resolveUserName(undefined, "Usuario"),
  );
  const [mode, setMode] = useState<RegisterMode>("instructor");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pendingSuccessFeedback, setPendingSuccessFeedback] =
    useState<FeedbackState | null>(null);
  const [stats, setStats] = useState({ instructores: 0, aprendices: 0 });
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [fichaCatalogOptions, setFichaCatalogOptions] =
    useState<FichaCatalogOptions>({ areas: [], programas: [], areasByPrograma: {} });
  const [pendingImport, setPendingImport] = useState<PendingImportState | null>(
    null,
  );
  const [pendingImportError, setPendingImportError] = useState<string | null>(
    null,
  );
  const [importedUsersPreview, setImportedUsersPreview] = useState<
    ImportedUserSummary[]
  >([]);
  const [instructorForm, setInstructorForm] = useState<InstructorFormState>(
    INITIAL_INSTRUCTOR_FORM,
  );
  const [aprendizForm, setAprendizForm] = useState<AprendizFormState>(
    INITIAL_APRENDIZ_FORM,
  );

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  useEffect(() => {
    const cedula = requireAdminAccess(navigate);
    if (!cedula) {
      return;
    }

    // Este bootstrap carga todo lo necesario para registro manual e importacion:
    // listados existentes, fichas actuales y catalogos derivados del backend.
    const loadData = async () => {
      try {
        const [
          dashboardResponse,
          aprendicesResponse,
          instructoresResponse,
          fichasResponse,
          fichaOptionsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
          fetch(`${API_URL}/aprendices?cedula=${cedula}`),
          fetch(`${API_URL}/instructores?cedula=${cedula}`),
          fetch(`${API_URL}/fichas`),
          fetch(`${API_URL}/fichas/options`),
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
        const fichaOptionsData = fichaOptionsResponse.ok
          ? await fichaOptionsResponse.json()
          : null;

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
        setFichaCatalogOptions(buildFichaCatalogOptions(fichaOptionsData));
      } catch (error) {
        console.error("Error cargando datos de registro:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const fichasActivas = useMemo(
    () => fichas.filter((item) => item.estado === "Activa"),
    [fichas],
  );

  const fichaSeleccionada = useMemo(
    () => fichasActivas.find((item) => item.numero === aprendizForm.ficha) || null,
    [aprendizForm.ficha, fichasActivas],
  );

  const instructorFichaSeleccionada = useMemo(
    () => fichasActivas.find((item) => item.numero === instructorForm.ficha) || null,
    [instructorForm.ficha, fichasActivas],
  );

  const instructorDefaultPassword = useMemo(
    () => buildDefaultPassword(instructorForm.nombre),
    [instructorForm.nombre],
  );

  const aprendizDefaultPassword = useMemo(
    () => buildDefaultPassword(aprendizForm.nombre),
    [aprendizForm.nombre],
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

  const buildPendingFichaDrafts = (
    fichaEntries: Array<
      | string
      | {
          numero?: string | number;
          nombre?: string;
          programa?: string;
          estado?: string;
        }
    >,
  ): MissingFichaDraft[] => {
    const existingFichasMap = new Map(fichas.map((item) => [item.numero, item]));

    return Array.from(
      new Map(
        fichaEntries
          .map((item) => {
            const numero =
              typeof item === "string" ? item : String(item?.numero || "").trim();
            if (!numero) return null;

            const existingFicha = existingFichasMap.get(numero);
            const nombre =
              typeof item === "object" && item !== null && normalizeTextValue(item.nombre)
                ? normalizeTextValue(item.nombre)
                : existingFicha && !isFichaNameIncomplete(existingFicha.nombre)
                  ? existingFicha.nombre
                  : "";
            const programa =
              typeof item === "object" &&
              item !== null &&
              normalizeTextValue(item.programa)
                ? normalizeTextValue(item.programa)
                : existingFicha && !isFichaProgramIncomplete(existingFicha.programa)
                  ? existingFicha.programa
                  : "";
            const estado =
              (typeof item === "object" && item !== null
                ? normalizeTextValue(item.estado)
                : "") ||
              normalizeTextValue(existingFicha?.estado) ||
              "Activa";

            return [
              numero,
              {
                numero,
                nombre,
                programa,
                estado: estado === "Inactiva" ? "Inactiva" : "Activa",
                manualEntry: false,
              },
            ] as const;
          })
          .filter(Boolean) as Array<readonly [string, MissingFichaDraft]>,
      ).values(),
    ).sort((a, b) => Number(a.numero) - Number(b.numero));
  };

  const loadFichaCatalogOptions = async () => {
    // El catalogo se consulta aparte porque puede refrescarse despues de crear
    // fichas faltantes sin recargar toda la pagina.
    try {
      const response = await fetch(`${API_URL}/fichas/options`);
      if (!response.ok) {
        return;
      }

      const payload = await response.json().catch(() => null);
      setFichaCatalogOptions(buildFichaCatalogOptions(payload));
    } catch (error) {
      console.error("Error cargando opciones de fichas:", error);
    }
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
    setInstructorForm((prev) => {
      if (name !== "ficha") {
        return { ...prev, [name]: value };
      }

      const programaAnterior =
        fichasActivas.find((item) => item.numero === prev.ficha)?.programa || "";
      const programaActual =
        fichasActivas.find((item) => item.numero === value)?.programa || "";
      const shouldSyncEspecializacion =
        !prev.especializacion.trim() || prev.especializacion === programaAnterior;

      return {
        ...prev,
        ficha: value,
        ...(shouldSyncEspecializacion
          ? { especializacion: programaActual }
          : {}),
      };
    });
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

  const buildImportErrorMessage = (payload: unknown, fallback: string) => {
    const baseMessage = extractErrorMessage(payload, fallback);
    const importErrors = Array.isArray(
      (payload as { errors?: unknown } | null)?.errors,
    )
      ? ((payload as {
          errors: Array<{ fila?: number; documento?: string; message?: string }>;
        }).errors || [])
      : [];

    if (importErrors.length === 0) {
      return baseMessage;
    }

    const details = importErrors
      .slice(0, 3)
      .map((item) => {
        const rowLabel = item?.fila ? `Fila ${item.fila}` : "Fila";
        const docLabel = item?.documento ? ` (${item.documento})` : "";
        return `${rowLabel}${docLabel}: ${item?.message || "Error desconocido."}`;
      })
      .join(" ");

    return `${baseMessage} ${details}`.trim();
  };

  const buildImportedUsersPreview = async (
    creadosDetalle: Array<{
      documento?: string;
      nombre?: string;
      tipoUsuario?: ImportedUserType;
      passwordTemporal?: string;
    }>,
    usuarios: ImportUserRow[],
  ): Promise<ImportedUserSummary[]> => {
    const uniqueCreatedDetails = Array.from(
      new Map(
        creadosDetalle
          .filter((item) => item?.documento && item?.tipoUsuario)
          .map((item) => [String(item.documento), item]),
      ).values(),
    );

    const importedDocs = new Set(
      uniqueCreatedDetails.map((item) => String(item.documento)),
    );

    if (importedDocs.size === 0) {
      return [];
    }

    const buildFallbackPreview = () =>
      uniqueCreatedDetails
        .map((item) => {
          const documento = String(item.documento || "");
          const sourceRow = usuarios.find(
            (usuario) => String(usuario.documento) === documento,
          );
          const fichaInfo = sourceRow?.ficha
            ? fichas.find((ficha) => ficha.numero === sourceRow.ficha)
            : null;
          const tipoUsuario = item.tipoUsuario || sourceRow?.tipoUsuario || "aprendiz";
          const detalle =
            tipoUsuario === "instructor"
              ? sourceRow?.especializacion ||
                fichaInfo?.programa ||
                "Sin especializacion"
              : fichaInfo?.programa || "Sin programa";

          return {
            documento,
            tipoUsuario,
            nombre: sourceRow?.nombre || String(item.nombre || ""),
            apellido: sourceRow?.apellido || "",
            ficha: sourceRow?.ficha || "",
            email: sourceRow?.email || "Sin email",
            detalle,
            passwordTemporal:
              item.passwordTemporal ||
              buildDefaultPassword(sourceRow?.nombre || String(item.nombre || "")),
          };
        });

    const fallbackPreview = buildFallbackPreview();

    const cedulaAdmin = localStorage.getItem("userCedula");
    if (!cedulaAdmin) {
      return fallbackPreview;
    }

    try {
      const [aprendicesResponse, instructoresResponse] = await Promise.all([
        fetch(`${API_URL}/aprendices?cedula=${cedulaAdmin}`),
        fetch(`${API_URL}/instructores?cedula=${cedulaAdmin}`),
      ]);

      if (!aprendicesResponse.ok && !instructoresResponse.ok) {
        return fallbackPreview;
      }

      const [aprendicesPayload, instructoresPayload] = await Promise.all([
        aprendicesResponse.ok
          ? aprendicesResponse.json().catch(() => [])
          : Promise.resolve([]),
        instructoresResponse.ok
          ? instructoresResponse.json().catch(() => [])
          : Promise.resolve([]),
      ]);

      const aprendizMap = new Map(
        (Array.isArray(aprendicesPayload) ? aprendicesPayload : [])
          .filter((item) => importedDocs.has(String(item?.documento || "")))
          .map((item) => [
            String(item?.documento || ""),
            {
              nombre: String(item?.nombre || ""),
              apellido: String(item?.apellido || ""),
              ficha: String(item?.ficha || ""),
              email: String(item?.email || "Sin email"),
              detalle: String(item?.programa || "Sin programa"),
            },
          ]),
      );

      const instructorMap = new Map(
        (Array.isArray(instructoresPayload) ? instructoresPayload : [])
          .filter((item) => importedDocs.has(String(item?.documento || "")))
          .map((item) => {
            const fichasCargo = Array.isArray(item?.fichasCargo)
              ? item.fichasCargo
              : [];

            return [
              String(item?.documento || ""),
              {
                nombre: String(item?.nombre || ""),
                apellido: String(item?.apellido || ""),
                ficha: fichasCargo
                  .map((ficha: unknown) => String(ficha || ""))
                  .filter(Boolean)
                  .join(", "),
                email: String(item?.email || "Sin email"),
                detalle: String(
                  item?.especializacion || item?.programa || "Sin especializacion",
                ),
              },
            ];
          }),
      );

      return uniqueCreatedDetails
        .map((item) => {
          const documento = String(item.documento || "");
          const sourceRow = usuarios.find(
            (usuario) => String(usuario.documento) === documento,
          );
          const fallbackItem = fallbackPreview.find(
            (previewItem) => previewItem.documento === documento,
          );
          const serverItem =
            item.tipoUsuario === "instructor"
              ? instructorMap.get(documento)
              : aprendizMap.get(documento);

          return {
            documento,
            tipoUsuario: item.tipoUsuario || sourceRow?.tipoUsuario || "aprendiz",
            nombre:
              serverItem?.nombre ||
              fallbackItem?.nombre ||
              sourceRow?.nombre ||
              String(item.nombre || ""),
            apellido:
              serverItem?.apellido || fallbackItem?.apellido || sourceRow?.apellido || "",
            ficha: serverItem?.ficha || fallbackItem?.ficha || sourceRow?.ficha || "",
            email: serverItem?.email || fallbackItem?.email || sourceRow?.email || "Sin email",
            detalle: serverItem?.detalle || fallbackItem?.detalle || "Sin detalle",
            passwordTemporal:
              item.passwordTemporal ||
              fallbackItem?.passwordTemporal ||
              buildDefaultPassword(sourceRow?.nombre || String(item.nombre || "")),
          };
        });
    } catch (error) {
      console.error("Error cargando usuarios importados:", error);
      return fallbackPreview;
    }
  };

  const submitImportedUsers = async (
    usuarios: ImportUserRow[],
    skippedRows: SkippedImportRow[],
    fileName: string,
  ) => {
    if (usuarios.length === 0) {
      setFeedback({
        type: "error",
        title: "Archivo sin usuarios",
        message:
          "El archivo no contiene filas de usuarios listas para importar.",
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch(`${API_URL}/users/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarios }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (
          payload &&
          typeof payload === "object" &&
          (payload as { code?: string }).code === "MISSING_FICHAS" &&
          Array.isArray((payload as { missingFichas?: unknown }).missingFichas)
        ) {
          const missingFichas = buildPendingFichaDrafts(
            (payload as {
              missingFichas: Array<
                | string
                | {
                    numero?: string | number;
                    nombre?: string;
                    programa?: string;
                    estado?: string;
                  }
              >;
            }).missingFichas || [],
          );

          setPendingImportError(null);
          setPendingImport({
            fileName,
            usuarios,
            skippedRows,
            missingFichas,
          });
          return;
        }

        throw new Error(
          buildImportErrorMessage(
            payload,
            "No fue posible importar el archivo de usuarios.",
          ),
        );
      }

      const creados = Number((payload as { creados?: number })?.creados || 0);
      const fallidos = Number((payload as { fallidos?: number })?.fallidos || 0);
      const errores = Array.isArray(
        (payload as { errores?: unknown } | null)?.errores,
      )
        ? ((payload as {
            errores: Array<{
              fila?: number;
              documento?: string;
              tipoUsuario?: string;
              message?: string;
            }>;
          }).errores || [])
        : [];

      const creadosDetalle = Array.isArray(
        (payload as { creadosDetalle?: unknown } | null)?.creadosDetalle,
      )
        ? ((payload as {
            creadosDetalle: Array<{ tipoUsuario?: ImportedUserType }>;
          }).creadosDetalle || [])
        : [];

      const documentosCreados = new Set(
        creadosDetalle
          .map((item) =>
            typeof item === "object" && item !== null && "documento" in item
              ? String((item as { documento?: unknown }).documento || "")
              : "",
          )
          .filter(Boolean),
      );
      const instructoresCreados = new Set(
        creadosDetalle
          .filter((item) => item?.tipoUsuario === "instructor")
          .map((item) =>
            typeof item === "object" && item !== null && "documento" in item
              ? String((item as { documento?: unknown }).documento || "")
              : "",
          )
          .filter(Boolean),
      ).size;
      const aprendicesCreados = new Set(
        creadosDetalle
          .filter((item) => item?.tipoUsuario === "aprendiz")
          .map((item) =>
            typeof item === "object" && item !== null && "documento" in item
              ? String((item as { documento?: unknown }).documento || "")
              : "",
          )
          .filter(Boolean),
      ).size;

      setStats((prev) => ({
        ...prev,
        instructores: prev.instructores + instructoresCreados,
        aprendices: prev.aprendices + aprendicesCreados,
      }));

      const summary = [
        `Archivo procesado: ${fileName}.`,
        `${documentosCreados.size} usuarios registrados.`,
        instructoresCreados > 0
          ? `${instructoresCreados} instructores creados.`
          : "",
        aprendicesCreados > 0
          ? `${aprendicesCreados} aprendices creados.`
          : "",
        fallidos > 0 ? `${fallidos} filas no se pudieron importar.` : "",
        errores.length > 0
          ? errores
              .slice(0, 3)
              .map((item) => {
                const rowLabel = item?.fila ? `Fila ${item.fila}` : "Fila";
                const docLabel = item?.documento ? ` (${item.documento})` : "";
                return `${rowLabel}${docLabel}: ${item?.message || "Error desconocido."}`;
              })
              .join(" ")
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      const nextFeedback: FeedbackState = {
        type: creados > 0 ? "success" : "error",
        title:
          fallidos > 0 || skippedRows.length > 0
            ? "Importacion con novedades"
            : "Importacion completada",
        message: summary,
      };

      const importedUsers = await buildImportedUsersPreview(
        creadosDetalle.map((item) => ({
          documento:
            typeof item === "object" && item !== null && "documento" in item
              ? String((item as { documento?: unknown }).documento || "")
              : "",
          nombre:
            typeof item === "object" && item !== null && "nombre" in item
              ? String((item as { nombre?: unknown }).nombre || "")
              : "",
          tipoUsuario:
            typeof item === "object" && item !== null && "tipoUsuario" in item
              ? ((item as { tipoUsuario?: ImportedUserType }).tipoUsuario ??
                undefined)
              : undefined,
          passwordTemporal:
            typeof item === "object" && item !== null && "passwordTemporal" in item
              ? String(
                  (item as { passwordTemporal?: unknown }).passwordTemporal || "",
                )
              : "",
        })),
        usuarios,
      );

      if (importedUsers.length > 0) {
        setImportedUsersPreview(importedUsers);
        setPendingSuccessFeedback(nextFeedback);
      } else {
        setFeedback(nextFeedback);
      }
    } catch (error) {
      console.error("Error importando usuarios:", error);
      setFeedback({
        type: "error",
        title: "Importacion fallida",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible importar el archivo de usuarios.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    // La importacion no inserta directo. Primero valida encabezados, normaliza
    // filas y detecta fichas faltantes para que el admin confirme el contexto.
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("El archivo no contiene hojas para procesar.");
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
        header: 1,
        defval: "",
      });

      if (rows.length < 2) {
        throw new Error("El archivo debe tener una fila de encabezados y datos.");
      }

      const headers = (rows[0] || []).map((header) =>
        normalizeExcelHeader(header),
      );
      const missingHeaders = IMPORT_REQUIRED_HEADERS.filter(
        (header) => !headers.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `El archivo no cumple el formato esperado. Faltan columnas: ${missingHeaders.join(", ")}.`,
        );
      }

      const headerIndex = (header: string) => headers.indexOf(header);
      const parsedUsers: ImportUserRow[] = [];
      const invalidTypeRows: SkippedImportRow[] = [];

      rows.slice(1).forEach((row, index) => {
        const rowValues = Array.isArray(row) ? row : [];
        const rowNumber = index + 2;
        const hasContent = rowValues.some((cell) => normalizeTextValue(cell));

        if (!hasContent) {
          return;
        }

        const tipoUsuario = normalizeImportedUserType(
          rowValues[headerIndex("TIPO DE USUARIO")],
        );

        if (!tipoUsuario) {
          invalidTypeRows.push({
            fila: rowNumber,
            motivo: `Tipo de usuario invalido: ${normalizeTextValue(
              rowValues[headerIndex("TIPO DE USUARIO")],
            )}.`,
          });
          return;
        }

        parsedUsers.push({
          documento: normalizeTextValue(rowValues[headerIndex("DOCUMENTO")]),
          tipoDocumento:
            normalizeExcelHeader(
              rowValues[headerIndex("TIPO DE DOCUMENTO")],
            ) || "CC",
          ficha: normalizeTextValue(rowValues[headerIndex("FICHA")]),
          nombre: normalizeTextValue(rowValues[headerIndex("NOMBRE")]),
          apellido: normalizeTextValue(rowValues[headerIndex("APELLIDO")]),
          sexo: normalizeSexoValue(rowValues[headerIndex("SEXO")]),
          telefono: normalizeTextValue(rowValues[headerIndex("TELEFONO")]),
          email: normalizeTextValue(rowValues[headerIndex("EMAIL")]),
          especializacion: "",
          tipoUsuario,
        });
      });

      if (invalidTypeRows.length > 0) {
        throw new Error(
          invalidTypeRows
            .slice(0, 3)
            .map((item) => `Fila ${item.fila}: ${item.motivo}`)
            .join(" "),
        );
      }

      if (parsedUsers.length === 0) {
        throw new Error(
          "El archivo no contiene filas de usuarios listas para importar.",
        );
      }

      const existingFichaMap = new Map(fichas.map((item) => [item.numero, item]));
      const pendingFichas = buildPendingFichaDrafts(
        Array.from(
          new Set(
            parsedUsers
              .map((item) => item.ficha)
              .filter(Boolean)
              .filter((numero) => {
                const ficha = existingFichaMap.get(numero);

                return (
                  !ficha ||
                  isFichaNameIncomplete(ficha.nombre) ||
                  isFichaProgramIncomplete(ficha.programa)
                );
              }),
          ),
        ),
      );

      if (pendingFichas.length > 0) {
        setPendingImportError(null);
        setPendingImport({
          fileName: file.name,
          usuarios: parsedUsers,
          skippedRows: [],
          missingFichas: pendingFichas,
        });
        return;
      }

      await submitImportedUsers(parsedUsers, [], file.name);
    } catch (error) {
      console.error("Error leyendo archivo de importacion:", error);
      setFeedback({
        type: "error",
        title: "Archivo invalido",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible leer el archivo seleccionado.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleMissingFichaChange = (
    index: number,
    field: "nombre" | "programa" | "estado" | "manualEntry",
    value: string | boolean,
  ) => {
    setPendingImportError(null);
    setPendingImport((prev) =>
      prev
        ? {
            ...prev,
            missingFichas: prev.missingFichas.map((item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item,
            ),
          }
        : prev,
    );
  };

  const handleMissingFichaProgramChange = (index: number, value: string) => {
    setPendingImportError(null);
    setPendingImport((prev) =>
      prev
        ? {
            ...prev,
            missingFichas: prev.missingFichas.map((item, itemIndex) => {
              if (itemIndex !== index) {
                return item;
              }

              if (item.manualEntry) {
                return { ...item, programa: value };
              }

              const validAreas = fichaCatalogOptions.areasByPrograma[value] || [];
              const nombre = validAreas.includes(item.nombre) ? item.nombre : "";

              return {
                ...item,
                programa: value,
                nombre,
              };
            }),
          }
        : prev,
    );
  };

  const toggleMissingFichaManualEntry = (index: number) => {
    setPendingImportError(null);
    setPendingImport((prev) =>
      prev
        ? {
            ...prev,
            missingFichas: prev.missingFichas.map((item, itemIndex) => {
              if (itemIndex !== index) {
                return item;
              }

              if (item.manualEntry) {
                const validAreas =
                  fichaCatalogOptions.areasByPrograma[item.programa] || [];

                return {
                  ...item,
                  manualEntry: false,
                  nombre: validAreas.includes(item.nombre) ? item.nombre : "",
                };
              }

              return {
                ...item,
                manualEntry: true,
              };
            }),
          }
        : prev,
    );
  };

  const handleCreateMissingFichas = async () => {
    if (!pendingImport) return;

    // Este paso cierra la brecha entre el archivo importado y la DB real:
    // primero crea fichas faltantes y luego dispara la importacion pendiente.
    const hasIncompleteFicha = pendingImport.missingFichas.some(
      (item) => !item.nombre.trim() || !item.programa.trim(),
    );

    if (hasIncompleteFicha) {
      setPendingImportError(
        "Completa el area y el programa de todas las fichas faltantes antes de continuar.",
      );
      return;
    }

    setPendingImportError(null);
    setIsImporting(true);

    try {
      const createdFichas = await Promise.all(
        pendingImport.missingFichas.map(async (item) => {
          const response = await fetch(`${API_URL}/fichas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              numero: item.numero,
              nombre: item.nombre.trim(),
              programa: item.programa.trim(),
              estado: item.estado,
              allowCustomCatalogValues: item.manualEntry,
            }),
          });

          const payload = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              extractErrorMessage(
                payload,
                `No fue posible registrar la ficha ${item.numero}.`,
              ),
            );
          }

          return {
            numero: item.numero,
            nombre: item.nombre.trim(),
            programa: item.programa.trim(),
            estado: item.estado,
          };
        }),
      );

      setFichas((prev) => {
        const next = [...prev];

        createdFichas.forEach((item) => {
          const existingIndex = next.findIndex(
            (existing) => existing.numero === item.numero,
          );

          if (existingIndex >= 0) {
            next[existingIndex] = item;
            return;
          }

          next.push(item);
        });

        return next;
      });
      await loadFichaCatalogOptions();

      const importData = pendingImport;
      setPendingImport(null);
      await submitImportedUsers(
        importData.usuarios,
        importData.skippedRows,
        importData.fileName,
      );
    } catch (error) {
      console.error("Error registrando fichas faltantes:", error);
      setPendingImportError(
        error instanceof Error
          ? error.message
          : "No fue posible registrar las fichas faltantes.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseImportedPreview = () => {
    setImportedUsersPreview([]);

    if (pendingSuccessFeedback) {
      setFeedback(pendingSuccessFeedback);
      setPendingSuccessFeedback(null);
    }
  };

  const submitInstructor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // El formulario manual de instructor comparte el mismo endpoint de creacion
    // que la importacion para evitar reglas de negocio duplicadas.
    if (
      !instructorForm.documento.trim() ||
      !instructorForm.nombre.trim() ||
      !instructorForm.apellido.trim() ||
      !instructorForm.ficha.trim() ||
      !instructorForm.especializacion.trim() ||
      !instructorForm.telefono.trim() ||
      !instructorForm.correo.trim()
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
          ficha: instructorForm.ficha,
          especializacion: instructorForm.especializacion,
          telefono: instructorForm.telefono,
          correo: instructorForm.correo,
          password: instructorDefaultPassword,
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
        message: `La cuenta del instructor fue creada correctamente. Clave inicial: ${instructorDefaultPassword}`,
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

    // El flujo manual de aprendiz exige programa derivado de la ficha para que
    // el admin vea en pantalla exactamente lo que se va a persistir.
    if (
      !aprendizForm.documento.trim() ||
      !aprendizForm.nombre.trim() ||
      !aprendizForm.apellido.trim() ||
      !aprendizForm.ficha.trim()
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
          password: aprendizDefaultPassword,
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
        message: `La cuenta del aprendiz fue creada correctamente. Clave inicial: ${aprendizDefaultPassword}`,
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
        <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>Registrar usuarios</h1>
          </div>
          <AdminProfileMenu
            displayName={adminName}
            isOpen={isMenuOpen}
            menuRef={menuRef}
            onToggle={() => setIsMenuOpen((current) => !current)}
            onLogout={() => {
              setIsMenuOpen(false);
              setShowLogoutModal(true);
            }}
            showProfileItem
          />
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
            <div className="register-users-card-actions">
              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="register-users-file-input"
                onChange={handleImportFileChange}
              />
              <button
                type="button"
                className="register-users-import-button"
                onClick={() => importInputRef.current?.click()}
                disabled={isImporting || isSubmitting}
              >
                <FileSpreadsheet size={18} />
                <span>
                  {isImporting ? "Procesando archivo..." : "Importar usuarios"}
                </span>
              </button>
              <div className="register-users-chip">
                <UserPlus size={16} />
                <span>{mode === "instructor" ? "Instructor" : "Aprendiz"}</span>
              </div>
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
                  <span>Ficha a cargo</span>
                  <select
                    name="ficha"
                    value={instructorForm.ficha}
                    onChange={handleInstructorChange}
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
                  <span>Programa de la ficha</span>
                  <input
                    type="text"
                    value={instructorFichaSeleccionada?.programa || ""}
                    readOnly
                    placeholder="Se completa al elegir ficha"
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
                  <span>Contrasena inicial</span>
                  <input
                    type="text"
                    value={instructorDefaultPassword}
                    readOnly
                  />
                </label>
              </div>

              <p className="register-users-form-hint">
                La clave inicial se genera automaticamente con el primer nombre
                del usuario y `123`.
              </p>

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
                  <span>Contrasena inicial</span>
                  <input
                    type="text"
                    value={aprendizDefaultPassword}
                    readOnly
                  />
                </label>
              </div>

              {fichaSeleccionada && (
                <p className="register-users-form-hint">
                  Area asociada: <strong>{fichaSeleccionada.nombre}</strong>
                </p>
              )}

              <p className="register-users-form-hint register-users-form-hint-secondary">
                Importa el archivo `.xlsx` y el sistema detectara si cada fila es
                `aprendiz` o `instructor`. La clave inicial se genera como
                `primernombre123`.
              </p>

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

      {pendingImport && (
        <div className="register-users-modal-overlay">
          <div className="register-users-modal-card register-users-missing-fichas-card">
            <h2>Fichas pendientes por completar</h2>
            <p>
              El archivo <strong>{pendingImport.fileName}</strong> incluye fichas
              que no existen o estan incompletas en la base de datos. Completa
              su area y programa para continuar con la importacion automatica de
              usuarios.
            </p>
            <p className="register-users-modal-inline-note">
              Primero selecciona el programa. Luego el sistema filtrara las
              areas asociadas a ese programa. Si no existe la opcion correcta,
              puedes agregarla manualmente.
            </p>

            <div className="register-users-missing-fichas-list">
              {pendingImport.missingFichas.map((item, index) => {
                const areaOptions = item.programa
                  ? fichaCatalogOptions.areasByPrograma[item.programa] || []
                  : [];

                return (
                  <div
                    key={item.numero}
                    className="register-users-missing-ficha-item"
                  >
                    <strong>Ficha {item.numero}</strong>

                    <label className="register-users-field">
                      <span>Programa</span>
                      {item.manualEntry || fichaCatalogOptions.programas.length === 0 ? (
                        <input
                          type="text"
                          value={item.programa}
                          onChange={(event) =>
                            handleMissingFichaProgramChange(
                              index,
                              event.target.value,
                            )
                          }
                          placeholder="Ej: SISTEMAS"
                        />
                      ) : (
                        <select
                          value={item.programa}
                          onChange={(event) =>
                            handleMissingFichaProgramChange(
                              index,
                              event.target.value,
                            )
                          }
                        >
                          <option value="">Selecciona un programa</option>
                          {fichaCatalogOptions.programas.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>

                    <label className="register-users-field">
                      <span>Area</span>
                      {item.manualEntry || fichaCatalogOptions.areas.length === 0 ? (
                        <input
                          type="text"
                          value={item.nombre}
                          onChange={(event) =>
                            handleMissingFichaChange(
                              index,
                              "nombre",
                              event.target.value,
                            )
                          }
                          placeholder="Ej: ADSO"
                        />
                      ) : (
                        <select
                          value={item.nombre}
                          onChange={(event) =>
                            handleMissingFichaChange(
                              index,
                              "nombre",
                              event.target.value,
                            )
                          }
                          disabled={!item.programa}
                        >
                          <option value="">
                            {item.programa
                              ? "Selecciona un area"
                              : "Selecciona primero un programa"}
                          </option>
                          {areaOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>

                    {!item.manualEntry && item.programa && areaOptions.length === 0 && (
                      <p className="register-users-modal-inline-note">
                        No hay areas registradas para este programa. Usa la
                        opcion manual para crear una nueva.
                      </p>
                    )}

                    <button
                      type="button"
                      className="register-users-modal-button secondary"
                      onClick={() => toggleMissingFichaManualEntry(index)}
                    >
                      {item.manualEntry
                        ? "Usar opciones existentes"
                        : "Agregar manualmente"}
                    </button>
                  </div>
                );
              })}
            </div>

            {pendingImportError && (
              <p className="register-users-modal-inline-note register-users-modal-inline-error">
                {pendingImportError}
              </p>
            )}
            <div className="register-users-modal-actions">
              <button
                type="button"
                className="register-users-modal-button secondary"
                onClick={() => {
                  setPendingImport(null);
                  setPendingImportError(null);
                }}
                disabled={isImporting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="register-users-modal-button"
                onClick={handleCreateMissingFichas}
                disabled={isImporting}
              >
                {isImporting
                  ? "Guardando fichas..."
                  : "Guardar fichas e importar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {importedUsersPreview.length > 0 && (
        <div className="register-users-modal-overlay">
          <div className="register-users-modal-card register-users-imported-list-card">
            <h2>Usuarios agregados</h2>
            <p>
              Estos usuarios ya quedaron registrados en la base de datos.
            </p>

            <div className="register-users-imported-table-wrapper">
              <table className="register-users-imported-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Ficha</th>
                    <th>Programa / Especializacion</th>
                    <th>Email</th>
                    <th>Clave inicial</th>
                  </tr>
                </thead>
                <tbody>
                  {importedUsersPreview.map((item) => (
                    <tr key={`${item.tipoUsuario}-${item.documento}`}>
                      <td>
                        <span
                          className={`register-users-user-type-badge ${item.tipoUsuario}`}
                        >
                          {item.tipoUsuario === "instructor"
                            ? "Instructor"
                            : "Aprendiz"}
                        </span>
                      </td>
                      <td>{item.documento}</td>
                      <td>{item.nombre}</td>
                      <td>{item.apellido}</td>
                      <td>{item.ficha || "Sin ficha"}</td>
                      <td>{item.detalle}</td>
                      <td>{item.email || "Sin email"}</td>
                      <td>{item.passwordTemporal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="register-users-modal-actions">
              <button
                type="button"
                className="register-users-modal-button"
                onClick={handleCloseImportedPreview}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminLogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => logoutAndRedirect(navigate)}
      />
    </div>
  );
};

export default RegistrarUsuariosAdmin;
