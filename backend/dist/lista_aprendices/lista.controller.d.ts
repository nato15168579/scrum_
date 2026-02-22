import { ListaService } from './lista.service';
export declare class ListaController {
    private readonly listaService;
    constructor(listaService: ListaService);
    getAprendices(): Promise<{
        documento: string;
        ficha: string;
        nombre: string;
        apellido: string;
        telefono: string;
        email: string;
    }[]>;
    getStats(cedula: string): Promise<{
        instructor: string;
    }>;
}
