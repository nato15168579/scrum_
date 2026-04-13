import { Repository } from "typeorm";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Proyecto } from "../entities/Proyecto";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { Usuario } from "../entities/Usuario";
export declare class MiProyectoService {
    private readonly usuProRepo;
    private readonly proyectoRepo;
    private readonly huRepo;
    private readonly usuarioRepo;
    constructor(usuProRepo: Repository<UsuProDetPar>, proyectoRepo: Repository<Proyecto>, huRepo: Repository<HistoriaUsuario>, usuarioRepo: Repository<Usuario>);
    private getProyectoAsignado;
    private getIntegrantesProyecto;
    getMiProyectoByCedula(cedula: number | string): Promise<{
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
    }>;
    getMiProyectoDetalleByCedula(cedula: number | string): Promise<{
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
    }>;
}
