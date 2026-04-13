import { AprendizHistoriasService } from "./aprendizHistorias.service";
import { CreateHistoriaDto } from "./dto/create-historia.dto";
import { UpdateHistoriaDto } from "./dto/update-historia.dto";
export declare class AprendizHistoriasController {
    private readonly service;
    constructor(service: AprendizHistoriasService);
    list(cedula: number): Promise<{
        id: number;
        titulo: string;
        descripcion: string;
        puntaje: number;
        numeroSprint: number;
        estadoId: number;
        estadoNombre: string;
        responsableCedula: number;
        responsableNombre: string;
        creadorCedula: number;
        creadorNombre: string;
        puedeEditar: boolean;
        puedeEliminar: boolean;
        puedeCambiarResponsable: boolean;
        esScrumMaster: boolean;
    }[]>;
    responsables(cedula: number): Promise<any[]>;
    getOne(id: number, cedula: number): Promise<{
        id: number;
        titulo: string;
        descripcion: string;
        puntaje: number;
        numeroSprint: number;
        estadoId: number;
        estadoNombre: string;
        responsableCedula: number;
        responsableNombre: string;
        creadorCedula: number;
        creadorNombre: string;
        puedeEditar: boolean;
        puedeEliminar: boolean;
        puedeCambiarResponsable: boolean;
        esScrumMaster: boolean;
    }>;
    create(dto: CreateHistoriaDto): Promise<{
        id: number;
        titulo: string;
        descripcion: string;
        puntaje: number;
        numeroSprint: number;
        estadoId: number;
        estadoNombre: string;
        responsableCedula: number;
        responsableNombre: string;
        creadorCedula: number;
        creadorNombre: string;
        puedeEditar: boolean;
        puedeEliminar: boolean;
        puedeCambiarResponsable: boolean;
        esScrumMaster: boolean;
    }>;
    update(id: number, dto: UpdateHistoriaDto & {
        cedula?: number;
    }, cedulaQ?: string): Promise<{
        id: number;
        titulo: string;
        descripcion: string;
        puntaje: number;
        numeroSprint: number;
        estadoId: number;
        estadoNombre: string;
        responsableCedula: number;
        responsableNombre: string;
        creadorCedula: number;
        creadorNombre: string;
        puedeEditar: boolean;
        puedeEliminar: boolean;
        puedeCambiarResponsable: boolean;
        esScrumMaster: boolean;
    }>;
    remove(id: number, cedulaQ?: string, body?: {
        cedula?: number;
    }): Promise<{
        ok: boolean;
    }>;
}
