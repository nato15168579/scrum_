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
exports.SugerenciaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Observaciones_1 = require("../../../entities/Observaciones");
let SugerenciaService = class SugerenciaService {
    constructor(observacionRepo) {
        this.observacionRepo = observacionRepo;
    }
    async crearSugerencia(data) {
        try {
            const nuevaObservacion = new Observaciones_1.Observaciones();
            nuevaObservacion.proIdFk = Number(data.projectId);
            nuevaObservacion.usuCedulaFk = Number(data.cedula);
            nuevaObservacion.obsDescripcion = `${data.titulo}: ${data.descripcion}`;
            nuevaObservacion.obsFecha = new Date().toISOString().split('T')[0];
            nuevaObservacion.detParIdFk = 13;
            const guardado = await this.observacionRepo.save(nuevaObservacion);
            return {
                success: true,
                data: guardado,
                message: 'Sugerencia guardada correctamente',
            };
        }
        catch (error) {
            console.error('Error detallado al crear observación:', error);
            throw new common_1.InternalServerErrorException('Error al guardar en la base de datos');
        }
    }
};
exports.SugerenciaService = SugerenciaService;
exports.SugerenciaService = SugerenciaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Observaciones_1.Observaciones)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SugerenciaService);
//# sourceMappingURL=sugerencia.service.js.map