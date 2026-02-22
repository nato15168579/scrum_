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
exports.RolSistema = void 0;
const typeorm_1 = require("typeorm");
const DetalleParametro_1 = require("./DetalleParametro");
const Usuario_1 = require("./Usuario");
let RolSistema = class RolSistema {
};
exports.RolSistema = RolSistema;
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "rol_sis_ID",
        comment: "id del rol de sistema",
    }),
    __metadata("design:type", Number)
], RolSistema.prototype, "rolSisId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "rol_nombre",
        nullable: true,
        comment: "nombre del rol de sistema",
        length: 100,
    }),
    __metadata("design:type", String)
], RolSistema.prototype, "rolNombre", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.rolSistemas),
    (0, typeorm_1.JoinTable)({
        name: "rol_sis_det_par",
        joinColumns: [{ name: "rol_sis_ID", referencedColumnName: "rolSisId" }],
        inverseJoinColumns: [
            { name: "det_par_ID", referencedColumnName: "detParId" },
        ],
        schema: "pro_scrum",
    }),
    __metadata("design:type", Array)
], RolSistema.prototype, "detalleParametros", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Usuario_1.Usuario, (usuario) => usuario.rolSisIdFk2),
    __metadata("design:type", Array)
], RolSistema.prototype, "usuarios", void 0);
exports.RolSistema = RolSistema = __decorate([
    (0, typeorm_1.Entity)("rol_sistema", { schema: "pro_scrum" })
], RolSistema);
//# sourceMappingURL=RolSistema.js.map