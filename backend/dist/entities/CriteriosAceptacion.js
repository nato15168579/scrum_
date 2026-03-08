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
exports.CriteriosAceptacion = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const DetalleParametro_1 = require("./DetalleParametro");
const HistoriaUsuario_1 = require("./HistoriaUsuario");
let CriteriosAceptacion = class CriteriosAceptacion {
};
exports.CriteriosAceptacion = CriteriosAceptacion;
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "cri_ID",
        comment: "id de criterio de aceptacion",
    }),
    __metadata("design:type", Number)
], CriteriosAceptacion.prototype, "criId", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "his_ID_FK",
        comment: "id de la historia de usuario",
    }),
    __metadata("design:type", Number)
], CriteriosAceptacion.prototype, "hisIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "pro_ID_his_FK",
        comment: "id del proyecto",
    }),
    __metadata("design:type", Number)
], CriteriosAceptacion.prototype, "proIdHisFk", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", {
        name: "usu_cedula_FK",
        nullable: true,
        comment: "cedula del usuario",
    }),
    __metadata("design:type", Number)
], CriteriosAceptacion.prototype, "usuCedulaFk", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "estado_FK",
        nullable: true,
        comment: "Estado del criterio (pendiente, en proceso, finalizado)",
    }),
    __metadata("design:type", Number)
], CriteriosAceptacion.prototype, "estadoFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "cri_tiempo",
        nullable: true,
        comment: "defina cuanto tiempo en horas va a ejercer cada criterio",
        length: 50,
    }),
    __metadata("design:type", String)
], CriteriosAceptacion.prototype, "criTiempo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "cri_descripcion",
        nullable: true,
        comment: "descripcion del criterio de aceptacion",
        length: 500,
    }),
    __metadata("design:type", String)
], CriteriosAceptacion.prototype, "criDescripcion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.criteriosAceptacions, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }]),
    __metadata("design:type", Usuario_1.Usuario)
], CriteriosAceptacion.prototype, "usuCedulaFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.criteriosAceptacions, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([{ name: "estado_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], CriteriosAceptacion.prototype, "estadoFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => HistoriaUsuario_1.HistoriaUsuario, (historiaUsuario) => historiaUsuario.criteriosAceptacions, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([
        { name: "his_ID_FK", referencedColumnName: "hisId" },
        { name: "pro_ID_his_FK", referencedColumnName: "proIdFk" },
    ]),
    __metadata("design:type", HistoriaUsuario_1.HistoriaUsuario)
], CriteriosAceptacion.prototype, "historiaUsuario", void 0);
exports.CriteriosAceptacion = CriteriosAceptacion = __decorate([
    (0, typeorm_1.Index)("usu_cedula_FK", ["usuCedulaFk"], {}),
    (0, typeorm_1.Index)("cri_ID", ["criId"], {}),
    (0, typeorm_1.Index)("estado_FK", ["estadoFk"], {}),
    (0, typeorm_1.Index)("his_ID_FK_2", ["hisIdFk", "proIdHisFk"], {}),
    (0, typeorm_1.Entity)("criterios_aceptacion", { schema: "pro_scrum" })
], CriteriosAceptacion);
//# sourceMappingURL=CriteriosAceptacion.js.map