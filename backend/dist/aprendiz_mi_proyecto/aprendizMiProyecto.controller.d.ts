import { MiProyectoService } from "./aprendizMiProyecto.service";
export declare class MiProyectoController {
    private readonly service;
    constructor(service: MiProyectoService);
    getMiProyecto(cedula: string): Promise<{
        proId: number;
        nombre: string;
        grupo: number;
        integrantes: {
            nombre: any;
            rol: any;
        }[];
        fechaAsignada: string;
        fechaFin: string;
        descripcion: string;
        distribucion: {
            creados: number;
            completos: number;
            enProceso: number;
        };
        avanceProyecto: {
            label: string;
            value: number;
        }[];
    } | {
        error: string;
    }>;
    getMiProyectoDetalle(cedula: string): Promise<{
        proId: number;
        proCodigo: string;
        nombre: string;
        descripcion: string;
        objetivoGeneral: string;
        objetivosEspecificos: string;
        justificacion: string;
        estado: string;
        fechaInicio: string;
        fechaFin: string;
        fechaCreacion: Date;
        integrantes: {
            cedula: any;
            nombre: string;
            correo: any;
            telefono: any;
            rol: any;
        }[];
    } | {
        error: string;
    }>;
}
