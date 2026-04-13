import { DataSource } from 'typeorm';
export declare class IntegrantesService {
    private dataSource;
    constructor(dataSource: DataSource);
    obtenerIntegrantes(projectId: number): Promise<any>;
    obtenerDisponibles(projectId: number): Promise<any>;
    obtenerRolesScrum(): Promise<any>;
    eliminarIntegrantes(projectId: number, cedulas: number[]): Promise<any>;
    asignarIntegrantes(projectId: number, assignments: any[]): Promise<{
        success: boolean;
    }>;
}
