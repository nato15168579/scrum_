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
exports.ReunionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Reuniones_1 = require("../../../entities/Reuniones");
let ReunionesService = class ReunionesService {
    constructor(reunionesRepository) {
        this.reunionesRepository = reunionesRepository;
    }
    async findByProyecto(proId, tipoReunionId) {
        return await this.reunionesRepository
            .createQueryBuilder('reunion')
            .innerJoinAndSelect('reunion.sprIdFk2', 'sprint')
            .leftJoinAndSelect('reunion.detParIdTipoFk2', 'tipo')
            .where('reunion.detParIdTipoFk = :tipoId', { tipoId: tipoReunionId })
            .orderBy('reunion.reuFecha', 'DESC')
            .addOrderBy('reunion.reuHora', 'DESC')
            .getMany();
    }
    async findOne(id) {
        const reunion = await this.reunionesRepository.findOne({
            where: { reuId: id },
            relations: ['sprIdFk2', 'detParIdTipoFk2']
        });
        if (!reunion) {
            throw new common_1.NotFoundException(`La reunión con ID ${id} no existe.`);
        }
        return reunion;
    }
    async create(data) {
        const nuevaReunion = this.reunionesRepository.create(data);
        return await this.reunionesRepository.save(nuevaReunion);
    }
};
exports.ReunionesService = ReunionesService;
exports.ReunionesService = ReunionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Reuniones_1.Reuniones)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReunionesService);
//# sourceMappingURL=reuniones.service.js.map