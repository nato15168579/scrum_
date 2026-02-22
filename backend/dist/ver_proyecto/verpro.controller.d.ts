import { VerproService } from './verpro.service';
export declare class VerproController {
    private readonly verproService;
    constructor(verproService: VerproService);
    getProyectos(): Promise<import("../entities/Proyecto").Proyecto[]>;
    getProyectoById(id: number): Promise<import("../entities/Proyecto").Proyecto>;
}
