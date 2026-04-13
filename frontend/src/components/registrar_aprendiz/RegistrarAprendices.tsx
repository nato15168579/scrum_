import React, {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  Hash,
  Home,
  List,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  User,
  UserPlus,
  Users,
  HelpCircle, // Icono para la nueva sección
} from 'lucide-react';
import senaLogo from '../../assets/sena.png';
import '../dashboard_instructor/Dashboard.css';
import './RegistrarAprendices.css';
import { API_URL } from '../../config/Api';

interface StatusState {
  type: 'success' | 'error';
  msg: string;
}

interface FichaInstructorOption {
  numero: string;
  area: string;
  nombre: string;
  programa: string;
  estado: string;
}

interface ImportUserRow {
  documento: string;
  tipoDocumento: string;
  ficha: string;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  email: string;
}

interface ImportedAprendizPreview {
  documento: string;
  nombre: string;
  apellido: string;
  ficha: string;
  email: string;
  detalle: string;
  passwordTemporal: string;
}

interface AprendizFormState {
  usuCedula: string;
  usuNombres: string;
  usuApellidos: string;
  usuCorreo: string;
  usuTelefono: string;
  usuTipodedocumento: string;
  usuFicha: string;
  usuPrograma: string;
  usuArea: string;
  usuSexo: string;
}

const INITIAL_FORM: AprendizFormState = {
  usuCedula: '',
  usuNombres: '',
  usuApellidos: '',
  usuCorreo: '',
  usuTelefono: '',
  usuTipodedocumento: 'CC',
  usuFicha: '',
  usuPrograma: '',
  usuArea: '',
  usuSexo: '',
};

const DOCUMENT_OPTIONS = [
  { value: 'CC', label: 'CC - Cedula de Ciudadania' },
  { value: 'TI', label: 'TI - Tarjeta de Identidad' },
  { value: 'CE', label: 'CE - Cedula de Extranjeria' },
  { value: 'PEP', label: 'PEP - Permiso Especial de Permanencia' },
  { value: 'PPT', label: 'PPT - Permiso por Proteccion Temporal' },
];

const IMPORT_REQUIRED_HEADERS = [
  'DOCUMENTO',
  'TIPO DE DOCUMENTO',
  'FICHA',
  'NOMBRE',
  'APELLIDO',
];

const normalizeTextValue = (value: unknown) => String(value ?? '').trim();

const normalizeExcelHeader = (value: unknown) =>
  normalizeTextValue(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { message?: unknown }).message)
  ) {
    return ((payload as { message: string[] }).message || []).join(', ');
  }

  if (
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { message?: unknown }).message === 'string'
  ) {
    return (payload as { message: string }).message;
  }

  return fallback;
};

const buildImportErrorMessage = (payload: unknown, fallback: string) => {
  const baseMessage = extractErrorMessage(payload, fallback);
  const errors = Array.isArray((payload as { errors?: unknown } | null)?.errors)
    ? ((payload as {
        errors: Array<{ fila?: number; documento?: string; message?: string }>;
      }).errors || [])
    : [];

  if (errors.length === 0) {
    return baseMessage;
  }

  const detail = errors
    .slice(0, 3)
    .map((item) => {
      const rowLabel = item.fila ? `Fila ${item.fila}` : 'Fila';
      const documentLabel = item.documento ? ` (${item.documento})` : '';
      return `${rowLabel}${documentLabel}: ${item.message || 'Error.'}`;
    })
    .join(' ');

  return `${baseMessage} ${detail}`.trim();
};

