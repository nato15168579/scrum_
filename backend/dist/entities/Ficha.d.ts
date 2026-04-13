import { DetalleParametro } from "./DetalleParametro";
import { UsuFic } from "./UsuFic";
export declare class Ficha {
    ficId: number;
    ficCodigo: number;
    proGraIdFk: number;
    ficEstado: string;
    programa: DetalleParametro;
    usuFics: UsuFic[];
}
