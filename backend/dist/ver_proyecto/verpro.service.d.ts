import { Repository } from 'typeorm';
import { Proyecto } from '../entities/Proyecto';
export declare class VerproService {
    private readonly proyectoRepository;
    constructor(proyectoRepository: Repository<Proyecto>);
    findAll(): Promise<Proyecto[]>;
    findOne(id: number): Promise<Proyecto>;
}
