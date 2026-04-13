import { ReunionesService } from './reuniones.service';
import { Reuniones } from '../../../entities/Reuniones';
export declare class ReunionesController {
    private readonly reunionesService;
    constructor(reunionesService: ReunionesService);
    create(data: Partial<Reuniones>): Promise<Reuniones>;
    findByProyecto(proId: string, tipoId: string): Promise<Reuniones[]>;
}
