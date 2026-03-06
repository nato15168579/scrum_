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
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(usuarioRepository, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    wrapIdentifier(identifier) {
        return `\`${identifier.replace(/`/g, "``")}\``;
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
    async columnExists(tableName, columnName) {
        const [row] = await this.dataSource.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `, [tableName, columnName]);
        return Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
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
        const [totalRow] = await this.dataSource.query(`SELECT COUNT(*) AS total FROM ${tableRef}`);
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
        const statusRows = await this.dataSource.query(`SELECT ${statusRef} AS estado FROM ${tableRef}`);
        const porHacer = statusRows.filter((row) => Number(row.estado) === 1)
            .length;
        const enProgreso = statusRows.filter((row) => Number(row.estado) === 2).length;
        const hecho = statusRows.filter((row) => Number(row.estado) === 3)
            .length;
        return { total, porHacer, enProgreso, hecho };
    }
    async obtenerDatosDashboard(cedulaInput) {
        try {
            const cedula = Number(cedulaInput);
            const usuario = await this.usuarioRepository.findOneBy({
                usuCedula: cedula,
            });
            if (!usuario) {
                this.logger.warn(`Usuario con cédula ${cedula} no encontrado`);
                return { error: "Usuario no encontrado" };
            }
            let reunionesCount = 0;
            try {
                const queryResult = await this.dataSource.query("SELECT COUNT(*) as total FROM usu_asis WHERE usu_cedula = ?", [cedula]);
                reunionesCount = parseInt(queryResult[0].total) || 0;
            }
            catch (e) {
                this.logger.error("Error al consultar la tabla intermedia usu_asis:", e.message);
            }
            let totalFichasSena = 0;
            try {
                const usuariosConFicha = await this.usuarioRepository.find({
                    where: { usuFicha: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    select: ["usuFicha"],
                });
                const fichasUnicas = [
                    ...new Set(usuariosConFicha.map((u) => u.usuFicha)),
                ];
                totalFichasSena = fichasUnicas.filter((f) => f).length;
            }
            catch (e) {
                this.logger.error("Error al calcular fichas:", e.message);
            }
            let proyectosStats = { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
            try {
                proyectosStats = await this.getProyectoStats();
            }
            catch (e) {
                this.logger.error("Error al calcular proyectos:", e.message);
            }
            return {
                instructor: `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
                correo: usuario.usuCorreo || "Sin correo",
                description: "Bienvenido al centro de administración del sistema. Desde aquí puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real.Este panel te ofrece una visión estratégica del rendimiento, crecimiento y actividad del sistema, permitiéndote tomar decisiones informadas y mantener el control operativo en todo momento.Utiliza el menú lateral para acceder a cada módulo y administrar los recursos de forma eficiente.",
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
            };
        }
        catch (error) {
            this.logger.error("Error crítico en DashboardService:", error.message);
            throw new Error(`Error interno: ${error.message}`);
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