const RegistrarAprendices: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [instructorCedula, setInstructorCedula] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [pendingStatus, setPendingStatus] = useState<StatusState | null>(null);
  const [importedUsersPreview, setImportedUsersPreview] = useState<
    ImportedAprendizPreview[]
  >([]);
  const [fichasInstructor, setFichasInstructor] = useState<FichaInstructorOption[]>(
    [],
  );
  const [formData, setFormData] = useState<AprendizFormState>(INITIAL_FORM);

  const menuItems = [
    { name: 'Inicio', icon: Home, path: '/dashboard' },
    { name: 'Lista de Aprendices', icon: Users, path: '/lista-aprendices' },
    { name: 'Crear Proyecto', icon: Plus, path: '/crear-proyecto' },
    { name: 'Asignar Proyectos', icon: MapPin, path: '/asignar-proyectos' },
    { name: 'Ver Proyectos', icon: Eye, path: '/ver-proyectos' },
    { name: 'Registrar Aprendiz', icon: List, path: '/registrar-aprendiz' },
  ];

  const fichaSeleccionada = useMemo(
    () =>
      fichasInstructor.find((item) => item.numero === formData.usuFicha) || null,
    [fichasInstructor, formData.usuFicha],
  );

  const normalizeFichasInstructor = (payload: unknown): FichaInstructorOption[] => {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => ({
        numero: normalizeTextValue((item as { numero?: unknown }).numero),
        area: normalizeTextValue(
          (item as { area?: unknown; nombre?: unknown }).area ||
            (item as { nombre?: unknown }).nombre,
        ),
        nombre: normalizeTextValue(
          (item as { nombre?: unknown; area?: unknown }).nombre ||
            (item as { area?: unknown }).area,
        ),
        programa: normalizeTextValue((item as { programa?: unknown }).programa),
        estado:
          normalizeTextValue((item as { estado?: unknown }).estado) || 'Activa',
      }))
      .filter((item) => item.numero);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const cedula = localStorage.getItem('userCedula');

    if (!cedula) {
      navigate('/');
      return;
    }

    setInstructorCedula(cedula);

    const loadData = async () => {
      try {
        const [dashboardResponse, fichasResponse] = await Promise.all([
          fetch(`${API_URL}/dashboard?cedula=${cedula}`),
          fetch(`${API_URL}/registrar-aprendices/fichas-instructor?cedula=${cedula}`),
        ]);

        const dashboardData = dashboardResponse.ok
          ? await dashboardResponse.json().catch(() => null)
          : null;
        const fichasPayload = await fichasResponse.json().catch(() => null);

        if (dashboardData?.instructor) {
          setInstructorName(String(dashboardData.instructor));
        }

        let fichasNormalizadas = fichasResponse.ok
          ? normalizeFichasInstructor(fichasPayload)
          : [];

        if (fichasNormalizadas.length === 0) {
          const instructoresResponse = await fetch(
            `${API_URL}/instructores?cedula=${cedula}`,
          );
          const instructoresPayload = instructoresResponse.ok
            ? await instructoresResponse.json().catch(() => [])
            : [];

          if (Array.isArray(instructoresPayload)) {
            const instructorActual = instructoresPayload.find(
              (item) =>
                normalizeTextValue((item as { documento?: unknown }).documento) ===
                cedula,
            ) as
              | {
                  fichasDetalle?: Array<{
                    ficha?: unknown;
                    nombre?: unknown;
                    programa?: unknown;
                    estado?: unknown;
                  }>;
                }
              | undefined;

            fichasNormalizadas = normalizeFichasInstructor(
              (instructorActual?.fichasDetalle || []).map((item) => ({
                numero: item.ficha,
                area: item.nombre,
                nombre: item.nombre,
                programa: item.programa,
                estado: item.estado,
              })),
            );
          }
        }

        setFichasInstructor(fichasNormalizadas);

        if (!fichasResponse.ok && fichasNormalizadas.length === 0) {
          const backendMessage = extractErrorMessage(
            fichasPayload,
            'No fue posible cargar las fichas del instructor.',
          );

          setStatus({
            type: 'error',
            msg: backendMessage,
          });
        }
      } catch (error) {
        console.error('Error cargando datos del instructor:', error);
        setStatus({
          type: 'error',
          msg: 'No fue posible cargar las fichas del instructor.',
        });
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (!fichaSeleccionada) {
      setFormData((prev) => {
        if (!prev.usuArea && !prev.usuPrograma) {
          return prev;
        }

        return {
          ...prev,
          usuArea: '',
          usuPrograma: '',
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      usuArea: fichaSeleccionada.area,
      usuPrograma: fichaSeleccionada.programa,
    }));
  }, [fichaSeleccionada]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
  };

  const buildImportedUsersPreview = (
    creadosDetalle: Array<{
      documento?: string;
      nombre?: string;
      passwordTemporal?: string;
    }>,
    sourceRows: ImportUserRow[],
  ): ImportedAprendizPreview[] => {
    const sourceMap = new Map(
      sourceRows.map((item) => [normalizeTextValue(item.documento), item]),
    );
    const fichaMap = new Map(
      fichasInstructor.map((item) => [normalizeTextValue(item.numero), item]),
    );

    return creadosDetalle
      .map((item) => {
        const documento = normalizeTextValue(item.documento);
        const sourceRow = sourceMap.get(documento);

        if (!documento || !sourceRow) {
          return null;
        }

        const fichaDetalle = fichaMap.get(normalizeTextValue(sourceRow.ficha));

        return {
          documento,
          nombre: normalizeTextValue(item.nombre) || sourceRow.nombre,
          apellido: sourceRow.apellido,
          ficha: sourceRow.ficha,
          email: sourceRow.email || 'Sin email',
          detalle: fichaDetalle?.programa || 'Sin programa',
          passwordTemporal:
            normalizeTextValue(item.passwordTemporal) || `${sourceRow.nombre.split(' ')[0]?.toLowerCase() || 'usuario'}123`,
        };
      })
      .filter(Boolean) as ImportedAprendizPreview[];
  };

  const handleCloseImportedPreview = () => {
    setImportedUsersPreview([]);

    if (pendingStatus) {
      setStatus(pendingStatus);
      setPendingStatus(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/registrar-aprendices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorCedula,
          usuCedula: formData.usuCedula,
          usuNombres: formData.usuNombres,
          usuApellidos: formData.usuApellidos,
          usuCorreo: formData.usuCorreo,
          usuTelefono: formData.usuTelefono,
          usuTipodedocumento: formData.usuTipodedocumento,
          usuFicha: formData.usuFicha,
          usuSexo: formData.usuSexo || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(payload, 'Error al registrar el aprendiz.'),
        );
      }

      resetForm();
      setStatus({
        type: 'success',
        msg:
          extractErrorMessage(
            payload,
            'Aprendiz registrado correctamente.',
          ) || 'Aprendiz registrado correctamente.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        msg:
          error instanceof Error
            ? error.message
            : 'Error al registrar el aprendiz.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setStatus(null);

    try {
      if (fichasInstructor.length === 0) {
        throw new Error('No tienes fichas activas asignadas para importar aprendices.');
      }

      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!worksheet) {
        throw new Error('El archivo no contiene hojas legibles.');
      }

      const rows = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
        header: 1,
        defval: '',
      });

      const [rawHeaders = [], ...rawDataRows] = rows;
      const headers = rawHeaders.map(normalizeExcelHeader);
      const missingHeaders = IMPORT_REQUIRED_HEADERS.filter(
        (header) => !headers.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Faltan columnas obligatorias en el archivo: ${missingHeaders.join(', ')}.`,
        );
      }

      const getColumnValue = (
        row: Array<string | number>,
        header: string,
      ) => {
        const index = headers.indexOf(header);
        return index >= 0 ? normalizeTextValue(row[index]) : '';
      };

      const usuarios: ImportUserRow[] = rawDataRows
        .map((row) => ({
          documento: getColumnValue(row, 'DOCUMENTO'),
          tipoDocumento: getColumnValue(row, 'TIPO DE DOCUMENTO') || 'CC',
          ficha: getColumnValue(row, 'FICHA'),
          nombre: getColumnValue(row, 'NOMBRE'),
          apellido: getColumnValue(row, 'APELLIDO'),
          sexo: getColumnValue(row, 'SEXO'),
          telefono: getColumnValue(row, 'TELEFONO'),
          email:
            getColumnValue(row, 'EMAIL') ||
            getColumnValue(row, 'CORREO ELECTRONICO'),
        }))
        .filter((row) =>
          Object.values(row).some((value) => normalizeTextValue(value)),
        );

      if (usuarios.length === 0) {
        throw new Error('El archivo no contiene aprendices para importar.');
      }

      const fichasPermitidas = new Set(
        fichasInstructor.map((item) => normalizeTextValue(item.numero)),
      );
      const fichasInvalidas = usuarios.filter(
        (item) => !fichasPermitidas.has(normalizeTextValue(item.ficha)),
      );

      if (fichasInvalidas.length > 0) {
        throw new Error(
          'El archivo contiene fichas que no estan asignadas al instructor.',
        );
      }

      const response = await fetch(`${API_URL}/registrar-aprendices/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorCedula,
          usuarios,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          buildImportErrorMessage(
            payload,
            'No fue posible importar los aprendices.',
          ),
        );
      }

      const creados = Number(payload?.creados || 0);
      const fallidos = Number(payload?.fallidos || 0);
      const creadosDetalle = Array.isArray(payload?.creadosDetalle)
        ? (payload.creadosDetalle as Array<{
            documento?: string;
            nombre?: string;
            passwordTemporal?: string;
          }>)
        : [];

      const nextStatus: StatusState = {
        type: fallidos > 0 ? 'error' : 'success',
        msg:
          fallidos > 0
            ? `Importacion finalizada. Creados: ${creados}. Fallidos: ${fallidos}.`
            : `Se importaron ${creados} aprendices correctamente.`,
      };

      const preview = buildImportedUsersPreview(creadosDetalle, usuarios);

      if (preview.length > 0) {
        setImportedUsersPreview(preview);
        setPendingStatus(nextStatus);
      } else {
        setStatus(nextStatus);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        msg:
          error instanceof Error
            ? error.message
            : 'No fue posible importar los aprendices.',
      });
    } finally {
      if (event.target) {
          event.target.value = '';
      }
      setIsImporting(false);
    }
  };

  return (
    <div className="dashboard-page">
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
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={18} style={{ marginRight: '10px' }} />
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
        
        {/* NUEVA SECCIÓN: AYUDA Y SOPORTE (Manteniendo el pie del sidebar) */}
        <div className="settings-footer" style={{ marginTop: 'auto', padding: '20px' }}>
          <p className="menu-title">SETTINGS</p>
          <div 
            className="support-item" 
            onClick={() => navigate('/ayuda-soporte')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              color: '#4a5568',
              fontSize: '14px',
              padding: '10px 0',
              transition: 'color 0.2s'
            }}
          >
            <HelpCircle size={18} style={{ marginRight: '10px', color: '#39A900' }} />
            <span>Ayuda y Soporte</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <nav className="nav-top">
          <div className="title-section">
            <h1>
              Modulo / <span style={{ color: '#39A900' }}>Nuevo Registro</span>
            </h1>
          </div>

          <div
            className="profile-menu"
            ref={menuRef}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=39A900&color=fff`}
              className="profile-img"
              alt="Avatar"
            />
            <span className="profile-name">{instructorName}</span>
            <ChevronDown size={18} />
            {isMenuOpen && (
              <ul className="dropdown-profile">
                <li onClick={() => navigate('/mi-perfil')}>
                  <User size={16} style={{ marginRight: '8px' }} />
                  Mi Perfil
                </li>
                <li
                  className="logout"
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} style={{ marginRight: '8px' }} />
                  Cerrar Sesion
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="aprendiz-container">
          <div className="aprendiz-card-form">
            <div className="aprendiz-card-header">
              <div className="aprendiz-card-heading">
                <UserPlus size={24} />
                <div>
                  <h3>Registrar aprendiz</h3>
                  <p>
                    Selecciona una ficha a tu cargo y el sistema completa area y
                    programa automaticamente.
                  </p>
                </div>
              </div>

              <div className="aprendiz-header-actions">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="aprendiz-file-input"
                  onChange={handleImportFileChange}
                />
                <button
                  type="button"
                  className="btn-importar"
                  onClick={() => importInputRef.current?.click()}
                  disabled={loading || isImporting || fichasInstructor.length === 0}
                >
                  <FileSpreadsheet size={18} />
                  <span>
                    {isImporting ? 'Importando...' : 'Importar usuarios'}
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid-form">
              <div className="input-field">
                <label>
                  <CreditCard size={16} />
                  Tipo de documento
                </label>
                <select
                  name="usuTipodedocumento"
                  value={formData.usuTipodedocumento}
                  onChange={handleChange}
                  required
                >
                  {DOCUMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <label>
                  <Hash size={16} />
                  Numero de documento
                </label>
                <input
                  type="number"
                  name="usuCedula"
                  value={formData.usuCedula}
                  onChange={handleChange}
                  placeholder="Documento sin puntos"
                  required
                />
              </div>

              <div className="input-field">
                <label>Nombres</label>
                <input
                  type="text"
                  name="usuNombres"
                  value={formData.usuNombres}
                  onChange={handleChange}
                  placeholder="Nombres del aprendiz"
                  required
                />
              </div>

              <div className="input-field">
                <label>Apellidos</label>
                <input
                  type="text"
                  name="usuApellidos"
                  value={formData.usuApellidos}
                  onChange={handleChange}
                  placeholder="Apellidos del aprendiz"
                  required
                />
              </div>

              <div className="input-field">
                <label>
                  <GraduationCap size={16} />
                  Ficha a cargo
                </label>
                <select
                  name="usuFicha"
                  value={formData.usuFicha}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una ficha</option>
                  {fichasInstructor.map((item) => (
                    <option key={item.numero} value={item.numero}>
                      {item.numero}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <label>
                  <BookOpen size={16} />
                  Area
                </label>
                <input
                  type="text"
                  name="usuArea"
                  value={formData.usuArea}
                  readOnly
                  placeholder="Se completa al elegir ficha"
                />
              </div>

              <div className="input-field">
                <label>
                  <BookOpen size={16} />
                  Programa de formacion
                </label>
                <input
                  type="text"
                  name="usuPrograma"
                  value={formData.usuPrograma}
                  readOnly
                  placeholder="Se completa al elegir ficha"
                />
              </div>

              <div className="input-field">
                <label>
                  <Mail size={16} />
                  Correo electronico
                </label>
                <input
                  type="email"
                  name="usuCorreo"
                  value={formData.usuCorreo}
                  onChange={handleChange}
                  placeholder="ejemplo@soy.sena.edu.co"
                />
              </div>

              <div className="input-field">
                <label>
                  <Phone size={16} />
                  Telefono
                </label>
                <input
                  type="text"
                  name="usuTelefono"
                  value={formData.usuTelefono}
                  onChange={handleChange}
                  placeholder="Numero de contacto"
                />
              </div>

              <div className="input-field">
                <label>Sexo</label>
                <select
                  name="usuSexo"
                  value={formData.usuSexo}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una opcion</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </div>

              <p className="form-hint">
                El boton de importacion solo registra aprendices y valida que la
                ficha pertenezca a tu listado de fichas a cargo.
              </p>

              {fichasInstructor.length === 0 && (!status || status.type !== 'error') && (
                <div className="alert-box error">
                  <AlertCircle size={20} />
                  <span>
                    No tienes fichas activas asignadas. No es posible registrar o
                    importar aprendices hasta que se te asigne una ficha.
                  </span>
                </div>
              )}

              {status && (
                <div className={`alert-box ${status.type}`}>
                  {status.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <span>{status.msg}</span>
                </div>
              )}

              <div className="form-footer">
                <button
                  type="submit"
                  className="btn-registrar"
                  disabled={loading || fichasInstructor.length === 0}
                >
                  {loading ? (
                    'Procesando...'
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar aprendiz
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {importedUsersPreview.length > 0 && (
        <div className="aprendiz-import-modal-overlay">
          <div className="aprendiz-import-modal-card aprendiz-imported-list-card">
            <h2>Usuarios agregados</h2>
            <p>Estos usuarios ya quedaron registrados en la base de datos.</p>

            <div className="aprendiz-imported-table-wrapper">
              <table className="aprendiz-imported-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Ficha</th>
                    <th>Programa</th>
                    <th>Email</th>
                    <th>Clave inicial</th>
                  </tr>
                </thead>
                <tbody>
                  {importedUsersPreview.map((item) => (
                    <tr key={item.documento}>
                      <td>
                        <span className="aprendiz-user-type-badge">
                          Aprendiz
                        </span>
                      </td>
                      <td>{item.documento}</td>
                      <td>{item.nombre}</td>
                      <td>{item.apellido}</td>
                      <td>{item.ficha || 'Sin ficha'}</td>
                      <td>{item.detalle}</td>
                      <td>{item.email || 'Sin email'}</td>
                      <td>{item.passwordTemporal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="aprendiz-modal-actions">
              <button
                type="button"
                className="aprendiz-modal-button"
                onClick={handleCloseImportedPreview}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarAprendices;