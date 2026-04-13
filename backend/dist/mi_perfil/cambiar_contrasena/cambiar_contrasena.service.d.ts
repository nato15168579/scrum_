import { Repository } from 'typeorm';
import { Usuario } from '../../entities/Usuario';
export declare class CambiarContrasenaService {
    private usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    actualizarPassword(cedula: number, passActual: string, passNueva: string): Promise<{
        message: string;
    }>;
}
