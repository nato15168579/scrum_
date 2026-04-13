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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const SchemaIntrospection_1 = require("../shared/database/SchemaIntrospection");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(usuarioRepository, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DashboardService_1.name);
        this.schema = new SchemaIntrospection_1.SchemaIntrospection(dataSource);
    }
    wrapIdentifier(identifier) {
        return this.schema.wrapIdentifier(identifier);
    }
    async tableExists(tableName) {
        return this.schema.tableExists(tableName);
    }
    async columnExists(tableName, columnName) {
        return this.schema.columnExists(tableName, columnName);
    }
    async resolveFichaTable() {
        if (await this.tableExists("fichas")) {
            return "fichas";
        }
        if (await this.tableExists("ficha")) {
            return "ficha";
        }
        return null;
    }
    async resolveReunionUsuarioTable() {
        if (await this.tableExists("usu_reu_pro")) {
            return { tableName: "usu_reu_pro", userColumn: "usu_cedula_FK" };
        }
        if (await this.tableExists("usu_asis")) {
            return { tableName: "usu_asis", userColumn: "usu_cedula" };
        }
        if (await this.tableExists("usu_reu")) {
            return { tableName: "usu_reu", userColumn: "usu_cedula_FK" };
        }
        return null;
    }
    async getProyectoStats() {
        const tableCandidates = ["proyecto", " proyecto"];
        let proyectoTable = null;
        for (const candidate of tableCandidates) {
            if (await this.tableExists(candidate)) {
                proyectoTable = candidate;
                break;
            }
        }
        if (!proyectoTable) {
            return { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
        }
        const tableRef = this.wrapIdentifier(proyectoTable);
        const [totalRow] = (await this.dataSource.query(`SELECT COUNT(*) AS total FROM ${tableRef}`));
        const total = Number((totalRow === null || totalRow === void 0 ? void 0 : totalRow.total) || 0);
        const statusCandidates = ["det_par_ID_FK", "det_par_id_fk"];
        let statusColumn = null;
        for (const candidate of statusCandidates) {
            if (await this.columnExists(proyectoTable, candidate)) {
                statusColumn = candidate;
                break;
            }
        }
        if (!statusColumn) {
            return { total, porHacer: 0, enProgreso: 0, hecho: 0 };
        }
        const statusRef = this.wrapIdentifier(statusColumn);
        const statusRows = (await this.dataSource.query(`SELECT ${statusRef} AS estado FROM ${tableRef}`));
        const porHacer = statusRows.filter((row) => Number(row.estado) === 1)
            .length;
        const enProgreso = statusRows.filter((row) => Number(row.estado) === 2)
            .length;
        const hecho = statusRows.filter((row) => Number(row.estado) === 3)
            .length;
        return { total, porHacer, enProgreso, hecho };
    }
    async getUsuariosPorRolEstado() {
        if (!(await this.tableExists("usuario"))) {
            return [
                { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 },
                { rol: "Instructores", activos: 0, inactivos: 0, total: 0 },
                { rol: "Administradores", activos: 0, inactivos: 0, total: 0 },
            ];
        }
        const tableRef = this.wrapIdentifier("usuario");
        const roleRef = this.wrapIdentifier("rol_sis_ID_FK");
        const hasEstadoColumn = await this.columnExists("usuario", "usu_estado");
        const estadoRef = hasEstadoColumn
            ? `COALESCE(NULLIF(TRIM(${this.wrapIdentifier("usu_estado")}), ''), 'Activo')`
            : `'Activo'`;
        const rows = (await this.dataSource.query(`
      SELECT
        ${roleRef} AS rolId,
        ${estadoRef} AS estado
      FROM ${tableRef}
      WHERE ${roleRef} IN (1, 2, 3)
    `));
        const summaryByRole = new Map([
            [1, { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 }],
            [2, { rol: "Instructores", activos: 0, inactivos: 0, total: 0 }],
            [3, { rol: "Administradores", activos: 0, inactivos: 0, total: 0 }],
        ]);
        for (const row of rows) {
            const roleId = Number(row.rolId);
            const target = summaryByRole.get(roleId);
            if (!target) {
                continue;
            }
            const estadoNormalizado = String(row.estado || "Activo").trim().toLowerCase() === "inactivo"
                ? "Inactivo"
                : "Activo";
            target.total += 1;
            if (estadoNormalizado === "Inactivo") {
                target.inactivos += 1;
                continue;
            }
            target.activos += 1;
        }
        return Array.from(summaryByRole.values());
    }
    async obtenerDatosDashboard(cedulaInput) {
        var _a;
        try {
            const cedula = Number(cedulaInput);
            const usuario = await this.usuarioRepository.findOneBy({
                usuCedula: cedula,
            });
            if (!usuario) {
                this.logger.warn(`Usuario con cedula ${cedula} no encontrado`);
                return { error: "Usuario no encontrado" };
            }
            let reunionesCount = 0;
            try {
                const reunionUsuarioTable = await this.resolveReunionUsuarioTable();
                if (reunionUsuarioTable) {
                    const tableRef = this.wrapIdentifier(reunionUsuarioTable.tableName);
                    const userColumnRef = this.wrapIdentifier(reunionUsuarioTable.userColumn);
                    const queryResult = (await this.dataSource.query(`SELECT COUNT(*) as total FROM ${tableRef} WHERE ${userColumnRef} = ?`, [cedula]));
                    reunionesCount = Number(((_a = queryResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0);
                }
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                this.logger.error("Error al consultar la tabla intermedia de reuniones:", error.message);
            }
            let totalFichasSena = 0;
            try {
                const fichaTable = await this.resolveFichaTable();
                if (fichaTable) {
                    const tableRef = this.wrapIdentifier(fichaTable);
                    const [fichasRow] = (await this.dataSource.query(`SELECT COUNT(*) AS total FROM ${tableRef}`));
                    totalFichasSena = Number((fichasRow === null || fichasRow === void 0 ? void 0 : fichasRow.total) || 0);
                }
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                this.logger.error("Error al calcular fichas:", error.message);
            }
            let proyectosStats = { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
            try {
                proyectosStats = await this.getProyectoStats();
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                this.logger.error("Error al calcular proyectos:", error.message);
            }
            let usuariosPorRolEstado = [
                { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 },
                { rol: "Instructores", activos: 0, inactivos: 0, total: 0 },
                { rol: "Administradores", activos: 0, inactivos: 0, total: 0 },
            ];
            try {
                usuariosPorRolEstado = await this.getUsuariosPorRolEstado();
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                this.logger.error("Error al calcular resumen de usuarios por rol:", error.message);
            }
            return {
                instructor: `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
                correo: usuario.usuCorreo || "Sin correo",
                description: "Bienvenido al centro de administracion del sistema. Desde aqui puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real. Este panel te ofrece una vision estrategica del rendimiento, crecimiento y actividad del sistema para mantener el control operativo en todo momento.",
                stats: [
                    { label: "Cantidad de fichas", value: totalFichasSena },
                    { label: "Reuniones observadas", value: reunionesCount },
                    { label: "Proyectos (Global)", value: proyectosStats.total },
                ],
                proyectosData: {
                    total: proyectosStats.total,
                    porHacer: proyectosStats.porHacer,
                    enProgreso: proyectosStats.enProgreso,
                    hecho: proyectosStats.hecho,
                },
                usuariosPorRolEstado,
            };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error("Error critico en DashboardService:", err.message);
            throw new Error(`Error interno: ${err.message}`);
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], DashboardService);
//# sourceMappingURL=DashboardService.js.map