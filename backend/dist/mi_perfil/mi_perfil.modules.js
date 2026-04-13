"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiPerfilModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mi_perfil_controller_1 = require("./mi_perfil.controller");
const mi_perfil_service_1 = require("./mi_perfil.service");
const Usuario_1 = require("../entities/Usuario");
let MiPerfilModule = class MiPerfilModule {
};
exports.MiPerfilModule = MiPerfilModule;
exports.MiPerfilModule = MiPerfilModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([Usuario_1.Usuario])],
        controllers: [mi_perfil_controller_1.MiPerfilController],
        providers: [mi_perfil_service_1.MiPerfilService],
    })
], MiPerfilModule);
//# sourceMappingURL=mi_perfil.modules.js.map