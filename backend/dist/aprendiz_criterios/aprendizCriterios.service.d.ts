import { Repository } from "typeorm";
import { CriteriosAceptacion } from "../entities/CriteriosAceptacion";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { CreateCriterioDto } from "./dto/create-criterio.dto";
import { UpdateCriterioDto } from "./dto/update-criterio.dto";
export declare class AprendizCriteriosService {
    private readonly caRepo;
    private readonly usuProRepo;
    private readonly huRepo;
    constructor(caRepo: Repository<CriteriosAceptacion>, usuProRepo: Repository<UsuProDetPar>, huRepo: Repository<HistoriaUsuario>);
    private estadoLabel;
    private getProyectoAsignado;
    private buildNombreUsuario;
    private mapCriterio;
    private validarResponsableCA;
    private validarQueSeaResponsableHU;
    getHistoriasParaSelect(cedula: number): Promise<{
        id: any;
        titulo: any;
        responsableCedula: any;
        puedeCrear: boolean;
    }[]>;
    listByCedula(cedula: number): Promise<{
        id: any;
        hisId: any;
        descripcion: any;
        estado: string;
        estadoId: any;
        tiempo: any;
        responsableCedula: any;
        responsableNombre: string;
    }[]>;
    getById(id: number, cedula: number): Promise<{
        id: number;
        hisId: number;
        descripcion: string;
        estadoId: number;
        tiempo: string;
        responsableCedula: number;
        responsableNombre: string;
    }>;
    create(dto: CreateCriterioDto, cedula: number): Promise<{
        ok: boolean;
        id: any;
    }>;
    update(id: number, dto: UpdateCriterioDto, cedula: number): Promise<{
        ok: boolean;
    }>;
    remove(id: number, cedula: number): Promise<{
        ok: boolean;
    }>;
}
