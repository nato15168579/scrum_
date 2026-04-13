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
exports.HistoriasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const HistoriaUsuario_1 = require("../../../entities/HistoriaUsuario");
let HistoriasService = class HistoriasService {
    constructor(historiaRepository) {
        this.historiaRepository = historiaRepository;
    }
    async findByProyecto(proId) {
        return await this.historiaRepository.find({
            where: { proIdFk: proId },
            relations: ['criteriosAceptacions', 'detParIdFk2'],
            order: { hisId: 'ASC' },
        });
    }
    async findOne(hisId, proId) {
        const historia = await this.historiaRepository.findOne({
            where: {
                hisId: hisId,
                proIdFk: proId
            },
            relations: ['criteriosAceptacions', 'detParIdFk2'],
        });
        if (!historia) {
            throw new common_1.NotFoundException(`La HU-${hisId} no existe en el proyecto ${proId}`);
        }
        return historia;
    }
};
exports.HistoriasService = HistoriasService;
exports.HistoriasService = HistoriasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HistoriasService);
//# sourceMappingURL=historias.service.js.map