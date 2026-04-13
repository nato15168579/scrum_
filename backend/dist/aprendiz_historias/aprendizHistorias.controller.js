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
exports.AprendizHistoriasController = void 0;
const common_1 = require("@nestjs/common");
const aprendizHistorias_service_1 = require("./aprendizHistorias.service");
const create_historia_dto_1 = require("./dto/create-historia.dto");
let AprendizHistoriasController = class AprendizHistoriasController {
    constructor(service) {
        this.service = service;
    }
    list(cedula) {
        return this.service.listByCedula(cedula);
    }
    responsables(cedula) {
        return this.service.listResponsablesProyecto(cedula);
    }
    getOne(id, cedula) {
        return this.service.getOne(id, cedula);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto, cedulaQ) {
        const cedula = Number(cedulaQ !== null && cedulaQ !== void 0 ? cedulaQ : dto.cedula);
        return this.service.update(id, dto, cedula);
    }
    remove(id, cedulaQ, body) {
        const cedula = Number(cedulaQ !== null && cedulaQ !== void 0 ? cedulaQ : body === null || body === void 0 ? void 0 : body.cedula);
        return this.service.remove(id, cedula);
    }
};
exports.AprendizHistoriasController = AprendizHistoriasController;
__decorate([
    (0, common_1.Get)("aprendiz/historias-usuario"),
    __param(0, (0, common_1.Query)("cedula", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("aprendiz/historias-usuario/responsables"),
    __param(0, (0, common_1.Query)("cedula", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "responsables", null);
__decorate([
    (0, common_1.Get)("historias-usuario/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("cedula", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)("historias-usuario"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_historia_dto_1.CreateHistoriaDto]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("historias-usuario/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("cedula")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("historias-usuario/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("cedula")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], AprendizHistoriasController.prototype, "remove", null);
exports.AprendizHistoriasController = AprendizHistoriasController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [aprendizHistorias_service_1.AprendizHistoriasService])
], AprendizHistoriasController);
//# sourceMappingURL=aprendizHistorias.controller.js.map