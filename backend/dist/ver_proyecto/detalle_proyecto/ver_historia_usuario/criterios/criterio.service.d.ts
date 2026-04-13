import { Repository } from 'typeorm';
import { CriteriosAceptacion } from '../../../../entities/CriteriosAceptacion';
export declare class CriterioService {
    private criterioRepo;
    constructor(criterioRepo: Repository<CriteriosAceptacion>);
    findByProyectoAndHistoria(proId: number, hisId: number): Promise<CriteriosAceptacion[]>;
}
