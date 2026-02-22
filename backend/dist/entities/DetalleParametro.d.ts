import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { Parametro } from "./Parametro";
import { HistoriaUsuario } from "./HistoriaUsuario";
import { Observaciones } from "./Observaciones";
import { Proyecto } from "./Proyecto";
import { Reuniones } from "./Reuniones";
import { RolSistema } from "./RolSistema";
import { UsuProDetPar } from "./UsuProDetPar";
export declare class DetalleParametro {
    detParId: number;
    detParDescripcion: string | null;
    parIdFk: number | null;
    criteriosAceptacions: CriteriosAceptacion[];
    parIdFk2: Parametro;
    historiaUsuarios: HistoriaUsuario[];
    observaciones: Observaciones[];
    proyectos: Proyecto[];
    reuniones: Reuniones[];
    rolSistemas: RolSistema[];
    usuProDetPars: UsuProDetPar[];
}
