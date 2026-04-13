import { ListaService } from './ListaService';
import { CreateFichaDto, CreateUsuarioDto, ImportUsuarioDto, UpdateAprendizDto, UpdateFichaDto, UpdateInstructorDto } from './ListaTypes';
export declare class ListaController {
    private readonly listaService;
    constructor(listaService: ListaService);
    getAprendices(cedula?: string): Promise<import("./ListaTypes").AprendizResponse[]>;
    updateAprendizEstado(cedula: string, payload: {
        estado: string;
    }): Promise<{
        ok: boolean;
        documento: string;
        estado: import("../entities/Usuario").EstadoUsuario;
    }>;
    updateAprendiz(cedula: string, payload: UpdateAprendizDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            tipoDocumento: string;
            ficha: string;
            area: any;
            fichaNombre: any;
            programa: any;
            nombre: string;
            apellido: string;
            telefono: string;
            email: string;
            sexo: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
    }>;
    deleteAprendiz(cedula: string, actorCedula?: string): Promise<{
        ok: boolean;
        documento: string;
        mensaje: string;
    }>;
    getInstructores(cedula?: string): Promise<import("./ListaTypes").InstructorResponse[]>;
    updateInstructor(cedula: string, payload: UpdateInstructorDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
            fichasCargo: any;
            fichasDetalle: any;
        };
    }>;
    replaceInstructor(cedula: string, payload: UpdateInstructorDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
            fichasCargo: any;
            fichasDetalle: any;
        };
    }>;
    updateInstructorCompat(cedula: string, payload: UpdateInstructorDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
            fichasCargo: any;
            fichasDetalle: any;
        };
    }>;
    deleteInstructor(cedula: string, actorCedula?: string): Promise<{
        ok: boolean;
        documento: string;
        mensaje: string;
    }>;
    getFichas(): Promise<any>;
    getFichaOptions(): Promise<{
        areas: any[];
        programas: any[];
        areasByPrograma: Record<string, string[]>;
    }>;
    createFicha(payload: CreateFichaDto): Promise<{
        ok: boolean;
        mensaje: string;
        ficha: {
            numero: string;
            nombre: string;
            programa: string;
            estado: string;
        };
    }>;
    updateFicha(numero: string, payload: UpdateFichaDto, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        ficha: {
            numero: string;
            nombre: string;
            programa: string;
            estado: string;
        };
    }>;
    deleteFicha(numero: string, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
    }>;
    renamePrograma(payload: {
        programaActual: string;
        programaNuevo: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas?: undefined;
        antes?: undefined;
        despues?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        antes: string;
        despues: string;
    }>;
    deletePrograma(payload: {
        programa: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        programa: string;
    }>;
    renameArea(payload: {
        programa?: string | null;
        areaActual: string;
        areaNueva: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas?: undefined;
        antes?: undefined;
        despues?: undefined;
        programa?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        antes: string;
        despues: string;
        programa: string;
    }>;
    deleteArea(payload: {
        programa?: string | null;
        area: string;
    }, actorCedula?: string): Promise<{
        ok: boolean;
        mensaje: string;
        fichasAfectadas: number;
        area: string;
        programa: string;
    }>;
    getStats(cedula: string): Promise<{
        instructor: string;
    }>;
    createUsuario(payload: CreateUsuarioDto): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
        fichaAsignada: boolean;
        aprendiz?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            sexo: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
        fichaAsignada?: undefined;
        aprendiz?: undefined;
    } | {
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            tipoDocumento: string;
            area: string;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: string;
            programa: string;
            email: string;
            telefono: string;
            sexo: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
        instructor?: undefined;
        fichaAsignada?: undefined;
    }>;
    importUsuarios(payload: {
        usuarios: ImportUsuarioDto[];
    }): Promise<{
        ok: boolean;
        total: number;
        creados: number;
        fallidos: number;
        creadosDetalle: {
            fila: number;
            documento: string;
            nombre: string;
            tipoUsuario: "aprendiz" | "instructor";
            passwordTemporal: string;
        }[];
        errores: {
            fila: number;
            documento: string;
            message: string;
        }[];
    }>;
}
