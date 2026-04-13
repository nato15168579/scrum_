import { AprendizDashboardService } from "./aprendizDashboard.service";
export declare class AprendizDashboardController {
    private readonly service;
    constructor(service: AprendizDashboardService);
    get(cedula: string): Promise<{
        aprendiz: string;
        correo: string | null;
        stats: {
            tareasActivas: number;
            tareasCompletadas: number;
            participacionReuniones: number;
            retroalimentaciones: number;
        };
        avanceProyecto: {
            label: string;
            value: number;
        }[];
        actividad: {
            completadas: number;
            enCurso: number;
            pendiente: number;
        };
        actividadGlobal: {
            completadas: number;
            enCurso: number;
            pendiente: number;
        };
        actividadesRecientes: {
            text: string;
            time: string;
            type: "hu" | "reunion" | "observacion";
        }[];
    } | {
        error: string;
        detalle?: undefined;
    } | {
        error: string;
        detalle: string;
    }>;
}
