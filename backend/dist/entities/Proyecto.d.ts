import { HistoriaUsuario } from "./HistoriaUsuario";
import { Observaciones } from "./Observaciones";
import { DetalleParametro } from "./DetalleParametro";
import { Sprint } from "./Sprint";
import { UsuProDetPar } from "./UsuProDetPar";
export declare class Proyecto {
    proId: number;
    proNombre: string | null;
    proObjetivoGeneral: string | null;
    porObjetivosEspecificos: string | null;
    proDescription: string | null;
    proFechaInicio: string | null;
    proFechaFin: string | null;
    proDuracionSprint: string | null;
    proJustificacion: string | null;
    detParIdFk: number | null;
    historiaUsuarios: HistoriaUsuario[];
    observaciones: Observaciones[];
    detParIdFk2: DetalleParametro;
    sprints: Sprint[];
    usuProDetPars: UsuProDetPar[];
}
