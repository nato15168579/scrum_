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
      SELECT pro_ID, pro_nombre, pro_fecha_inicio 
      FROM proyecto
    `);
    }
    async getAprendicesParaAsignacion() {
        return await this.dataSource.query(`
      SELECT usu_cedula, usu_nombres, usu_apellidos, usu_correo 
      FROM usuario 
      WHERE rol_ID = (SELECT rol_ID FROM rol WHERE rol_nombre = 'Aprendiz')
    `);
    }
    async getRolesScrum() {
        return await this.dataSource.query(`
      SELECT det_par_ID, det_par_descripcion 
      FROM detalle_parametros 
      WHERE par_ID = (SELECT par_ID FROM parametros WHERE par_nombre = 'Roles Scrum')
    `);
    }
    async asignarIntegrantes(projectId, assignments) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const assign of assignments) {
                await queryRunner.query(`
          INSERT INTO proyecto_usuarios (pro_ID, usu_cedula, rol_scrum_ID)
          VALUES ($1, $2, $3)`, [projectId, assign.cedula, assign.rolId]);
            }
            await queryRunner.commitTransaction();
            return { success: true };
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