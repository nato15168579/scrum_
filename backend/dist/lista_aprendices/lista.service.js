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
exports.ListaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
let ListaService = class ListaService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async findAllAprendices() {
        const aprendices = await this.usuarioRepository.find({
            where: {
                rolSisIdFk: 1,
            },
            select: [
                'usuCedula',
                'usuFicha',
                'usuNombres',
                'usuApellidos',
                'usuTelefono',
                'usuCorreo',
            ],
        });
        return aprendices.map(ap => ({
            documento: ap.usuCedula.toString(),
            ficha: ap.usuFicha || 'Sin ficha',
            nombre: ap.usuNombres,
            apellido: ap.usuApellidos,
            telefono: ap.usuTelefono,
            email: ap.usuCorreo,
        }));
    }
    async getInstructorStats(cedula) {
        const instructor = await this.usuarioRepository.findOne({
            where: { usuCedula: parseInt(cedula) },
            select: ['usuNombres', 'usuApellidos'],
        });
        return {
            instructor: instructor
                ? `${instructor.usuNombres} ${instructor.usuApellidos}`
                : 'Instructor SENA',
        };
    }
};
exports.ListaService = ListaService;
exports.ListaService = ListaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ListaService);
//# sourceMappingURL=lista.service.js.map