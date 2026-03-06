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
                return { error: 'Usuario no encontrado' };
            }
            let reunionesCount = 0;
            try {
                const queryResult = await this.dataSource.query('SELECT COUNT(*) as total FROM reuniones WHERE usu_cedula = ?', [cedula]);
                reunionesCount = parseInt(queryResult[0].total) || 0;
            }
            catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                this.logger.error('Error al consultar reuniones:', error.message);
            }
            let proyectos = [];
            let porHacer = 0;
            let enProgreso = 0;
            let hecho = 0;
            try {
                proyectos = await this.proyectoRepository.find();
                porHacer = proyectos.filter((p) => p.estadoId === 1).length;
                enProgreso = proyectos.filter((p) => p.estadoId === 2).length;
                hecho = proyectos.filter((p) => p.estadoId === 3).length;
            }
            catch (e) {
                this.logger.error('Error al procesar proyectos:', e.message);
            }
            return {
                instructor: `${usuario.usuNombres || ''} ${usuario.usuApellidos || ''}`.trim(),
                correo: usuario.usuCorreo || 'Sin correo',
                description: 'Facilitar la gestión, administración y monitoreo de los proyectos desarrollados por los aprendices del SENA mediante una aplicación basada en la metodología ágil Scrum.',
                stats: [
                    { label: 'Mis tareas Activas', value: porHacer },
                    { label: 'Tareas Completadas', value: hecho },
                    { label: 'Participación en reuniones', value: reunionesCount },
                    { label: 'Retroalimentaciones recibidas', value: 0 },
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
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error('Error crítico en DashboardService:', err.message);
            throw err;
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
//# sourceMappingURL=DashboardService.js.map