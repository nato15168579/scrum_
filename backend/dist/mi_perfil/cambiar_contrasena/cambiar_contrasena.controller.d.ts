import { CambiarContrasenaService } from './cambiar_contrasena.service';
export declare class CambiarContrasenaController {
    private readonly cambiarService;
    constructor(cambiarService: CambiarContrasenaService);
    cambiarPassword(cedula: number, body: {
        passActual: string;
        passNueva: string;
    }): Promise<{
        message: string;
    }>;
}
