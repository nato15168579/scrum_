import { IntegrantesService } from './integrantes.service';
export declare class IntegrantesController {
    private readonly integrantesService;
    constructor(integrantesService: IntegrantesService);
    getIntegrantes(id: number): Promise<any>;
    getDisponibles(id: number): Promise<any>;
    getRoles(): Promise<any>;
    remove(body: {
        projectId: number;
        cedulas: number[];
    }): Promise<any>;
    assign(body: {
        projectId: number;
        assignments: any[];
    }): Promise<{
        success: boolean;
    }>;
}
