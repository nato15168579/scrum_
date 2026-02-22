import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';
export declare class ListaService {
    private readonly usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    findAllAprendices(): Promise<{
        documento: string;
        ficha: string;
        nombre: string;
        apellido: string;
        telefono: string;
        email: string;
    }[]>;
    getInstructorStats(cedula: string): Promise<{
        instructor: string;
    }>;
}
