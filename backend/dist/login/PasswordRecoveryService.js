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
exports.PasswordRecoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const node_crypto_1 = require("node:crypto");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const PasswordRecoveryCode_1 = require("../entities/PasswordRecoveryCode");
const Usuario_1 = require("../entities/Usuario");
const PasswordSecurity_1 = require("./PasswordSecurity");
const PasswordRecoveryEmailService_1 = require("./PasswordRecoveryEmailService");
let PasswordRecoveryService = class PasswordRecoveryService {
    constructor(usuarioRepo, recoveryRepo, dataSource, emailService) {
        this.usuarioRepo = usuarioRepo;
        this.recoveryRepo = recoveryRepo;
        this.dataSource = dataSource;
        this.emailService = emailService;
        this.ensureRecoveryTablePromise = null;
    }
    async requestRecoveryCode(body) {
        await this.ensureRecoveryTable();
        await this.expireStaleRecoveryRequests();
        const cedula = this.parseCedula(body === null || body === void 0 ? void 0 : body.usu_cedula);
        const correo = this.normalizeEmail(body === null || body === void 0 ? void 0 : body.usu_correo);
        if (!cedula) {
            throw new common_1.BadRequestException('Debes ingresar un numero de documento valido.');
        }
        if (!correo) {
            throw new common_1.BadRequestException('Debes ingresar el correo registrado.');
        }
        const usuario = await this.usuarioRepo.findOne({
            where: { usuCedula: cedula },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('No existe un usuario con ese documento.');
        }
        if (usuario.usuEstado === 'Inactivo') {
            throw new common_1.BadRequestException('El usuario se encuentra inactivo.');
        }
        const correoRegistrado = this.normalizeEmail(usuario.usuCorreo);
        if (!correoRegistrado) {
            throw new common_1.BadRequestException('El usuario no tiene un correo registrado para recuperar la contrasena.');
        }
        if (correoRegistrado !== correo) {
            throw new common_1.BadRequestException('El correo no coincide con el usuario registrado.');
        }
        const resendCooldownSeconds = this.getResendCooldownSeconds();
        const latestRequest = await this.recoveryRepo.findOne({
            where: { usuCedulaFk: cedula },
            order: { requestedAt: 'DESC' },
        });
        if (latestRequest) {
            const secondsSinceLastRequest = Math.floor((Date.now() - latestRequest.requestedAt.getTime()) / 1000);
            if (secondsSinceLastRequest < resendCooldownSeconds) {
                throw new common_1.HttpException(`Espera ${resendCooldownSeconds - secondsSinceLastRequest} segundos antes de solicitar un nuevo codigo.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        await this.invalidateActiveRequestsForUser(cedula);
        const code = this.generateNumericCode();
        const expiresInMinutes = this.getCodeTtlMinutes();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);
        const requestEntity = this.recoveryRepo.create({
            recoveryId: (0, node_crypto_1.randomUUID)(),
            usuCedulaFk: cedula,
            usuCorreo: correoRegistrado,
            codeHash: await bcrypt.hash(code, 10),
            resetTokenHash: null,
            attemptCount: 0,
            maxAttempts: this.getMaxAttempts(),
            requestedAt: now,
            expiresAt,
            lastAttemptAt: null,
            verifiedAt: null,
            resetTokenExpiresAt: null,
            consumedAt: null,
            invalidatedAt: null,
        });
        await this.recoveryRepo.save(requestEntity);
        try {
            const delivery = await this.emailService.sendRecoveryCodeEmail({
                to: correoRegistrado,
                fullName: this.buildUserFullName(usuario),
                code,
                expiresInMinutes,
            });
            return {
                message: delivery.deliveryMode === 'email'
                    ? 'Codigo enviado al correo registrado.'
                    : 'Codigo generado. Revisa la consola del backend porque el correo SMTP no esta configurado.',
                recoveryId: requestEntity.recoveryId,
                maskedEmail: this.maskEmail(correoRegistrado),
                expiresAt: expiresAt.toISOString(),
                expiresInMinutes,
                resendAvailableAt: new Date(now.getTime() + resendCooldownSeconds * 1000).toISOString(),
                deliveryMode: delivery.deliveryMode,
                debugCode: delivery.deliveryMode === 'console' && this.shouldExposeDebugCode()
                    ? code
                    : undefined,
                debugLogLocation: delivery.deliveryMode === 'console'
                    ? 'backend/run-backend.log'
                    : undefined,
            };
        }
        catch (error) {
            requestEntity.invalidatedAt = new Date();
            await this.recoveryRepo.save(requestEntity);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error instanceof Error
                ? error.message
                : 'No fue posible enviar el codigo de recuperacion.');
        }
    }
    async verifyRecoveryCode(body) {
        await this.ensureRecoveryTable();
        await this.expireStaleRecoveryRequests();
        const cedula = this.parseCedula(body === null || body === void 0 ? void 0 : body.usu_cedula);
        const recoveryId = this.normalizeRecoveryId(body === null || body === void 0 ? void 0 : body.recovery_id);
        const codigo = this.normalizeCode(body === null || body === void 0 ? void 0 : body.codigo);
        if (!cedula || !recoveryId || !codigo) {
            throw new common_1.BadRequestException('Documento, solicitud y codigo son obligatorios.');
        }
        const requestEntity = await this.getRecoveryRequestOrThrow(cedula, recoveryId);
        this.assertRequestAvailableForCodeValidation(requestEntity);
        const now = new Date();
        if (requestEntity.expiresAt.getTime() <= now.getTime()) {
            requestEntity.invalidatedAt = now;
            await this.recoveryRepo.save(requestEntity);
            throw new common_1.BadRequestException('El codigo ya expiro. Solicita uno nuevo.');
        }
        const isValidCode = await bcrypt.compare(codigo, requestEntity.codeHash);
        if (!isValidCode) {
            requestEntity.attemptCount += 1;
            requestEntity.lastAttemptAt = now;
            if (requestEntity.attemptCount >= requestEntity.maxAttempts) {
                requestEntity.invalidatedAt = now;
            }
            await this.recoveryRepo.save(requestEntity);
            if (requestEntity.invalidatedAt) {
                throw new common_1.BadRequestException('Se alcanzo el maximo de intentos. Solicita un nuevo codigo.');
            }
            throw new common_1.BadRequestException(`Codigo incorrecto. Te quedan ${requestEntity.maxAttempts - requestEntity.attemptCount} intentos.`);
        }
        const resetToken = (0, node_crypto_1.randomBytes)(32).toString('hex');
        const resetTokenTtlMinutes = this.getResetTokenTtlMinutes();
        requestEntity.lastAttemptAt = now;
        requestEntity.verifiedAt = now;
        requestEntity.resetTokenHash = this.hashToken(resetToken);
        requestEntity.resetTokenExpiresAt = new Date(now.getTime() + resetTokenTtlMinutes * 60 * 1000);
        await this.recoveryRepo.save(requestEntity);
        return {
            message: 'Codigo validado correctamente.',
            resetToken,
            resetExpiresAt: requestEntity.resetTokenExpiresAt.toISOString(),
            passwordPolicy: Object.assign(Object.assign({}, PasswordSecurity_1.PASSWORD_POLICY), { hints: [...PasswordSecurity_1.PASSWORD_POLICY_HINTS] }),
        };
    }
    async resetPassword(body) {
        await this.ensureRecoveryTable();
        await this.expireStaleRecoveryRequests();
        const cedula = this.parseCedula(body === null || body === void 0 ? void 0 : body.usu_cedula);
        const recoveryId = this.normalizeRecoveryId(body === null || body === void 0 ? void 0 : body.recovery_id);
        const resetToken = this.normalizeResetToken(body === null || body === void 0 ? void 0 : body.reset_token);
        const newPassword = String((body === null || body === void 0 ? void 0 : body.new_password) || '');
        if (!cedula || !recoveryId || !resetToken || !newPassword) {
            throw new common_1.BadRequestException('Faltan datos para restablecer la contrasena.');
        }
        const passwordValidation = (0, PasswordSecurity_1.validatePasswordPolicy)(newPassword);
        if (!passwordValidation.isValid) {
            throw new common_1.BadRequestException(passwordValidation.errors.join(' '));
        }
        const requestEntity = await this.getRecoveryRequestOrThrow(cedula, recoveryId);
        this.assertRequestReadyForPasswordReset(requestEntity);
        const now = new Date();
        if (!requestEntity.resetTokenExpiresAt ||
            requestEntity.resetTokenExpiresAt.getTime() <= now.getTime()) {
            requestEntity.invalidatedAt = now;
            await this.recoveryRepo.save(requestEntity);
            throw new common_1.BadRequestException('La validacion expiro. Debes solicitar un nuevo codigo.');
        }
        if (requestEntity.resetTokenHash !== this.hashToken(resetToken)) {
            throw new common_1.BadRequestException('La validacion final no es correcta.');
        }
        const usuario = await this.usuarioRepo.findOne({
            where: { usuCedula: cedula },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        const samePassword = await (0, PasswordSecurity_1.compareWithStoredPassword)(newPassword, usuario.usuContrasena);
        if (samePassword) {
            throw new common_1.BadRequestException('La nueva contrasena debe ser diferente a la actual.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const usuarioRepository = queryRunner.manager.getRepository(Usuario_1.Usuario);
            const recoveryRepository = queryRunner.manager.getRepository(PasswordRecoveryCode_1.PasswordRecoveryCode);
            usuario.usuContrasena = await (0, PasswordSecurity_1.hashPassword)(newPassword);
            await usuarioRepository.save(usuario);
            requestEntity.consumedAt = now;
            requestEntity.invalidatedAt = now;
            requestEntity.codeHash = '';
            requestEntity.resetTokenHash = null;
            requestEntity.resetTokenExpiresAt = null;
            await recoveryRepository.save(requestEntity);
            await recoveryRepository
                .createQueryBuilder()
                .update(PasswordRecoveryCode_1.PasswordRecoveryCode)
                .set({ invalidatedAt: now })
                .where('usu_cedula_fk = :cedula', { cedula })
                .andWhere('recovery_id != :recoveryId', { recoveryId })
                .andWhere('consumed_at IS NULL')
                .andWhere('invalidated_at IS NULL')
                .execute();
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        return {
            message: 'Contrasena actualizada correctamente.',
            invalidateClientSession: true,
            invalidatedPreviousCodes: true,
        };
    }
    async ensureRecoveryTable() {
        if (!this.ensureRecoveryTablePromise) {
            this.ensureRecoveryTablePromise = this.dataSource
                .query(`
          CREATE TABLE IF NOT EXISTS password_recovery_codes (
            prc_id BIGINT NOT NULL AUTO_INCREMENT,
            recovery_id VARCHAR(64) NOT NULL,
            usu_cedula_fk BIGINT NOT NULL,
            usu_correo VARCHAR(100) NOT NULL,
            code_hash VARCHAR(255) NOT NULL,
            reset_token_hash VARCHAR(64) NULL,
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 5,
            requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            last_attempt_at DATETIME NULL,
            verified_at DATETIME NULL,
            reset_token_expires_at DATETIME NULL,
            consumed_at DATETIME NULL,
            invalidated_at DATETIME NULL,
            PRIMARY KEY (prc_id),
            UNIQUE KEY uq_password_recovery_codes_recovery_id (recovery_id),
            KEY idx_password_recovery_codes_user (usu_cedula_fk),
            KEY idx_password_recovery_codes_expires (expires_at),
            CONSTRAINT fk_password_recovery_codes_usuario
              FOREIGN KEY (usu_cedula_fk)
              REFERENCES usuario (usu_cedula)
              ON DELETE CASCADE
              ON UPDATE RESTRICT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `)
                .then(() => undefined);
        }
        return this.ensureRecoveryTablePromise;
    }
    async expireStaleRecoveryRequests() {
        const now = new Date();
        await this.recoveryRepo
            .createQueryBuilder()
            .update(PasswordRecoveryCode_1.PasswordRecoveryCode)
            .set({ invalidatedAt: now })
            .where('expires_at <= :now', { now })
            .andWhere('consumed_at IS NULL')
            .andWhere('invalidated_at IS NULL')
            .execute();
        await this.recoveryRepo
            .createQueryBuilder()
            .update(PasswordRecoveryCode_1.PasswordRecoveryCode)
            .set({ invalidatedAt: now })
            .where('reset_token_expires_at IS NOT NULL')
            .andWhere('reset_token_expires_at <= :now', { now })
            .andWhere('consumed_at IS NULL')
            .andWhere('invalidated_at IS NULL')
            .execute();
    }
    async invalidateActiveRequestsForUser(cedula) {
        await this.recoveryRepo
            .createQueryBuilder()
            .update(PasswordRecoveryCode_1.PasswordRecoveryCode)
            .set({ invalidatedAt: new Date() })
            .where('usu_cedula_fk = :cedula', { cedula })
            .andWhere('consumed_at IS NULL')
            .andWhere('invalidated_at IS NULL')
            .execute();
    }
    async getRecoveryRequestOrThrow(cedula, recoveryId) {
        const requestEntity = await this.recoveryRepo.findOne({
            where: {
                recoveryId,
                usuCedulaFk: cedula,
            },
            order: { requestedAt: 'DESC' },
        });
        if (!requestEntity) {
            throw new common_1.NotFoundException('La solicitud de recuperacion no existe o ya no esta disponible.');
        }
        return requestEntity;
    }
    assertRequestAvailableForCodeValidation(requestEntity) {
        if (requestEntity.consumedAt || requestEntity.invalidatedAt) {
            throw new common_1.BadRequestException('La solicitud ya no esta disponible. Solicita un nuevo codigo.');
        }
        if (requestEntity.attemptCount >= requestEntity.maxAttempts) {
            throw new common_1.BadRequestException('La solicitud ya alcanzo el limite de intentos.');
        }
    }
    assertRequestReadyForPasswordReset(requestEntity) {
        if (requestEntity.consumedAt || requestEntity.invalidatedAt) {
            throw new common_1.BadRequestException('La solicitud ya no esta disponible. Solicita un nuevo codigo.');
        }
        if (!requestEntity.verifiedAt || !requestEntity.resetTokenHash) {
            throw new common_1.BadRequestException('Debes validar el codigo antes de cambiar la contrasena.');
        }
    }
    parseCedula(rawCedula) {
        const normalized = String(rawCedula || '').trim();
        if (!normalized) {
            return 0;
        }
        const cedula = Number(normalized);
        if (!Number.isFinite(cedula) || cedula <= 0) {
            return 0;
        }
        return cedula;
    }
    normalizeEmail(rawEmail) {
        return String(rawEmail || '').trim().toLowerCase();
    }
    normalizeRecoveryId(rawRecoveryId) {
        return String(rawRecoveryId || '').trim();
    }
    normalizeResetToken(rawResetToken) {
        return String(rawResetToken || '').trim();
    }
    normalizeCode(rawCode) {
        return String(rawCode || '')
            .replace(/\D/g, '')
            .slice(0, 6);
    }
    buildUserFullName(usuario) {
        const nombres = String(usuario.usuNombres || '').trim();
        const apellidos = String(usuario.usuApellidos || '').trim();
        return `${nombres} ${apellidos}`.trim() || 'usuario';
    }
    maskEmail(email) {
        const [localPart, domain] = String(email || '').split('@');
        if (!localPart || !domain) {
            return email;
        }
        const visibleLocalPart = localPart.slice(0, 2);
        return `${visibleLocalPart}${'*'.repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
    }
    generateNumericCode() {
        return String((0, node_crypto_1.randomInt)(0, 1000000)).padStart(6, '0');
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    getCodeTtlMinutes() {
        return this.parsePositiveInteger(process.env.PASSWORD_RECOVERY_CODE_TTL_MINUTES, 10);
    }
    getResetTokenTtlMinutes() {
        return this.parsePositiveInteger(process.env.PASSWORD_RECOVERY_RESET_TTL_MINUTES, 10);
    }
    getMaxAttempts() {
        return this.parsePositiveInteger(process.env.PASSWORD_RECOVERY_MAX_ATTEMPTS, 5);
    }
    getResendCooldownSeconds() {
        return this.parsePositiveInteger(process.env.PASSWORD_RECOVERY_RESEND_SECONDS, 60);
    }
    parsePositiveInteger(rawValue, fallback) {
        const parsedValue = Number(rawValue || fallback);
        if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
            return fallback;
        }
        return Math.floor(parsedValue);
    }
    shouldExposeDebugCode() {
        const explicitFlag = String(process.env.PASSWORD_RECOVERY_EXPOSE_DEBUG_CODE || '')
            .trim()
            .toLowerCase();
        if (explicitFlag) {
            return explicitFlag === 'true';
        }
        return String(process.env.NODE_ENV || 'development').trim() !== 'production';
    }
};
exports.PasswordRecoveryService = PasswordRecoveryService;
exports.PasswordRecoveryService = PasswordRecoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(PasswordRecoveryCode_1.PasswordRecoveryCode)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        PasswordRecoveryEmailService_1.PasswordRecoveryEmailService])
], PasswordRecoveryService);
//# sourceMappingURL=PasswordRecoveryService.js.map