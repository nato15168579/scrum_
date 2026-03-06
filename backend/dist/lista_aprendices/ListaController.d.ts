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
    getInstructores(cedula?: string): Promise<any[]>;
    getFichas(): Promise<any>;
    getStats(cedula: string): Promise<{
        instructor: string;
    }>;
    createAprendiz(payload: {
        cedula: string | number;
        nombre: string;
        apellidos: string;
        correo: string;
        telefono?: string;
        ficha?: string;
        tipoDocumento?: string;
        sexo?: string;
        password: string;
    }): Promise<{
        ok: boolean;
        mensaje: string;
        aprendiz: {
            documento: string;
            nombre: string;
            apellido: string;
            ficha: string;
            fichaNombre: any;
            programa: any;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/Usuario").EstadoUsuario;
        };
    }>;
}
