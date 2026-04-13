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
exports.CambiarContrasenaController = void 0;
const common_1 = require("@nestjs/common");
const cambiar_contrasena_service_1 = require("./cambiar_contrasena.service");
let CambiarContrasenaController = class CambiarContrasenaController {
    constructor(cambiarService) {
        this.cambiarService = cambiarService;
    }
    async cambiarPassword(cedula, body) {
        const { passActual, passNueva } = body;
        if (!passActual || !passNueva) {
            throw new common_1.BadRequestException('La contraseña actual y la nueva son obligatorias');
        }
        return await this.cambiarService.actualizarPassword(cedula, passActual, passNueva);
    }
};
exports.CambiarContrasenaController = CambiarContrasenaController;
__decorate([
    (0, common_1.Put)('cambiar-password/:cedula'),
    __param(0, (0, common_1.Param)('cedula', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CambiarContrasenaController.prototype, "cambiarPassword", null);
exports.CambiarContrasenaController = CambiarContrasenaController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [cambiar_contrasena_service_1.CambiarContrasenaService])
], CambiarContrasenaController);
//# sourceMappingURL=cambiar_contrasena.controller.js.map