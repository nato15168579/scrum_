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
exports.ReunionesController = void 0;
const common_1 = require("@nestjs/common");
const reuniones_service_1 = require("./reuniones.service");
let ReunionesController = class ReunionesController {
    constructor(reunionesService) {
        this.reunionesService = reunionesService;
    }
    async create(data) {
        return await this.reunionesService.create(data);
    }
    async findByProyecto(proId, tipoId) {
        return await this.reunionesService.findByProyecto(+proId, +tipoId);
    }
};
exports.ReunionesController = ReunionesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReunionesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('proyecto/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReunionesController.prototype, "findByProyecto", null);
exports.ReunionesController = ReunionesController = __decorate([
    (0, common_1.Controller)('reuniones'),
    __metadata("design:paramtypes", [reuniones_service_1.ReunionesService])
], ReunionesController);
//# sourceMappingURL=reuniones.controller.js.map