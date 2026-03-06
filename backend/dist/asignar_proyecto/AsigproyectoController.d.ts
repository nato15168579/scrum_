import { AsigProyectoService } from './AsigproyectoService';
export declare class AsigProyectoController {
    private readonly asigService;
    constructor(asigService: AsigProyectoService);
    getProyectos(): Promise<any>;
    getAprendices(): Promise<any>;
    getRolesScrum(): Promise<any>;
    asignar(body: {
        projectId: number;
        assignments: any[];
    }): Promise<{
        success: boolean;
    }>;
}
