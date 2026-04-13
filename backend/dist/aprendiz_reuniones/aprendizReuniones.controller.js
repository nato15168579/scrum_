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
exports.AprendizReunionesController = void 0;
const common_1 = require("@nestjs/common");
const aprendizReuniones_service_1 = require("./aprendizReuniones.service");
const create_reunion_dto_1 = require("./dto/create-reunion.dto");
const update_reunion_informe_dto_1 = require("./dto/update-reunion-informe.dto");
let AprendizReunionesController = class AprendizReunionesController {
    constructor(aprendizReunionesService) {
        this.aprendizReunionesService = aprendizReunionesService;
    }
    async findByAprendiz(cedula) {
        return this.aprendizReunionesService.findByAprendizCedula(Number(cedula));
    }
    async findAprendicesProyectoByReunion(id, cedula) {
        return this.aprendizReunionesService.findAprendicesProyectoByReunion(Number(id), Number(cedula));
    }
    async createByAprendiz(cedula, dto) {
        return this.aprendizReunionesService.createByAprendizCedula(Number(cedula), dto);
    }
    async updateByAprendiz(id, cedula, dto) {
        return this.aprendizReunionesService.updateByAprendizCedula(Number(id), Number(cedula), dto);
    }
    async updateInformeByResponsable(id, cedula, dto) {
        return this.aprendizReunionesService.updateInformeByResponsable(Number(id), Number(cedula), dto);
    }
};
exports.AprendizReunionesController = AprendizReunionesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AprendizReunionesController.prototype, "findByAprendiz", null);
__decorate([
    (0, common_1.Get)(":id/aprendices"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AprendizReunionesController.prototype, "findAprendicesProyectoByReunion", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)("cedula")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_reunion_dto_1.CreateReunionDto]),
    __metadata("design:returntype", Promise)
], AprendizReunionesController.prototype, "createByAprendiz", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_reunion_dto_1.CreateReunionDto]),
    __metadata("design:returntype", Promise)
], AprendizReunionesController.prototype, "updateByAprendiz", null);
__decorate([
    (0, common_1.Patch)(":id/informe"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_reunion_informe_dto_1.UpdateReunionInformeDto]),
    __metadata("design:returntype", Promise)
], AprendizReunionesController.prototype, "updateInformeByResponsable", null);
exports.AprendizReunionesController = AprendizReunionesController = __decorate([
    (0, common_1.Controller)("aprendiz/reuniones"),
    __metadata("design:paramtypes", [aprendizReuniones_service_1.AprendizReunionesService])
], AprendizReunionesController);
//# sourceMappingURL=aprendizReuniones.controller.js.map