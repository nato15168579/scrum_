import { Sprint } from "./Sprint";
import { DetalleParametro } from "./DetalleParametro";
export declare class Reuniones {
    reuId: number;
    sprIdFk: number;
    detParIdTipoFk: number;
    reuFecha: string;
    reuDescripcion: string | null;
    reuLugar: string | null;
    reuHora: string | null;
    sprIdFk2: Sprint;
    detParIdTipoFk2: DetalleParametro;
}
