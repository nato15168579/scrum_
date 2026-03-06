import { VerproService } from './VerproService';
export declare class VerproController {
    private readonly verproService;
    constructor(verproService: VerproService);
    getProyectos(): Promise<any>;
    getProyectoById(id: number): Promise<any>;
}
