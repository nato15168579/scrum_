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
exports.HistoriasController = void 0;
const common_1 = require("@nestjs/common");
const historias_service_1 = require("./historias.service");
let HistoriasController = class HistoriasController {
    constructor(historiasService) {
        this.historiasService = historiasService;
    }
    async getByProyecto(proId) {
        return await this.historiasService.findByProyecto(proId);
    }
    async getOne(proId, hisId) {
        return await this.historiasService.findOne(hisId, proId);
    }
};
exports.HistoriasController = HistoriasController;
__decorate([
    (0, common_1.Get)('proyecto/:proId'),
    __param(0, (0, common_1.Param)('proId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HistoriasController.prototype, "getByProyecto", null);
__decorate([
    (0, common_1.Get)('proyecto/:proId/hu/:hisId'),
    __param(0, (0, common_1.Param)('proId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('hisId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], HistoriasController.prototype, "getOne", null);
exports.HistoriasController = HistoriasController = __decorate([
    (0, common_1.Controller)('historias'),
    __metadata("design:paramtypes", [historias_service_1.HistoriasService])
], HistoriasController);
//# sourceMappingURL=historias.controller.js.map