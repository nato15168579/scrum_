import { AsigProVerService } from './AsigproverService';
export declare class AsigProVerController {
    private readonly asigProVerService;
    constructor(asigProVerService: AsigProVerService);
    findOne(id: number): Promise<any>;
}
