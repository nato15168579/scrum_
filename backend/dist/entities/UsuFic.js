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
exports.UsuFic = void 0;
const typeorm_1 = require("typeorm");
const Ficha_1 = require("./Ficha");
let UsuFic = class UsuFic {
};
exports.UsuFic = UsuFic;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "int", name: "usu_fic_ID" }),
    __metadata("design:type", Number)
], UsuFic.prototype, "usuFicId", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "usu_cedula_FK" }),
    __metadata("design:type", Number)
], UsuFic.prototype, "usuCedulaFk", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "fic_ID_FK" }),
    __metadata("design:type", Number)
], UsuFic.prototype, "ficIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "usu_fic_estado", length: 10, default: "Activo" }),
    __metadata("design:type", String)
], UsuFic.prototype, "usuFicEstado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Usuario'),
    (0, typeorm_1.JoinColumn)([{ name: "usu_cedula_FK", referencedColumnName: "usuCedula" }]),
    __metadata("design:type", Object)
], UsuFic.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Ficha_1.Ficha, (ficha) => ficha.usuFics),
    (0, typeorm_1.JoinColumn)([{ name: "fic_ID_FK", referencedColumnName: "ficId" }]),
    __metadata("design:type", Ficha_1.Ficha)
], UsuFic.prototype, "ficha", void 0);
exports.UsuFic = UsuFic = __decorate([
    (0, typeorm_1.Entity)("usu_fic", { schema: "pro_scrum" })
], UsuFic);
//# sourceMappingURL=UsuFic.js.map