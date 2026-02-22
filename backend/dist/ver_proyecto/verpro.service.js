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
exports.VerproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Proyecto_1 = require("../entities/Proyecto");
let VerproService = class VerproService {
    constructor(proyectoRepository) {
        this.proyectoRepository = proyectoRepository;
    }
    async findAll() {
        return await this.proyectoRepository.find({
            relations: [
                'historiaUsuarios',
                'detParIdFk2',
                'sprints'
            ],
        });
    }
    async findOne(id) {
        const proyecto = await this.proyectoRepository.findOne({
            where: { proId: id },
            relations: ['historiaUsuarios', 'detParIdFk2'],
        });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        return proyecto;
    }
};
exports.VerproService = VerproService;
exports.VerproService = VerproService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Proyecto_1.Proyecto)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VerproService);
//# sourceMappingURL=verpro.service.js.map