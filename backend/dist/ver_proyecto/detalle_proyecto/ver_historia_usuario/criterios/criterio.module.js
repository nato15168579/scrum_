"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriterioModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const criterio_service_1 = require("./criterio.service");
const criterio_controller_1 = require("./criterio.controller");
const CriteriosAceptacion_1 = require("../../../../entities/CriteriosAceptacion");
let CriterioModule = class CriterioModule {
};
exports.CriterioModule = CriterioModule;
exports.CriterioModule = CriterioModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([CriteriosAceptacion_1.CriteriosAceptacion])],
        controllers: [criterio_controller_1.CriterioController],
        providers: [criterio_service_1.CriterioService],
    })
], CriterioModule);
//# sourceMappingURL=criterio.module.js.map