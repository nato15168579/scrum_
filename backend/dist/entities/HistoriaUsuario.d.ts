import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { DetalleParametro } from "./DetalleParametro";
import { Proyecto } from "./Proyecto";
export declare class HistoriaUsuario {
    hisId: number;
    proIdFk: number;
    hisTitulo: string | null;
    hisDescripcion: string | null;
    hisPrioridad: string | null;
    hisPuntaje: number | null;
    hisNumeroSprint: number | null;
    detParIdEstadoFk: number | null;
    criteriosAceptacions: CriteriosAceptacion[];
    detParIdEstadoFk2: DetalleParametro;
    proIdFk2: Proyecto;
}
