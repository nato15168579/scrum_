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
exports.AprendizCriteriosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const CriteriosAceptacion_1 = require("../entities/CriteriosAceptacion");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const ESTADO_PENDIENTE = 1;
let AprendizCriteriosService = class AprendizCriteriosService {
    constructor(caRepo, usuProRepo, huRepo) {
        this.caRepo = caRepo;
        this.usuProRepo = usuProRepo;
        this.huRepo = huRepo;
    }
    estadoLabel(detParIdFk) {
        if (Number(detParIdFk) === 1)
            return "Pendiente";
        if (Number(detParIdFk) === 2)
            return "En proceso";
        if (Number(detParIdFk) === 3)
            return "Finalizado";
        return "-";
    }
    async getProyectoAsignado(cedula) {
        var _a;
        const asignacion = await this.usuProRepo.findOne({
            where: { usuCedula: Number(cedula) },
            order: { proId: "DESC" },
        });
        const proId = (_a = asignacion === null || asignacion === void 0 ? void 0 : asignacion.proId) !== null && _a !== void 0 ? _a : null;
        return proId ? Number(proId) : null;
    }
    buildNombreUsuario(usuario) {
        var _a, _b;
        if (!usuario)
            return null;
        return (`${(_a = usuario.usuNombres) !== null && _a !== void 0 ? _a : ""} ${(_b = usuario.usuApellidos) !== null && _b !== void 0 ? _b : ""}`.trim() || null);
    }
    mapCriterio(r) {
        var _a, _b, _c, _d, _e;
        return {
            id: r.criId,
            hisId: r.hisIdFk,
            descripcion: (_a = r.criDescripcion) !== null && _a !== void 0 ? _a : "",
            estado: this.estadoLabel(r.detParIdFk),
            estadoId: (_b = r.detParIdFk) !== null && _b !== void 0 ? _b : ESTADO_PENDIENTE,
            tiempo: (_c = r.criTiempo) !== null && _c !== void 0 ? _c : "-",
            responsableCedula: (_d = r.usuCedulaFk) !== null && _d !== void 0 ? _d : null,
            responsableNombre: (_e = this.buildNombreUsuario(r.usuCedulaFk2)) !== null && _e !== void 0 ? _e : null,
        };
    }
    validarResponsableCA(ca, cedula) {
        var _a;
        const esResponsable = Number((_a = ca.usuCedulaFk) !== null && _a !== void 0 ? _a : 0) === Number(cedula);
        if (!esResponsable) {
            throw new common_1.ForbiddenException("No tienes permisos para editar o eliminar este criterio. Solo puede hacerlo el responsable.");
        }
    }
    async validarQueSeaResponsableHU(hisId, proId, cedula) {
        var _a;
        const hu = await this.huRepo.findOne({
            where: { hisId, proIdFk: proId },
            select: {
                hisId: true,
                proIdFk: true,
                usuCedulaFk: true,
            },
        });
        if (!hu) {
            throw new common_1.BadRequestException("HU_NO_PERTENECE_AL_PROYECTO");
        }
        if (Number((_a = hu.usuCedulaFk) !== null && _a !== void 0 ? _a : 0) !== Number(cedula)) {
            throw new common_1.ForbiddenException("Solo el responsable de la historia de usuario puede crear criterios de aceptación.");
        }
        return hu;
    }
    async getHistoriasParaSelect(cedula) {
        if (!Number.isFinite(cedula) || cedula <= 0)
            return [];
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            return [];
        const historias = await this.huRepo.find({
            where: { proIdFk: proId },
            select: {
                hisId: true,
                hisTitulo: true,
                usuCedulaFk: true,
            },
            order: { hisId: "ASC" },
        });
        return historias.map((h) => {
            var _a, _b, _c;
            return ({
                id: h.hisId,
                titulo: (_a = h.hisTitulo) !== null && _a !== void 0 ? _a : `HU ${h.hisId}`,
                responsableCedula: (_b = h.usuCedulaFk) !== null && _b !== void 0 ? _b : null,
                puedeCrear: Number((_c = h.usuCedulaFk) !== null && _c !== void 0 ? _c : 0) === Number(cedula),
            });
        });
    }
    async listByCedula(cedula) {
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            return [];
        const rows = await this.caRepo.find({
            where: { proIdFk: proId },
            relations: {
                usuCedulaFk2: true,
            },
            order: { criId: "ASC" },
        });
        return rows.map((r) => this.mapCriterio(r));
    }
    async getById(id, cedula) {
        var _a, _b, _c, _d;
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            throw new common_1.NotFoundException("PROYECTO_NO_ASIGNADO");
        const ca = await this.caRepo.findOne({
            where: { criId: id, proIdFk: proId },
            relations: {
                usuCedulaFk2: true,
            },
        });
        if (!ca)
            throw new common_1.NotFoundException("CRITERIO_NO_ENCONTRADO");
        return {
            id: ca.criId,
            hisId: ca.hisIdFk,
            descripcion: (_a = ca.criDescripcion) !== null && _a !== void 0 ? _a : "",
            estadoId: (_b = ca.detParIdFk) !== null && _b !== void 0 ? _b : ESTADO_PENDIENTE,
            tiempo: (_c = ca.criTiempo) !== null && _c !== void 0 ? _c : "",
            responsableCedula: (_d = ca.usuCedulaFk) !== null && _d !== void 0 ? _d : null,
            responsableNombre: this.buildNombreUsuario(ca.usuCedulaFk2),
        };
    }
    async create(dto, cedula) {
        var _a, _b, _c, _d, _e;
        const hisId = Number((_a = dto.hisIdFk) !== null && _a !== void 0 ? _a : dto.hisId);
        if (!Number.isFinite(cedula) || cedula <= 0) {
            throw new common_1.BadRequestException("CEDULA_INVALIDA");
        }
        if (!Number.isFinite(hisId) || hisId <= 0) {
            throw new common_1.BadRequestException("HISID_INVALIDO");
        }
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            throw new common_1.BadRequestException("PROYECTO_NO_ASIGNADO");
        await this.validarQueSeaResponsableHU(hisId, proId, cedula);
        const maxIdRow = await this.caRepo
            .createQueryBuilder("ca")
            .select("MAX(ca.criId)", "max")
            .getRawOne();
        const nextId = Number((_b = maxIdRow === null || maxIdRow === void 0 ? void 0 : maxIdRow.max) !== null && _b !== void 0 ? _b : 0) + 1;
        const ca = this.caRepo.create({
            criId: nextId,
            hisIdFk: hisId,
            proIdFk: proId,
            usuCedulaFk: Number(cedula),
            detParIdFk: (_c = dto.estadoId) !== null && _c !== void 0 ? _c : ESTADO_PENDIENTE,
            criTiempo: (_d = dto.tiempo) !== null && _d !== void 0 ? _d : null,
            criDescripcion: (_e = dto.descripcion) !== null && _e !== void 0 ? _e : null,
        });
        const saved = await this.caRepo.save(ca);
        return {
            ok: true,
            id: saved.criId,
        };
    }
    async update(id, dto, cedula) {
        var _a, _b, _c, _d;
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            throw new common_1.BadRequestException("PROYECTO_NO_ASIGNADO");
        const ca = await this.caRepo.findOne({
            where: { criId: id, proIdFk: proId },
        });
        if (!ca)
            throw new common_1.NotFoundException("CRITERIO_NO_ENCONTRADO");
        this.validarResponsableCA(ca, cedula);
        if (dto.hisIdFk !== undefined || dto.hisId !== undefined) {
            const newHisId = Number((_a = dto.hisIdFk) !== null && _a !== void 0 ? _a : dto.hisId);
            if (!Number.isFinite(newHisId) || newHisId <= 0) {
                throw new common_1.BadRequestException("HISID_INVALIDO");
            }
            await this.validarQueSeaResponsableHU(newHisId, proId, cedula);
            ca.hisIdFk = newHisId;
            ca.proIdFk = proId;
            ca.usuCedulaFk = Number(cedula);
        }
        if (dto.descripcion !== undefined) {
            ca.criDescripcion = (_b = dto.descripcion) !== null && _b !== void 0 ? _b : null;
        }
        if (dto.estadoId !== undefined) {
            ca.detParIdFk = (_c = dto.estadoId) !== null && _c !== void 0 ? _c : ESTADO_PENDIENTE;
        }
        if (dto.tiempo !== undefined) {
            ca.criTiempo = (_d = dto.tiempo) !== null && _d !== void 0 ? _d : null;
        }
        await this.caRepo.save(ca);
        return { ok: true };
    }
    async remove(id, cedula) {
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId)
            throw new common_1.BadRequestException("PROYECTO_NO_ASIGNADO");
        const ca = await this.caRepo.findOne({
            where: { criId: id, proIdFk: proId },
            select: {
                criId: true,
                hisIdFk: true,
                proIdFk: true,
                usuCedulaFk: true,
            },
        });
        if (!ca)
            throw new common_1.NotFoundException("CRITERIO_NO_ENCONTRADO");
        this.validarResponsableCA(ca, cedula);
        await this.caRepo.delete({
            criId: ca.criId,
            proIdFk: ca.proIdFk,
        });
        return { ok: true };
    }
};
exports.AprendizCriteriosService = AprendizCriteriosService;
exports.AprendizCriteriosService = AprendizCriteriosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(CriteriosAceptacion_1.CriteriosAceptacion)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __param(2, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AprendizCriteriosService);
//# sourceMappingURL=aprendizCriterios.service.js.map