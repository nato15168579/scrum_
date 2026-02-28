import { DataSource, Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';
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
    private ensureRegistroTable;
    findAllAprendices(): Promise<any>;
    findAllInstructores(): Promise<any>;
    createAprendiz(payload: CreateAprendizDto): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            nombre: string;
            apellido: string;
            ficha: string;
            email: string;
            fechaInscripcion: string;
        };
    }>;
    getInstructorStats(cedula: string): Promise<{
        instructor: string;
    }>;
}
export {};
