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
exports.VerproController = void 0;
const common_1 = require("@nestjs/common");
const VerproService_1 = require("./VerproService");
let VerproController = class VerproController {
    constructor(verproService) {
        this.verproService = verproService;
    }
    async getProyectos() {
        return await this.verproService.findAll();
    }
    async getProyectoDetalleAdmin(id) {
        return await this.verproService.findAdminDetalle(id);
    }
    async updateProyectoDetalleAdmin(id, body) {
        return await this.verproService.updateAdminDetalle(id, body);
    }
    async getProyectoAprendicesEditor(id) {
        return await this.verproService.findAdminAprendicesEditor(id);
    }
    async addAprendizToProyecto(id, body) {
        return await this.verproService.addAprendizToProyecto(id, body.cedula, body.detParId);
    }
    async saveProyectoAprendices(id, body) {
        return await this.verproService.saveProyectoAprendices(id, body);
    }
    async updateAprendizProyectoRole(id, cedula, body) {
        return await this.verproService.updateAprendizProyectoRole(id, cedula, body.detParId);
    }
    async removeAprendizFromProyecto(id, cedula) {
        return await this.verproService.removeAprendizFromProyecto(id, cedula);
    }
    async getProyectoById(id) {
        return await this.verproService.findOne(id);
    }
};
exports.VerproController = VerproController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "getProyectos", null);
__decorate([
    (0, common_1.Get)(':id/detalle-admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "getProyectoDetalleAdmin", null);
__decorate([
    (0, common_1.Patch)(':id/detalle-admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "updateProyectoDetalleAdmin", null);
__decorate([
    (0, common_1.Get)(':id/aprendices-edicion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "getProyectoAprendicesEditor", null);
__decorate([
    (0, common_1.Post)(':id/aprendices'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "addAprendizToProyecto", null);
__decorate([
    (0, common_1.Post)(':id/aprendices/guardar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "saveProyectoAprendices", null);
__decorate([
    (0, common_1.Patch)(':id/aprendices/:cedula'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('cedula')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "updateAprendizProyectoRole", null);
__decorate([
    (0, common_1.Delete)(':id/aprendices/:cedula'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "removeAprendizFromProyecto", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VerproController.prototype, "getProyectoById", null);
exports.VerproController = VerproController = __decorate([
    (0, common_1.Controller)('verpro'),
    __metadata("design:paramtypes", [VerproService_1.VerproService])
], VerproController);
//# sourceMappingURL=VerproController.js.map