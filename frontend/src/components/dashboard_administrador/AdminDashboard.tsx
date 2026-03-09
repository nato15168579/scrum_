/**
 * Pantalla principal del administrador.
 *
 * Responsabilidades:
 * - valida la sesion del rol administrador
 * - carga resumen general, aprendices e instructores
 * - transforma fechas de registro en series para el grafico
 * - reutiliza el shell comun del panel admin
 *
 * Los helpers de fechas se mantienen en este archivo porque solo alimentan la
 * visualizacion del dashboard y comparten las mismas reglas de agregacion.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PenTool,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminDashboard.css";
import { API_URL } from "../../config/Api";
import AdminLogoutModal from "./shared/AdminLogoutModal";
import AdminProfileMenu from "./shared/AdminProfileMenu";
import AdminSidebar from "./shared/AdminSidebar";
import { logoutAndRedirect, requireAdminAccess } from "./shared/adminSession";

interface Stat {
  label: string;
  value: number;
}

interface Aprendiz {
  documento: string;
  ficha: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string;
  fechaRegistro?: string;
  fecha_registro?: string;
  createdAt?: string;
  created_at?: string;
  fecha?: string;
}

interface Instructor {
  documento: string;
  ficha: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaInscripcion?: string;
  fechaRegistro?: string;
  fecha_registro?: string;
  createdAt?: string;
  created_at?: string;
  fecha?: string;
}

interface DashboardData {
  instructor: string;
  correo: string;
  description: string;
  stats: Stat[];
}

type PeriodKey = "dia" | "semana" | "mes" | "anio";
type RegistroKey = "aprendices" | "instructores";

interface PeriodOption {
  key: PeriodKey;
  label: string;
  color: string;
}

interface RegistroOption {
  key: RegistroKey;
  label: string;
}

interface ChartRow {
  periodo: string;
  inscritos: number;
  order: number;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: "dia", label: "Por dia", color: "#39A900" },
  { key: "semana", label: "Por semana", color: "#0EA5E9" },
  { key: "mes", label: "Por mes", color: "#F59E0B" },
  { key: "anio", label: "Por año", color: "#EF4444" },
];

const REGISTRO_OPTIONS: RegistroOption[] = [
  { key: "aprendices", label: "Aprendices" },
  { key: "instructores", label: "Instructores" },
];

const CHART_LIMIT: Record<PeriodKey, number> = {
  dia: 14,
  semana: 12,
  mes: 12,
  anio: 8,
};

// Helpers base para generar llaves temporales consistentes en el grafico.
const twoDigits = (value: number) => String(value).padStart(2, "0");

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}`;

const toYearKey = (date: Date) => `${date.getFullYear()}`;

const CURRENT_YEAR = new Date().getFullYear();

const formatDayLabel = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  };

  if (date.getFullYear() !== CURRENT_YEAR) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("es-CO", options);
};

const getWeekStart = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return start;
};

const parseDateCandidate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
};

const parseInscripcionDate = (aprendiz: Aprendiz): Date | null => {
  const candidates: unknown[] = [
    aprendiz.fechaInscripcion,
    aprendiz.fechaRegistro,
    aprendiz.fecha_registro,
    aprendiz.createdAt,
    aprendiz.created_at,
    aprendiz.fecha,
  ];

  for (const candidate of candidates) {
    const parsed = parseDateCandidate(candidate);
    if (parsed) return parsed;
  }

  return null;
};

// Agrupa fechas por dia, semana, mes o anio y las deja listas para Recharts.
const buildRowsByPeriod = (dates: Date[], period: PeriodKey): ChartRow[] => {
  const grouped = dates.reduce<Record<string, ChartRow>>((acc, date) => {
    if (period === "dia") {
      const key = toDayKey(date);
      const label = formatDayLabel(date);

      if (!acc[key]) {
        acc[key] = {
          periodo: label,
          inscritos: 0,
          order: new Date(key).getTime(),
        };
      }

      acc[key].inscritos += 1;
      return acc;
    }

    if (period === "semana") {
      const weekStart = getWeekStart(date);
      const key = toDayKey(weekStart);
      const label = `Sem ${formatDayLabel(weekStart)}`;

      if (!acc[key]) {
        acc[key] = {
          periodo: label,
          inscritos: 0,
          order: weekStart.getTime(),
        };
      }

      acc[key].inscritos += 1;
      return acc;
    }

    if (period === "anio") {
      const key = toYearKey(date);
      const yearDate = new Date(date.getFullYear(), 0, 1);

      if (!acc[key]) {
        acc[key] = {
          periodo: key,
          inscritos: 0,
          order: yearDate.getTime(),
        };
      }

      acc[key].inscritos += 1;
      return acc;
    }

    const key = toMonthKey(date);
    const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const label = monthDate.toLocaleDateString("es-CO", {
      month: "short",
      year: "numeric",
    });

    if (!acc[key]) {
      acc[key] = {
        periodo: label,
        inscritos: 0,
        order: monthDate.getTime(),
      };
    }

    acc[key].inscritos += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => a.order - b.order);
};

const getCurrentBucketCount = (dates: Date[], period: PeriodKey) => {
  const now = new Date();

  if (period === "dia") {
    const todayKey = toDayKey(now);
    return dates.filter((date) => toDayKey(date) === todayKey).length;
  }

  if (period === "semana") {
    const weekKey = toDayKey(getWeekStart(now));
    return dates.filter((date) => toDayKey(getWeekStart(date)) === weekKey)
      .length;
  }

  if (period === "anio") {
    const yearKey = toYearKey(now);
    return dates.filter((date) => toYearKey(date) === yearKey).length;
  }

  const monthKey = toMonthKey(now);
  return dates.filter((date) => toMonthKey(date) === monthKey).length;
};

const getCurrentBucketLabel = (period: PeriodKey) => {
  if (period === "dia") return "hoy";
  if (period === "semana") return "esta semana";
  if (period === "anio") return "este año";
  return "este mes";
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [activeRegistro, setActiveRegistro] =
    useState<RegistroKey>("aprendices");
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("dia");
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedCedula = requireAdminAccess(navigate);
    if (!storedCedula) {
      return;
    }

    // El dashboard necesita el resumen y tambien los listados crudos para
    // construir tarjetas y series temporales sin depender de otro endpoint.
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, aprendicesResponse, instructoresResponse] =
          await Promise.all([
          fetch(`${API_URL}/dashboard?cedula=${storedCedula}`),
          fetch(`${API_URL}/aprendices?cedula=${storedCedula}`),
          fetch(`${API_URL}/instructores?cedula=${storedCedula}`),
        ]);

        const dashboardPayload = await dashboardResponse.json();
        if (dashboardPayload && !dashboardPayload.error) {
          setDashboardData(dashboardPayload);
        }

        const aprendicesPayload = aprendicesResponse.ok
          ? await aprendicesResponse.json()
          : [];

        setAprendices(
          Array.isArray(aprendicesPayload) ? aprendicesPayload : [],
        );

        const instructoresPayload = instructoresResponse.ok
          ? await instructoresResponse.json()
          : [];

        setInstructores(
          Array.isArray(instructoresPayload) ? instructoresPayload : [],
        );
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Las fechas se derivan una sola vez y luego se reutilizan en todos los memos
  // que alimentan el grafico y los contadores del periodo actual.
  const fechasInscripcion = useMemo(
    () =>
      aprendices
        .map(parseInscripcionDate)
        .filter((date): date is Date => date !== null),
    [aprendices],
  );

  const fechasInscripcionInstructores = useMemo(
    () =>
      instructores
        .map(parseInscripcionDate)
        .filter((date): date is Date => date !== null),
    [instructores],
  );

  const rowsByPeriodAprendices = useMemo(
    () => ({
      dia: buildRowsByPeriod(fechasInscripcion, "dia"),
      semana: buildRowsByPeriod(fechasInscripcion, "semana"),
      mes: buildRowsByPeriod(fechasInscripcion, "mes"),
      anio: buildRowsByPeriod(fechasInscripcion, "anio"),
    }),
    [fechasInscripcion],
  );

  const rowsByPeriodInstructores = useMemo(
    () => ({
      dia: buildRowsByPeriod(fechasInscripcionInstructores, "dia"),
      semana: buildRowsByPeriod(fechasInscripcionInstructores, "semana"),
      mes: buildRowsByPeriod(fechasInscripcionInstructores, "mes"),
      anio: buildRowsByPeriod(fechasInscripcionInstructores, "anio"),
    }),
    [fechasInscripcionInstructores],
  );

  const currentBucketTotalsAprendices = useMemo(
    () => ({
      dia: getCurrentBucketCount(fechasInscripcion, "dia"),
      semana: getCurrentBucketCount(fechasInscripcion, "semana"),
      mes: getCurrentBucketCount(fechasInscripcion, "mes"),
      anio: getCurrentBucketCount(fechasInscripcion, "anio"),
    }),
    [fechasInscripcion],
  );

  const currentBucketTotalsInstructores = useMemo(
    () => ({
      dia: getCurrentBucketCount(fechasInscripcionInstructores, "dia"),
      semana: getCurrentBucketCount(fechasInscripcionInstructores, "semana"),
      mes: getCurrentBucketCount(fechasInscripcionInstructores, "mes"),
      anio: getCurrentBucketCount(fechasInscripcionInstructores, "anio"),
    }),
    [fechasInscripcionInstructores],
  );

  if (isLoading || !dashboardData)
    return <div className="loading-screen">Cargando...</div>;

  const activePeriodOption =
    PERIOD_OPTIONS.find((period) => period.key === activePeriod) ||
    PERIOD_OPTIONS[0];

  const activeRowsByPeriod =
    activeRegistro === "aprendices"
      ? rowsByPeriodAprendices
      : rowsByPeriodInstructores;
  const activeBucketTotals =
    activeRegistro === "aprendices"
      ? currentBucketTotalsAprendices
      : currentBucketTotalsInstructores;

  const activeRows = activeRowsByPeriod[activePeriodOption.key].slice(
    -CHART_LIMIT[activePeriodOption.key],
  );

  const totalInscritos =
    activeRegistro === "aprendices" ? aprendices.length : instructores.length;
  const inscritosConFecha =
    activeRegistro === "aprendices"
      ? fechasInscripcion.length
      : fechasInscripcionInstructores.length;
  const registroLabel =
    activeRegistro === "aprendices" ? "aprendices" : "instructores";
  const registroLabelSingular =
    activeRegistro === "aprendices" ? "Aprendices" : "Instructores";

  // El logout real vive en el helper compartido; el componente solo decide
  // cuando abrir o confirmar el modal.
  const confirmLogout = () => {
    logoutAndRedirect(navigate);
  };

  return (
    <div className="dashboard-page">
      <div className="container-dashboard">
        <AdminSidebar currentPath={location.pathname} onNavigate={navigate} />

        <main className="content">
          <nav className="nav-top">
            <div className="title-section">
              <h1>Panel Admin</h1>
            </div>
            <AdminProfileMenu
              displayName={dashboardData.instructor}
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen((current) => !current)}
              onLogout={() => setShowLogoutModal(true)}
              showProfileItem
            />
          </nav>

          <section className="dashboard-content">
            <h2>Bienvenido, {dashboardData.instructor}</h2>

            <section className="description-section">
              <div className="desc-header">
                <PenTool
                  size={20}
                  color="#39A900"
                  style={{ marginRight: "10px" }}
                />
                <h3>Proposito del Sistema</h3>
              </div>
              <p className="desc-text">{dashboardData.description}</p>
            </section>

            <section className="summary-section">
              <div
                className="summary-card-full students-chart-card"
                data-component="Card"
              >
                <div
                  className="card-header students-card-header"
                  data-component="CardHeader"
                >
                  <div className="students-card-copy">
                    <h3 className="card-title students-card-title">
                      Inscripcion de {registroLabel} por tiempo
                    </h3>
                    <p className="card-description students-card-description">
                      Total inscritos: {totalInscritos.toLocaleString()} | con
                      fecha: {inscritosConFecha.toLocaleString()}
                    </p>
                    <div className="students-entity-toggle">
                      {REGISTRO_OPTIONS.map((registro) => (
                        <button
                          key={registro.key}
                          type="button"
                          className={`entity-toggle-button ${activeRegistro === registro.key ? "active" : ""}`}
                          onClick={() => setActiveRegistro(registro.key)}
                        >
                          {registro.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="students-metric-tabs">
                    {PERIOD_OPTIONS.map((period) => (
                      <button
                        key={period.key}
                        className={`metric-tab-button ${activePeriodOption.key === period.key ? "active" : ""}`}
                        onClick={() => setActivePeriod(period.key)}
                      >
                        <span className="metric-tab-label">{period.label}</span>
                        <span className="metric-tab-value">
                          {activeBucketTotals[period.key].toLocaleString()}
                        </span>
                        <span className="metric-tab-meta">
                          {getCurrentBucketLabel(period.key)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="card-content students-card-content"
                  data-component="CardContent"
                >
                  {activeRows.length > 0 ? (
                    <div className="students-chart-wrapper">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={activeRows}
                          margin={{
                            top: 10,
                            right: 12,
                            left: 0,
                            bottom: 8,
                          }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey="periodo"
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            tick={{ fontSize: 12 }}
                            angle={activeRows.length > 5 ? -20 : 0}
                            textAnchor={
                              activeRows.length > 5 ? "end" : "middle"
                            }
                            height={activeRows.length > 5 ? 56 : 30}
                          />
                          <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            formatter={(value: number | string) =>
                              [
                                `${Number(value).toLocaleString()} inscritos`,
                                registroLabelSingular,
                              ] as [string, string]
                            }
                            labelFormatter={(label: unknown) =>
                              `Periodo: ${label}`
                            }
                          />
                          <Bar
                            dataKey="inscritos"
                            fill={activePeriodOption.color}
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="empty-chart-state">
                      No hay fechas de inscripcion de {registroLabel} disponibles
                      para graficar por dia, semana, mes o año.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>

      <AdminLogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default AdminDashboard;
