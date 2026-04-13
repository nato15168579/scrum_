"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsigProyectoModule = void 0;
const common_1 = require("@nestjs/common");
const asigproyecto_controller_1 = require("./asigproyecto.controller");
const asigproyecto_service_1 = require("./asigproyecto.service");
let AsigProyectoModule = class AsigProyectoModule {
};
exports.AsigProyectoModule = AsigProyectoModule;
exports.AsigProyectoModule = AsigProyectoModule = __decorate([
    (0, common_1.Module)({
        controllers: [asigproyecto_controller_1.AsigProyectoController],
        providers: [asigproyecto_service_1.AsigProyectoService],
    })
], AsigProyectoModule);
//# sourceMappingURL=asigproyecto.modules.js.map