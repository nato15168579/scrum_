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
exports.Reuniones = void 0;
const typeorm_1 = require("typeorm");
const Sprint_1 = require("./Sprint");
const DetalleParametro_1 = require("./DetalleParametro");
const Usuario_1 = require("./Usuario");
let Reuniones = class Reuniones {
};
exports.Reuniones = Reuniones;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "int", name: "reu_ID" }),
    __metadata("design:type", Number)
], Reuniones.prototype, "reuId", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "spr_ID_FK" }),
    __metadata("design:type", Number)
], Reuniones.prototype, "sprIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "det_par_ID_tipo_FK",
        comment: "Tipo de reunión (ID 10-13)",
    }),
    __metadata("design:type", Number)
], Reuniones.prototype, "detParIdTipoFk", void 0);
__decorate([
    (0, typeorm_1.Column)("date", { name: "reu_fecha" }),
    __metadata("design:type", String)
], Reuniones.prototype, "reuFecha", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "reu_resumen", nullable: true }),
    __metadata("design:type", String)
], Reuniones.prototype, "reuResumen", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "reu_asistentes_FK", nullable: true }),
    __metadata("design:type", Number)
], Reuniones.prototype, "reuAsistentesFk", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sprint_1.Sprint, (sprint) => sprint.reuniones, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "spr_ID_FK", referencedColumnName: "sprId" }]),
    __metadata("design:type", Sprint_1.Sprint)
], Reuniones.prototype, "sprIdFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.reuniones, { onDelete: "RESTRICT", onUpdate: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)([
        { name: "det_par_ID_tipo_FK", referencedColumnName: "detParId" },
    ]),
    __metadata("design:type", DetalleParametro_1.DetalleParametro)
], Reuniones.prototype, "detParIdTipoFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Usuario_1.Usuario, (usuario) => usuario.reuniones),
    __metadata("design:type", Array)
], Reuniones.prototype, "usuarios", void 0);
exports.Reuniones = Reuniones = __decorate([
    (0, typeorm_1.Index)("spr_ID_FK", ["sprIdFk"], {}),
    (0, typeorm_1.Index)("det_par_ID_tipo_FK", ["detParIdTipoFk"], {}),
    (0, typeorm_1.Index)("reu_asistentes_FK", ["reuAsistentesFk"], {}),
    (0, typeorm_1.Entity)("reuniones", { schema: "pro_scrum" })
], Reuniones);
//# sourceMappingURL=Reuniones.js.map