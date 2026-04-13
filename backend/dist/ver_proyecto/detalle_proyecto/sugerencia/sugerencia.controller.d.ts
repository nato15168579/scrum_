import { SugerenciaService } from './sugerencia.service';
export declare class SugerenciaController {
    private readonly sugerenciaService;
    constructor(sugerenciaService: SugerenciaService);
    crearSugerencia(body: {
        projectId: number;
        cedula: number;
        titulo: string;
        descripcion: string;
    }): Promise<{
        success: boolean;
        data: import("../../../entities/Observaciones").Observaciones;
        message: string;
    }>;
}
