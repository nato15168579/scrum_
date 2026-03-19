import { LoginService } from './LoginService';
interface LoginRequestBody {
    cedula: string;
    pass: string;
}
export declare class LoginController {
    private readonly loginService;
    constructor(loginService: LoginService);
    login(body: LoginRequestBody): Promise<{
        usuCedula: number;
        usuTipoDocumento: string | null;
        usuNombres: string | null;
        usuApellidos: string | null;
        usuCorreo: string | null;
        usuTelefono: string | null;
        usuEspecializacion: string | null;
        usuSexo: import("../entities/Usuario").SexoUsuario | null;
        usuContrasena: string | null;
        fechaRegistro: Date;
        rolSisIdFk: number | null;
        usuEstado: import("../entities/Usuario").EstadoUsuario | null;
        criteriosAceptacions: import("../entities/CriteriosAceptacion").CriteriosAceptacion[];
        observaciones: import("../entities/Observaciones").Observaciones[];
        rolSisIdFk2: import("../entities/RolSistema").RolSistema;
        usuProDetPars: import("../entities/UsuProDetPar").UsuProDetPar[];
    }>;
}
export {};
