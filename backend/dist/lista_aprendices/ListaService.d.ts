import { DataSource, Repository } from 'typeorm';
import { EstadoUsuario, Usuario } from '../entities/Usuario';
interface CreateAprendizDto {
    cedula: string | number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono?: string;
    ficha?: string;
    tipoDocumento?: string;
    sexo?: string;
    password: string;
}
export declare class ListaService {
    private readonly usuarioRepository;
    private readonly dataSource;
    constructor(usuarioRepository: Repository<Usuario>, dataSource: DataSource);
    private columnExists;
    private tableExists;
    private ensureFechaRegistroColumn;
    private ensureEstadoColumn;
    private ensureUsuarioColumns;
    private ensureFichaSchema;
    private normalizeEstado;
    private formatDateToIso;
    private buildFichaDetalle;
    private getRolUsuario;
    private getFichasAsignadasUsuario;
    findAllFichas(): Promise<any>;
    findAllAprendices(cedulaSolicitante?: string): Promise<any[]>;
    findAllInstructores(_cedulaSolicitante?: string): Promise<any[]>;
    createAprendiz(payload: CreateAprendizDto): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: any;
            programa: any;
            email: string;
            fechaInscripcion: string;
            estado: EstadoUsuario;
        };
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
