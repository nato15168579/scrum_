import { LoginService } from './LoginService';
import { PasswordRecoveryService } from './PasswordRecoveryService';
interface LoginRequestBody {
    cedula: string;
    pass: string;
}
interface PasswordRecoveryRequestBody {
    usu_cedula: string;
    usu_correo: string;
}
interface VerifyRecoveryCodeBody {
    usu_cedula: string;
    recovery_id: string;
    codigo: string;
}
interface ResetPasswordBody {
    usu_cedula: string;
    recovery_id: string;
    reset_token: string;
    new_password: string;
}
export declare class LoginController {
    private readonly loginService;
    private readonly passwordRecoveryService;
    constructor(loginService: LoginService, passwordRecoveryService: PasswordRecoveryService);
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
    sendRecoveryCode(body: PasswordRecoveryRequestBody): Promise<{
        message: string;
        recoveryId: string;
        maskedEmail: string;
        expiresAt: string;
        expiresInMinutes: number;
        resendAvailableAt: string;
        deliveryMode: "console" | "email";
        debugCode: string;
        debugLogLocation: string;
    }>;
    verifyCode(body: VerifyRecoveryCodeBody): Promise<{
        message: string;
        resetToken: string;
        resetExpiresAt: string;
        passwordPolicy: {
            hints: ("Minimo 8 caracteres." | "Al menos una letra mayuscula." | "Al menos una letra minuscula." | "Al menos un numero." | "Al menos un caracter especial.")[];
            minLength: 8;
            requireLowercase: true;
            requireUppercase: true;
            requireNumber: true;
            requireSpecial: true;
        };
    }>;
    resetPassword(body: ResetPasswordBody): Promise<{
        message: string;
        invalidateClientSession: boolean;
        invalidatedPreviousCodes: boolean;
    }>;
}
export {};
