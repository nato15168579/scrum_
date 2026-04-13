"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReunionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reuniones_controller_1 = require("./reuniones.controller");
const reuniones_service_1 = require("./reuniones.service");
const Reuniones_1 = require("../../../entities/Reuniones");
const Sprint_1 = require("../../../entities/Sprint");
let ReunionModule = class ReunionModule {
};
exports.ReunionModule = ReunionModule;
exports.ReunionModule = ReunionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Reuniones_1.Reuniones, Sprint_1.Sprint])
        ],
        controllers: [reuniones_controller_1.ReunionesController],
        providers: [reuniones_service_1.ReunionesService],
    })
], ReunionModule);
//# sourceMappingURL=reuniones.module.js.map