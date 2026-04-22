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
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const PasswordSecurity_1 = require("./PasswordSecurity");
let LoginService = class LoginService {
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }
    async validarUsuario(cedula, pass) {
        console.log('[LoginService] Buscando usuario con cedula:', cedula);
        const usuario = await this.usuarioRepo.findOne({
            where: { usuCedula: Number(cedula) },
        });
        if (!usuario) {
            console.error('[LoginService] Usuario no encontrado con cedula:', cedula);
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        if (usuario.usuEstado === 'Inactivo') {
            console.error('[LoginService] Usuario inactivo:', cedula);
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        console.log('[LoginService] Usuario encontrado:', {
            usuCedula: usuario.usuCedula,
            usuNombres: usuario.usuNombres,
            rolSisIdFk: usuario.rolSisIdFk,
        });
        const passwordGuardada = usuario.usuContrasena || '';
        const esValida = await (0, PasswordSecurity_1.compareWithStoredPassword)(pass, passwordGuardada);
        if (esValida && !passwordGuardada.startsWith('$2')) {
            usuario.usuContrasena = await (0, PasswordSecurity_1.hashPassword)(pass);
            await this.usuarioRepo.save(usuario);
        }
        if (!esValida) {
            console.error('[LoginService] Contrasena incorrecta para cedula:', cedula);
            throw new common_1.UnauthorizedException('Contrasena incorrecta');
        }
        console.log('[LoginService] Contrasena valida');
        const datos = Object.assign({}, usuario);
        delete datos.usuContrasena;
        console.log('[LoginService] Devolviendo datos del usuario:', {
            usuCedula: datos.usuCedula,
            usuNombres: datos.usuNombres,
            rolSisIdFk: datos.rolSisIdFk,
        });
        return datos;
    }
    async fixPasswords() {
        const usuarios = await this.usuarioRepo.find();
        let contador = 0;
        for (const u of usuarios) {
            if (u.usuContrasena && !u.usuContrasena.startsWith('$2b$')) {
                u.usuContrasena = await (0, PasswordSecurity_1.hashPassword)(u.usuContrasena);
                await this.usuarioRepo.save(u);
                contador++;
            }
        }
        return { mensaje: `Se actualizaron ${contador} claves` };
    }
};
exports.LoginService = LoginService;
exports.LoginService = LoginService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LoginService);
//# sourceMappingURL=LoginService.js.map