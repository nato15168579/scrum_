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
    async columnExists(tableName, columnName) {
        return this.schema.columnExists(tableName, columnName);
    }
    async resolveCambioObservadoConfig() {
        const hasCamObservado = await this.columnExists("cambios_sistema", "cam_observado");
        const hasFechaObservado = await this.columnExists("cambios_sistema", "cam_fecha_observado");
        const hasDetalleParametro = await this.tableExists("detalle_parametro");
        const hasDetParFk = await this.columnExists("cambios_sistema", "det_par_FK");
        return {
            hasCamObservado,
            hasFechaObservado,
            hasDetalleParametro,
            hasDetParFk,
        };
    }
    async resolveEstadoObservacionId(target) {
        const hasDetalleParametro = await this.tableExists("detalle_parametro");
        if (!hasDetalleParametro)
            return null;
        const [row] = await this.dataSource.query(`
        SELECT det_par_ID AS detParId
        FROM detalle_parametro
        WHERE par_ID_FK = 6
          AND LOWER(TRIM(COALESCE(det_par_descripcion, ''))) = ?
        ORDER BY det_par_ID ASC
        LIMIT 1
      `, [target]);
        return (row === null || row === void 0 ? void 0 : row.detParId) ? Number(row.detParId) : null;
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
        const observadoConfig = await this.resolveCambioObservadoConfig();
        if (filtroEstado === "pendiente") {
            if (observadoConfig.hasCamObservado) {
                whereClauses.push("c.cam_observado = 0");
            }
            else if (observadoConfig.hasFechaObservado) {
                whereClauses.push("c.cam_fecha_observado IS NULL");
            }
            else if (observadoConfig.hasDetParFk) {
                const pendienteId = observadoConfig.hasDetalleParametro
                    ? await this.resolveEstadoObservacionId("pendiente")
                    : null;
                if (pendienteId) {
                    whereClauses.push("c.det_par_FK = ?");
                    params.push(pendienteId);
                }
                else {
                    whereClauses.push("c.det_par_FK IS NULL");
                }
            }
        }
        else if (filtroEstado === "visto") {
            if (observadoConfig.hasCamObservado) {
                whereClauses.push("c.cam_observado = 1");
            }
            else if (observadoConfig.hasFechaObservado) {
                whereClauses.push("c.cam_fecha_observado IS NOT NULL");
            }
            else if (observadoConfig.hasDetParFk) {
                const vistoId = observadoConfig.hasDetalleParametro
                    ? await this.resolveEstadoObservacionId("visto")
                    : null;
                if (vistoId) {
                    whereClauses.push("c.det_par_FK = ?");
                    params.push(vistoId);
                }
                else {
                    whereClauses.push("c.det_par_FK IS NOT NULL");
                }
            }
        }
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const observadoSelect = observadoConfig.hasCamObservado
            ? "c.cam_observado"
            : observadoConfig.hasFechaObservado
                ? "CASE WHEN c.cam_fecha_observado IS NULL THEN 0 ELSE 1 END"
                : observadoConfig.hasDetParFk
                    ? "CASE WHEN c.det_par_FK IS NULL THEN 0 ELSE 1 END"
                    : "0";
        const rows = (await this.dataSource.query(`
        SELECT
          c.cam_ID AS id,
          c.cam_descripcion AS descripcion,
          c.cam_fecha AS fecha,
          ${observadoSelect} AS observado,
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
        const observadoConfig = await this.resolveCambioObservadoConfig();
        const updates = [];
        const params = [];
        if (observadoConfig.hasCamObservado) {
            updates.push("cam_observado = 1");
        }
        if (observadoConfig.hasFechaObservado) {
            updates.push("cam_fecha_observado = CURRENT_TIMESTAMP");
        }
        if (observadoConfig.hasDetParFk && observadoConfig.hasDetalleParametro) {
            const vistoId = await this.resolveEstadoObservacionId("visto");
            if (vistoId) {
                updates.push("det_par_FK = ?");
                params.push(vistoId);
            }
        }
        if (updates.length === 0) {
            throw new common_1.BadRequestException("La tabla cambios_sistema no tiene columnas para marcar como observado.");
        }
        const whereParts = ["cam_ID = ?"];
        const whereParams = [id];
        if (observadoConfig.hasCamObservado) {
            whereParts.push("cam_observado = 0");
        }
        else if (observadoConfig.hasFechaObservado) {
            whereParts.push("cam_fecha_observado IS NULL");
        }
        const result = await this.dataSource.query(`
        UPDATE cambios_sistema
        SET ${updates.join(", ")}
        WHERE ${whereParts.join(" AND ")}
      `, [...params, ...whereParams]);
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