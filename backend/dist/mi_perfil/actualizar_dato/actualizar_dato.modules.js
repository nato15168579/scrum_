"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarDatoModule = void 0;
const common_1 = require("@nestjs/common");
const actualizar_dato_controller_1 = require("./actualizar_dato.controller");
const actualizar_dato_service_1 = require("./actualizar_dato.service");
let ActualizarDatoModule = class ActualizarDatoModule {
};
exports.ActualizarDatoModule = ActualizarDatoModule;
exports.ActualizarDatoModule = ActualizarDatoModule = __decorate([
    (0, common_1.Module)({
        controllers: [actualizar_dato_controller_1.ActualizarDatoController],
        providers: [actualizar_dato_service_1.ActualizarDatoService],
    })
], ActualizarDatoModule);
//# sourceMappingURL=actualizar_dato.modules.js.map