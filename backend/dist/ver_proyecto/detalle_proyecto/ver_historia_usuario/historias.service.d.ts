import { Repository } from 'typeorm';
import { HistoriaUsuario } from '../../../entities/HistoriaUsuario';
export declare class HistoriasService {
    private readonly historiaRepository;
    constructor(historiaRepository: Repository<HistoriaUsuario>);
    findByProyecto(proId: number): Promise<HistoriaUsuario[]>;
    findOne(hisId: number, proId: number): Promise<HistoriaUsuario>;
}
