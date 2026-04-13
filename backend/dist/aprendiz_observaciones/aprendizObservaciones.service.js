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
exports.AprendizObservacionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Observaciones_1 = require("../entities/Observaciones");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
let AprendizObservacionesService = class AprendizObservacionesService {
    constructor(observacionesRepo, usuProDetParRepo) {
        this.observacionesRepo = observacionesRepo;
        this.usuProDetParRepo = usuProDetParRepo;
        this.ESTADO_POR_HACER = 1;
        this.ESTADO_HECHO = 3;
    }
    async findByAprendizCedula(cedula) {
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula es obligatoria.");
        }
        const relaciones = await this.usuProDetParRepo.find({
            where: { usuCedula: Number(cedula) },
        });
        if (!relaciones.length)
            return [];
        const projectIds = [
            ...new Set(relaciones
                .map((r) => Number(r.proId))
                .filter((id) => Number.isFinite(id) && id > 0)),
        ];
        const observaciones = await this.observacionesRepo.find({
            where: { proIdFk: (0, typeorm_2.In)(projectIds) },
            relations: {
                usuCedulaFk2: true,
            },
            order: {
                obsFecha: "DESC",
                obsId: "DESC",
            },
        });
        return observaciones.map((obs) => {
            var _a, _b, _c;
            const estaHecho = Number(obs.detParIdFk) === this.ESTADO_HECHO;
            return {
                id: obs.obsId,
                descripcion: (_a = obs.obsDescripcion) !== null && _a !== void 0 ? _a : "-",
                area: estaHecho ? "hecho" : "por hacer",
                instructor: this.getNombreCompleto(obs.usuCedulaFk2),
                fecha: (_b = obs.obsFecha) !== null && _b !== void 0 ? _b : null,
                visto: estaHecho,
                estadoFk: (_c = obs.detParIdFk) !== null && _c !== void 0 ? _c : null,
            };
        });
    }
    async toggleVisto(observacionId, cedula) {
        if (!observacionId) {
            throw new common_1.BadRequestException("ID inválido.");
        }
        if (!cedula) {
            throw new common_1.BadRequestException("Cédula inválida.");
        }
        const relaciones = await this.usuProDetParRepo.find({
            where: { usuCedula: Number(cedula) },
        });
        if (!relaciones.length) {
            throw new common_1.BadRequestException("Sin proyectos asociados.");
        }
        const projectIds = [
            ...new Set(relaciones
                .map((r) => Number(r.proId))
                .filter((id) => Number.isFinite(id) && id > 0)),
        ];
        const observacion = await this.observacionesRepo.findOne({
            where: { obsId: observacionId },
        });
        if (!observacion) {
            throw new common_1.NotFoundException("No existe.");
        }
        if (!projectIds.includes(Number(observacion.proIdFk))) {
            throw new common_1.BadRequestException("Sin permisos.");
        }
        const estaHecho = Number(observacion.detParIdFk) === this.ESTADO_HECHO;
        const nuevoEstado = estaHecho
            ? this.ESTADO_POR_HACER
            : this.ESTADO_HECHO;
        observacion.detParIdFk = nuevoEstado;
        await this.observacionesRepo.save(observacion);
        return {
            id: observacion.obsId,
            visto: nuevoEstado === this.ESTADO_HECHO,
            area: nuevoEstado === this.ESTADO_HECHO ? "hecho" : "por hacer",
            estadoFk: nuevoEstado,
            message: nuevoEstado === this.ESTADO_HECHO
                ? "Observación marcada como hecha."
                : "Observación marcada como por hacer.",
        };
    }
    getNombreCompleto(usuario) {
        var _a, _b;
        if (!usuario)
            return "-";
        return `${(_a = usuario.usuNombres) !== null && _a !== void 0 ? _a : ""} ${(_b = usuario.usuApellidos) !== null && _b !== void 0 ? _b : ""}`.trim() || "-";
    }
};
exports.AprendizObservacionesService = AprendizObservacionesService;
exports.AprendizObservacionesService = AprendizObservacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Observaciones_1.Observaciones)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AprendizObservacionesService);
//# sourceMappingURL=aprendizObservaciones.service.js.map