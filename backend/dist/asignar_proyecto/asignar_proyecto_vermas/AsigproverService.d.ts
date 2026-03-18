import { DataSource } from 'typeorm';
export declare class AsigProVerService {
    private dataSource;
    private readonly schema;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private resolveProyectoTable;
    getProyectoDetalle(id: number): Promise<any>;
}
