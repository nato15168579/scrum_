"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarDatoController = void 0;
const common_1 = require("@nestjs/common");
const actualizar_dato_service_1 = require("./actualizar_dato.service");
let ActualizarDatoController = class ActualizarDatoController {
    constructor(actualizarDatoService) {
        this.actualizarDatoService = actualizarDatoService;
    }
    async getUsuario(cedula) {
        return this.actualizarDatoService.findOne(cedula);
    }
    async updateUsuario(cedula, data) {
        return this.actualizarDatoService.update(cedula, data);
    }
};
exports.ActualizarDatoController = ActualizarDatoController;
__decorate([
    (0, common_1.Get)(':cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActualizarDatoController.prototype, "getUsuario", null);
__decorate([
    (0, common_1.Put)('actualizar/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActualizarDatoController.prototype, "updateUsuario", null);
exports.ActualizarDatoController = ActualizarDatoController = __decorate([
    (0, common_1.Controller)('usuario'),
    __metadata("design:paramtypes", [actualizar_dato_service_1.ActualizarDatoService])
], ActualizarDatoController);
//# sourceMappingURL=actualizar_dato.controller.js.map