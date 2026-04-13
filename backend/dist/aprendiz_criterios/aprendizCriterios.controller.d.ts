import { AprendizCriteriosService } from "./aprendizCriterios.service";
import { CreateCriterioDto } from "./dto/create-criterio.dto";
import { UpdateCriterioDto } from "./dto/update-criterio.dto";
export declare class AprendizCriteriosController {
    private readonly service;
    constructor(service: AprendizCriteriosService);
    list(cedula: string): Promise<{
        id: any;
        hisId: any;
        descripcion: any;
        estado: string;
        estadoId: any;
        tiempo: any;
        responsableCedula: any;
        responsableNombre: string;
    }[]>;
    historias(cedula: string): Promise<{
        id: any;
        titulo: any;
        responsableCedula: any;
        puedeCrear: boolean;
    }[]>;
    getOne(id: string, cedula: string): Promise<{
        id: number;
        hisId: number;
        descripcion: string;
        estadoId: number;
        tiempo: string;
        responsableCedula: number;
        responsableNombre: string;
    }>;
    create(cedula: string, dto: CreateCriterioDto): Promise<{
        ok: boolean;
        id: any;
    }>;
    update(id: string, cedula: string, dto: UpdateCriterioDto): Promise<{
        ok: boolean;
    }>;
    remove(id: string, cedula: string): Promise<{
        ok: boolean;
    }>;
}
