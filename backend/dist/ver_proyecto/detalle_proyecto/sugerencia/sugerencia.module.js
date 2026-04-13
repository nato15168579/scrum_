"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugerenciaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sugerencia_controller_1 = require("./sugerencia.controller");
const sugerencia_service_1 = require("./sugerencia.service");
const Observaciones_1 = require("../../../entities/Observaciones");
let SugerenciaModule = class SugerenciaModule {
};
exports.SugerenciaModule = SugerenciaModule;
exports.SugerenciaModule = SugerenciaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Observaciones_1.Observaciones])
        ],
        controllers: [sugerencia_controller_1.SugerenciaController],
        providers: [sugerencia_service_1.SugerenciaService],
    })
], SugerenciaModule);
//# sourceMappingURL=sugerencia.module.js.map