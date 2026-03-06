import { DataSource } from 'typeorm';
export declare class VerproService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private wrapIdentifier;
    private tableExists;
    private resolveProyectoTable;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
}
