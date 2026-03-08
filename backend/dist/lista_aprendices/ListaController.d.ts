import { ListaService } from './ListaService';
export declare class ListaController {
    private readonly listaService;
    constructor(listaService: ListaService);
    getAprendices(cedula?: string): Promise<any[]>;
    updateAprendizEstado(cedula: string, payload: {
        estado: string;
    }): Promise<{
        ok: boolean;
        documento: string;
        estado: import("../entities/Usuario").EstadoUsuario;
    }>;
    updateAprendiz(cedula: string, payload: {
        nombre?: string;
        apellidos?: string;
        correo?: string;
        telefono?: string;
        sexo?: string;
        ficha?: string | number;
        estado?: string;
    }): Promise<{
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
    deleteAprendiz(cedula: string): Promise<{
        ok: boolean;
        documento: string;
        mensaje: string;
    }>;
    getInstructores(cedula?: string): Promise<any[]>;
    updateInstructor(cedula: string, payload: {
        nombre?: string;
        apellidos?: string;
        correo?: string;
        telefono?: string;
        sexo?: string;
        especializacion?: string;
        fichas?: Array<string | number>;
    }): Promise<{
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
            fichasCargo: any;
            fichasDetalle: any;
        };
    }>;
    deleteInstructor(cedula: string): Promise<{
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
    createFicha(payload: {
        numero: string | number;
        nombre: string;
        programa: string;
        estado?: 'Activa' | 'Inactiva';
        allowCustomCatalogValues?: boolean;
    }): Promise<{
        ok: boolean;
        mensaje: string;
        ficha: {
            numero: string;
            nombre: string;
            programa: string;
            estado: string;
        };
    }>;
    getStats(cedula: string): Promise<{
        instructor: string;
    }>;
    createUsuario(payload: {
        cedula: string | number;
        nombre: string;
        apellidos: string;
        correo?: string;
        telefono?: string;
        ficha?: string;
        tipoDocumento?: string;
        sexo?: string;
        especializacion?: string;
        tipoUsuario?: 'aprendiz' | 'instructor';
        password?: string;
    }): Promise<{
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
            fichaNombre: any;
            programa: any;
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
            fichaNombre: any;
            programa: any;
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
            area: any;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: any;
            programa: any;
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
        usuarios: Array<{
            documento: string | number;
            tipoDocumento?: string;
            ficha?: string | number;
            nombre: string;
            apellido: string;
            sexo?: string;
            telefono?: string;
            email?: string;
            especializacion?: string;
            tipoUsuario?: 'aprendiz' | 'instructor' | string;
        }>;
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
