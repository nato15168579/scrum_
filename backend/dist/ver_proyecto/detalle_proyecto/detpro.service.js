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
exports.DetproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DetproService = class DetproService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getProjectById(id) {
        const query = `
      SELECT 
        p.pro_ID as proId, 
        p.pro_nombre as proNombre, 
        p.pro_objetivo_general as proObjetivoGeneral, 
        p.pro_descripcion as proDescripcion, 
        p.pro_fecha_inicio as proFechaInicio,
        p.pro_fecha_fin as proFechaFin,
        p.det_par_ID_FK as detParIdFk
      FROM proyecto p
      WHERE p.pro_ID = ?
    `;
        const result = await this.dataSource.query(query, [id]);
        return result[0] || null;
    }
    async getIntegrantes(id) {
        const query = `
      SELECT 
        CONCAT(u.usu_nombres, ' ', u.usu_apellidos) as nombre,
        dp.det_par_descripcion as rol
      FROM usu_pro_det_par updp
      INNER JOIN usuario u ON updp.usu_cedula = u.usu_cedula
      /* ERROR CORREGIDO: de det_par_ID_ a det_par_ID_FK */
      INNER JOIN detalle_parametro dp ON updp.det_par_ID_FK = dp.det_par_ID
      WHERE updp.pro_ID = ?
    `;
        const integrantes = await this.dataSource.query(query, [id]);
        return integrantes;
    }
};
exports.DetproService = DetproService;
exports.DetproService = DetproService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DetproService);
//# sourceMappingURL=detpro.service.js.map