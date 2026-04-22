interface RecoveryEmailPayload {
    to: string;
    fullName: string;
    code: string;
    expiresInMinutes: number;
}
export declare class PasswordRecoveryEmailService {
    private readonly logger;
    private transporter;
    private get smtpHost();
    private get smtpUser();
    private get smtpPass();
    private get smtpFrom();
    private get smtpPort();
    private get smtpSecure();
    private get allowConsoleFallback();
    sendRecoveryCodeEmail(payload: RecoveryEmailPayload): Promise<{
        deliveryMode: "console";
    } | {
        deliveryMode: "email";
    }>;
    private getTransporter;
    private escapeHtml;
    private mapEmailError;
}
export {};
