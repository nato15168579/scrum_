import { DataSource, Repository } from 'typeorm';
import { EstadoUsuario, Usuario } from '../entities/Usuario';
interface CreateUsuarioDto {
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
    password: string;
}
interface UpdateAprendizDto {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    sexo?: string;
    ficha?: string | number;
    estado?: string;
}
export declare class ListaService {
    private readonly usuarioRepository;
    private readonly dataSource;
    constructor(usuarioRepository: Repository<Usuario>, dataSource: DataSource);
    private columnExists;
    private tableExists;
    private ensureFechaRegistroColumn;
    private ensureEstadoColumn;
    private ensureEspecializacionColumn;
    private ensureSexoColumn;
    private ensureUsuarioColumns;
    private ensureFichaSchema;
    private getFichaNombreSelect;
    private normalizeEstado;
    private formatDateToIso;
    private buildFichaDetalle;
    private getRolUsuario;
    private getFichasAsignadasUsuario;
    private sanitizeText;
    private getFichaActualUsuario;
    private getFichaByNumero;
    private mapAprendizResponse;
    private deleteUsuarioReferences;
    findAllFichas(): Promise<any>;
    findAllAprendices(cedulaSolicitante?: string): Promise<any[]>;
    findAllInstructores(_cedulaSolicitante?: string): Promise<any[]>;
    createUsuario(payload: CreateUsuarioDto): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
        aprendiz?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            tipoDocumento: string;
            area: any;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: any;
            programa: any;
            email: string;
            telefono: string;
            sexo: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
        instructor?: undefined;
    }>;
    updateAprendiz(cedula: string, payload: UpdateAprendizDto): Promise<{
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
    deleteAprendiz(cedula: string): Promise<{
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
export {};
