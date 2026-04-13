"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiProyectoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const aprendizMiProyecto_controller_1 = require("./aprendizMiProyecto.controller");
const aprendizMiProyecto_service_1 = require("./aprendizMiProyecto.service");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Proyecto_1 = require("../entities/Proyecto");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const Usuario_1 = require("../entities/Usuario");
let MiProyectoModule = class MiProyectoModule {
};
exports.MiProyectoModule = MiProyectoModule;
exports.MiProyectoModule = MiProyectoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([UsuProDetPar_1.UsuProDetPar, Proyecto_1.Proyecto, HistoriaUsuario_1.HistoriaUsuario, Usuario_1.Usuario]),
        ],
        controllers: [aprendizMiProyecto_controller_1.MiProyectoController],
        providers: [aprendizMiProyecto_service_1.MiProyectoService],
    })
], MiProyectoModule);
//# sourceMappingURL=aprendizMiProyecto.module.js.map