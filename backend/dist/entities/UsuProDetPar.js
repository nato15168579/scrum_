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
exports.UsuProDetPar = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
const DetalleParametro_1 = require("./DetalleParametro");
const Proyecto_1 = require("./Proyecto");
let UsuProDetPar = class UsuProDetPar {
};
exports.UsuProDetPar = UsuProDetPar;
__decorate([
    (0, typeorm_1.Column)("bigint", {
        primary: true,
        name: "usu_cedula",
        comment: "cedula del usuario",
    }),
    __metadata("design:type", Number)
], UsuProDetPar.prototype, "usuCedula", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "det_par_ID_FK",
        comment: "id del detalle parametro",
    }),
    __metadata("design:type", Number)
], UsuProDetPar.prototype, "detParId", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { primary: true, name: "pro_ID", comment: "id del proyecto" }),
    __metadata("design:type", Number)
], UsuProDetPar.prototype, "proId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.usuProDetPars, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "usu_cedula", referencedColumnName: "usuCedula" }]),
    __metadata("design:type", Usuario_1.Usuario)
], UsuProDetPar.prototype, "usuCedula2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.usuProDetPars, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([{ name: "det_par_ID_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], UsuProDetPar.prototype, "detParId_2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Proyecto_1.Proyecto, (proyecto) => proyecto.usuProDetPars, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "pro_ID", referencedColumnName: "proId" }]),
    __metadata("design:type", Proyecto_1.Proyecto)
], UsuProDetPar.prototype, "pro", void 0);
exports.UsuProDetPar = UsuProDetPar = __decorate([
    (0, typeorm_1.Index)("CedulaUsuario", ["detParId"], {}),
    (0, typeorm_1.Index)("RolScrumID", ["proId"], {}),
    (0, typeorm_1.Entity)("usu_pro_det_par", { schema: "pro_scrum" })
], UsuProDetPar);
//# sourceMappingURL=UsuProDetPar.js.map