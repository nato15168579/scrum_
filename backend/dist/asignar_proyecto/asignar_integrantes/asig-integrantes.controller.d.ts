import { AsigIntegrantesService } from './asig-integrantes.service';
export declare class AsigIntegrantesController {
    private readonly asigService;
    constructor(asigService: AsigIntegrantesService);
    listarAprendices(): Promise<import("../../entities/Usuario").Usuario[]>;
    obtenerIntegrantes(id: string): Promise<import("../../entities/UsuProDetPar").UsuProDetPar[]>;
    guardar(id: string, body: {
        assignments: any[];
    }): Promise<{
        status: string;
    }>;
}
