import { Usuario } from './Usuario';
export declare class PasswordRecoveryCode {
    prcId: number;
    recoveryId: string;
    usuCedulaFk: number;
    usuCorreo: string;
    codeHash: string;
    resetTokenHash: string | null;
    attemptCount: number;
    maxAttempts: number;
    requestedAt: Date;
    expiresAt: Date;
    lastAttemptAt: Date | null;
    verifiedAt: Date | null;
    resetTokenExpiresAt: Date | null;
    consumedAt: Date | null;
    invalidatedAt: Date | null;
    usuario: Usuario;
}
