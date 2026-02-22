import { Repository } from 'typeorm';
import { Proyecto } from '../entities/proyecto';
import { UsuProDetPar } from '../entities/UsuProDetPar';
export declare class CrearproService {
    private readonly proyectoRepository;
    private readonly usuRepository;
    constructor(proyectoRepository: Repository<Proyecto>, usuRepository: Repository<UsuProDetPar>);
    checkProjectExists(nombre: string): Promise<{
        exists: boolean;
    }>;
    createProject(data: {
        nombre: string;
        objetivo: string;
        fecha: string;
        cedula: number;
    }): Promise<Proyecto>;
}
