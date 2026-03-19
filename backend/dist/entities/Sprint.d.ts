import { DetalleParametro } from "./DetalleParametro";
import { Reuniones } from "./Reuniones";
export declare class Sprint {
    sprId: number;
    sprNombre: string | null;
    sprFechaInicio: string | null;
    sprFechaFin: string | null;
    sprDescripcion: string | null;
    detParFk: number | null;
    reuniones: Reuniones[];
    detParFk2: DetalleParametro;
}
