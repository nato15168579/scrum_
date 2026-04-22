import { DataSource, Repository } from 'typeorm';
import { PasswordRecoveryCode } from '../entities/PasswordRecoveryCode';
import { Usuario } from '../entities/Usuario';
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
export declare class PasswordRecoveryService {
    private readonly usuarioRepo;
    private readonly recoveryRepo;
    private readonly dataSource;
    private readonly emailService;
    private ensureRecoveryTablePromise;
    constructor(usuarioRepo: Repository<Usuario>, recoveryRepo: Repository<PasswordRecoveryCode>, dataSource: DataSource, emailService: PasswordRecoveryEmailService);
    requestRecoveryCode(body: RequestRecoveryBody): Promise<{
        message: string;
        recoveryId: string;
        maskedEmail: string;
        expiresAt: string;
        expiresInMinutes: number;
        resendAvailableAt: string;
        deliveryMode: "console" | "email";
        debugCode: string;
        debugLogLocation: string;
    }>;
    verifyRecoveryCode(body: VerifyRecoveryCodeBody): Promise<{
        message: string;
        resetToken: string;
        resetExpiresAt: string;
        passwordPolicy: {
            hints: ("Minimo 8 caracteres." | "Al menos una letra mayuscula." | "Al menos una letra minuscula." | "Al menos un numero." | "Al menos un caracter especial.")[];
            minLength: 8;
            requireLowercase: true;
            requireUppercase: true;
            requireNumber: true;
            requireSpecial: true;
        };
    }>;
    resetPassword(body: ResetPasswordBody): Promise<{
        message: string;
        invalidateClientSession: boolean;
        invalidatedPreviousCodes: boolean;
    }>;
    private ensureRecoveryTable;
    private expireStaleRecoveryRequests;
    private invalidateActiveRequestsForUser;
    private getRecoveryRequestOrThrow;
    private assertRequestAvailableForCodeValidation;
    private assertRequestReadyForPasswordReset;
    private parseCedula;
    private normalizeEmail;
    private normalizeRecoveryId;
    private normalizeResetToken;
    private normalizeCode;
    private buildUserFullName;
    private maskEmail;
    private generateNumericCode;
    private hashToken;
    private getCodeTtlMinutes;
    private getResetTokenTtlMinutes;
    private getMaxAttempts;
    private getResendCooldownSeconds;
    private parsePositiveInteger;
    private shouldExposeDebugCode;
}
export {};
