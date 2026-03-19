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
exports.DetalleParametro = void 0;
const typeorm_1 = require("typeorm");
const CriteriosAceptacion_1 = require("./CriteriosAceptacion");
const Parametro_1 = require("./Parametro");
const HistoriaUsuario_1 = require("./HistoriaUsuario");
const Observaciones_1 = require("./Observaciones");
const Proyecto_1 = require("./Proyecto");
const Reuniones_1 = require("./Reuniones");
const RolSistema_1 = require("./RolSistema");
const UsuProDetPar_1 = require("./UsuProDetPar");
let DetalleParametro = class DetalleParametro {
};
exports.DetalleParametro = DetalleParametro;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: "int",
        name: "det_par_ID",
        comment: "id del detalle parametro",
    }),
    __metadata("design:type", Number)
], DetalleParametro.prototype, "detParId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "det_par_descripcion",
        nullable: true,
        comment: "descripcion del detalle parametro",
        length: 500,
    }),
    __metadata("design:type", String)
], DetalleParametro.prototype, "detParDescripcion", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "par_ID_FK",
        nullable: true,
        comment: "id del parametro",
    }),
    __metadata("design:type", Number)
], DetalleParametro.prototype, "parIdFk", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CriteriosAceptacion_1.CriteriosAceptacion, (criteriosAceptacion) => criteriosAceptacion.detParIdFk2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "criteriosAceptacions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Parametro_1.Parametro, (parametro) => parametro.detalleParametros, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "par_ID_FK", referencedColumnName: "parId" }]),
    __metadata("design:type", Parametro_1.Parametro)
], DetalleParametro.prototype, "parIdFk2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HistoriaUsuario_1.HistoriaUsuario, (historiaUsuario) => historiaUsuario.detParIdFk2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "historiaUsuarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Observaciones_1.Observaciones, (observaciones) => observaciones.detParIdFk2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Proyecto_1.Proyecto, (proyecto) => proyecto.detParIdFk2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "proyectos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Reuniones_1.Reuniones, (reuniones) => reuniones.detParIdTipoFk2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "reuniones", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => RolSistema_1.RolSistema, (rolSistema) => rolSistema.detalleParametros),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "rolSistemas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuProDetPar_1.UsuProDetPar, (usuProDetPar) => usuProDetPar.detParId_2),
    __metadata("design:type", Array)
], DetalleParametro.prototype, "usuProDetPars", void 0);
exports.DetalleParametro = DetalleParametro = __decorate([
    (0, typeorm_1.Index)("par_ID_FK", ["parIdFk"], {}),
    (0, typeorm_1.Entity)("detalle_parametro", { schema: "pro_scrum" })
], DetalleParametro);
//# sourceMappingURL=DetalleParametro.js.map