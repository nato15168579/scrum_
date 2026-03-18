import { DataSource } from 'typeorm';
interface AssignmentInput {
    cedula: number;
    rolId: number;
}
export declare class AsigProyectoService {
    private dataSource;
    private readonly schema;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private resolveProyectoTable;
    getProyectos(): Promise<any>;
    getAprendicesParaAsignacion(): Promise<any>;
    getRolesScrum(): Promise<any>;
    asignarIntegrantes(projectId: number, assignments: AssignmentInput[]): Promise<{
        success: boolean;
    }>;
}
export {};
