"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprendizDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const Usuario_1 = require("../entities/Usuario");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Reuniones_1 = require("../entities/Reuniones");
const Observaciones_1 = require("../entities/Observaciones");
const Sprint_1 = require("../entities/Sprint");
const aprendizDashboard_controller_1 = require("./aprendizDashboard.controller");
const aprendizDashboard_service_1 = require("./aprendizDashboard.service");
let AprendizDashboardModule = class AprendizDashboardModule {
};
exports.AprendizDashboardModule = AprendizDashboardModule;
exports.AprendizDashboardModule = AprendizDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                Usuario_1.Usuario,
                HistoriaUsuario_1.HistoriaUsuario,
                UsuProDetPar_1.UsuProDetPar,
                Reuniones_1.Reuniones,
                Observaciones_1.Observaciones,
                Sprint_1.Sprint,
            ]),
        ],
        controllers: [aprendizDashboard_controller_1.AprendizDashboardController],
        providers: [aprendizDashboard_service_1.AprendizDashboardService],
    })
], AprendizDashboardModule);
//# sourceMappingURL=aprendizDashboard.module.js.map