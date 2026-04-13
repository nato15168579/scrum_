import { ListaService } from '../lista_aprendices/ListaService';
interface RegistrarAprendizPayload {
    instructorCedula?: string | number;
    usuCedula?: string | number;
    usuNombres?: string;
    usuApellidos?: string;
    usuCorreo?: string;
    usuTelefono?: string;
    usuTipodedocumento?: string;
    usuFicha?: string | number;
    usuSexo?: string;
}
interface ImportarAprendicesPayload {
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
}
export declare class RegistrarAprendicesService {
    private readonly listaService;
    constructor(listaService: ListaService);
    private normalizeText;
    private getInstructorByCedula;
    private getInstructorFichasActivas;
    private ensureFichaPerteneceAlInstructor;
    crear(datos: RegistrarAprendizPayload): Promise<{
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
    obtenerFichasInstructor(instructorCedulaRaw: string | number | undefined): Promise<{
        numero: string;
        area: string;
        nombre: string;
        programa: string;
        estado: string;
    }[]>;
    importarAprendices(payload: ImportarAprendicesPayload): Promise<{
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
    listar(): Promise<import("../lista_aprendices/ListaTypes").AprendizResponse[]>;
}
export {};
