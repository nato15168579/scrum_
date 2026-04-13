import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';
export declare class MiPerfilService {
    private readonly usuarioRepo;
    constructor(usuarioRepo: Repository<Usuario>);
    obtenerPerfil(cedula: number): Promise<{
        usuCedula: number;
        usuTipoDocumento: string | null;
        usuNombres: string | null;
        usuApellidos: string | null;
        usuCorreo: string | null;
        usuTelefono: string | null;
        usuEspecializacion: string | null;
        usuSexo: import("../entities/Usuario").SexoUsuario | null;
        fechaRegistro: Date;
        rolSisIdFk: number | null;
        usuEstado: import("../entities/Usuario").EstadoUsuario | null;
        criteriosAceptacions: import("../entities/CriteriosAceptacion").CriteriosAceptacion[];
        observaciones: import("../entities/Observaciones").Observaciones[];
        rolSisIdFk2: import("../entities/RolSistema").RolSistema;
        usuProDetPars: import("../entities/UsuProDetPar").UsuProDetPar[];
    }>;
}
