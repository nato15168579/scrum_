import { DetalleParametro } from "./DetalleParametro";
import { Usuario } from "./Usuario";
export declare class RolSistema {
    rolSisId: number;
    rolNombre: string | null;
    detalleParametros: DetalleParametro[];
    usuarios: Usuario[];
}
