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
exports.RegistrarAprendicesController = void 0;
const common_1 = require("@nestjs/common");
const registrar_aprendices_service_1 = require("./registrar-aprendices.service");
let RegistrarAprendicesController = class RegistrarAprendicesController {
    constructor(service) {
        this.service = service;
    }
    async registrar(datos) {
        return await this.service.crear(datos);
    }
    async obtenerFichasInstructor(cedula) {
        return await this.service.obtenerFichasInstructor(cedula);
    }
    async importarAprendices(payload) {
        return await this.service.importarAprendices(payload);
    }
    async obtenerTodos() {
        return await this.service.listar();
    }
};
exports.RegistrarAprendicesController = RegistrarAprendicesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegistrarAprendicesController.prototype, "registrar", null);
__decorate([
    (0, common_1.Get)('fichas-instructor'),
    __param(0, (0, common_1.Query)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrarAprendicesController.prototype, "obtenerFichasInstructor", null);
__decorate([
    (0, common_1.Post)('importar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegistrarAprendicesController.prototype, "importarAprendices", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RegistrarAprendicesController.prototype, "obtenerTodos", null);
exports.RegistrarAprendicesController = RegistrarAprendicesController = __decorate([
    (0, common_1.Controller)('registrar-aprendices'),
    __metadata("design:paramtypes", [registrar_aprendices_service_1.RegistrarAprendicesService])
], RegistrarAprendicesController);
//# sourceMappingURL=registrar-aprendices.controller.js.map