import { DataSource, Repository } from "typeorm";
import { Usuario } from "../entities/Usuario";
export declare class DashboardService {
    private readonly usuarioRepository;
    private dataSource;
    private readonly logger;
    private readonly schema;
    constructor(usuarioRepository: Repository<Usuario>, dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private columnExists;
    private resolveFichaTable;
    private resolveReunionUsuarioTable;
    private getProyectoStats;
    obtenerDatosDashboard(cedulaInput: string | number): Promise<{
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
