import { HistoriaUsuario } from "./HistoriaUsuario";
import { Observaciones } from "./Observaciones";
import { DetalleParametro } from "./DetalleParametro";
import { Sprint } from "./Sprint";
import { UsuProDetPar } from "./UsuProDetPar";
export declare class Proyecto {
    proId: number;
    proCodigo: string | null;
    proNombre: string | null;
    proObjetivoGeneral: string | null;
    proObjetivosEspecificos: string | null;
    proDescription: string | null;
    proFechaInicio: string | null;
    proFechaFin: string | null;
    proJustificacion: string | null;
    detParIdFk: number | null;
    proFechaCreacion: Date;
    historiaUsuarios: HistoriaUsuario[];
    observaciones: Observaciones[];
    detParIdFk2: DetalleParametro;
    sprints: Sprint[];
    usuProDetPars: UsuProDetPar[];
}
