import { Repository } from 'typeorm';
import { Observaciones } from '../../../entities/Observaciones';
export declare class SugerenciaService {
    private readonly observacionRepo;
    constructor(observacionRepo: Repository<Observaciones>);
    crearSugerencia(data: {
        projectId: number;
        cedula: number;
        titulo: string;
        descripcion: string;
    }): Promise<{
        success: boolean;
        data: Observaciones;
        message: string;
    }>;
}
