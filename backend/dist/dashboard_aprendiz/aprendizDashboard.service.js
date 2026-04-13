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
exports.AprendizDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Reuniones_1 = require("../entities/Reuniones");
const Observaciones_1 = require("../entities/Observaciones");
const Sprint_1 = require("../entities/Sprint");
const ESTADO_TODO = 1;
const ESTADO_DOING = 2;
const ESTADO_DONE = 3;
let AprendizDashboardService = class AprendizDashboardService {
    constructor(usuarioRepo, huRepo, usuProRepo, reunionesRepo, observacionesRepo, sprintRepo) {
        this.usuarioRepo = usuarioRepo;
        this.huRepo = huRepo;
        this.usuProRepo = usuProRepo;
        this.reunionesRepo = reunionesRepo;
        this.observacionesRepo = observacionesRepo;
        this.sprintRepo = sprintRepo;
    }
    emptyDashboard(aprendiz, correo) {
        return {
            aprendiz,
            correo: correo !== null && correo !== void 0 ? correo : null,
            stats: {
                tareasActivas: 0,
                tareasCompletadas: 0,
                participacionReuniones: 0,
                retroalimentaciones: 0,
            },
            avanceProyecto: [],
            actividad: {
                completadas: 0,
                enCurso: 0,
                pendiente: 0,
            },
            actividadGlobal: {
                completadas: 0,
                enCurso: 0,
                pendiente: 0,
            },
            actividadesRecientes: [],
        };
    }
    getProIdFromAsignacion(asig) {
        var _a, _b, _c, _d;
        if (!asig)
            return null;
        return Number((_d = (_b = (_a = asig.proId) !== null && _a !== void 0 ? _a : asig.proIdFk) !== null && _b !== void 0 ? _b : (_c = asig.pro) === null || _c === void 0 ? void 0 : _c.proId) !== null && _d !== void 0 ? _d : 0) || null;
    }
    formatRelativeFromDate(fecha) {
        if (!fecha || isNaN(fecha.getTime()))
            return "reciente";
        const now = Date.now();
        const diff = now - fecha.getTime();
        if (diff < 60 * 1000)
            return "hace un momento";
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 60)
            return `hace ${minutes} min`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24)
            return `hace ${hours} h`;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 1)
            return "ayer";
        if (days < 7)
            return `hace ${days} días`;
        return fecha.toLocaleDateString("es-CO");
    }
    getHistoriaAccion(estado) {
        if (estado === ESTADO_DONE)
            return "Completó la HU";
        if (estado === ESTADO_DOING)
            return "Está trabajando en la HU";
        return "Tiene asignada la HU";
    }
    buildDateFromReunion(fecha, hora) {
        if (!fecha)
            return null;
        const fechaTexto = typeof fecha === "string"
            ? fecha
            : fecha instanceof Date
                ? fecha.toISOString().slice(0, 10)
                : String(fecha);
        const horaTexto = hora ? String(hora).slice(0, 8) : "00:00:00";
        const full = `${fechaTexto} ${horaTexto}`;
        const date = new Date(full);
        if (!isNaN(date.getTime()))
            return date;
        const onlyDate = new Date(fechaTexto);
        return isNaN(onlyDate.getTime()) ? null : onlyDate;
    }
    normalizeText(value, fallback, max = 90) {
        const text = (value !== null && value !== void 0 ? value : fallback).toString().trim();
        if (!text)
            return fallback;
        return text.length > max ? `${text.slice(0, max)}...` : text;
    }
    interleaveActivities(groups) {
        const buckets = groups.map((g) => [...g]);
        const result = [];
        let keepGoing = true;
        while (keepGoing) {
            keepGoing = false;
            for (const bucket of buckets) {
                if (bucket.length > 0) {
                    result.push(bucket.shift());
                    keepGoing = true;
                }
            }
        }
        return result;
    }
    buildActivityPercentages(pendientes, enCurso, hechas) {
        const total = pendientes + enCurso + hechas;
        return {
            completadas: total ? Math.round((hechas / total) * 100) : 0,
            enCurso: total ? Math.round((enCurso / total) * 100) : 0,
            pendiente: total ? Math.round((pendientes / total) * 100) : 0,
        };
    }
    async getDashboardByCedula(cedula) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const cedulaNum = Number(cedula);
            if (!Number.isFinite(cedulaNum) || cedulaNum <= 0) {
                return { error: "cedula requerida" };
            }
            const user = await this.usuarioRepo.findOne({
                where: { usuCedula: cedulaNum },
                select: {
                    usuCedula: true,
                    usuNombres: true,
                    usuApellidos: true,
                    usuCorreo: true,
                },
            });
            if (!user) {
                return { error: "Usuario no encontrado" };
            }
            const aprendiz = `${(_a = user.usuNombres) !== null && _a !== void 0 ? _a : ""} ${(_b = user.usuApellidos) !== null && _b !== void 0 ? _b : ""}`.trim() ||
                "Aprendiz";
            const asignacion = await this.usuProRepo.findOne({
                where: { usuCedula: cedulaNum },
                order: { proId: "DESC" },
            });
            const proId = this.getProIdFromAsignacion(asignacion);
            if (!proId) {
                return this.emptyDashboard(aprendiz, (_c = user.usuCorreo) !== null && _c !== void 0 ? _c : null);
            }
            const [pendientes, enCurso, hechas, globalPendientes, globalEnCurso, globalHechas,] = await Promise.all([
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        usuCedulaFk: cedulaNum,
                        detParIdFk: ESTADO_TODO,
                    },
                }),
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        usuCedulaFk: cedulaNum,
                        detParIdFk: ESTADO_DOING,
                    },
                }),
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        usuCedulaFk: cedulaNum,
                        detParIdFk: ESTADO_DONE,
                    },
                }),
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        detParIdFk: ESTADO_TODO,
                    },
                }),
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        detParIdFk: ESTADO_DOING,
                    },
                }),
                this.huRepo.count({
                    where: {
                        proIdFk: proId,
                        detParIdFk: ESTADO_DONE,
                    },
                }),
            ]);
            const tareasActivas = pendientes + enCurso;
            const tareasCompletadas = hechas;
            const porSprint = await this.huRepo
                .createQueryBuilder("h")
                .select("h.sprintIdFk", "sprint")
                .addSelect("COUNT(*)", "total")
                .addSelect(`SUM(CASE WHEN h.detParIdFk = ${ESTADO_DONE} THEN 1 ELSE 0 END)`, "done")
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
                    value: total > 0 ? Math.round((done / total) * 100) : 0,
                };
            });
            const actividad = this.buildActivityPercentages(pendientes, enCurso, hechas);
            const actividadGlobal = this.buildActivityPercentages(globalPendientes, globalEnCurso, globalHechas);
            const historiasRecientes = await this.huRepo.find({
                where: {
                    proIdFk: proId,
                    usuCedulaFk: cedulaNum,
                },
                order: {
                    hisId: "DESC",
                },
                take: 50,
            });
            const actividadesHU = (historiasRecientes || []).map((h) => {
                var _a, _b;
                const titulo = this.normalizeText((_a = h.hisTitulo) !== null && _a !== void 0 ? _a : h.hisDescripcion, "Historia de usuario");
                return {
                    text: `${this.getHistoriaAccion(Number((_b = h.detParIdFk) !== null && _b !== void 0 ? _b : 0))}: ${titulo}`,
                    time: `HU #${Number(h.hisId) || ""}`,
                    type: "hu",
                };
            });
            const reunionesParticipadas = await this.reunionesRepo.query(`
        SELECT
          r.reu_ID AS reuId,
          r.reu_descripcion AS descripcion,
          r.reu_fecha AS fecha,
          r.reu_hora AS hora
        FROM pro_scrum.usu_reu_pro ur
        INNER JOIN pro_scrum.reuniones r
          ON r.reu_ID = ur.reu_id_FK
        WHERE ur.usu_cedula_FK = ?
          AND ur.pro_id_FK = ?
        ORDER BY r.reu_fecha DESC, r.reu_hora DESC, r.reu_ID DESC
        LIMIT 50
        `, [cedulaNum, proId]);
            const actividadesReuniones = (reunionesParticipadas || []).map((r) => {
                const fechaReunion = this.buildDateFromReunion(r.fecha, r.hora);
                return {
                    text: `Participó en reunión: ${this.normalizeText(r.descripcion, "Reunión del proyecto")}`,
                    time: fechaReunion
                        ? this.formatRelativeFromDate(fechaReunion)
                        : "reciente",
                    type: "reunion",
                };
            });
            const observacionesRecientes = await this.observacionesRepo.find({
                where: {
                    proIdFk: proId,
                },
                order: {
                    obsFecha: "DESC",
                    obsId: "DESC",
                },
                take: 50,
            });
            const actividadesObservaciones = (observacionesRecientes || []).map((o) => {
                const fechaObs = o.obsFecha ? new Date(o.obsFecha) : null;
                return {
                    text: `Nueva observación: ${this.normalizeText(o.obsDescripcion, "Observación del proyecto")}`,
                    time: fechaObs ? this.formatRelativeFromDate(fechaObs) : "reciente",
                    type: "observacion",
                };
            });
            const actividadesRecientes = this.interleaveActivities([
                actividadesHU,
                actividadesReuniones,
                actividadesObservaciones,
            ]);
            const reunionesRaw = await this.reunionesRepo.query(`
        SELECT COUNT(*) AS total
        FROM pro_scrum.usu_reu_pro ur
        WHERE ur.usu_cedula_FK = ?
          AND ur.pro_id_FK = ?
        `, [cedulaNum, proId]);
            const participacionReuniones = Number((_e = (_d = reunionesRaw === null || reunionesRaw === void 0 ? void 0 : reunionesRaw[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0);
            const retroalimentaciones = await this.observacionesRepo.count({
                where: { proIdFk: proId },
            });
            return {
                aprendiz,
                correo: (_f = user.usuCorreo) !== null && _f !== void 0 ? _f : null,
                stats: {
                    tareasActivas,
                    tareasCompletadas,
                    participacionReuniones,
                    retroalimentaciones,
                },
                avanceProyecto,
                actividad,
                actividadGlobal,
                actividadesRecientes,
            };
        }
        catch (err) {
            console.error("❌ AprendizDashboardService error:", err);
            return {
                error: "Error interno",
                detalle: String((_g = err === null || err === void 0 ? void 0 : err.message) !== null && _g !== void 0 ? _g : err),
            };
        }
    }
};
exports.AprendizDashboardService = AprendizDashboardService;
exports.AprendizDashboardService = AprendizDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __param(2, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __param(3, (0, typeorm_1.InjectRepository)(Reuniones_1.Reuniones)),
    __param(4, (0, typeorm_1.InjectRepository)(Observaciones_1.Observaciones)),
    __param(5, (0, typeorm_1.InjectRepository)(Sprint_1.Sprint)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AprendizDashboardService);
//# sourceMappingURL=aprendizDashboard.service.js.map