import { DataSource } from 'typeorm';
export declare class ActualizarDatoService {
    private dataSource;
    constructor(dataSource: DataSource);
    findOne(cedula: string): Promise<any>;
    update(cedula: string, updateData: any): Promise<{
        message: string;
    }>;
}
