"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsigProVerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AsigProVerService = class AsigProVerService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getProyectoDetalle(id) {
        const query = `
      SELECT 
        p.pro_ID, 
        p.pro_nombre, 
        p.pro_fecha_inicio, 
        p.pro_descripcion, 
        p.pro_objetivo_general,
        dp.det_par_descripcion AS estado_nombre
      FROM proyecto p
      LEFT JOIN detalle_parametro dp ON p.det_par_ID_FK = dp.det_par_ID
      WHERE p.pro_ID = ?
    `;
        const result = await this.dataSource.query(query, [id]);
        if (!result || result.length === 0) {
            throw new common_1.NotFoundException('El proyecto no existe');
        }
        return JSON.parse(JSON.stringify(result[0]));
    }
};
exports.AsigProVerService = AsigProVerService;
exports.AsigProVerService = AsigProVerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AsigProVerService);
//# sourceMappingURL=asigprover.service.js.map