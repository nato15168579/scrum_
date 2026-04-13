import { Repository } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Reuniones } from "../entities/Reuniones";
import { Observaciones } from "../entities/Observaciones";
import { Sprint } from "../entities/Sprint";
type ActivityType = "hu" | "reunion" | "observacion";
type ActivityDonut = {
    completadas: number;
    enCurso: number;
    pendiente: number;
};
type DashboardResponse = {
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
    actividad: ActivityDonut;
    actividadGlobal: ActivityDonut;
    actividadesRecientes: {
        text: string;
        time: string;
        type: ActivityType;
    }[];
};
export declare class AprendizDashboardService {
    private readonly usuarioRepo;
    private readonly huRepo;
    private readonly usuProRepo;
    private readonly reunionesRepo;
    private readonly observacionesRepo;
    private readonly sprintRepo;
    constructor(usuarioRepo: Repository<Usuario>, huRepo: Repository<HistoriaUsuario>, usuProRepo: Repository<UsuProDetPar>, reunionesRepo: Repository<Reuniones>, observacionesRepo: Repository<Observaciones>, sprintRepo: Repository<Sprint>);
    private emptyDashboard;
    private getProIdFromAsignacion;
    private formatRelativeFromDate;
    private getHistoriaAccion;
    private buildDateFromReunion;
    private normalizeText;
    private interleaveActivities;
    private buildActivityPercentages;
    getDashboardByCedula(cedula: number | string): Promise<DashboardResponse | {
        error: string;
        detalle?: undefined;
    } | {
        error: string;
        detalle: string;
    }>;
}
export {};
