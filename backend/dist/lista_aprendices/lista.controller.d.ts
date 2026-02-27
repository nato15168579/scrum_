import { ListaService } from './lista.service';
export declare class ListaController {
    private readonly listaService;
    constructor(listaService: ListaService);
    getAprendices(): Promise<any>;
    getStats(cedula: string): Promise<{
        instructor: string;
    }>;
    createAprendiz(payload: {
        cedula: string | number;
        nombre: string;
        apellidos: string;
        correo: string;
        telefono?: string;
        ficha?: string;
        tipoDocumento?: string;
        sexo?: string;
        password: string;
    }): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            nombre: string;
            apellido: string;
            ficha: string;
            email: string;
            fechaInscripcion: string;
        };
    }>;
}
