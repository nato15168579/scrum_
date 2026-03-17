import { VerproService } from './VerproService';
export declare class VerproController {
    private readonly verproService;
    constructor(verproService: VerproService);
    getProyectos(): Promise<any>;
    getProyectoDetalleAdmin(id: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
        historiasUsuario: any[];
        criteriosAceptacion: any[];
        sugerencias: any[];
    }>;
    updateProyectoDetalleAdmin(id: number, body: {
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
    getProyectoAprendicesEditor(id: number): Promise<{
        proyecto: {
            proId: number;
            proNombre: any;
            fichaNumero: string;
        };
        aprendicesProyecto: any;
        aprendicesFicha: any[];
        rolesScrum: any[];
    }>;
    addAprendizToProyecto(id: number, body: {
        cedula: string | number;
        detParId?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    saveProyectoAprendices(id: number, body: {
        addCedulas?: Array<string | number>;
        removeCedulas?: Array<string | number>;
    }): Promise<{
        success: boolean;
        added: string[];
        removed: string[];
    }>;
    updateAprendizProyectoRole(id: number, cedula: string, body: {
        detParId: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    removeAprendizFromProyecto(id: number, cedula: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getProyectoById(id: number): Promise<any>;
}
