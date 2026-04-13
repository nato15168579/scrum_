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
exports.Ficha = void 0;
const typeorm_1 = require("typeorm");
const DetalleParametro_1 = require("./DetalleParametro");
const UsuFic_1 = require("./UsuFic");
let Ficha = class Ficha {
};
exports.Ficha = Ficha;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "int", name: "fic_ID" }),
    __metadata("design:type", Number)
], Ficha.prototype, "ficId", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "fic_codigo" }),
    __metadata("design:type", Number)
], Ficha.prototype, "ficCodigo", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "pro_gra_ID_FK" }),
    __metadata("design:type", Number)
], Ficha.prototype, "proGraIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "fic_estado", length: 10, default: "Activo" }),
    __metadata("design:type", String)
], Ficha.prototype, "ficEstado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro),
    (0, typeorm_1.JoinColumn)([{ name: "pro_gra_ID_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], Ficha.prototype, "programa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuFic_1.UsuFic, (usuFic) => usuFic.ficha),
    __metadata("design:type", Array)
], Ficha.prototype, "usuFics", void 0);
exports.Ficha = Ficha = __decorate([
    (0, typeorm_1.Index)("pro_gra_ID_FK", ["proGraIdFk"], {}),
    (0, typeorm_1.Entity)("ficha", { schema: "pro_scrum" })
], Ficha);
//# sourceMappingURL=Ficha.js.map