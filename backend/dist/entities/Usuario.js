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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const CriteriosAceptacion_1 = require("./CriteriosAceptacion");
const Observaciones_1 = require("./Observaciones");
const RolSistema_1 = require("./RolSistema");
const Reuniones_1 = require("./Reuniones");
const UsuProDetPar_1 = require("./UsuProDetPar");
let Usuario = class Usuario {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.Column)("int", {
        primary: true,
        name: "usu_cedula",
        comment: "cedula del usuario",
    }),
    __metadata("design:type", Number)
], Usuario.prototype, "usuCedula", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_tipodedocumento",
        nullable: true,
        length: 20,
        default: () => "'CC'",
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuTipoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_nombres",
        nullable: true,
        comment: "nombre  del usuario",
        length: 100,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuNombres", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_apellidos",
        nullable: true,
        comment: "apellido  del usuario",
        length: 100,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuApellidos", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_correo",
        nullable: true,
        comment: "correo  del usuario",
        length: 100,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuCorreo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_telefono",
        nullable: true,
        comment: "telefono del usuario",
        length: 20,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_contraseña",
        nullable: true,
        comment: "contraseña del usuario",
        length: 250,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuContrasena", void 0);
__decorate([
    (0, typeorm_1.Column)("datetime", {
        name: "fecha_registro",
        default: () => "CURRENT_TIMESTAMP",
        comment: "fecha de registro del usuario",
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "fechaRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { name: "rol_sis_ID_FK", nullable: true }),
    __metadata("design:type", Number)
], Usuario.prototype, "rolSisIdFk", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "usu_ficha",
        nullable: true,
        comment: "Número de ficha (solo para aprendices)",
        length: 50,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "usuFicha", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CriteriosAceptacion_1.CriteriosAceptacion, (criteriosAceptacion) => criteriosAceptacion.usuCedulaFk2),
    __metadata("design:type", Array)
], Usuario.prototype, "criteriosAceptacions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Observaciones_1.Observaciones, (observaciones) => observaciones.usuCedulaFk2),
    __metadata("design:type", Array)
], Usuario.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RolSistema_1.RolSistema, (rolSistema) => rolSistema.usuarios, {
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    }),
    (0, typeorm_1.JoinColumn)([{ name: "rol_sis_ID_FK", referencedColumnName: "rolSisId" }]),
    __metadata("design:type", RolSistema_1.RolSistema)
], Usuario.prototype, "rolSisIdFk2", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Reuniones_1.Reuniones, (reuniones) => reuniones.usuarios),
    (0, typeorm_1.JoinTable)({
        name: "usu_asis",
        joinColumns: [{ name: "usu_cedula", referencedColumnName: "usuCedula" }],
        inverseJoinColumns: [
            { name: "reu_asistente_FK", referencedColumnName: "reuAsistentesFk" },
        ],
        schema: "pro_scrum",
    }),
    __metadata("design:type", Array)
], Usuario.prototype, "reuniones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuProDetPar_1.UsuProDetPar, (usuProDetPar) => usuProDetPar.usuCedula2),
    __metadata("design:type", Array)
], Usuario.prototype, "usuProDetPars", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Index)("RolID", ["rolSisIdFk"], {}),
    (0, typeorm_1.Entity)("usuario", { schema: "pro_scrum" })
], Usuario);
//# sourceMappingURL=Usuario.js.map