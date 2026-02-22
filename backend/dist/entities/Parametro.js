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
exports.Parametro = void 0;
const typeorm_1 = require("typeorm");
const DetalleParametro_1 = require("./DetalleParametro");
let Parametro = class Parametro {
};
exports.Parametro = Parametro;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: "int",
        name: "par_ID",
        comment: "id del parametro",
    }),
    __metadata("design:type", Number)
], Parametro.prototype, "parId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "par_descripcion",
        nullable: true,
        comment: "descripcion del parametro",
        length: 500,
    }),
    __metadata("design:type", String)
], Parametro.prototype, "parDescripcion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DetalleParametro_1.DetalleParametro, (detalleParametro) => detalleParametro.parIdFk2),
    __metadata("design:type", Array)
], Parametro.prototype, "detalleParametros", void 0);
exports.Parametro = Parametro = __decorate([
    (0, typeorm_1.Entity)("parametro", { schema: "pro_scrum" })
], Parametro);
//# sourceMappingURL=Parametro.js.map