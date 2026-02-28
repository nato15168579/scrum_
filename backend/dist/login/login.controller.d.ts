import { LoginService } from './login.service';
export declare class LoginController {
    private readonly loginService;
    constructor(loginService: LoginService);
    login(body: any): Promise<{
        usuCedula: number;
        usuTipoDocumento: string | null;
        usuNombres: string | null;
        usuApellidos: string | null;
        usuCorreo: string | null;
        usuTelefono: string | null;
        rolSisIdFk: number | null;
        usuFicha: string | null;
        criteriosAceptacions: import("../entities/CriteriosAceptacion").CriteriosAceptacion[];
        observaciones: import("../entities/Observaciones").Observaciones[];
        rolSisIdFk2: import("../entities/RolSistema").RolSistema;
        reuniones: import("../entities/Reuniones").Reuniones[];
        usuProDetPars: import("../entities/UsuProDetPar").UsuProDetPar[];
    }>;
}
