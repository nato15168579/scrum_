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
exports.AprendizObservacionesController = void 0;
const common_1 = require("@nestjs/common");
const aprendizObservaciones_service_1 = require("./aprendizObservaciones.service");
let AprendizObservacionesController = class AprendizObservacionesController {
    constructor(aprendizObservacionesService) {
        this.aprendizObservacionesService = aprendizObservacionesService;
    }
    async findByAprendiz(cedula) {
        return this.aprendizObservacionesService.findByAprendizCedula(Number(cedula));
    }
    async toggleVisto(id, cedula) {
        return this.aprendizObservacionesService.toggleVisto(Number(id), Number(cedula));
    }
};
exports.AprendizObservacionesController = AprendizObservacionesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AprendizObservacionesController.prototype, "findByAprendiz", null);
__decorate([
    (0, common_1.Patch)(":id/toggle-visto"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AprendizObservacionesController.prototype, "toggleVisto", null);
exports.AprendizObservacionesController = AprendizObservacionesController = __decorate([
    (0, common_1.Controller)("aprendiz/observaciones"),
    __metadata("design:paramtypes", [aprendizObservaciones_service_1.AprendizObservacionesService])
], AprendizObservacionesController);
//# sourceMappingURL=aprendizObservaciones.controller.js.map