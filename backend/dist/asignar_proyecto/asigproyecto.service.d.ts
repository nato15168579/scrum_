import { DataSource } from 'typeorm';
export declare class AsigProyectoService {
    private dataSource;
    constructor(dataSource: DataSource);
    getProyectos(): Promise<any>;
    getAprendicesParaAsignacion(): Promise<any>;
    getRolesScrum(): Promise<any>;
    asignarIntegrantes(projectId: number, assignments: any[]): Promise<{
        success: boolean;
    }>;
}
