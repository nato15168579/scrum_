import { VerproService } from './VerproService';
export declare class VerproController {
    private readonly verproService;
    constructor(verproService: VerproService);
    getProyectos(): Promise<any>;
    getProyectoDetalleAdmin(id: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
    }>;
    getProyectoById(id: number): Promise<any>;
}
