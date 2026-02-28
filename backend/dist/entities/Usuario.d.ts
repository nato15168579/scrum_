import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { Observaciones } from "./Observaciones";
import { RolSistema } from "./RolSistema";
import { Reuniones } from "./Reuniones";
import { UsuProDetPar } from "./UsuProDetPar";
export declare class Usuario {
    usuCedula: number;
    usuTipoDocumento: string | null;
    usuNombres: string | null;
    usuApellidos: string | null;
    usuCorreo: string | null;
    usuTelefono: string | null;
    usuContrasena: string | null;
    rolSisIdFk: number | null;
    usuFicha: string | null;
    criteriosAceptacions: CriteriosAceptacion[];
    observaciones: Observaciones[];
    rolSisIdFk2: RolSistema;
    reuniones: Reuniones[];
    usuProDetPars: UsuProDetPar[];
}
