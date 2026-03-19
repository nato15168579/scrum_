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
exports.Observaciones = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const Proyecto_1 = require("./Proyecto");
const DetalleParametro_1 = require("./DetalleParametro");
let Observaciones = class Observaciones {
};
exports.Observaciones = Observaciones;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: "int",
        name: "obs_ID",
        comment: "id de la observacion",
    }),
    __metadata("design:type", Number)
], Observaciones.prototype, "obsId", void 0);
__decorate([
    (0, typeorm_1.Column)("date", {
        name: "obs_fecha",
        nullable: true,
        comment: "fecha de la  observacion",
    }),
    __metadata("design:type", String)
], Observaciones.prototype, "obsFecha", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "det_par_id_FK",
        nullable: true,
        comment: "especifique en que estado se estado est ala observacion (por hacer, en progreso, hecho)",
    }),
    __metadata("design:type", Number)
], Observaciones.prototype, "detParIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "obs_descripcion",
        nullable: true,
        comment: "descripcion de la  observacion",
        length: 255,
    }),
    __metadata("design:type", String)
], Observaciones.prototype, "obsDescripcion", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "usu_cedula_FK", nullable: true }),
    __metadata("design:type", Number)
], Observaciones.prototype, "usuCedulaFk", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "pro_ID_FK", nullable: true }),
    __metadata("design:type", Number)
], Observaciones.prototype, "proIdFk", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.observaciones, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }]),
    __metadata("design:type", Usuario_1.Usuario)
], Observaciones.prototype, "usuCedulaFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Proyecto_1.Proyecto, (proyecto) => proyecto.observaciones, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "pro_ID_FK", referencedColumnName: "proId" }]),
    __metadata("design:type", Proyecto_1.Proyecto)
], Observaciones.prototype, "proIdFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.observaciones, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([{ name: "det_par_id_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], Observaciones.prototype, "detParIdFk2", void 0);
exports.Observaciones = Observaciones = __decorate([
    (0, typeorm_1.Index)("usu_fk", ["usuCedulaFk"], {}),
    (0, typeorm_1.Index)("pro_ID_FK", ["proIdFk"], {}),
    (0, typeorm_1.Index)("obs_estado_FK", ["detParIdFk"], {}),
    (0, typeorm_1.Entity)("observaciones", { schema: "pro_scrum" })
], Observaciones);
//# sourceMappingURL=Observaciones.js.map