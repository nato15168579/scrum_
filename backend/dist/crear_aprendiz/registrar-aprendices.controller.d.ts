import { RegistrarAprendicesService } from './registrar-aprendices.service';
import { Usuario } from '../entities/usuario';
export declare class RegistrarAprendicesController {
    private readonly service;
    constructor(service: RegistrarAprendicesService);
    registrar(datos: Partial<Usuario> & {
        instructorCedula?: string | number;
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
            fichaNombre: string;
            programa: string;
            telefono: string;
            email: string;
            fechaInscripcion: string;
            estado: import("../entities/usuario").EstadoUsuario;
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
            estado: import("../entities/usuario").EstadoUsuario;
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
            estado: import("../entities/usuario").EstadoUsuario;
        };
        instructor?: undefined;
        fichaAsignada?: undefined;
    }>;
    obtenerFichasInstructor(cedula?: string): Promise<{
        numero: string;
        area: string;
        nombre: string;
        programa: string;
        estado: string;
    }[]>;
    importarAprendices(payload: {
        instructorCedula?: string | number;
        usuarios?: Array<{
            documento?: string | number;
            tipoDocumento?: string;
            ficha?: string | number;
            nombre?: string;
            apellido?: string;
            sexo?: string;
            telefono?: string;
            email?: string;
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
    obtenerTodos(): Promise<import("../lista_aprendices/ListaTypes").AprendizResponse[]>;
}
