import { Repository } from "typeorm";
import { Observaciones } from "../entities/Observaciones";
import { UsuProDetPar } from "../entities/UsuProDetPar";
export declare class AprendizObservacionesService {
    private readonly observacionesRepo;
    private readonly usuProDetParRepo;
    private readonly ESTADO_POR_HACER;
    private readonly ESTADO_HECHO;
    constructor(observacionesRepo: Repository<Observaciones>, usuProDetParRepo: Repository<UsuProDetPar>);
    findByAprendizCedula(cedula: number | string): Promise<{
        id: number;
        descripcion: string;
        area: string;
        instructor: string;
        fecha: string;
        visto: boolean;
        estadoFk: number;
    }[]>;
    toggleVisto(observacionId: number, cedula: number | string): Promise<{
        id: number;
        visto: boolean;
        area: string;
        estadoFk: number;
        message: string;
    }>;
    private getNombreCompleto;
}
