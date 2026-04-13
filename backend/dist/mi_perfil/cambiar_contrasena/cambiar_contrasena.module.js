"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CambiarContrasenaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_1 = require("../../entities/usuario");
const cambiar_contrasena_controller_1 = require("./cambiar_contrasena.controller");
const cambiar_contrasena_service_1 = require("./cambiar_contrasena.service");
let CambiarContrasenaModule = class CambiarContrasenaModule {
};
exports.CambiarContrasenaModule = CambiarContrasenaModule;
exports.CambiarContrasenaModule = CambiarContrasenaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([usuario_1.Usuario])],
        controllers: [cambiar_contrasena_controller_1.CambiarContrasenaController],
        providers: [cambiar_contrasena_service_1.CambiarContrasenaService],
    })
], CambiarContrasenaModule);
//# sourceMappingURL=cambiar_contrasena.module.js.map