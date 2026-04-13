import { DataSource } from 'typeorm';
export declare class DetproService {
    private dataSource;
    constructor(dataSource: DataSource);
    getProjectById(id: number): Promise<any>;
    getIntegrantes(id: number): Promise<any>;
}
