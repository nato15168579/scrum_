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
exports.CambiosSistemaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const SchemaIntrospection_1 = require("../shared/database/SchemaIntrospection");
let CambiosSistemaService = class CambiosSistemaService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.schema = new SchemaIntrospection_1.SchemaIntrospection(dataSource);
    }
    async tableExists(tableName) {
        return this.schema.tableExists(tableName);
    }
    async listarCambios({ estado, limit }) {
        const hasTable = await this.tableExists("cambios_sistema");
        if (!hasTable) {
            return { ok: true, cambios: [] };
        }
        const estadoNormalizado = String(estado || "pendiente").trim().toLowerCase();
        const allowedEstados = ["pendiente", "visto", "todos"];
        const filtroEstado = allowedEstados.includes(estadoNormalizado)
            ? estadoNormalizado
            : "pendiente";
        const parsedLimit = Number(limit !== null && limit !== void 0 ? limit : 200);
        const take = Number.isFinite(parsedLimit)
            ? Math.min(500, Math.max(1, Math.trunc(parsedLimit)))
            : 200;
        const whereClauses = [];
        const params = [];
        if (filtroEstado === "pendiente") {
            whereClauses.push("c.cam_observado = 0");
        }
        else if (filtroEstado === "visto") {
            whereClauses.push("c.cam_observado = 1");
        }
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const rows = (await this.dataSource.query(`
        SELECT
          c.cam_ID AS id,
          c.cam_descripcion AS descripcion,
          c.cam_fecha AS fecha,
          c.cam_observado AS observado,
          u.usu_cedula AS usuCedula,
          u.usu_nombres AS nombres,
          u.usu_apellidos AS apellidos,
          r.rol_nombre AS rol
        FROM cambios_sistema c
        LEFT JOIN usuario u ON u.usu_cedula = c.usu_cedula_FK
        LEFT JOIN rol_sistema r ON r.rol_sis_ID = u.rol_sis_ID_FK
        ${whereSql}
        ORDER BY c.cam_ID DESC
        LIMIT ${take}
      `, params));
        const cambios = rows.map((row) => {
            var _a;
            return ({
                id: Number(row.id),
                descripcion: String(row.descripcion || "").trim(),
                fecha: (_a = row.fecha) !== null && _a !== void 0 ? _a : null,
                observado: Number(row.observado || 0) === 1,
                usuario: {
                    cedula: row.usuCedula ? String(row.usuCedula) : "",
                    nombres: row.nombres || "",
                    apellidos: row.apellidos || "",
                    rol: row.rol || "",
                },
            });
        });
        return { ok: true, cambios };
    }
    async marcarComoObservado(id) {
        var _a, _b, _c;
        if (!Number.isFinite(id) || id <= 0) {
            throw new common_1.BadRequestException("El id del cambio es invalido.");
        }
        const hasTable = await this.tableExists("cambios_sistema");
        if (!hasTable) {
            throw new common_1.BadRequestException("La tabla cambios_sistema no existe.");
        }
        const result = await this.dataSource.query(`
        UPDATE cambios_sistema
        SET cam_observado = 1,
            cam_fecha_observado = CURRENT_TIMESTAMP
        WHERE cam_ID = ?
          AND cam_observado = 0
      `, [id]);
        const affected = Number((_c = (_a = result === null || result === void 0 ? void 0 : result.affectedRows) !== null && _a !== void 0 ? _a : (_b = result === null || result === void 0 ? void 0 : result[0]) === null || _b === void 0 ? void 0 : _b.affectedRows) !== null && _c !== void 0 ? _c : 0);
        if (!affected) {
            throw new common_1.NotFoundException("No se encontro un cambio pendiente con ese id.");
        }
        return { ok: true, id };
    }
};
exports.CambiosSistemaService = CambiosSistemaService;
exports.CambiosSistemaService = CambiosSistemaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CambiosSistemaService);
//# sourceMappingURL=CambiosSistemaService.js.map