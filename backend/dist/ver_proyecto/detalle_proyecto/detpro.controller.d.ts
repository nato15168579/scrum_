import { DetproService } from './detpro.service';
export declare class DetproController {
    private readonly detproService;
    constructor(detproService: DetproService);
    getProject(id: number): Promise<any>;
    getIntegrantes(id: number): Promise<any>;
}
