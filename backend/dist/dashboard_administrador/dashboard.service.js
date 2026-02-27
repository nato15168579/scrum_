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
const Proyecto_1 = require("../entities/Proyecto");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(usuarioRepository, proyectoRepository, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.proyectoRepository = proyectoRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DashboardService_1.name);
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
            let proyectos = await this.proyectoRepository.find();
            const porHacer = proyectos.filter((p) => Number(p.detParIdFk || p.det_par_id_fk) === 1).length;
            const enProgreso = proyectos.filter((p) => Number(p.detParIdFk || p.det_par_id_fk) === 2).length;
            const hecho = proyectos.filter((p) => Number(p.detParIdFk || p.det_par_id_fk) === 3).length;
            return {
                instructor: `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
                correo: usuario.usuCorreo || "Sin correo",
                description: "Bienvenido al centro de administración del sistema. Desde aquí puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real.Este panel te ofrece una visión estratégica del rendimiento, crecimiento y actividad del sistema, permitiéndote tomar decisiones informadas y mantener el control operativo en todo momento.Utiliza el menú lateral para acceder a cada módulo y administrar los recursos de forma eficiente.",
                stats: [
                    { label: "Cantidad de fichas", value: totalFichasSena },
                    { label: "Reuniones observadas", value: reunionesCount },
                    { label: "Proyectos (Global)", value: proyectos.length },
                ],
                proyectosData: {
                    total: proyectos.length,
                    porHacer,
                    enProgreso,
                    hecho,
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
    __param(1, (0, typeorm_1.InjectRepository)(Proyecto_1.Proyecto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map