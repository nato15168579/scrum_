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
exports.IntegrantesController = void 0;
const common_1 = require("@nestjs/common");
const integrantes_service_1 = require("./integrantes.service");
let IntegrantesController = class IntegrantesController {
    constructor(integrantesService) {
        this.integrantesService = integrantesService;
    }
    async getIntegrantes(id) {
        return await this.integrantesService.obtenerIntegrantes(id);
    }
    async getDisponibles(id) {
        return await this.integrantesService.obtenerDisponibles(id);
    }
    async getRoles() {
        return await this.integrantesService.obtenerRolesScrum();
    }
    async remove(body) {
        return await this.integrantesService.eliminarIntegrantes(body.projectId, body.cedulas);
    }
    async assign(body) {
        return await this.integrantesService.asignarIntegrantes(body.projectId, body.assignments);
    }
};
exports.IntegrantesController = IntegrantesController;
__decorate([
    (0, common_1.Get)('integrantes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IntegrantesController.prototype, "getIntegrantes", null);
__decorate([
    (0, common_1.Get)('aprendices-disponibles/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IntegrantesController.prototype, "getDisponibles", null);
__decorate([
    (0, common_1.Get)('roles-scrum'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrantesController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('eliminar-integrantes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrantesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('asignar-integrantes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrantesController.prototype, "assign", null);
exports.IntegrantesController = IntegrantesController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [integrantes_service_1.IntegrantesService])
], IntegrantesController);
//# sourceMappingURL=integrantes.controller.js.map