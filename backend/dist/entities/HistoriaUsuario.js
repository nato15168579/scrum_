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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoriaUsuario = void 0;
const typeorm_1 = require("typeorm");
const CriteriosAceptacion_1 = require("./CriteriosAceptacion");
const DetalleParametro_1 = require("./DetalleParametro");
const Proyecto_1 = require("./Proyecto");
let HistoriaUsuario = class HistoriaUsuario {
};
exports.HistoriaUsuario = HistoriaUsuario;
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "his_ID",
        comment: "id de la historia de usuario",
    }),
    __metadata("design:type", Number)
], HistoriaUsuario.prototype, "hisId", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { primary: true, name: "pro_ID_FK" }),
    __metadata("design:type", Number)
], HistoriaUsuario.prototype, "proIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "his_titulo",
        nullable: true,
        comment: "titulo de la historia de usuario",
        length: 255,
    }),
    __metadata("design:type", String)
], HistoriaUsuario.prototype, "hisTitulo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "his_descripcion",
        nullable: true,
        comment: "prioridada de la historia de usuario",
        length: 500,
    }),
    __metadata("design:type", String)
], HistoriaUsuario.prototype, "hisDescripcion", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "his_prioridad",
        nullable: true,
        comment: "numero de sprint de historia de usuario",
        length: 50,
    }),
    __metadata("design:type", String)
], HistoriaUsuario.prototype, "hisPrioridad", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "his_puntaje",
        nullable: true,
        comment: "puntaje de la historia de usuario",
    }),
    __metadata("design:type", Number)
], HistoriaUsuario.prototype, "hisPuntaje", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "his_numero_sprint", nullable: true }),
    __metadata("design:type", Number)
], HistoriaUsuario.prototype, "hisNumeroSprint", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "det_par_ID_estado_FK",
        nullable: true,
        comment: "Estado de la HU (To Do, Doing, Done)",
    }),
    __metadata("design:type", Number)
], HistoriaUsuario.prototype, "detParIdEstadoFk", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CriteriosAceptacion_1.CriteriosAceptacion, (criteriosAceptacion) => criteriosAceptacion.historiaUsuario),
    __metadata("design:type", Array)
], HistoriaUsuario.prototype, "criteriosAceptacions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.historiaUsuarios, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([
        { name: "det_par_ID_estado_FK", referencedColumnName: "detParId" },
    ]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], HistoriaUsuario.prototype, "detParIdEstadoFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Proyecto_1.Proyecto, (proyecto) => proyecto.historiaUsuarios, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "pro_ID_FK", referencedColumnName: "proId" }]),
    __metadata("design:type", Proyecto_1.Proyecto)
], HistoriaUsuario.prototype, "proIdFk2", void 0);
exports.HistoriaUsuario = HistoriaUsuario = __decorate([
    (0, typeorm_1.Index)("pro_ID_FK", ["proIdFk"], {}),
    (0, typeorm_1.Index)("fk_hu_estado", ["detParIdEstadoFk"], {}),
    (0, typeorm_1.Entity)("historia_usuario", { schema: "pro_scrum" })
], HistoriaUsuario);
//# sourceMappingURL=HistoriaUsuario.js.map