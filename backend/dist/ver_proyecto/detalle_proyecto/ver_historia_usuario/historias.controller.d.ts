import { HistoriasService } from './historias.service';
export declare class HistoriasController {
    private readonly historiasService;
    constructor(historiasService: HistoriasService);
    getByProyecto(proId: number): Promise<import("../../../entities/HistoriaUsuario").HistoriaUsuario[]>;
    getOne(proId: number, hisId: number): Promise<import("../../../entities/HistoriaUsuario").HistoriaUsuario>;
}
