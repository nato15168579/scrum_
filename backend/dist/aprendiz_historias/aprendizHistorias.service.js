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
exports.AprendizHistoriasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Usuario_1 = require("../entities/Usuario");
const ESTADO_TODO = 1;
const DET_PAR_SCRUM_MASTER = 5;
let AprendizHistoriasService = class AprendizHistoriasService {
    constructor(huRepo, usuProRepo, userRepo) {
        this.huRepo = huRepo;
        this.usuProRepo = usuProRepo;
        this.userRepo = userRepo;
    }
    async getProyectoIdByCedula(cedula) {
        var _a;
        if (!cedula) {
            throw new common_1.BadRequestException("Cédula inválida");
        }
        const asignacion = await this.usuProRepo.findOne({
            where: { usuCedula: Number(cedula) },
            order: { proId: "DESC" },
        });
        const proId = (_a = asignacion === null || asignacion === void 0 ? void 0 : asignacion.proId) !== null && _a !== void 0 ? _a : null;
        if (!proId) {
            throw new common_1.NotFoundException("El aprendiz no tiene proyecto asignado");
        }
        return Number(proId);
    }
    getEstadoNombre(estadoId) {
        switch (Number(estadoId)) {
            case 1:
                return "Pendiente";
            case 2:
                return "En proceso";
            case 3:
                return "Finalizado";
            default:
                return "Sin estado";
        }
    }
    buildNombre(usuario) {
        var _a, _b;
        if (!usuario)
            return null;
        return (`${(_a = usuario.usuNombres) !== null && _a !== void 0 ? _a : ""} ${(_b = usuario.usuApellidos) !== null && _b !== void 0 ? _b : ""}`.trim() || null);
    }
    async esScrumMasterDelProyecto(cedula, proId) {
        var _a;
        const asignacion = await this.usuProRepo.findOne({
            where: { usuCedula: Number(cedula), proId },
        });
        if (!asignacion)
            return false;
        return Number((_a = asignacion === null || asignacion === void 0 ? void 0 : asignacion.detParId) !== null && _a !== void 0 ? _a : 0) === DET_PAR_SCRUM_MASTER;
    }
    async listResponsablesProyecto(cedula) {
        var _a, _b, _c, _d;
        const proId = await this.getProyectoIdByCedula(cedula);
        const asignaciones = await this.usuProRepo.find({
            where: { proId },
            relations: {
                usuCedula2: true,
            },
            order: { usuCedula: "ASC" },
        });
        const usados = new Set();
        const result = [];
        for (const a of asignaciones) {
            const usuario = a.usuCedula2;
            const ced = String((_b = (_a = usuario === null || usuario === void 0 ? void 0 : usuario.usuCedula) !== null && _a !== void 0 ? _a : a.usuCedula) !== null && _b !== void 0 ? _b : "").trim();
            if (!ced || usados.has(ced))
                continue;
            usados.add(ced);
            result.push({
                cedula: ced,
                nombre: `${(_c = usuario === null || usuario === void 0 ? void 0 : usuario.usuNombres) !== null && _c !== void 0 ? _c : ""} ${(_d = usuario === null || usuario === void 0 ? void 0 : usuario.usuApellidos) !== null && _d !== void 0 ? _d : ""}`.trim(),
            });
        }
        return result;
    }
    mapHistoria(h, esScrumMaster, cedulaActual) {
        var _a, _b;
        const usuario = (_a = h.usuCedulaFk2) !== null && _a !== void 0 ? _a : null;
        const usuarioNombre = this.buildNombre(usuario);
        const esResponsable = String((_b = h.usuCedulaFk) !== null && _b !== void 0 ? _b : "") === String(cedulaActual);
        const puedeEditar = esScrumMaster || esResponsable;
        const puedeEliminar = esScrumMaster;
        const puedeCambiarResponsable = esScrumMaster;
        return {
            id: h.hisId,
            titulo: h.hisTitulo,
            descripcion: h.hisDescripcion,
            puntaje: h.hisPuntaje,
            numeroSprint: h.sprintIdFk,
            estadoId: h.detParIdFk,
            estadoNombre: this.getEstadoNombre(h.detParIdFk),
            responsableCedula: h.usuCedulaFk,
            responsableNombre: usuarioNombre || null,
            creadorCedula: h.usuCedulaFk,
            creadorNombre: usuarioNombre || null,
            puedeEditar,
            puedeEliminar,
            puedeCambiarResponsable,
            esScrumMaster,
        };
    }
    async listByCedula(cedula) {
        const proId = await this.getProyectoIdByCedula(cedula);
        const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);
        const hus = await this.huRepo.find({
            where: { proIdFk: proId },
            relations: {
                usuCedulaFk2: true,
            },
            order: { hisId: "ASC" },
        });
        return hus.map((h) => this.mapHistoria(h, esScrumMaster, cedula));
    }
    async getOne(id, cedula) {
        const proId = await this.getProyectoIdByCedula(cedula);
        const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);
        const hu = await this.huRepo.findOne({
            where: { hisId: id, proIdFk: proId },
            relations: {
                usuCedulaFk2: true,
            },
        });
        if (!hu) {
            throw new common_1.NotFoundException("Historia no encontrada o no pertenece a tu proyecto");
        }
        return this.mapHistoria(hu, esScrumMaster, cedula);
    }
    async create(dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const proId = await this.getProyectoIdByCedula(dto.cedula);
        const esScrumMaster = await this.esScrumMasterDelProyecto(dto.cedula, proId);
        if (!esScrumMaster) {
            throw new common_1.ForbiddenException("Solo el Scrum Master puede crear historias de usuario.");
        }
        if (!dto.responsableCedula || !String(dto.responsableCedula).trim()) {
            throw new common_1.BadRequestException("Debes asignar un responsable.");
        }
        const responsableAsignado = await this.usuProRepo.findOne({
            where: {
                usuCedula: Number(dto.responsableCedula),
                proId,
            },
        });
        if (!responsableAsignado) {
            throw new common_1.BadRequestException("El responsable no pertenece al proyecto.");
        }
        const insertResult = await this.huRepo
            .createQueryBuilder()
            .insert()
            .into(HistoriaUsuario_1.HistoriaUsuario)
            .values({
            proIdFk: proId,
            hisTitulo: dto.titulo,
            hisDescripcion: dto.descripcion,
            hisPuntaje: dto.puntaje,
            sprintIdFk: (_a = dto.numeroSprint) !== null && _a !== void 0 ? _a : null,
            detParIdFk: (_b = dto.estadoId) !== null && _b !== void 0 ? _b : ESTADO_TODO,
            usuCedulaFk: dto.responsableCedula
                ? Number(dto.responsableCedula)
                : null,
        })
            .execute();
        const newId = (_g = (_e = (_d = (_c = insertResult === null || insertResult === void 0 ? void 0 : insertResult.identifiers) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.hisId) !== null && _e !== void 0 ? _e : (_f = insertResult === null || insertResult === void 0 ? void 0 : insertResult.raw) === null || _f === void 0 ? void 0 : _f.insertId) !== null && _g !== void 0 ? _g : null;
        const saved = (_h = (newId
            ? await this.huRepo.findOne({
                where: { hisId: newId, proIdFk: proId },
                relations: { usuCedulaFk2: true },
            })
            : await this.huRepo.findOne({
                where: { proIdFk: proId },
                relations: { usuCedulaFk2: true },
                order: { hisId: "DESC" },
            }))) !== null && _h !== void 0 ? _h : null;
        if (!saved) {
            throw new common_1.BadRequestException("No se pudo confirmar el guardado en BD");
        }
        return this.mapHistoria(saved, esScrumMaster, dto.cedula);
    }
    async update(id, dto, cedula) {
        var _a;
        const proId = await this.getProyectoIdByCedula(cedula);
        const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);
        const hu = await this.huRepo.findOne({
            where: { hisId: id, proIdFk: proId },
        });
        if (!hu) {
            throw new common_1.NotFoundException("Historia no encontrada o no pertenece a tu proyecto");
        }
        const esResponsable = String((_a = hu.usuCedulaFk) !== null && _a !== void 0 ? _a : "") === String(cedula);
        if (!esScrumMaster && !esResponsable) {
            throw new common_1.ForbiddenException("Solo el Scrum Master o el responsable pueden editar esta historia.");
        }
        if (dto.titulo !== undefined)
            hu.hisTitulo = dto.titulo;
        if (dto.descripcion !== undefined)
            hu.hisDescripcion = dto.descripcion;
        if (dto.puntaje !== undefined)
            hu.hisPuntaje = dto.puntaje;
        if (dto.numeroSprint !== undefined)
            hu.sprintIdFk = dto.numeroSprint;
        if (dto.estadoId !== undefined)
            hu.detParIdFk = dto.estadoId;
        if (dto.responsableCedula !== undefined) {
            if (!esScrumMaster) {
                throw new common_1.ForbiddenException("Solo el Scrum Master puede reasignar responsables.");
            }
            const responsableAsignado = await this.usuProRepo.findOne({
                where: {
                    usuCedula: Number(dto.responsableCedula),
                    proId,
                },
            });
            if (!responsableAsignado) {
                throw new common_1.BadRequestException("El responsable no pertenece al proyecto.");
            }
            hu.usuCedulaFk = dto.responsableCedula
                ? Number(dto.responsableCedula)
                : null;
        }
        await this.huRepo.save(hu);
        const saved = await this.huRepo.findOne({
            where: { hisId: id, proIdFk: proId },
            relations: { usuCedulaFk2: true },
        });
        if (!saved) {
            throw new common_1.NotFoundException("No se pudo recargar la historia actualizada");
        }
        return this.mapHistoria(saved, esScrumMaster, cedula);
    }
    async remove(id, cedula) {
        const proId = await this.getProyectoIdByCedula(cedula);
        const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);
        if (!esScrumMaster) {
            throw new common_1.ForbiddenException("Solo el Scrum Master puede eliminar historias de usuario.");
        }
        const hu = await this.huRepo.findOne({
            where: { hisId: id, proIdFk: proId },
        });
        if (!hu) {
            throw new common_1.NotFoundException("Historia no encontrada o no pertenece a tu proyecto");
        }
        await this.huRepo.delete({ hisId: id, proIdFk: proId });
        return { ok: true };
    }
};
exports.AprendizHistoriasService = AprendizHistoriasService;
exports.AprendizHistoriasService = AprendizHistoriasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __param(2, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AprendizHistoriasService);
//# sourceMappingURL=aprendizHistorias.service.js.map