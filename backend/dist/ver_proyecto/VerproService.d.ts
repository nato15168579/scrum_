import { DataSource } from 'typeorm';
export declare class VerproService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private columnExists;
    private resolveProyectoTable;
    private resolveFichaNombreColumn;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    findAdminDetalle(id: number): Promise<{
        proyecto: any;
        aprendices: unknown[];
    }>;
}
