import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { DetalleParametro } from "./DetalleParametro";
import { Proyecto } from "./Proyecto";
import { Sprint } from "./Sprint";
import { Usuario } from "./Usuario";
export declare class HistoriaUsuario {
    hisId: number;
    proIdFk: number;
    hisTitulo: string | null;
    hisDescripcion: string | null;
    hisPuntaje: number | null;
    detParIdFk: number | null;
    usuCedulaFk: number | null;
    sprintIdFk: number | null;
    criteriosAceptacions: CriteriosAceptacion[];
    detParIdFk2: DetalleParametro;
    usuCedulaFk2: Usuario;
    sprintIdFk2: Sprint;
    proIdFk2: Proyecto;
}
