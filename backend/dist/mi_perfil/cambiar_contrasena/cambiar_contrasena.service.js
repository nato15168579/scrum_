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
exports.CambiarContrasenaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../../entities/Usuario");
const PasswordSecurity_1 = require("../../login/PasswordSecurity");
let CambiarContrasenaService = class CambiarContrasenaService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async actualizarPassword(cedula, passActual, passNueva) {
        const usuario = await this.usuarioRepository.findOne({
            where: { usuCedula: cedula },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const coinciden = await (0, PasswordSecurity_1.compareWithStoredPassword)(passActual, usuario.usuContrasena);
        if (!coinciden) {
            throw new common_1.UnauthorizedException('La contrasena actual es incorrecta');
        }
        const passwordValidation = (0, PasswordSecurity_1.validatePasswordPolicy)(passNueva);
        if (!passwordValidation.isValid) {
            throw new common_1.BadRequestException(passwordValidation.errors.join(' '));
        }
        const esLaMismaPassword = await (0, PasswordSecurity_1.compareWithStoredPassword)(passNueva, usuario.usuContrasena);
        if (esLaMismaPassword) {
            throw new common_1.BadRequestException('La nueva contrasena debe ser diferente a la actual');
        }
        usuario.usuContrasena = await (0, PasswordSecurity_1.hashPassword)(passNueva);
        await this.usuarioRepository.save(usuario);
        return { message: 'Contrasena actualizada con exito' };
    }
};
exports.CambiarContrasenaService = CambiarContrasenaService;
exports.CambiarContrasenaService = CambiarContrasenaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CambiarContrasenaService);
//# sourceMappingURL=cambiar_contrasena.service.js.map