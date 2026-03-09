import { AsigProyectoService } from './AsigproyectoService';
interface AssignmentInput {
    cedula: number;
    rolId: number;
}
export declare class AsigProyectoController {
    private readonly asigService;
    constructor(asigService: AsigProyectoService);
    getProyectos(): Promise<any>;
    getAprendices(): Promise<any>;
    getRolesScrum(): Promise<any>;
    asignar(body: {
        projectId: number;
        assignments: AssignmentInput[];
    }): Promise<{
        success: boolean;
    }>;
}
export {};
