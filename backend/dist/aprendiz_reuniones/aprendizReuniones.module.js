"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprendizReunionesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const Reuniones_1 = require("../entities/Reuniones");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Sprint_1 = require("../entities/Sprint");
const Usuario_1 = require("../entities/Usuario");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const aprendizReuniones_controller_1 = require("./aprendizReuniones.controller");
const aprendizReuniones_service_1 = require("./aprendizReuniones.service");
let AprendizReunionesModule = class AprendizReunionesModule {
};
exports.AprendizReunionesModule = AprendizReunionesModule;
exports.AprendizReunionesModule = AprendizReunionesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                Reuniones_1.Reuniones,
                UsuProDetPar_1.UsuProDetPar,
                Sprint_1.Sprint,
                Usuario_1.Usuario,
                HistoriaUsuario_1.HistoriaUsuario,
            ]),
        ],
        controllers: [aprendizReuniones_controller_1.AprendizReunionesController],
        providers: [aprendizReuniones_service_1.AprendizReunionesService],
    })
], AprendizReunionesModule);
//# sourceMappingURL=aprendizReuniones.module.js.map