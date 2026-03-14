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
exports.CambiosSistemaController = void 0;
const common_1 = require("@nestjs/common");
const CambiosSistemaService_1 = require("./CambiosSistemaService");
let CambiosSistemaController = class CambiosSistemaController {
    constructor(cambiosSistemaService) {
        this.cambiosSistemaService = cambiosSistemaService;
    }
    async listarCambios(estado, limit) {
        return await this.cambiosSistemaService.listarCambios({
            estado,
            limit,
        });
    }
    async marcarComoObservado(id) {
        return await this.cambiosSistemaService.marcarComoObservado(id);
    }
};
exports.CambiosSistemaController = CambiosSistemaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("estado")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CambiosSistemaController.prototype, "listarCambios", null);
__decorate([
    (0, common_1.Patch)(":id/observado"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CambiosSistemaController.prototype, "marcarComoObservado", null);
exports.CambiosSistemaController = CambiosSistemaController = __decorate([
    (0, common_1.Controller)("cambios-sistema"),
    __metadata("design:paramtypes", [CambiosSistemaService_1.CambiosSistemaService])
], CambiosSistemaController);
//# sourceMappingURL=CambiosSistemaController.js.map