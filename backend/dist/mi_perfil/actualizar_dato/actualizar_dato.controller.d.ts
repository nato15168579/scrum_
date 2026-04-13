import { ActualizarDatoService } from './actualizar_dato.service';
export declare class ActualizarDatoController {
    private readonly actualizarDatoService;
    constructor(actualizarDatoService: ActualizarDatoService);
    getUsuario(cedula: string): Promise<any>;
    updateUsuario(cedula: string, data: any): Promise<{
        message: string;
    }>;
}
