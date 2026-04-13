"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarAprendicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const registrar_aprendices_controller_1 = require("./registrar-aprendices.controller");
const registrar_aprendices_service_1 = require("./registrar-aprendices.service");
const usuario_1 = require("../entities/usuario");
const ListaModules_1 = require("../lista_aprendices/ListaModules");
let RegistrarAprendicesModule = class RegistrarAprendicesModule {
};
exports.RegistrarAprendicesModule = RegistrarAprendicesModule;
exports.RegistrarAprendicesModule = RegistrarAprendicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([usuario_1.Usuario]),
            ListaModules_1.ListaModule,
        ],
        controllers: [registrar_aprendices_controller_1.RegistrarAprendicesController],
        providers: [registrar_aprendices_service_1.RegistrarAprendicesService],
        exports: [registrar_aprendices_service_1.RegistrarAprendicesService],
    })
], RegistrarAprendicesModule);
//# sourceMappingURL=registrar-aprendices.module.js.map