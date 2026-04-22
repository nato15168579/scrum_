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
exports.PasswordRecoveryCode = void 0;
const typeorm_1 = require("typeorm");
const Usuario_1 = require("./Usuario");
let PasswordRecoveryCode = class PasswordRecoveryCode {
};
exports.PasswordRecoveryCode = PasswordRecoveryCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', name: 'prc_id' }),
    __metadata("design:type", Number)
], PasswordRecoveryCode.prototype, "prcId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'recovery_id',
        length: 64,
    }),
    __metadata("design:type", String)
], PasswordRecoveryCode.prototype, "recoveryId", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', {
        name: 'usu_cedula_fk',
    }),
    __metadata("design:type", Number)
], PasswordRecoveryCode.prototype, "usuCedulaFk", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'usu_correo',
        length: 100,
    }),
    __metadata("design:type", String)
], PasswordRecoveryCode.prototype, "usuCorreo", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'code_hash',
        length: 255,
    }),
    __metadata("design:type", String)
], PasswordRecoveryCode.prototype, "codeHash", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'reset_token_hash',
        length: 64,
        nullable: true,
    }),
    __metadata("design:type", String)
], PasswordRecoveryCode.prototype, "resetTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        name: 'attempt_count',
        default: () => '0',
    }),
    __metadata("design:type", Number)
], PasswordRecoveryCode.prototype, "attemptCount", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        name: 'max_attempts',
        default: () => '5',
    }),
    __metadata("design:type", Number)
], PasswordRecoveryCode.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'requested_at',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "requestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'expires_at',
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'last_attempt_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "lastAttemptAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'verified_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'reset_token_expires_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "resetTokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'consumed_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "consumedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', {
        name: 'invalidated_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PasswordRecoveryCode.prototype, "invalidatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)([{ name: 'usu_cedula_fk', referencedColumnName: 'usuCedula' }]),
    __metadata("design:type", Usuario_1.Usuario)
], PasswordRecoveryCode.prototype, "usuario", void 0);
exports.PasswordRecoveryCode = PasswordRecoveryCode = __decorate([
    (0, typeorm_1.Index)('uq_password_recovery_codes_recovery_id', ['recoveryId'], { unique: true }),
    (0, typeorm_1.Index)('idx_password_recovery_codes_user', ['usuCedulaFk'], {}),
    (0, typeorm_1.Index)('idx_password_recovery_codes_expires', ['expiresAt'], {}),
    (0, typeorm_1.Entity)('password_recovery_codes', { schema: 'pro_scrum' })
], PasswordRecoveryCode);
//# sourceMappingURL=PasswordRecoveryCode.js.map