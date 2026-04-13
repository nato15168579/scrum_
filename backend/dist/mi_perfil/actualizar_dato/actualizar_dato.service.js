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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarDatoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ActualizarDatoService = class ActualizarDatoService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findOne(cedula) {
        const usuario = await this.dataSource.query('SELECT usu_cedula, usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento FROM usuario WHERE usu_cedula = ?', [cedula]);
        if (!usuario || usuario.length === 0) {
            throw new common_1.NotFoundException(`Usuario con cédula ${cedula} no encontrado`);
        }
        return usuario[0];
    }
    async update(cedula, updateData) {
        const { usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento } = updateData;
        const result = await this.dataSource.query(`UPDATE usuario 
       SET usu_nombres = ?, 
           usu_apellidos = ?, 
           usu_correo = ?, 
           usu_telefono = ?, 
           usu_tipodedocumento = ? 
       WHERE usu_cedula = ?`, [usu_nombres, usu_apellidos, usu_correo, usu_telefono, usu_tipodedocumento, cedula]);
        return { message: 'Datos actualizados correctamente' };
    }
};
exports.ActualizarDatoService = ActualizarDatoService;
exports.ActualizarDatoService = ActualizarDatoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], ActualizarDatoService);
//# sourceMappingURL=actualizar_dato.service.js.map