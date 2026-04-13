import { AprendizReunionesService } from "./aprendizReuniones.service";
import { CreateReunionDto } from "./dto/create-reunion.dto";
import { UpdateReunionInformeDto } from "./dto/update-reunion-informe.dto";
export declare class AprendizReunionesController {
    private readonly aprendizReunionesService;
    constructor(aprendizReunionesService: AprendizReunionesService);
    findByAprendiz(cedula: string): Promise<{
        id: number;
        tipo: string;
        fecha: string;
        descripcion: string;
        hora: string;
        responsable: string;
        responsableCedula: number;
        asistentes: string[];
        asistentesDetalle: {
            cedula: string;
            nombre: string;
        }[];
        cantidadAsistentes: number;
        lugar: string;
        estado: string;
        estadoId: number;
        informe: string;
        puedeGestionarInforme: boolean;
        puedeEditar: boolean;
    }[]>;
    findAprendicesProyectoByReunion(id: string, cedula: string): Promise<{
        cedula: string;
        nombre: string;
    }[]>;
    createByAprendiz(cedula: string, dto: CreateReunionDto): Promise<{
        id: number;
        tipo: string;
        fecha: string;
        descripcion: string;
        hora: string;
        responsable: string;
        responsableCedula: number;
        asistentes: any[];
        asistentesDetalle: any[];
        cantidadAsistentes: number;
        lugar: string;
        estado: string;
        estadoId: number;
        informe: string;
        puedeGestionarInforme: boolean;
        puedeEditar: boolean;
        message: string;
    }>;
    updateByAprendiz(id: string, cedula: string, dto: CreateReunionDto): Promise<{
        id: number;
        tipo: string;
        fecha: string;
        descripcion: string;
        hora: string;
        responsable: string;
        responsableCedula: number;
        asistentes: string[];
        asistentesDetalle: {
            cedula: string;
            nombre: string;
        }[];
        cantidadAsistentes: number;
        lugar: string;
        estado: string;
        estadoId: number;
        informe: string;
        puedeGestionarInforme: boolean;
        puedeEditar: boolean;
        message: string;
    }>;
    updateInformeByResponsable(id: string, cedula: string, dto: UpdateReunionInformeDto): Promise<{
        id: number;
        tipo: string;
        fecha: string;
        hora: string;
        responsable: string;
        responsableCedula: number;
        asistentes: string[];
        asistentesDetalle: {
            cedula: string;
            nombre: string;
        }[];
        cantidadAsistentes: number;
        lugar: string;
        estado: string;
        estadoId: number;
        informe: string;
        puedeGestionarInforme: boolean;
        puedeEditar: boolean;
        message: string;
    }>;
}
