import { Repository, DataSource } from 'typeorm';
import { Usuario } from '../../entities/Usuario';
import { UsuProDetPar } from '../../entities/UsuProDetPar';
export declare class AsigIntegrantesService {
    private readonly usuarioRepo;
    private readonly usuProDetParRepo;
    private dataSource;
    constructor(usuarioRepo: Repository<Usuario>, usuProDetParRepo: Repository<UsuProDetPar>, dataSource: DataSource);
    getAprendices(): Promise<Usuario[]>;
    getIntegrantesPorProyecto(proId: number): Promise<UsuProDetPar[]>;
    guardarAsignacion(proId: number, assignments: {
        cedula: number;
        rolId: number;
    }[]): Promise<{
        status: string;
    }>;
}
