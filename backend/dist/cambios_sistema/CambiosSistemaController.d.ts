import { CambiosSistemaService } from "./CambiosSistemaService";
export declare class CambiosSistemaController {
    private readonly cambiosSistemaService;
    constructor(cambiosSistemaService: CambiosSistemaService);
    listarCambios(estado?: string, limit?: string): Promise<{
        ok: boolean;
        cambios: {
            id: number;
            descripcion: string;
            fecha: string | Date;
            observado: boolean;
            usuario: {
                cedula: string;
                nombres: string;
                apellidos: string;
                rol: string;
            };
        }[];
    }>;
    marcarComoObservado(id: number): Promise<{
        ok: boolean;
        id: number;
    }>;
}
