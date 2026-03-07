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
    getFichas(): Promise<any>;
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
        password: string;
    }): Promise<{
        ok: boolean;
        mensaje: string;
        instructor: {
            documento: string;
            tipoDocumento: string;
            nombre: string;
            apellido: string;
            especializacion: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
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
    }>;
}
