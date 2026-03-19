import { DataSource } from 'typeorm';
export declare class VerproService {
    private readonly dataSource;
    private readonly schema;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private columnExists;
    private getTableType;
    private ensureLegacyAdminViews;
    private resolveUsuProDetParRoleColumn;
    private resolveProyectoTable;
    private resolveFichaNombreColumn;
    private resolveRolesScrum;
    private resolveDefaultRolScrumId;
    private resolveDefaultEstadoId;
    private resolveHistoriaEstadoColumn;
    private resolveHistoriaSprintColumn;
    private resolveObservacionEstadoColumn;
    private resolveCriteriaProjectColumn;
    private resolveCriteriaHistoriaColumn;
    private resolveCriteriaEstadoColumn;
    private normalizeIntegerFieldInput;
    private resolveUsuarioResponsableCedula;
    private resolveNextProjectScopedId;
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
    createHistoriaUsuario(id: number, payload: {
        titulo?: unknown;
        descripcion?: unknown;
        puntaje?: unknown;
        numeroSprint?: unknown;
        actorCedula?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    updateHistoriaUsuario(id: number, hisId: number, payload: {
        titulo?: unknown;
        descripcion?: unknown;
        puntaje?: unknown;
        numeroSprint?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    deleteHistoriaUsuario(id: number, hisId: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    createCriterioAceptacion(id: number, payload: {
        descripcion?: unknown;
        tiempo?: unknown;
        hisId?: unknown;
        actorCedula?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    updateCriterioAceptacion(id: number, criId: number, payload: {
        descripcion?: unknown;
        tiempo?: unknown;
        hisId?: unknown;
        actorCedula?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    deleteCriterioAceptacion(id: number, criId: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    createSugerencia(id: number, payload: {
        descripcion?: unknown;
        actorCedula?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    updateSugerencia(id: number, obsId: number, payload: {
        descripcion?: unknown;
        actorCedula?: unknown;
    }): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    deleteSugerencia(id: number, obsId: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
}
