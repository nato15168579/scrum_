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
exports.IntegrantesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let IntegrantesService = class IntegrantesService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async obtenerIntegrantes(projectId) {
        const sql = `
      SELECT u.usu_cedula as documento, u.usu_nombres as nombre, 
             u.usu_apellidos as apellido, u.usu_correo as email, 
             dp.det_par_descripcion AS rol
      FROM usu_pro_det_par up
      JOIN usuario u ON up.usu_cedula = u.usu_cedula
      JOIN detalle_parametro dp ON up.det_par_ID_FK = dp.det_par_ID
      WHERE up.pro_ID = ?
    `;
        return await this.dataSource.query(sql, [projectId]);
    }
    async obtenerDisponibles(projectId) {
        const sql = `
      SELECT u.usu_cedula as documento, u.usu_nombres as nombre, 
             u.usu_apellidos as apellido, u.usu_correo as email
      FROM usuario u
      WHERE u.rol_sis_ID_FK = 1 
      AND u.usu_cedula NOT IN (
        SELECT usu_cedula FROM usu_pro_det_par WHERE pro_ID = ?
      )
    `;
        return await this.dataSource.query(sql, [projectId]);
    }
    async obtenerRolesScrum() {
        const sql = `
      SELECT det_par_ID, det_par_descripcion 
      FROM detalle_parametro 
      WHERE det_par_ID IN (4, 5, 6)
    `;
        return await this.dataSource.query(sql);
    }
    async eliminarIntegrantes(projectId, cedulas) {
        return await this.dataSource.query(`DELETE FROM usu_pro_det_par WHERE pro_ID = ? AND usu_cedula IN (?)`, [projectId, cedulas]);
    }
    async asignarIntegrantes(projectId, assignments) {
        for (const item of assignments) {
            await this.dataSource.query(`INSERT INTO usu_pro_det_par (usu_cedula, pro_ID, det_par_ID_FK) VALUES (?, ?, ?)`, [item.cedula, projectId, item.rolId]);
        }
        return { success: true };
    }
};
exports.IntegrantesService = IntegrantesService;
exports.IntegrantesService = IntegrantesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], IntegrantesService);
//# sourceMappingURL=integrantes.service.js.map