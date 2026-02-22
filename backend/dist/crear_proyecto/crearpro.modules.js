"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearproModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crearpro_controller_1 = require("./crearpro.controller");
const crearpro_service_1 = require("./crearpro.service");
const Proyecto_1 = require("../entities/Proyecto");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
let CrearproModule = class CrearproModule {
};
exports.CrearproModule = CrearproModule;
exports.CrearproModule = CrearproModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([Proyecto_1.Proyecto, UsuProDetPar_1.UsuProDetPar])],
        controllers: [crearpro_controller_1.CrearproController],
        providers: [crearpro_service_1.CrearproService],
    })
], CrearproModule);
//# sourceMappingURL=crearpro.modules.js.map