import { Usuario } from "./Usuario";
import { DetalleParametro } from "./DetalleParametro";
import { HistoriaUsuario } from "./HistoriaUsuario";
export declare class CriteriosAceptacion {
    criId: number;
    proIdFk: number;
    usuCedulaFk: number;
    detParIdFk: number;
    hisIdFk: number | null;
    criTiempo: string | null;
    criDescripcion: string | null;
    usuCedulaFk2: Usuario;
    detParIdFk2: DetalleParametro;
    historiaUsuario: HistoriaUsuario;
}
