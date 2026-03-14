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
    async updateAprendiz(cedula, payload, actorCedula) {
        return await this.listaService.updateAprendiz(cedula, payload, actorCedula);
    }
    async deleteAprendiz(cedula, actorCedula) {
        return await this.listaService.deleteAprendiz(cedula, actorCedula);
    }
    async getInstructores(cedula) {
        return await this.listaService.findAllInstructores(cedula);
    }
    async updateInstructor(cedula, payload, actorCedula) {
        return await this.listaService.updateInstructor(cedula, payload, actorCedula);
    }
    async replaceInstructor(cedula, payload, actorCedula) {
        return await this.listaService.updateInstructor(cedula, payload, actorCedula);
    }
    async updateInstructorCompat(cedula, payload, actorCedula) {
        return await this.listaService.updateInstructor(cedula, payload, actorCedula);
    }
    async deleteInstructor(cedula, actorCedula) {
        return await this.listaService.deleteInstructor(cedula, actorCedula);
    }
    async getFichas() {
        return await this.listaService.findAllFichas();
    }
    async getFichaOptions() {
        return await this.listaService.getFichaCatalogOptions();
    }
    async createFicha(payload) {
        return await this.listaService.createFicha(payload);
    }
    async updateFicha(numero, payload, actorCedula) {
        return await this.listaService.updateFicha(numero, payload, actorCedula);
    }
    async deleteFicha(numero, actorCedula) {
        return await this.listaService.deleteFicha(numero, actorCedula);
    }
    async renamePrograma(payload, actorCedula) {
        return await this.listaService.renamePrograma(payload, actorCedula);
    }
    async deletePrograma(payload, actorCedula) {
        return await this.listaService.deletePrograma(payload, actorCedula);
    }
    async renameArea(payload, actorCedula) {
        return await this.listaService.renameArea(payload, actorCedula);
    }
    async deleteArea(payload, actorCedula) {
        return await this.listaService.deleteArea(payload, actorCedula);
    }
    async getStats(cedula) {
        return await this.listaService.getInstructorStats(cedula);
    }
    async createUsuario(payload) {
        return await this.listaService.createUsuario(payload);
    }
    async importUsuarios(payload) {
        return await this.listaService.importUsuarios(payload.usuarios);
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
    (0, common_1.Patch)('aprendices/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "updateAprendiz", null);
__decorate([
    (0, common_1.Delete)('aprendices/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "deleteAprendiz", null);
__decorate([
    (0, common_1.Get)('instructores'),
    __param(0, (0, common_1.Query)('cedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getInstructores", null);
__decorate([
    (0, common_1.Patch)('instructores/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "updateInstructor", null);
__decorate([
    (0, common_1.Put)('instructores/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "replaceInstructor", null);
__decorate([
    (0, common_1.Post)('instructores/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "updateInstructorCompat", null);
__decorate([
    (0, common_1.Delete)('instructores/:cedula'),
    __param(0, (0, common_1.Param)('cedula')),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "deleteInstructor", null);
__decorate([
    (0, common_1.Get)('fichas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getFichas", null);
__decorate([
    (0, common_1.Get)('fichas/options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "getFichaOptions", null);
__decorate([
    (0, common_1.Post)('fichas'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "createFicha", null);
__decorate([
    (0, common_1.Patch)('fichas/:numero'),
    __param(0, (0, common_1.Param)('numero')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "updateFicha", null);
__decorate([
    (0, common_1.Delete)('fichas/:numero'),
    __param(0, (0, common_1.Param)('numero')),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "deleteFicha", null);
__decorate([
    (0, common_1.Patch)('catalogos/programas'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "renamePrograma", null);
__decorate([
    (0, common_1.Post)('catalogos/programas/eliminar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "deletePrograma", null);
__decorate([
    (0, common_1.Patch)('catalogos/areas'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "renameArea", null);
__decorate([
    (0, common_1.Post)('catalogos/areas/eliminar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('actorCedula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "deleteArea", null);
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
], ListaController.prototype, "createUsuario", null);
__decorate([
    (0, common_1.Post)('users/import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListaController.prototype, "importUsuarios", null);
exports.ListaController = ListaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [ListaService_1.ListaService])
], ListaController);
//# sourceMappingURL=ListaController.js.map