import { Sprint } from "./Sprint";
import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";
export declare class Reuniones {
    reuId: number;
    sprIdFk: number;
    detParIdTipoFk: number;
    reuFecha: string;
    reuResumen: string | null;
    reuAsistentesFk: number | null;
    sprIdFk2: Sprint;
    detParIdTipoFk2: DetalleParametro;
    usuarios: Usuario[];
}
