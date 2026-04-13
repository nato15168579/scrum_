"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsigIntegrantesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const asig_integrantes_controller_1 = require("./asig-integrantes.controller");
const asig_integrantes_service_1 = require("./asig-integrantes.service");
const Usuario_1 = require("../../entities/Usuario");
const UsuProDetPar_1 = require("../../entities/UsuProDetPar");
let AsigIntegrantesModule = class AsigIntegrantesModule {
};
exports.AsigIntegrantesModule = AsigIntegrantesModule;
exports.AsigIntegrantesModule = AsigIntegrantesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Usuario_1.Usuario, UsuProDetPar_1.UsuProDetPar])
        ],
        controllers: [asig_integrantes_controller_1.AsigIntegrantesController],
        providers: [asig_integrantes_service_1.AsigIntegrantesService],
    })
], AsigIntegrantesModule);
//# sourceMappingURL=asig-integrantes.module.js.map