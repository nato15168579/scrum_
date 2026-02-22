import { Usuario } from "./Usuario";
import { DetalleParametro } from "./DetalleParametro";
import { HistoriaUsuario } from "./HistoriaUsuario";
export declare class CriteriosAceptacion {
    criId: number;
    hisIdFk: number;
    proIdHisFk: number;
    usuCedulaFk: number | null;
    estadoFk: number | null;
    criTiempo: string | null;
    criDescripcion: string | null;
    usuCedulaFk2: Usuario;
    estadoFk2: DetalleParametro;
    historiaUsuario: HistoriaUsuario;
}
