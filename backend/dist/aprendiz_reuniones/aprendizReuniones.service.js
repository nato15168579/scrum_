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
exports.AprendizReunionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Reuniones_1 = require("../entities/Reuniones");
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
const Sprint_1 = require("../entities/Sprint");
const Usuario_1 = require("../entities/Usuario");
const HistoriaUsuario_1 = require("../entities/HistoriaUsuario");
let AprendizReunionesService = class AprendizReunionesService {
    constructor(reunionesRepo, usuProDetParRepo, sprintRepo, usuarioRepo, historiaRepo) {
        this.reunionesRepo = reunionesRepo;
        this.usuProDetParRepo = usuProDetParRepo;
        this.sprintRepo = sprintRepo;
        this.usuarioRepo = usuarioRepo;
        this.historiaRepo = historiaRepo;
    }
    async findByAprendizCedula(cedula) {
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula es obligatoria.");
        }
        const relaciones = await this.usuProDetParRepo.find({
            where: { usuCedula: Number(cedula) },
        });
        if (!relaciones.length) {
            return [];
        }
        const projectIds = [
            ...new Set(relaciones.map((r) => Number(r.proId)).filter(Boolean)),
        ];
        const historias = await this.historiaRepo.find({
            where: {
                proIdFk: (0, typeorm_2.In)(projectIds),
            },
            select: {
                sprintIdFk: true,
            },
        });
        const sprintIds = [
            ...new Set(historias
                .map((h) => Number(h.sprintIdFk))
                .filter((id) => Number.isFinite(id) && id > 0)),
        ];
        if (!sprintIds.length) {
            return [];
        }
        const reuniones = await this.reunionesRepo.find({
            where: {
                sprIdFk: (0, typeorm_2.In)(sprintIds),
            },
            relations: {
                detParIdTipoFk2: true,
                detParIdEstadoFk2: true,
                reuResponsableFk2: true,
            },
            order: {
                reuFecha: "DESC",
                reuHora: "DESC",
                reuId: "DESC",
            },
        });
        const asistentesPorReunion = await this.getAsistentesPorReunion(reuniones, projectIds);
        return reuniones.map((reu) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const esResponsable = String((_a = reu.reuResponsableFk) !== null && _a !== void 0 ? _a : "") === String(cedula);
            const asistentesDetalle = (_b = asistentesPorReunion.get(Number(reu.reuId))) !== null && _b !== void 0 ? _b : [];
            return {
                id: reu.reuId,
                tipo: this.getDetalleLabel(reu.detParIdTipoFk2),
                fecha: (_c = reu.reuFecha) !== null && _c !== void 0 ? _c : null,
                descripcion: (_d = reu.reuDescripcion) !== null && _d !== void 0 ? _d : null,
                hora: (_e = reu.reuHora) !== null && _e !== void 0 ? _e : null,
                responsable: this.getNombreCompleto(reu.reuResponsableFk2),
                responsableCedula: (_f = reu.reuResponsableFk) !== null && _f !== void 0 ? _f : null,
                asistentes: asistentesDetalle.map((a) => a.nombre),
                asistentesDetalle,
                cantidadAsistentes: asistentesDetalle.length,
                lugar: (_g = reu.reuLugar) !== null && _g !== void 0 ? _g : "-",
                estado: this.getDetalleLabel(reu.detParIdEstadoFk2),
                estadoId: (_h = reu.detParIdEstadoFk) !== null && _h !== void 0 ? _h : null,
                informe: (_j = reu.reuInforme) !== null && _j !== void 0 ? _j : null,
                puedeGestionarInforme: esResponsable,
                puedeEditar: esResponsable,
            };
        });
    }
    async findAprendicesProyectoByReunion(reunionId, cedula) {
        if (!reunionId) {
            throw new common_1.BadRequestException("El id de la reunión es obligatorio.");
        }
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula es obligatoria.");
        }
        const reunion = await this.reunionesRepo.findOne({
            where: { reuId: reunionId },
        });
        if (!reunion) {
            throw new common_1.NotFoundException("La reunión no existe.");
        }
        const projectIds = await this.getProjectIdsBySprintIds([
            Number(reunion.sprIdFk),
        ]);
        if (!projectIds.length) {
            return [];
        }
        const integrantes = await this.getIntegrantesProyecto(projectIds);
        return integrantes.map((item) => ({
            cedula: item.cedula,
            nombre: item.nombre,
        }));
    }
    async createByAprendizCedula(cedula, dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula del usuario es obligatoria.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.sprIdFk)) {
            throw new common_1.BadRequestException("El sprint es obligatorio.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.detParIdTipoFk)) {
            throw new common_1.BadRequestException("El tipo de reunión es obligatorio.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.reuFecha)) {
            throw new common_1.BadRequestException("La fecha es obligatoria.");
        }
        const usuario = await this.usuarioRepo.findOne({
            where: { usuCedula: Number(cedula) },
        });
        if (!usuario) {
            throw new common_1.NotFoundException("No se encontró el usuario responsable.");
        }
        const reunion = this.reunionesRepo.create({
            sprIdFk: Number(dto.sprIdFk),
            detParIdTipoFk: Number(dto.detParIdTipoFk),
            detParIdEstadoFk: dto.detParIdEstadoFk
                ? Number(dto.detParIdEstadoFk)
                : null,
            reuFecha: dto.reuFecha,
            reuDescripcion: ((_a = dto.reuDescripcion) === null || _a === void 0 ? void 0 : _a.trim()) || null,
            reuHora: (_b = dto.reuHora) !== null && _b !== void 0 ? _b : null,
            reuLugar: ((_c = dto.reuLugar) === null || _c === void 0 ? void 0 : _c.trim()) || null,
            reuResumen: ((_d = dto.reuResumen) === null || _d === void 0 ? void 0 : _d.trim()) || null,
            reuInforme: null,
            reuResponsableFk: Number(cedula),
        });
        const saved = await this.reunionesRepo.save(reunion);
        const created = await this.reunionesRepo.findOne({
            where: { reuId: saved.reuId },
            relations: {
                detParIdTipoFk2: true,
                detParIdEstadoFk2: true,
                reuResponsableFk2: true,
            },
        });
        return {
            id: (_e = created === null || created === void 0 ? void 0 : created.reuId) !== null && _e !== void 0 ? _e : saved.reuId,
            tipo: this.getDetalleLabel(created === null || created === void 0 ? void 0 : created.detParIdTipoFk2),
            fecha: (_f = created === null || created === void 0 ? void 0 : created.reuFecha) !== null && _f !== void 0 ? _f : dto.reuFecha,
            descripcion: (_h = (_g = created === null || created === void 0 ? void 0 : created.reuDescripcion) !== null && _g !== void 0 ? _g : dto.reuDescripcion) !== null && _h !== void 0 ? _h : null,
            hora: (_k = (_j = created === null || created === void 0 ? void 0 : created.reuHora) !== null && _j !== void 0 ? _j : dto.reuHora) !== null && _k !== void 0 ? _k : null,
            responsable: this.getNombreCompleto(created === null || created === void 0 ? void 0 : created.reuResponsableFk2),
            responsableCedula: (_l = created === null || created === void 0 ? void 0 : created.reuResponsableFk) !== null && _l !== void 0 ? _l : Number(cedula),
            asistentes: [],
            asistentesDetalle: [],
            cantidadAsistentes: 0,
            lugar: (_o = (_m = created === null || created === void 0 ? void 0 : created.reuLugar) !== null && _m !== void 0 ? _m : dto.reuLugar) !== null && _o !== void 0 ? _o : "-",
            estado: this.getDetalleLabel(created === null || created === void 0 ? void 0 : created.detParIdEstadoFk2),
            estadoId: (_q = (_p = created === null || created === void 0 ? void 0 : created.detParIdEstadoFk) !== null && _p !== void 0 ? _p : dto.detParIdEstadoFk) !== null && _q !== void 0 ? _q : null,
            informe: (_r = created === null || created === void 0 ? void 0 : created.reuInforme) !== null && _r !== void 0 ? _r : null,
            puedeGestionarInforme: true,
            puedeEditar: true,
            message: "Reunión creada correctamente.",
        };
    }
    async updateByAprendizCedula(reunionId, cedula, dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        if (!reunionId) {
            throw new common_1.BadRequestException("El id de la reunión es inválido.");
        }
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula del usuario es inválida.");
        }
        const reunion = await this.reunionesRepo.findOne({
            where: { reuId: reunionId },
            relations: {
                reuResponsableFk2: true,
            },
        });
        if (!reunion) {
            throw new common_1.NotFoundException("La reunión no existe.");
        }
        if (String((_a = reunion.reuResponsableFk) !== null && _a !== void 0 ? _a : "") !== String(cedula)) {
            throw new common_1.ForbiddenException("Solo el responsable que creó la reunión puede editarla.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.sprIdFk)) {
            throw new common_1.BadRequestException("El sprint es obligatorio.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.detParIdTipoFk)) {
            throw new common_1.BadRequestException("El tipo de reunión es obligatorio.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.reuFecha)) {
            throw new common_1.BadRequestException("La fecha es obligatoria.");
        }
        reunion.sprIdFk = Number(dto.sprIdFk);
        reunion.detParIdTipoFk = Number(dto.detParIdTipoFk);
        reunion.detParIdEstadoFk = dto.detParIdEstadoFk
            ? Number(dto.detParIdEstadoFk)
            : null;
        reunion.reuFecha = dto.reuFecha;
        reunion.reuDescripcion = ((_b = dto.reuDescripcion) === null || _b === void 0 ? void 0 : _b.trim()) || null;
        reunion.reuHora = (_c = dto.reuHora) !== null && _c !== void 0 ? _c : null;
        reunion.reuLugar = ((_d = dto.reuLugar) === null || _d === void 0 ? void 0 : _d.trim()) || null;
        reunion.reuResumen = ((_e = dto.reuResumen) === null || _e === void 0 ? void 0 : _e.trim()) || null;
        await this.reunionesRepo.save(reunion);
        const updated = await this.reunionesRepo.findOne({
            where: { reuId: reunionId },
            relations: {
                detParIdTipoFk2: true,
                detParIdEstadoFk2: true,
                reuResponsableFk2: true,
            },
        });
        const asistentesPorReunion = await this.getAsistentesPorReunion(updated ? [updated] : [], []);
        const asistentesDetalle = (_g = asistentesPorReunion.get(Number((_f = updated === null || updated === void 0 ? void 0 : updated.reuId) !== null && _f !== void 0 ? _f : 0))) !== null && _g !== void 0 ? _g : [];
        return {
            id: (_h = updated === null || updated === void 0 ? void 0 : updated.reuId) !== null && _h !== void 0 ? _h : reunionId,
            tipo: this.getDetalleLabel(updated === null || updated === void 0 ? void 0 : updated.detParIdTipoFk2),
            fecha: (_j = updated === null || updated === void 0 ? void 0 : updated.reuFecha) !== null && _j !== void 0 ? _j : dto.reuFecha,
            descripcion: (_l = (_k = updated === null || updated === void 0 ? void 0 : updated.reuDescripcion) !== null && _k !== void 0 ? _k : dto.reuDescripcion) !== null && _l !== void 0 ? _l : null,
            hora: (_o = (_m = updated === null || updated === void 0 ? void 0 : updated.reuHora) !== null && _m !== void 0 ? _m : dto.reuHora) !== null && _o !== void 0 ? _o : null,
            responsable: this.getNombreCompleto(updated === null || updated === void 0 ? void 0 : updated.reuResponsableFk2),
            responsableCedula: (_p = updated === null || updated === void 0 ? void 0 : updated.reuResponsableFk) !== null && _p !== void 0 ? _p : null,
            asistentes: asistentesDetalle.map((a) => a.nombre),
            asistentesDetalle,
            cantidadAsistentes: asistentesDetalle.length,
            lugar: (_r = (_q = updated === null || updated === void 0 ? void 0 : updated.reuLugar) !== null && _q !== void 0 ? _q : dto.reuLugar) !== null && _r !== void 0 ? _r : "-",
            estado: this.getDetalleLabel(updated === null || updated === void 0 ? void 0 : updated.detParIdEstadoFk2),
            estadoId: (_t = (_s = updated === null || updated === void 0 ? void 0 : updated.detParIdEstadoFk) !== null && _s !== void 0 ? _s : dto.detParIdEstadoFk) !== null && _t !== void 0 ? _t : null,
            informe: (_u = updated === null || updated === void 0 ? void 0 : updated.reuInforme) !== null && _u !== void 0 ? _u : null,
            puedeGestionarInforme: true,
            puedeEditar: true,
            message: "Reunión actualizada correctamente.",
        };
    }
    async updateInformeByResponsable(reunionId, cedula, dto) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!reunionId) {
            throw new common_1.BadRequestException("El id de la reunión es inválido.");
        }
        if (!cedula) {
            throw new common_1.BadRequestException("La cédula del usuario es inválida.");
        }
        if (!(dto === null || dto === void 0 ? void 0 : dto.reuInforme) || !dto.reuInforme.trim()) {
            throw new common_1.BadRequestException("El informe de la reunión es obligatorio.");
        }
        const reunion = await this.reunionesRepo.findOne({
            where: { reuId: reunionId },
            relations: {
                detParIdTipoFk2: true,
                detParIdEstadoFk2: true,
                reuResponsableFk2: true,
            },
        });
        if (!reunion) {
            throw new common_1.NotFoundException("La reunión no existe.");
        }
        if (String((_a = reunion.reuResponsableFk) !== null && _a !== void 0 ? _a : "") !== String(cedula)) {
            throw new common_1.ForbiddenException("Solo el responsable de la reunión puede crear o editar el informe.");
        }
        const projectIds = await this.getProjectIdsBySprintIds([
            Number(reunion.sprIdFk),
        ]);
        if (!projectIds.length) {
            throw new common_1.BadRequestException("No se encontró el proyecto relacionado con la reunión.");
        }
        const integrantesProyecto = await this.getIntegrantesProyecto(projectIds);
        const integrantesPermitidos = new Set(integrantesProyecto.map((i) => String(i.cedula)));
        const asistentesCedulas = Array.isArray(dto.asistentesCedulas)
            ? [...new Set(dto.asistentesCedulas.map((x) => String(x).trim()).filter(Boolean))]
            : [];
        for (const cedulaAsistente of asistentesCedulas) {
            if (!integrantesPermitidos.has(String(cedulaAsistente))) {
                throw new common_1.BadRequestException(`El usuario ${cedulaAsistente} no pertenece al proyecto de esta reunión.`);
            }
        }
        reunion.reuInforme = dto.reuInforme.trim();
        await this.reunionesRepo.save(reunion);
        await this.reunionesRepo.query(`DELETE FROM pro_scrum.usu_reu_pro WHERE reu_id_FK = ?`, [reunionId]);
        if (asistentesCedulas.length) {
            const proyectoId = Number(projectIds[0]);
            for (const cedulaAsistente of asistentesCedulas) {
                await this.reunionesRepo.query(`
          INSERT INTO pro_scrum.usu_reu_pro
          (reu_id_FK, usu_cedula_FK, pro_id_FK)
          VALUES (?, ?, ?)
          `, [reunionId, cedulaAsistente, proyectoId]);
            }
        }
        const asistentesPorReunion = await this.getAsistentesPorReunion([reunion], projectIds);
        const asistentesDetalle = (_b = asistentesPorReunion.get(Number(reunion.reuId))) !== null && _b !== void 0 ? _b : [];
        return {
            id: reunion.reuId,
            tipo: this.getDetalleLabel(reunion.detParIdTipoFk2),
            fecha: (_c = reunion.reuFecha) !== null && _c !== void 0 ? _c : null,
            hora: (_d = reunion.reuHora) !== null && _d !== void 0 ? _d : null,
            responsable: this.getNombreCompleto(reunion.reuResponsableFk2),
            responsableCedula: (_e = reunion.reuResponsableFk) !== null && _e !== void 0 ? _e : null,
            asistentes: asistentesDetalle.map((a) => a.nombre),
            asistentesDetalle,
            cantidadAsistentes: asistentesDetalle.length,
            lugar: (_f = reunion.reuLugar) !== null && _f !== void 0 ? _f : "-",
            estado: this.getDetalleLabel(reunion.detParIdEstadoFk2),
            estadoId: (_g = reunion.detParIdEstadoFk) !== null && _g !== void 0 ? _g : null,
            informe: reunion.reuInforme,
            puedeGestionarInforme: true,
            puedeEditar: true,
            message: "Informe de la reunión guardado correctamente.",
        };
    }
    async getProjectIdsBySprintIds(sprintIds) {
        const validSprintIds = [
            ...new Set(sprintIds
                .map(Number)
                .filter((id) => Number.isFinite(id) && id > 0)),
        ];
        if (!validSprintIds.length) {
            return [];
        }
        const historias = await this.historiaRepo.find({
            where: {
                sprintIdFk: (0, typeorm_2.In)(validSprintIds),
            },
            select: {
                proIdFk: true,
            },
        });
        return [
            ...new Set(historias
                .map((h) => Number(h.proIdFk))
                .filter((id) => Number.isFinite(id) && id > 0)),
        ];
    }
    async getIntegrantesProyecto(projectIds) {
        const ids = [...new Set(projectIds.map(Number).filter(Boolean))];
        if (!ids.length) {
            return [];
        }
        const sql = `
      SELECT DISTINCT
        CAST(u.usu_cedula AS CHAR) AS cedula,
        TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))) AS nombreCompleto
      FROM pro_scrum.usu_pro_det_par upd
      INNER JOIN pro_scrum.usuario u
        ON u.usu_cedula = upd.usu_cedula
      WHERE upd.pro_ID IN (${ids.join(",")})
      ORDER BY nombreCompleto ASC
    `;
        const rows = await this.reunionesRepo.query(sql);
        return rows.map((row) => {
            var _a, _b;
            return ({
                cedula: String((_a = row.cedula) !== null && _a !== void 0 ? _a : "").trim(),
                nombre: String((_b = row.nombreCompleto) !== null && _b !== void 0 ? _b : "").trim() || "-",
            });
        });
    }
    async getAsistentesPorReunion(reuniones, projectIds) {
        var _a, _b, _c;
        const map = new Map();
        if (!reuniones.length)
            return map;
        const reunionIds = [
            ...new Set(reuniones.map((r) => Number(r.reuId)).filter(Boolean)),
        ];
        if (!reunionIds.length)
            return map;
        const projectIdsValid = [
            ...new Set(projectIds.map(Number).filter(Boolean)),
        ];
        let sql = `
      SELECT
        ur.reu_id_FK AS reuIdFk,
        ur.pro_id_FK AS proIdFk,
        CAST(u.usu_cedula AS CHAR) AS usuCedula,
        TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))) AS nombreCompleto
      FROM pro_scrum.usu_reu_pro ur
      INNER JOIN pro_scrum.usuario u
        ON u.usu_cedula = ur.usu_cedula_FK
      WHERE ur.reu_id_FK IN (${reunionIds.join(",")})
    `;
        if (projectIdsValid.length) {
            sql += ` AND ur.pro_id_FK IN (${projectIdsValid.join(",")})`;
        }
        sql += ` ORDER BY ur.reu_id_FK ASC, nombreCompleto ASC`;
        const rawRows = await this.reunionesRepo.query(sql);
        for (const row of rawRows) {
            const reunionId = Number((_a = row.reuIdFk) !== null && _a !== void 0 ? _a : 0);
            if (!reunionId)
                continue;
            const cedula = String((_b = row.usuCedula) !== null && _b !== void 0 ? _b : "").trim();
            const nombre = String((_c = row.nombreCompleto) !== null && _c !== void 0 ? _c : "").trim() || cedula || "-";
            if (!map.has(reunionId)) {
                map.set(reunionId, []);
            }
            map.get(reunionId).push({
                cedula,
                nombre,
            });
        }
        return map;
    }
    getDetalleLabel(detalle) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!detalle)
            return "-";
        return (((_b = (_a = detalle.detParDescripcion) === null || _a === void 0 ? void 0 : _a.trim) === null || _b === void 0 ? void 0 : _b.call(_a)) ||
            ((_d = (_c = detalle.detParNombre) === null || _c === void 0 ? void 0 : _c.trim) === null || _d === void 0 ? void 0 : _d.call(_c)) ||
            ((_f = (_e = detalle.detParValor) === null || _e === void 0 ? void 0 : _e.trim) === null || _f === void 0 ? void 0 : _f.call(_e)) ||
            `${(_g = detalle.detParId) !== null && _g !== void 0 ? _g : "-"}`);
    }
    getNombreCompleto(usuario) {
        var _a, _b, _c, _d, _e, _f;
        if (!usuario)
            return "-";
        const nombres = (_c = (_b = (_a = usuario.usuNombres) === null || _a === void 0 ? void 0 : _a.trim) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : "";
        const apellidos = (_f = (_e = (_d = usuario.usuApellidos) === null || _d === void 0 ? void 0 : _d.trim) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : "";
        return `${nombres} ${apellidos}`.trim() || "-";
    }
};
exports.AprendizReunionesService = AprendizReunionesService;
exports.AprendizReunionesService = AprendizReunionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Reuniones_1.Reuniones)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __param(2, (0, typeorm_1.InjectRepository)(Sprint_1.Sprint)),
    __param(3, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __param(4, (0, typeorm_1.InjectRepository)(HistoriaUsuario_1.HistoriaUsuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AprendizReunionesService);
//# sourceMappingURL=aprendizReuniones.service.js.map