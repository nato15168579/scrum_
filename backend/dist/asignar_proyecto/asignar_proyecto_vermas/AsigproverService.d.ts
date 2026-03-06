import { DataSource } from 'typeorm';
export declare class AsigProVerService {
    private dataSource;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private resolveProyectoTable;
    getProyectoDetalle(id: number): Promise<any>;
}
