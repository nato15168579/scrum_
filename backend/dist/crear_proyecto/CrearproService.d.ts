import { Repository } from 'typeorm';
import { Proyecto } from '../entities/Proyecto';
export declare class CrearproService {
    private readonly proyectoRepository;
    constructor(proyectoRepository: Repository<Proyecto>);
    private getProjectTableName;
    private getEscapedProjectTableName;
    private tableExists;
    private columnExists;
    private resolveFichaTableName;
    private resolveFichaNumeroColumn;
    private fichaExists;
    private projectCodeColumnExists;
    private ensureFichaProyectoSchema;
    private ensureProjectCodeSchema;
    private generateUniqueProjectCode;
    private resolveDefaultProjectStatusId;
    checkProjectExists(nombre: string): Promise<{
        exists: boolean;
    }>;
    createProject(data: {
        nombre: string;
        objetivo: string;
        fecha: string;
        fechaInicio?: string;
        fechaFin?: string;
        cedula: number;
        fichaNumero?: number | string | null;
    }): Promise<Proyecto>;
}
