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
exports.ListaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const bcrypt = require("bcrypt");
let ListaService = class ListaService {
    constructor(usuarioRepository, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.dataSource = dataSource;
    }
    async ensureRegistroTable() {
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS usuario_registro (
        usu_cedula INT NOT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usu_cedula),
        CONSTRAINT fk_usuario_registro_usuario
          FOREIGN KEY (usu_cedula) REFERENCES usuario(usu_cedula)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    }
    async findAllAprendices() {
        await this.ensureRegistroTable();
        const aprendices = await this.dataSource.query(`
        SELECT
          u.usu_cedula AS documento,
          u.usu_ficha AS ficha,
          u.usu_nombres AS nombre,
          u.usu_apellidos AS apellido,
          u.usu_telefono AS telefono,
          u.usu_correo AS email,
          r.fecha_registro AS fechaInscripcion
        FROM usuario u
        LEFT JOIN usuario_registro r
          ON r.usu_cedula = u.usu_cedula
        WHERE u.rol_sis_ID_FK = 1
        ORDER BY r.fecha_registro DESC, u.usu_cedula DESC
      `);
        return (aprendices || []).map((ap) => ({
            documento: String(ap.documento),
            ficha: ap.ficha || 'Sin ficha',
            nombre: ap.nombre || '',
            apellido: ap.apellido || '',
            telefono: ap.telefono || '',
            email: ap.email || '',
            fechaInscripcion: ap.fechaInscripcion
                ? new Date(ap.fechaInscripcion).toISOString()
                : null,
        }));
    }
    async createAprendiz(payload) {
        var _a, _b, _c, _d, _e, _f;
        const cedula = Number(payload.cedula);
        if (!cedula || Number.isNaN(cedula)) {
            throw new common_1.BadRequestException('La cedula es obligatoria y debe ser numerica.');
        }
        if (!payload.password || payload.password.trim().length < 4) {
            throw new common_1.BadRequestException('La contrasena es obligatoria.');
        }
        const yaExiste = await this.usuarioRepository.findOneBy({
            usuCedula: cedula,
        });
        if (yaExiste) {
            throw new common_1.ConflictException('Ya existe un usuario con esa cedula.');
        }
        const hash = await bcrypt.hash(payload.password.trim(), 10);
        const nuevoAprendiz = this.usuarioRepository.create({
            usuCedula: cedula,
            usuTipoDocumento: payload.tipoDocumento || 'CC',
            usuNombres: ((_a = payload.nombre) === null || _a === void 0 ? void 0 : _a.trim()) || '',
            usuApellidos: ((_b = payload.apellidos) === null || _b === void 0 ? void 0 : _b.trim()) || '',
            usuCorreo: ((_c = payload.correo) === null || _c === void 0 ? void 0 : _c.trim()) || '',
            usuTelefono: ((_d = payload.telefono) === null || _d === void 0 ? void 0 : _d.trim()) || null,
            usuSexo: ((_e = payload.sexo) === null || _e === void 0 ? void 0 : _e.trim()) || null,
            usuContrasena: hash,
            rolSisIdFk: 1,
            usuFicha: ((_f = payload.ficha) === null || _f === void 0 ? void 0 : _f.trim()) || null,
        });
        try {
            await this.usuarioRepository.save(nuevoAprendiz);
            await this.ensureRegistroTable();
            await this.dataSource.query(`
          INSERT INTO usuario_registro (usu_cedula, fecha_registro)
          VALUES (?, NOW())
          ON DUPLICATE KEY UPDATE fecha_registro = fecha_registro
        `, [cedula]);
            const [registro] = await this.dataSource.query('SELECT fecha_registro FROM usuario_registro WHERE usu_cedula = ? LIMIT 1', [cedula]);
            return {
                ok: true,
                mensaje: 'Aprendiz registrado correctamente.',
                aprendiz: {
                    documento: String(nuevoAprendiz.usuCedula),
                    nombre: nuevoAprendiz.usuNombres || '',
                    apellido: nuevoAprendiz.usuApellidos || '',
                    ficha: nuevoAprendiz.usuFicha || 'Sin ficha',
                    email: nuevoAprendiz.usuCorreo || '',
                    fechaInscripcion: (registro === null || registro === void 0 ? void 0 : registro.fecha_registro)
                        ? new Date(registro.fecha_registro).toISOString()
                        : null,
                },
            };
        }
        catch (error) {
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo registrar el aprendiz: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
    }
    async getInstructorStats(cedula) {
        const instructor = await this.usuarioRepository.findOne({
            where: { usuCedula: parseInt(cedula) },
            select: ['usuNombres', 'usuApellidos'],
        });
        return {
            instructor: instructor
                ? `${instructor.usuNombres} ${instructor.usuApellidos}`
                : 'Instructor SENA',
        };
    }
};
exports.ListaService = ListaService;
exports.ListaService = ListaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ListaService);
//# sourceMappingURL=lista.service.js.map