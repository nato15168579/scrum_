import { Usuario } from "./Usuario";
import { Proyecto } from "./Proyecto";
import { DetalleParametro } from "./DetalleParametro";
export declare class Observaciones {
    obsId: number;
    obsFecha: string | null;
    detParIdFk: number | null;
    obsDescripcion: string | null;
    usuCedulaFk: number | null;
    proIdFk: number | null;
    usuCedulaFk2: Usuario;
    proIdFk2: Proyecto;
    detParIdFk2: DetalleParametro;
}
