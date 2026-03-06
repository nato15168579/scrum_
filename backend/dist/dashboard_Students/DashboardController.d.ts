import { DashboardService } from './DashboardService';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardData(cedula: string): Promise<{
        error: string;
        instructor?: undefined;
        correo?: undefined;
        description?: undefined;
        stats?: undefined;
        proyectosData?: undefined;
    } | {
        instructor: string;
        correo: string;
        description: string;
        stats: {
            label: string;
            value: number;
        }[];
        proyectosData: {
            total: number;
            porHacer: number;
            enProgreso: number;
            hecho: number;
        };
        error?: undefined;
    }>;
}
