import { CriteriosAceptacion } from "./CriteriosAceptacion";
import { Observaciones } from "./Observaciones";
import { RolSistema } from "./RolSistema";
import { UsuProDetPar } from "./UsuProDetPar";
export type EstadoUsuario = "Activo" | "Inactivo";
export type SexoUsuario = "Hombre" | "Mujer";
export declare class Usuario {
    usuCedula: number;
    usuTipoDocumento: string | null;
    usuNombres: string | null;
    usuApellidos: string | null;
    usuCorreo: string | null;
    usuTelefono: string | null;
    usuEspecializacion: string | null;
    usuSexo: SexoUsuario | null;
    usuContrasena: string | null;
    fechaRegistro: Date;
    rolSisIdFk: number | null;
    usuEstado: EstadoUsuario | null;
    criteriosAceptacions: CriteriosAceptacion[];
    observaciones: Observaciones[];
    rolSisIdFk2: RolSistema;
    usuProDetPars: UsuProDetPar[];
}
