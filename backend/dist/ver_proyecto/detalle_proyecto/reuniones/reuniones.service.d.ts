import { Repository } from 'typeorm';
import { Reuniones } from '../../../entities/Reuniones';
export declare class ReunionesService {
    private readonly reunionesRepository;
    constructor(reunionesRepository: Repository<Reuniones>);
    findByProyecto(proId: number, tipoReunionId: number): Promise<Reuniones[]>;
    findOne(id: number): Promise<Reuniones>;
    create(data: Partial<Reuniones>): Promise<Reuniones>;
}
