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
exports.MiProyectoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Proyecto_1 = require("../entities/Proyecto");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const Usuario_1 = require("../entities/Usuario");
const ESTADO_CREADO = 1;
const ESTADO_EN_PROCESO = 2;
const ESTADO_COMPLETO = 3;
let MiProyectoService = class MiProyectoService {
    constructor(usuProRepo, proyectoRepo, huRepo, usuarioRepo) {
        this.usuProRepo = usuProRepo;
        this.proyectoRepo = proyectoRepo;
        this.huRepo = huRepo;
        this.usuarioRepo = usuarioRepo;
    }
    async getProyectoAsignado(cedula) {
        var _a;
        const asignacion = await this.usuProRepo.findOne({
            where: { usuCedula: Number(cedula) },
            order: { proId: "DESC" },
        });
        const proId = (_a = asignacion === null || asignacion === void 0 ? void 0 : asignacion.proId) !== null && _a !== void 0 ? _a : null;
        if (!proId)
            return null;
        return proId;
    }
    async getIntegrantesProyecto(proId) {
        const asignaciones = await this.usuProRepo.find({
            where: { proId },
            relations: ["usuCedula2", "detParId_2"],
        });
        return asignaciones
            .map((item) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const u = item.usuCedula2;
            if (!u)
                return null;
            const nombre = `${(_a = u.usuNombres) !== null && _a !== void 0 ? _a : ""} ${(_b = u.usuApellidos) !== null && _b !== void 0 ? _b : ""}`.trim();
            return {
                cedula: (_c = u.usuCedula) !== null && _c !== void 0 ? _c : null,
                nombre: nombre || "Sin nombre",
                correo: (_d = u.usuCorreo) !== null && _d !== void 0 ? _d : null,
                telefono: (_e = u.usuTelefono) !== null && _e !== void 0 ? _e : null,
                rol: (_g = (_f = item.detParId_2) === null || _f === void 0 ? void 0 : _f.detParDescripcion) !== null && _g !== void 0 ? _g : "Sin rol",
            };
        })
            .filter(Boolean);
    }
    async getMiProyectoByCedula(cedula) {
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId) {
            return {
                proId: null,
                nombre: null,
                grupo: 0,
                integrantes: [],
                fechaAsignada: null,
                fechaFin: null,
                descripcion: null,
                distribucion: {
                    creados: 0,
                    completos: 0,
                    enProceso: 0,
                },
                avanceProyecto: [],
            };
        }
        const proyecto = await this.proyectoRepo.findOne({
            where: { proId },
            relations: ["detParIdFk2"],
        });
        if (!proyecto) {
            return {
                proId,
                nombre: null,
                grupo: 0,
                integrantes: [],
                fechaAsignada: null,
                fechaFin: null,
                descripcion: null,
                distribucion: {
                    creados: 0,
                    completos: 0,
                    enProceso: 0,
                },
                avanceProyecto: [],
            };
        }
        const integrantes = await this.getIntegrantesProyecto(proId);
        const grupo = integrantes.length;
        const [creados, enProceso, completos] = await Promise.all([
            this.huRepo.count({
                where: { proIdFk: proId, detParIdFk: ESTADO_CREADO },
            }),
            this.huRepo.count({
                where: { proIdFk: proId, detParIdFk: ESTADO_EN_PROCESO },
            }),
            this.huRepo.count({
                where: { proIdFk: proId, detParIdFk: ESTADO_COMPLETO },
            }),
        ]);
        const porSprint = await this.huRepo
            .createQueryBuilder("h")
            .select("h.sprintIdFk", "sprint")
            .addSelect("COUNT(*)", "total")
            .addSelect(`SUM(CASE WHEN h.detParIdFk = ${ESTADO_COMPLETO} THEN 1 ELSE 0 END)`, "done")
            .where("h.proIdFk = :proId", { proId })
            .andWhere("h.sprintIdFk IS NOT NULL")
            .groupBy("h.sprintIdFk")
            .orderBy("h.sprintIdFk", "ASC")
            .getRawMany();
        const avanceProyecto = porSprint.map((r) => {
            const total = Number(r.total) || 0;
            const done = Number(r.done) || 0;
            return {
                label: `Sprint ${r.sprint}`,
                value: total ? Math.round((done / total) * 100) : 0,
            };
        });
        return {
            proId: proyecto.proId,
            nombre: proyecto.proNombre,
            grupo,
            integrantes: integrantes.map((i) => ({
                nombre: i.nombre,
                rol: i.rol,
            })),
            fechaAsignada: proyecto.proFechaInicio,
            fechaFin: proyecto.proFechaFin,
            descripcion: proyecto.proDescription,
            distribucion: {
                creados,
                completos,
                enProceso,
            },
            avanceProyecto,
        };
    }
    async getMiProyectoDetalleByCedula(cedula) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const proId = await this.getProyectoAsignado(cedula);
        if (!proId) {
            return {
                proId: null,
                proCodigo: null,
                nombre: null,
                descripcion: null,
                objetivoGeneral: null,
                objetivosEspecificos: null,
                justificacion: null,
                estado: null,
                fechaInicio: null,
                fechaFin: null,
                fechaCreacion: null,
                integrantes: [],
            };
        }
        const proyecto = await this.proyectoRepo.findOne({
            where: { proId },
            relations: ["detParIdFk2"],
        });
        if (!proyecto) {
            return {
                proId,
                proCodigo: null,
                nombre: null,
                descripcion: null,
                objetivoGeneral: null,
                objetivosEspecificos: null,
                justificacion: null,
                estado: null,
                fechaInicio: null,
                fechaFin: null,
                fechaCreacion: null,
                integrantes: [],
            };
        }
        const integrantes = await this.getIntegrantesProyecto(proId);
        return {
            proId: proyecto.proId,
            proCodigo: (_a = proyecto.proCodigo) !== null && _a !== void 0 ? _a : null,
            nombre: (_b = proyecto.proNombre) !== null && _b !== void 0 ? _b : null,
            descripcion: (_c = proyecto.proDescription) !== null && _c !== void 0 ? _c : null,
            objetivoGeneral: (_d = proyecto.proObjetivoGeneral) !== null && _d !== void 0 ? _d : null,
            objetivosEspecificos: (_e = proyecto.proObjetivosEspecificos) !== null && _e !== void 0 ? _e : null,
            justificacion: (_f = proyecto.proJustificacion) !== null && _f !== void 0 ? _f : null,
            estado: (_h = (_g = proyecto.detParIdFk2) === null || _g === void 0 ? void 0 : _g.detParDescripcion) !== null && _h !== void 0 ? _h : null,
            fechaInicio: (_j = proyecto.proFechaInicio) !== null && _j !== void 0 ? _j : null,
            fechaFin: (_k = proyecto.proFechaFin) !== null && _k !== void 0 ? _k : null,
            fechaCreacion: (_l = proyecto.proFechaCreacion) !== null && _l !== void 0 ? _l : null,
            integrantes,
        };
    }
};
exports.MiProyectoService = MiProyectoService;
exports.MiProyectoService = MiProyectoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __param(1, (0, typeorm_1.InjectRepository)(Proyecto_1.Proyecto)),
    __param(2, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __param(3, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MiProyectoService);
//# sourceMappingURL=aprendizMiProyecto.service.js.map