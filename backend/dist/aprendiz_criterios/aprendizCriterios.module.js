"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprendizCriteriosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const aprendizCriterios_controller_1 = require("./aprendizCriterios.controller");
const aprendizCriterios_service_1 = require("./aprendizCriterios.service");
const CriteriosAceptacion_1 = require("../entities/CriteriosAceptacion");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
let AprendizCriteriosModule = class AprendizCriteriosModule {
};
exports.AprendizCriteriosModule = AprendizCriteriosModule;
exports.AprendizCriteriosModule = AprendizCriteriosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([CriteriosAceptacion_1.CriteriosAceptacion, UsuProDetPar_1.UsuProDetPar, HistoriaUsuario_1.HistoriaUsuario])],
        controllers: [aprendizCriterios_controller_1.AprendizCriteriosController],
        providers: [aprendizCriterios_service_1.AprendizCriteriosService],
    })
], AprendizCriteriosModule);
//# sourceMappingURL=aprendizCriterios.module.js.map