"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprendizHistoriasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const aprendizHistorias_controller_1 = require("./aprendizHistorias.controller");
const aprendizHistorias_service_1 = require("./aprendizHistorias.service");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Usuario_1 = require("../entities/Usuario");
let AprendizHistoriasModule = class AprendizHistoriasModule {
};
exports.AprendizHistoriasModule = AprendizHistoriasModule;
exports.AprendizHistoriasModule = AprendizHistoriasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                HistoriaUsuario_1.HistoriaUsuario,
                UsuProDetPar_1.UsuProDetPar,
                Usuario_1.Usuario,
            ]),
        ],
        controllers: [aprendizHistorias_controller_1.AprendizHistoriasController],
        providers: [aprendizHistorias_service_1.AprendizHistoriasService],
        exports: [aprendizHistorias_service_1.AprendizHistoriasService],
    })
], AprendizHistoriasModule);
//# sourceMappingURL=aprendizHistorias.module.js.map