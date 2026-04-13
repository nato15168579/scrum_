import { CriterioService } from './criterio.service';
export declare class CriterioController {
    private readonly criterioService;
    constructor(criterioService: CriterioService);
    getCriterios(proId: number, hisId: number): Promise<import("../../../../entities/CriteriosAceptacion").CriteriosAceptacion[]>;
}
