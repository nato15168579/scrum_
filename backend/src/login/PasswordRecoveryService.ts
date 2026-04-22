import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PasswordRecoveryCode } from '../entities/PasswordRecoveryCode';
import { Usuario } from '../entities/Usuario';
import {
  PASSWORD_POLICY,
  PASSWORD_POLICY_HINTS,
  compareWithStoredPassword,
  hashPassword,
  validatePasswordPolicy,
} from './PasswordSecurity';
import { PasswordRecoveryEmailService } from './PasswordRecoveryEmailService';

interface RequestRecoveryBody {
  usu_cedula: string;
  usu_correo: string;
}

interface VerifyRecoveryCodeBody {
  usu_cedula: string;
  recovery_id: string;
  codigo: string;
}

interface ResetPasswordBody {
  usu_cedula: string;
  recovery_id: string;
  reset_token: string;
  new_password: string;
}

@Injectable()
export class PasswordRecoveryService {
  private ensureRecoveryTablePromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(PasswordRecoveryCode)
    private readonly recoveryRepo: Repository<PasswordRecoveryCode>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly emailService: PasswordRecoveryEmailService,
  ) {}

  async requestRecoveryCode(body: RequestRecoveryBody) {
    await this.ensureRecoveryTable();
    await this.expireStaleRecoveryRequests();

    const cedula = this.parseCedula(body?.usu_cedula);
    const correo = this.normalizeEmail(body?.usu_correo);

    if (!cedula) {
      throw new BadRequestException('Debes ingresar un numero de documento valido.');
    }

    if (!correo) {
      throw new BadRequestException('Debes ingresar el correo registrado.');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { usuCedula: cedula },
    });

    if (!usuario) {
      throw new NotFoundException('No existe un usuario con ese documento.');
    }

    if (usuario.usuEstado === 'Inactivo') {
      throw new BadRequestException('El usuario se encuentra inactivo.');
    }

    const correoRegistrado = this.normalizeEmail(usuario.usuCorreo);

    if (!correoRegistrado) {
      throw new BadRequestException(
        'El usuario no tiene un correo registrado para recuperar la contrasena.',
      );
    }

    if (correoRegistrado !== correo) {
      throw new BadRequestException(
        'El correo no coincide con el usuario registrado.',
      );
    }

    const resendCooldownSeconds = this.getResendCooldownSeconds();
    const latestRequest = await this.recoveryRepo.findOne({
      where: { usuCedulaFk: cedula },
      order: { requestedAt: 'DESC' },
    });

    if (latestRequest) {
      const secondsSinceLastRequest = Math.floor(
        (Date.now() - latestRequest.requestedAt.getTime()) / 1000,
      );

      if (secondsSinceLastRequest < resendCooldownSeconds) {
        throw new HttpException(
          `Espera ${resendCooldownSeconds - secondsSinceLastRequest} segundos antes de solicitar un nuevo codigo.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.invalidateActiveRequestsForUser(cedula);

    const code = this.generateNumericCode();
    const expiresInMinutes = this.getCodeTtlMinutes();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

    const requestEntity = this.recoveryRepo.create({
      recoveryId: randomUUID(),
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
        message:
          delivery.deliveryMode === 'email'
            ? 'Codigo enviado al correo registrado.'
            : 'Codigo generado. Revisa la consola del backend porque el correo SMTP no esta configurado.',
        recoveryId: requestEntity.recoveryId,
        maskedEmail: this.maskEmail(correoRegistrado),
        expiresAt: expiresAt.toISOString(),
        expiresInMinutes,
        resendAvailableAt: new Date(
          now.getTime() + resendCooldownSeconds * 1000,
        ).toISOString(),
        deliveryMode: delivery.deliveryMode,
        debugCode:
          delivery.deliveryMode === 'console' && this.shouldExposeDebugCode()
            ? code
            : undefined,
        debugLogLocation:
          delivery.deliveryMode === 'console'
            ? 'backend/run-backend.log'
            : undefined,
      };
    } catch (error) {
      requestEntity.invalidatedAt = new Date();
      await this.recoveryRepo.save(requestEntity);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'No fue posible enviar el codigo de recuperacion.',
      );
    }
  }

  async verifyRecoveryCode(body: VerifyRecoveryCodeBody) {
    await this.ensureRecoveryTable();
    await this.expireStaleRecoveryRequests();

    const cedula = this.parseCedula(body?.usu_cedula);
    const recoveryId = this.normalizeRecoveryId(body?.recovery_id);
    const codigo = this.normalizeCode(body?.codigo);

    if (!cedula || !recoveryId || !codigo) {
      throw new BadRequestException(
        'Documento, solicitud y codigo son obligatorios.',
      );
    }

    const requestEntity = await this.getRecoveryRequestOrThrow(cedula, recoveryId);
    this.assertRequestAvailableForCodeValidation(requestEntity);

    const now = new Date();

    if (requestEntity.expiresAt.getTime() <= now.getTime()) {
      requestEntity.invalidatedAt = now;
      await this.recoveryRepo.save(requestEntity);
      throw new BadRequestException('El codigo ya expiro. Solicita uno nuevo.');
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
        throw new BadRequestException(
          'Se alcanzo el maximo de intentos. Solicita un nuevo codigo.',
        );
      }

      throw new BadRequestException(
        `Codigo incorrecto. Te quedan ${requestEntity.maxAttempts - requestEntity.attemptCount} intentos.`,
      );
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenTtlMinutes = this.getResetTokenTtlMinutes();

    requestEntity.lastAttemptAt = now;
    requestEntity.verifiedAt = now;
    requestEntity.resetTokenHash = this.hashToken(resetToken);
    requestEntity.resetTokenExpiresAt = new Date(
      now.getTime() + resetTokenTtlMinutes * 60 * 1000,
    );
    await this.recoveryRepo.save(requestEntity);

    return {
      message: 'Codigo validado correctamente.',
      resetToken,
      resetExpiresAt: requestEntity.resetTokenExpiresAt.toISOString(),
      passwordPolicy: {
        ...PASSWORD_POLICY,
        hints: [...PASSWORD_POLICY_HINTS],
      },
    };
  }

  async resetPassword(body: ResetPasswordBody) {
    await this.ensureRecoveryTable();
    await this.expireStaleRecoveryRequests();

    const cedula = this.parseCedula(body?.usu_cedula);
    const recoveryId = this.normalizeRecoveryId(body?.recovery_id);
    const resetToken = this.normalizeResetToken(body?.reset_token);
    const newPassword = String(body?.new_password || '');

    if (!cedula || !recoveryId || !resetToken || !newPassword) {
      throw new BadRequestException(
        'Faltan datos para restablecer la contrasena.',
      );
    }

    const passwordValidation = validatePasswordPolicy(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(' '));
    }

    const requestEntity = await this.getRecoveryRequestOrThrow(cedula, recoveryId);
    this.assertRequestReadyForPasswordReset(requestEntity);

    const now = new Date();

    if (
      !requestEntity.resetTokenExpiresAt ||
      requestEntity.resetTokenExpiresAt.getTime() <= now.getTime()
    ) {
      requestEntity.invalidatedAt = now;
      await this.recoveryRepo.save(requestEntity);
      throw new BadRequestException(
        'La validacion expiro. Debes solicitar un nuevo codigo.',
      );
    }

    if (requestEntity.resetTokenHash !== this.hashToken(resetToken)) {
      throw new BadRequestException('La validacion final no es correcta.');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { usuCedula: cedula },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const samePassword = await compareWithStoredPassword(
      newPassword,
      usuario.usuContrasena,
    );

    if (samePassword) {
      throw new BadRequestException(
        'La nueva contrasena debe ser diferente a la actual.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuarioRepository = queryRunner.manager.getRepository(Usuario);
      const recoveryRepository =
        queryRunner.manager.getRepository(PasswordRecoveryCode);

      usuario.usuContrasena = await hashPassword(newPassword);
      await usuarioRepository.save(usuario);

      requestEntity.consumedAt = now;
      requestEntity.invalidatedAt = now;
      requestEntity.codeHash = '';
      requestEntity.resetTokenHash = null;
      requestEntity.resetTokenExpiresAt = null;
      await recoveryRepository.save(requestEntity);

      await recoveryRepository
        .createQueryBuilder()
        .update(PasswordRecoveryCode)
        .set({ invalidatedAt: now })
        .where('usu_cedula_fk = :cedula', { cedula })
        .andWhere('recovery_id != :recoveryId', { recoveryId })
        .andWhere('consumed_at IS NULL')
        .andWhere('invalidated_at IS NULL')
        .execute();

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      message: 'Contrasena actualizada correctamente.',
      invalidateClientSession: true,
      invalidatedPreviousCodes: true,
    };
  }

  private async ensureRecoveryTable() {
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

  private async expireStaleRecoveryRequests() {
    const now = new Date();

    await this.recoveryRepo
      .createQueryBuilder()
      .update(PasswordRecoveryCode)
      .set({ invalidatedAt: now })
      .where('expires_at <= :now', { now })
      .andWhere('consumed_at IS NULL')
      .andWhere('invalidated_at IS NULL')
      .execute();

    await this.recoveryRepo
      .createQueryBuilder()
      .update(PasswordRecoveryCode)
      .set({ invalidatedAt: now })
      .where('reset_token_expires_at IS NOT NULL')
      .andWhere('reset_token_expires_at <= :now', { now })
      .andWhere('consumed_at IS NULL')
      .andWhere('invalidated_at IS NULL')
      .execute();
  }

  private async invalidateActiveRequestsForUser(cedula: number) {
    await this.recoveryRepo
      .createQueryBuilder()
      .update(PasswordRecoveryCode)
      .set({ invalidatedAt: new Date() })
      .where('usu_cedula_fk = :cedula', { cedula })
      .andWhere('consumed_at IS NULL')
      .andWhere('invalidated_at IS NULL')
      .execute();
  }

  private async getRecoveryRequestOrThrow(cedula: number, recoveryId: string) {
    const requestEntity = await this.recoveryRepo.findOne({
      where: {
        recoveryId,
        usuCedulaFk: cedula,
      },
      order: { requestedAt: 'DESC' },
    });

    if (!requestEntity) {
      throw new NotFoundException(
        'La solicitud de recuperacion no existe o ya no esta disponible.',
      );
    }

    return requestEntity;
  }

  private assertRequestAvailableForCodeValidation(
    requestEntity: PasswordRecoveryCode,
  ) {
    if (requestEntity.consumedAt || requestEntity.invalidatedAt) {
      throw new BadRequestException(
        'La solicitud ya no esta disponible. Solicita un nuevo codigo.',
      );
    }

    if (requestEntity.attemptCount >= requestEntity.maxAttempts) {
      throw new BadRequestException(
        'La solicitud ya alcanzo el limite de intentos.',
      );
    }
  }

  private assertRequestReadyForPasswordReset(requestEntity: PasswordRecoveryCode) {
    if (requestEntity.consumedAt || requestEntity.invalidatedAt) {
      throw new BadRequestException(
        'La solicitud ya no esta disponible. Solicita un nuevo codigo.',
      );
    }

    if (!requestEntity.verifiedAt || !requestEntity.resetTokenHash) {
      throw new BadRequestException(
        'Debes validar el codigo antes de cambiar la contrasena.',
      );
    }
  }

  private parseCedula(rawCedula: string) {
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

  private normalizeEmail(rawEmail: string | null | undefined) {
    return String(rawEmail || '').trim().toLowerCase();
  }

  private normalizeRecoveryId(rawRecoveryId: string) {
    return String(rawRecoveryId || '').trim();
  }

  private normalizeResetToken(rawResetToken: string) {
    return String(rawResetToken || '').trim();
  }

  private normalizeCode(rawCode: string) {
    return String(rawCode || '')
      .replace(/\D/g, '')
      .slice(0, 6);
  }

  private buildUserFullName(usuario: Usuario) {
    const nombres = String(usuario.usuNombres || '').trim();
    const apellidos = String(usuario.usuApellidos || '').trim();
    return `${nombres} ${apellidos}`.trim() || 'usuario';
  }

  private maskEmail(email: string) {
    const [localPart, domain] = String(email || '').split('@');
    if (!localPart || !domain) {
      return email;
    }

    const visibleLocalPart = localPart.slice(0, 2);
    return `${visibleLocalPart}${'*'.repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
  }

  private generateNumericCode() {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getCodeTtlMinutes() {
    return this.parsePositiveInteger(
      process.env.PASSWORD_RECOVERY_CODE_TTL_MINUTES,
      10,
    );
  }

  private getResetTokenTtlMinutes() {
    return this.parsePositiveInteger(
      process.env.PASSWORD_RECOVERY_RESET_TTL_MINUTES,
      10,
    );
  }

  private getMaxAttempts() {
    return this.parsePositiveInteger(
      process.env.PASSWORD_RECOVERY_MAX_ATTEMPTS,
      5,
    );
  }

  private getResendCooldownSeconds() {
    return this.parsePositiveInteger(
      process.env.PASSWORD_RECOVERY_RESEND_SECONDS,
      60,
    );
  }

  private parsePositiveInteger(rawValue: string | undefined, fallback: number) {
    const parsedValue = Number(rawValue || fallback);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return fallback;
    }

    return Math.floor(parsedValue);
  }

  private shouldExposeDebugCode() {
    const explicitFlag = String(
      process.env.PASSWORD_RECOVERY_EXPOSE_DEBUG_CODE || '',
    )
      .trim()
      .toLowerCase();

    if (explicitFlag) {
      return explicitFlag === 'true';
    }

    return String(process.env.NODE_ENV || 'development').trim() !== 'production';
  }
}
