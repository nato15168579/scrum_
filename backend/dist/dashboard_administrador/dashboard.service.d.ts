import { Repository, DataSource } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { Proyecto } from "../entities/Proyecto";
export declare class DashboardService {
    private readonly usuarioRepository;
    private readonly proyectoRepository;
    private dataSource;
    private readonly logger;
    constructor(usuarioRepository: Repository<Usuario>, proyectoRepository: Repository<Proyecto>, dataSource: DataSource);
    obtenerDatosDashboard(cedulaInput: any): Promise<{
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
