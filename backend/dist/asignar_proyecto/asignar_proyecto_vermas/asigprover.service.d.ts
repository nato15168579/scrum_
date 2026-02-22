import { DataSource } from 'typeorm';
export declare class AsigProVerService {
    private dataSource;
    constructor(dataSource: DataSource);
    getProyectoDetalle(id: number): Promise<any>;
}
