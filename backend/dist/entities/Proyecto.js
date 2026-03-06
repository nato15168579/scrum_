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
exports.Proyecto = void 0;
const typeorm_1 = require("typeorm");
const HistoriaUsuario_1 = require("./HistoriaUsuario");
const Observaciones_1 = require("./Observaciones");
const DetalleParametro_1 = require("./DetalleParametro");
const Sprint_1 = require("./Sprint");
const UsuProDetPar_1 = require("./UsuProDetPar");
let Proyecto = class Proyecto {
};
exports.Proyecto = Proyecto;
__decorate([
    (0, typeorm_1.Column)("int", { primary: true, name: "pro_ID", comment: "id del proyecto" }),
    __metadata("design:type", Number)
], Proyecto.prototype, "proId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "pro_codigo",
        nullable: true,
        unique: true,
        length: 32,
        comment: "codigo unico del proyecto",
    }),
    __metadata("design:type", String)
], Proyecto.prototype, "proCodigo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "pro_nombre", nullable: true, length: 100 }),
    __metadata("design:type", String)
], Proyecto.prototype, "proNombre", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "pro_objetivo_general",
        nullable: true,
        length: 500,
    }),
    __metadata("design:type", String)
], Proyecto.prototype, "proObjetivoGeneral", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "pro_objetivos_especificos",
        nullable: true,
        length: 500,
    }),
    __metadata("design:type", String)
], Proyecto.prototype, "proObjetivosEspecificos", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "pro_descripcion", nullable: true, length: 200 }),
    __metadata("design:type", String)
], Proyecto.prototype, "proDescription", void 0);
__decorate([
    (0, typeorm_1.Column)("date", { name: "pro_fecha_inicio", nullable: true }),
    __metadata("design:type", String)
], Proyecto.prototype, "proFechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)("date", { name: "pro_fecha_fin", nullable: true }),
    __metadata("design:type", String)
], Proyecto.prototype, "proFechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { name: "pro_justificacion", nullable: true, length: 500 }),
    __metadata("design:type", String)
], Proyecto.prototype, "proJustificacion", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "det_par_ID_FK", nullable: true }),
    __metadata("design:type", Number)
], Proyecto.prototype, "detParIdFk", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HistoriaUsuario_1.HistoriaUsuario, (h) => h.proIdFk2),
    __metadata("design:type", Array)
], Proyecto.prototype, "historiaUsuarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Observaciones_1.Observaciones, (o) => o.proIdFk2),
    __metadata("design:type", Array)
], Proyecto.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (dp) => dp.proyectos),
    (0, typeorm_1.JoinColumn)([{ name: "det_par_ID_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], Proyecto.prototype, "detParIdFk2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sprint_1.Sprint, (s) => s.proIdFk2),
    __metadata("design:type", Array)
], Proyecto.prototype, "sprints", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuProDetPar_1.UsuProDetPar, (u) => u.pro),
    __metadata("design:type", Array)
], Proyecto.prototype, "usuProDetPars", void 0);
exports.Proyecto = Proyecto = __decorate([
    (0, typeorm_1.Index)("det_par_ID_FK", ["detParIdFk"], {}),
    (0, typeorm_1.Entity)("proyecto", { schema: "pro_scrum" })
], Proyecto);
//# sourceMappingURL=Proyecto.js.map