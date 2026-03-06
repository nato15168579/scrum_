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
exports.VerproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let VerproService = class VerproService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    wrapIdentifier(identifier) {
        return `\`${identifier.replace(/`/g, '``')}\``;
    }
    async tableExists(tableName) {
        const [row] = await this.dataSource.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `, [tableName]);
        return Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
    }
    async resolveProyectoTable() {
        const candidates = ['proyecto', ' proyecto'];
        for (const candidate of candidates) {
            if (await this.tableExists(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async findAll() {
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable)
            return [];
        const tableRef = this.wrapIdentifier(proyectoTable);
        return await this.dataSource.query(`
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk
      FROM ${tableRef} p
      ORDER BY p.pro_ID DESC
      `);
    }
    async findOne(id) {
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        const tableRef = this.wrapIdentifier(proyectoTable);
        const result = await this.dataSource.query(`
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk
      FROM ${tableRef} p
      WHERE p.pro_ID = ?
      LIMIT 1
      `, [id]);
        const proyecto = Array.isArray(result) && result.length > 0 ? result[0] : null;
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        return proyecto;
    }
};
exports.VerproService = VerproService;
exports.VerproService = VerproService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], VerproService);
//# sourceMappingURL=VerproService.js.map