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
exports.ListaController = void 0;
const common_1 = require("@nestjs/common");
const ListaService_1 = require("./ListaService");
let ListaController = class ListaController {
    constructor(listaService) {
        this.listaService = listaService;
    }
    async getAprendices(cedula) {
        return await this.listaService.findAllAprendices(cedula);
    }
    async updateAprendizEstado(cedula, payload) {
        return await this.listaService.updateAprendizEstado(cedula, payload.estado);
    }
    async getInstructores(cedula) {
        return await this.listaService.findAllInstructores(cedula);
    }
    async getFichas() {
        return await this.listaService.findAllFichas();
    }
    async getStats(cedula) {
        return await this.listaService.getInstructorStats(cedula);
    }
    async createAprendiz(payload) {
        return await this.listaService.createAprendiz(payload);
    }
};
exports.ListaController = ListaController;
__decorate([
    (0, common_1.Get)('aprendices'),
    __param(0, (0, common_1.Query)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getAprendices", null);
__decorate([
    (0, common_1.Patch)('aprendices/:cedula/estado'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "updateAprendizEstado", null);
__decorate([
    (0, common_1.Get)('instructores'),
    __param(0, (0, common_1.Query)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getInstructores", null);
__decorate([
    (0, common_1.Get)('fichas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getFichas", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "createAprendiz", null);
exports.ListaController = ListaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ListaService_1.ListaService])
], ListaController);
//# sourceMappingURL=ListaController.js.map