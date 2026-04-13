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
exports.CriterioController = void 0;
const common_1 = require("@nestjs/common");
const criterio_service_1 = require("./criterio.service");
let CriterioController = class CriterioController {
    constructor(criterioService) {
        this.criterioService = criterioService;
    }
    async getCriterios(proId, hisId) {
        return this.criterioService.findByProyectoAndHistoria(proId, hisId);
    }
};
exports.CriterioController = CriterioController;
__decorate([
    (0, common_1.Get)(':proId/:hisId'),
    __param(0, (0, common_1.Param)('proId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('hisId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CriterioController.prototype, "getCriterios", null);
exports.CriterioController = CriterioController = __decorate([
    (0, common_1.Controller)('criterio-aceptacion'),
    __metadata("design:paramtypes", [criterio_service_1.CriterioService])
], CriterioController);
//# sourceMappingURL=criterio.controller.js.map