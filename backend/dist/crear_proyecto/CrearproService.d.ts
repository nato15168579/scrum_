import { Repository } from 'typeorm';
import { Proyecto } from '../entities/Proyecto';
import { UsuProDetPar } from '../entities/UsuProDetPar';
export declare class CrearproService {
    private readonly proyectoRepository;
    private readonly usuRepository;
    constructor(proyectoRepository: Repository<Proyecto>, usuRepository: Repository<UsuProDetPar>);
    private getProjectTableName;
    private getEscapedProjectTableName;
    private projectCodeColumnExists;
    private ensureProjectCodeSchema;
    private generateUniqueProjectCode;
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
    }): Promise<Proyecto>;
}
