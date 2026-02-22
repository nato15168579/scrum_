import { CrearproService } from './crearpro.service';
export declare class CrearproController {
    private readonly crearproService;
    constructor(crearproService: CrearproService);
    checkName(nombre: string): Promise<{
        exists: boolean;
    }>;
    create(body: {
        nombre: string;
        objetivo: string;
        fecha: string;
        cedula: number;
    }): Promise<import("../entities/Proyecto").Proyecto>;
}
