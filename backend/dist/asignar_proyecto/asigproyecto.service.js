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
exports.AsigProyectoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AsigProyectoService = class AsigProyectoService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getProyectos() {
        return await this.dataSource.query(`
      SELECT pro_ID as proId, pro_nombre as proNombre, pro_fecha_creacion as proFechaCreacion 
      FROM proyecto
    `);
    }
    async getAprendicesParaAsignacion() {
        return await this.dataSource.query(`
      SELECT usu_cedula as usuCedula, usu_nombres as usuNombres, usu_apellidos as usuApellidos, usu_correo as usuCorreo 
      FROM usuario 
      WHERE rol_sis_ID_FK = 1
    `);
    }
    async getRolesScrum() {
        return await this.dataSource.query(`
      SELECT 
        det_par_ID as detParId, 
        det_par_descripcion as detParDescripcion 
      FROM detalle_parametro 
      WHERE par_ID_FK = (SELECT par_ID FROM parametro WHERE par_nombre = 'Rol Scrum')
    `);
    }
    async asignarIntegrantes(projectId, assignments) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const assign of assignments) {
                await queryRunner.query(`
          INSERT INTO usu_pro_det_par (pro_ID_FK, usu_cedula_FK, det_par_ID_FK)
          VALUES (?, ?, ?)`, [projectId, assign.cedula, assign.rolId]);
            }
            await queryRunner.commitTransaction();
            return { success: true, message: 'Integrantes asignados correctamente' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('Error al asignar integrantes');
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.AsigProyectoService = AsigProyectoService;
exports.AsigProyectoService = AsigProyectoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AsigProyectoService);
//# sourceMappingURL=asigproyecto.service.js.map