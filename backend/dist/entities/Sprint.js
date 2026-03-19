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
exports.Sprint = void 0;
const typeorm_1 = require("typeorm");
const DetalleParametro_1 = require("./DetalleParametro");
const Reuniones_1 = require("./Reuniones");
let Sprint = class Sprint {
};
exports.Sprint = Sprint;
__decorate([
    (0, typeorm_1.PrimaryColumn)("int", { name: "spr_ID", comment: "id del sprint" }),
    __metadata("design:type", Number)
], Sprint.prototype, "sprId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "spr_nombre",
        nullable: true,
        comment: "nombre del sprint",
        length: 100,
    }),
    __metadata("design:type", String)
], Sprint.prototype, "sprNombre", void 0);
__decorate([
    (0, typeorm_1.Column)("date", {
        name: "spr_fecha_inicio",
        nullable: true,
        comment: "fecha de inicio del sprint",
    }),
    __metadata("design:type", String)
], Sprint.prototype, "sprFechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)("date", {
        name: "spr_fecha_fin",
        nullable: true,
        comment: "fecha fin del sprint",
    }),
    __metadata("design:type", String)
], Sprint.prototype, "sprFechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "spr_descripcion",
        nullable: true,
        comment: "descripcion del sprint",
        length: 500,
    }),
    __metadata("design:type", String)
], Sprint.prototype, "sprDescripcion", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "det_par_FK", nullable: true }),
    __metadata("design:type", Number)
], Sprint.prototype, "detParFk", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reuniones_1.Reuniones, (reuniones) => reuniones.sprIdFk2),
    __metadata("design:type", Array)
], Sprint.prototype, "reuniones", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "det_par_FK", referencedColumnName: "detParId" }]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], Sprint.prototype, "detParFk2", void 0);
exports.Sprint = Sprint = __decorate([
    (0, typeorm_1.Index)("spr_ID", ["sprId"], {}),
    (0, typeorm_1.Index)("det_par_FK", ["detParFk"], {}),
    (0, typeorm_1.Entity)("sprint", { schema: "pro_scrum" })
], Sprint);
//# sourceMappingURL=Sprint.js.map