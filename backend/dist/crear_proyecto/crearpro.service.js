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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proyecto_1 = require("../entities/proyecto");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
let CrearproService = class CrearproService {
    constructor(proyectoRepository, usuRepository) {
        this.proyectoRepository = proyectoRepository;
        this.usuRepository = usuRepository;
    }
    async checkProjectExists(nombre) {
        const proyecto = await this.proyectoRepository.findOne({ where: { proNombre: nombre } });
        return { exists: !!proyecto };
    }
    async createProject(data) {
        const existe = await this.proyectoRepository.findOne({ where: { proNombre: data.nombre } });
        if (existe)
            throw new common_1.ConflictException('El nombre del proyecto ya está registrado');
        try {
            const ultimo = await this.proyectoRepository.findOne({
                where: {},
                order: { proId: 'DESC' }
            });
            const nuevoId = ultimo ? ultimo.proId + 1 : 1;
            const relacion = await this.usuRepository.findOne({
                where: { detParId: data.cedula }
            });
            const idParametroValido = relacion ? relacion.detParId : 1;
            const nuevoProyecto = this.proyectoRepository.create({
                proId: nuevoId,
                proNombre: data.nombre,
                proObjetivoGeneral: data.objetivo,
                proFechaInicio: data.fecha,
                detParIdFk: idParametroValido,
                proDescription: "Registro manual",
                proJustificacion: "N/A",
                porObjetivosEspecificos: "N/A",
                proDuracionSprint: "2 semanas",
                proFechaFin: data.fecha
            });
            return await this.proyectoRepository.save(nuevoProyecto);
        }
        catch (error) {
            console.error("ERROR CRÍTICO:", error);
            throw new common_1.InternalServerErrorException('No se pudo completar el registro en la base de datos.');
        }
    }
};
exports.CrearproService = CrearproService;
exports.CrearproService = CrearproService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proyecto_1.Proyecto)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CrearproService);
//# sourceMappingURL=crearpro.service.js.map