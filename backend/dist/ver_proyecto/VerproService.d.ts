import { DataSource } from 'typeorm';
export declare class VerproService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private columnExists;
    private resolveProyectoTable;
    private resolveFichaNombreColumn;
    private resolveRolesScrum;
    private resolveDefaultRolScrumId;
    private findProyectoContext;
    private findProyectoAprendices;
    private findFichaAprendicesForProject;
    private getAprendizProyectoAssignment;
    private normalizeCedulasList;
    private normalizeTextFieldInput;
    private findHistoriasUsuarioByProyecto;
    private findCriteriosAceptacionByProyecto;
    private findSugerenciasByProyecto;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    findAdminDetalle(id: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    updateAdminDetalle(id: number, payload: {
        proDescription?: string | null;
        proObjetivoGeneral?: string | null;
        proObjetivosEspecificos?: string | null;
        proJustificacion?: string | null;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    findAdminAprendicesEditor(id: number): Promise<{
        proyecto: {
            proId: number;
            proNombre: any;
            fichaNumero: string;
        };
        aprendicesProyecto: any;
        aprendicesFicha: any[];
        rolesScrum: any[];
    }>;
    addAprendizToProyecto(id: number, cedula: string | number, detParId?: number): Promise<{
        success: boolean;
        message: string;
    }>;
    saveProyectoAprendices(id: number, payload: {
        addCedulas?: Array<string | number>;
        removeCedulas?: Array<string | number>;
    }): Promise<{
        success: boolean;
        added: string[];
        removed: string[];
    }>;
    updateAprendizProyectoRole(id: number, cedula: string | number, detParId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    removeAprendizFromProyecto(id: number, cedula: string | number): Promise<{
        success: boolean;
        message: string;
    }>;
}
