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
exports.AsigIntegrantesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../../entities/Usuario");
const UsuProDetPar_1 = require("../../entities/UsuProDetPar");
let AsigIntegrantesService = class AsigIntegrantesService {
    constructor(usuarioRepo, usuProDetParRepo, dataSource) {
        this.usuarioRepo = usuarioRepo;
        this.usuProDetParRepo = usuProDetParRepo;
        this.dataSource = dataSource;
    }
    async getAprendices() {
        return await this.usuarioRepo.find({
            where: { rolSisIdFk: 1 },
            select: ['usuCedula', 'usuNombres', 'usuApellidos'],
        });
    }
    async getIntegrantesPorProyecto(proId) {
        return await this.usuProDetParRepo.find({
            where: { proId: proId },
            relations: ['usuCedula2'],
        });
    }
    async guardarAsignacion(proId, assignments) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.query("DELETE FROM `usu_pro_det_par` WHERE `pro_ID` = ?", [proId]);
            for (const item of assignments) {
                let roleMapped = 6;
                if (item.rolId === 1)
                    roleMapped = 4;
                else if (item.rolId === 2)
                    roleMapped = 5;
                await queryRunner.manager.query("INSERT INTO `usu_pro_det_par` (`usu_cedula`, `pro_ID`, `det_par_ID_FK`) VALUES (?, ?, ?)", [item.cedula, proId, roleMapped]);
            }
            await queryRunner.commitTransaction();
            return { status: 'success' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Error SQL:", error.message);
            throw new common_1.InternalServerErrorException("Error en la base de datos: " + error.message);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.AsigIntegrantesService = AsigIntegrantesService;
exports.AsigIntegrantesService = AsigIntegrantesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AsigIntegrantesService);
//# sourceMappingURL=asig-integrantes.service.js.map