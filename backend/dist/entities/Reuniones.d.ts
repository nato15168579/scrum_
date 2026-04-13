import { Sprint } from "./Sprint";
import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";
export declare class Reuniones {
    reuId: number;
    sprIdFk: number;
    detParIdTipoFk: number;
    detParIdEstadoFk: number | null;
    reuFecha: string;
    reuDescripcion: string | null;
    reuLugar: string | null;
    reuHora: string | null;
    reuResumen: string | null;
    reuInforme: string | null;
    reuResponsableFk: number | null;
    sprIdFk2: Sprint;
    detParIdTipoFk2: DetalleParametro;
    detParIdEstadoFk2: DetalleParametro | null;
    reuResponsableFk2: Usuario | null;
}
