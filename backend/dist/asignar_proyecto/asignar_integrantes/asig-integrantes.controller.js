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
exports.AsigIntegrantesController = void 0;
const common_1 = require("@nestjs/common");
const asig_integrantes_service_1 = require("./asig-integrantes.service");
let AsigIntegrantesController = class AsigIntegrantesController {
    constructor(asigService) {
        this.asigService = asigService;
    }
    async listarAprendices() {
        return await this.asigService.getAprendices();
    }
    async obtenerIntegrantes(id) {
        const proyectoId = parseInt(id);
        if (isNaN(proyectoId))
            throw new common_1.BadRequestException('ID de proyecto inválido');
        return await this.asigService.getIntegrantesPorProyecto(proyectoId);
    }
    async guardar(id, body) {
        const proyectoId = parseInt(id);
        if (isNaN(proyectoId)) {
            throw new common_1.BadRequestException('El ID del proyecto debe ser un número.');
        }
        return await this.asigService.guardarAsignacion(proyectoId, body.assignments);
    }
};
exports.AsigIntegrantesController = AsigIntegrantesController;
__decorate([
    (0, common_1.Get)('aprendices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AsigIntegrantesController.prototype, "listarAprendices", null);
__decorate([
    (0, common_1.Get)('proyecto/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AsigIntegrantesController.prototype, "obtenerIntegrantes", null);
__decorate([
    (0, common_1.Post)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AsigIntegrantesController.prototype, "guardar", null);
exports.AsigIntegrantesController = AsigIntegrantesController = __decorate([
    (0, common_1.Controller)('asig-integrantes'),
    __metadata("design:paramtypes", [asig_integrantes_service_1.AsigIntegrantesService])
], AsigIntegrantesController);
//# sourceMappingURL=asig-integrantes.controller.js.map