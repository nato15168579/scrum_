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
exports.AprendizCriteriosController = void 0;
const common_1 = require("@nestjs/common");
const aprendizCriterios_service_1 = require("./aprendizCriterios.service");
const create_criterio_dto_1 = require("./dto/create-criterio.dto");
const update_criterio_dto_1 = require("./dto/update-criterio.dto");
let AprendizCriteriosController = class AprendizCriteriosController {
    constructor(service) {
        this.service = service;
    }
    async list(cedula) {
        return this.service.listByCedula(Number(cedula));
    }
    async historias(cedula) {
        return this.service.getHistoriasParaSelect(Number(cedula));
    }
    async getOne(id, cedula) {
        return this.service.getById(Number(id), Number(cedula));
    }
    async create(cedula, dto) {
        return this.service.create(dto, Number(cedula));
    }
    async update(id, cedula, dto) {
        return this.service.update(Number(id), dto, Number(cedula));
    }
    async remove(id, cedula) {
        return this.service.remove(Number(id), Number(cedula));
    }
};
exports.AprendizCriteriosController = AprendizCriteriosController;
__decorate([
    (0, common_1.Get)("aprendiz/criterios-aceptacion"),
    __param(0, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("aprendiz/criterios-aceptacion/historias"),
    __param(0, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "historias", null);
__decorate([
    (0, common_1.Get)("criterios-aceptacion/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)("criterios-aceptacion"),
    __param(0, (0, common_1.Query)("cedula")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_criterio_dto_1.CreateCriterioDto]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("criterios-aceptacion/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_criterio_dto_1.UpdateCriterioDto]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("criterios-aceptacion/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AprendizCriteriosController.prototype, "remove", null);
exports.AprendizCriteriosController = AprendizCriteriosController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [aprendizCriterios_service_1.AprendizCriteriosService])
], AprendizCriteriosController);
//# sourceMappingURL=aprendizCriterios.controller.js.map