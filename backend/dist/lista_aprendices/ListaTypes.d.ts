import { EstadoUsuario } from '../entities/Usuario';
export interface CreateUsuarioDto {
    cedula: string | number;
    nombre: string;
    apellidos: string;
    correo?: string;
    telefono?: string;
    ficha?: string;
    tipoDocumento?: string;
    sexo?: string;
    especializacion?: string;
    tipoUsuario?: 'aprendiz' | 'instructor';
    password?: string;
}
export interface CreateFichaDto {
    numero: string | number;
    nombre: string;
    programa: string;
    estado?: 'Activa' | 'Inactiva';
    allowCustomCatalogValues?: boolean;
}
export interface UpdateFichaDto {
    nombre?: string;
    programa?: string;
    estado?: 'Activa' | 'Inactiva';
    allowCustomCatalogValues?: boolean;
}
export interface ImportUsuarioDto {
    documento: string | number;
    tipoDocumento?: string;
    ficha?: string | number;
    nombre: string;
    apellido: string;
    sexo?: string;
    telefono?: string;
    email?: string;
    especializacion?: string;
    tipoUsuario?: 'aprendiz' | 'instructor' | string;
}
export interface UpdateAprendizDto {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    sexo?: string;
    ficha?: string | number;
    estado?: string;
}
export interface UpdateInstructorDto {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    sexo?: string;
    especializacion?: string;
    fichas?: Array<string | number>;
    estado?: string;
}
export interface FichaDetalle {
    ficha: string;
    nombre: string;
    programa: string;
    estado: string;
    fechaCreacion: string | null;
}
export interface FichaDetalleRow {
    ficha?: unknown;
    fichaNombre?: unknown;
    programa?: unknown;
    fichaEstado?: unknown;
    fichaFechaCreacion?: unknown;
}
export interface FichaAsignadaRow {
    ficha?: unknown;
}
export interface FichaCatalogRow {
    numero?: unknown;
    nombre?: unknown;
    programa?: unknown;
    estado?: unknown;
    fechaCreacion?: unknown;
}
export interface FichaRecord {
    fic_numero?: number;
    fichaNombre?: string;
    fic_programa?: string;
    programa?: string;
    fic_estado?: string;
    estado?: string;
}
export interface AprendizQueryRow {
    documento?: unknown;
    tipoDocumento?: unknown;
    ficha?: unknown;
    fichaNombre?: unknown;
    programa?: unknown;
    nombre?: unknown;
    apellido?: unknown;
    telefono?: unknown;
    email?: unknown;
    sexo?: unknown;
    fechaInscripcion?: unknown;
    estado?: unknown;
}
export interface AprendizResponse {
    documento: string;
    tipoDocumento: string;
    ficha: string;
    area: string;
    fichaNombre: string;
    programa: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    sexo: string;
    fechaInscripcion: string | null;
    estado: EstadoUsuario;
}
export interface InstructorResponse {
    documento: string;
    tipoDocumento: string;
    especializacion: string;
    fichasCargo: string[];
    fichasDetalle: FichaDetalle[];
    nombre: string;
    apellido: string;
    sexo: string;
    telefono: string;
    email: string;
    fechaInscripcion: string | null;
    estado: EstadoUsuario;
}
export interface QueryExecutor {
    query: (query: string, parameters?: readonly unknown[]) => Promise<Array<Record<string, unknown>>>;
}
