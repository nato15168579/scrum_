import { CrearproService } from './CrearproService';
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
        fechaInicio?: string;
        fechaFin?: string;
        cedula: number;
    }): Promise<import("../entities/Proyecto").Proyecto>;
}
