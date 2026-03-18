import { DataSource, Repository } from 'typeorm';
import { EstadoUsuario, Usuario } from '../entities/Usuario';
import { AprendizResponse, CreateFichaDto, CreateUsuarioDto, ImportUsuarioDto, InstructorResponse, UpdateAprendizDto, UpdateFichaDto, UpdateInstructorDto } from './ListaTypes';
export declare class ListaService {
    private readonly usuarioRepository;
    private readonly dataSource;
    private readonly schema;
    constructor(usuarioRepository: Repository<Usuario>, dataSource: DataSource);
    private columnExists;
    private tableExists;
    private getTableType;
    private ensureLegacyAdminViews;
    private resolvePhysicalTableName;
    private ensureUsuarioFichaFechaAsignacionColumn;
    private ensureFechaRegistroColumn;
    private ensureEstadoColumn;
    private ensureEspecializacionColumn;
    private ensureSexoColumn;
    private ensureUsuarioCedulaBigInt;
    private ensureUsuarioColumns;
    private ensureFichaSchema;
    private getFichaNombreSelect;
    private getFichaNombreColumn;
    private normalizeCatalogValue;
    private resolveCatalogValue;
    private escapeSqlLiteral;
    private getColumnMetadata;
    private getEnumColumnOptions;
    private ensureEnumColumnValue;
    private getFichaAreasByPrograma;
    private normalizeEstado;
    private formatDateToIso;
    private buildFichaDetalle;
    private getRolUsuario;
    private getFichasAsignadasUsuario;
    private ensureUsuarioFichaAssignment;
    private sanitizeText;
    private normalizeCedula;
    private formatCambioSistemaValue;
    private formatCambioSistemaList;
    private pushCambioSistemaIfDifferent;
    private pushCambioSistemaListIfDifferent;
    private insertCambioSistema;
    private buildDefaultPassword;
    private getFichaActualUsuario;
    private getFichaByNumero;
    private getFichasByNumeros;
    getFichaCatalogOptions(): Promise<{
        areas: any[];
        programas: any[];
        areasByPrograma: Record<string, string[]>;
    }>;
    private mapAprendizResponse;
    private deleteUsuarioReferences;
    findAllFichas(): Promise<any>;
    createFicha(payload: CreateFichaDto): Promise<{
        ok: boolean;
        mensaje: string;
        ficha: {
            numero: string;
            nombre: string;
            programa: string;
            estado: string;
        };
    }>;
    updateFicha(numero: string, payload: UpdateFichaDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        ficha: {
            numero: string;
            nombre: string;
            programa: string;
            estado: string;
        };
    }>;
    deleteFicha(numero: string, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
    }>;
    renamePrograma(payload: {
        programaActual: string;
        programaNuevo: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas?: undefined;
        antes?: undefined;
        despues?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        antes: string;
        despues: string;
    }>;
    deletePrograma(payload: {
        programa: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        programa: string;
    }>;
    renameArea(payload: {
        programa?: string | null;
        areaActual: string;
        areaNueva: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas?: undefined;
        antes?: undefined;
        despues?: undefined;
        programa?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        antes: string;
        despues: string;
        programa: string;
    }>;
    deleteArea(payload: {
        programa?: string | null;
        area: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        area: string;
        programa: string;
    }>;
    importUsuarios(rows: ImportUsuarioDto[]): Promise<{
        ok: boolean;
        total: number;
        creados: number;
        fallidos: number;
        creadosDetalle: {
            fila: number;
            documento: string;
            nombre: string;
            tipoUsuario: "aprendiz" | "instructor";
            passwordTemporal: string;
        }[];
        errores: {
            fila: number;
            documento: string;
            message: string;
        }[];
    }>;
    findAllAprendices(cedulaSolicitante?: string): Promise<AprendizResponse[]>;
    findAllInstructores(_cedulaSolicitante?: string): Promise<InstructorResponse[]>;
    createUsuario(payload: CreateUsuarioDto): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
        fichaAsignada: boolean;
        aprendiz?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
        fichaAsignada?: undefined;
        aprendiz?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            tipoDocumento: string;
            area: string;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            email: string;
            telefono: string;
            sexo: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
        instructor?: undefined;
        fichaAsignada?: undefined;
    }>;
    updateAprendiz(cedula: string, payload: UpdateAprendizDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            tipoDocumento: string;
            ficha: string;
            area: any;
            fichaNombre: any;
            programa: any;
            nombre: string;
            apellido: string;
            telefono: string;
            email: string;
            sexo: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
    }>;
    updateInstructor(cedula: string, payload: UpdateInstructorDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            fichasCargo: any;
            fichasDetalle: any;
        };
    }>;
    deleteAprendiz(cedula: string, actorCedula?: string): Promise<{
        ok: boolean;
        documento: string;
        mensaje: string;
    }>;
    deleteInstructor(cedula: string, actorCedula?: string): Promise<{
        ok: boolean;
        documento: string;
        mensaje: string;
    }>;
    updateAprendizEstado(cedula: string, estado: string): Promise<{
        ok: boolean;
        documento: string;
        estado: EstadoUsuario;
    }>;
    getInstructorStats(cedula: string): Promise<{
        instructor: string;
    }>;
}
