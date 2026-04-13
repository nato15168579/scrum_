import { AprendizObservacionesService } from "./aprendizObservaciones.service";
export declare class AprendizObservacionesController {
    private readonly aprendizObservacionesService;
    constructor(aprendizObservacionesService: AprendizObservacionesService);
    findByAprendiz(cedula: string): Promise<{
        id: number;
        descripcion: string;
        area: string;
        instructor: string;
        fecha: string;
        visto: boolean;
        estadoFk: number;
    }[]>;
    toggleVisto(id: string, cedula: string): Promise<{
        id: number;
        visto: boolean;
        area: string;
        estadoFk: number;
        message: string;
    }>;
}
