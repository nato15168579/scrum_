import { AsigProVerService } from './asigprover.service';
export declare class AsigProVerController {
    private readonly asigProVerService;
    constructor(asigProVerService: AsigProVerService);
    findOne(id: string): Promise<any>;
}
