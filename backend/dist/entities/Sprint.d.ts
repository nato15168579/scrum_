import { Reuniones } from "./Reuniones";
import { Proyecto } from "./Proyecto";
export declare class Sprint {
    sprId: number;
    sprNombre: string | null;
    sprFechaInicio: string | null;
    sprFechaFin: string | null;
    sprEstado: string | null;
    sprDescripcion: string | null;
    proIdFk: number | null;
    reuniones: Reuniones[];
    proIdFk2: Proyecto;
}
