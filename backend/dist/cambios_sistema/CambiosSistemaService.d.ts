import { DataSource } from "typeorm";
interface ListCambiosOptions {
    estado?: string;
    limit?: string;
}
export declare class CambiosSistemaService {
    private readonly dataSource;
    private readonly schema;
    constructor(dataSource: DataSource);
    private tableExists;
    listarCambios({ estado, limit }: ListCambiosOptions): Promise<{
        ok: boolean;
        cambios: {
            id: number;
            descripcion: string;
            fecha: string | Date;
            observado: boolean;
            usuario: {
                cedula: string;
                nombres: string;
                apellidos: string;
                rol: string;
            };
        }[];
    }>;
    marcarComoObservado(id: number): Promise<{
        ok: boolean;
        id: number;
    }>;
}
export {};
