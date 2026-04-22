"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PasswordRecoveryEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRecoveryEmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let PasswordRecoveryEmailService = PasswordRecoveryEmailService_1 = class PasswordRecoveryEmailService {
    constructor() {
        this.logger = new common_1.Logger(PasswordRecoveryEmailService_1.name);
        this.transporter = null;
    }
    get smtpHost() {
        return String(process.env.SMTP_HOST || '').trim();
    }
    get smtpUser() {
        return String(process.env.SMTP_USER || '').trim();
    }
    get smtpPass() {
        return String(process.env.SMTP_PASS || '').trim();
    }
    get smtpFrom() {
        return String(process.env.SMTP_FROM || '').trim();
    }
    get smtpPort() {
        const port = Number(process.env.SMTP_PORT || 0);
        if (Number.isFinite(port) && port > 0) {
            return port;
        }
        return this.smtpSecure ? 465 : 587;
    }
    get smtpSecure() {
        return String(process.env.SMTP_SECURE || 'false')
            .trim()
            .toLowerCase() === 'true';
    }
    get allowConsoleFallback() {
        const explicitFlag = String(process.env.PASSWORD_RECOVERY_ALLOW_CONSOLE_FALLBACK || '')
            .trim()
            .toLowerCase();
        if (explicitFlag) {
            return explicitFlag === 'true';
        }
        return String(process.env.NODE_ENV || 'development').trim() !== 'production';
    }
    async sendRecoveryCodeEmail(payload) {
        const normalizedTo = String(payload.to || '').trim().toLowerCase();
        if (!normalizedTo) {
            throw new common_1.ServiceUnavailableException('No fue posible enviar el codigo de recuperacion.');
        }
        if (!this.smtpHost || !this.smtpUser || !this.smtpPass) {
            if (!this.allowConsoleFallback) {
                throw new common_1.ServiceUnavailableException('El servicio de correo no esta configurado.');
            }
            this.logger.warn(`SMTP no configurado. Se registra el codigo temporal en consola para ${normalizedTo}.`);
            this.logger.log(`[PasswordRecovery] Codigo para ${normalizedTo}: ${payload.code} (expira en ${payload.expiresInMinutes} minutos)`);
            return {
                deliveryMode: 'console',
            };
        }
        const transporter = this.getTransporter();
        const fromAddress = this.smtpFrom || this.smtpUser;
        try {
            await transporter.sendMail({
                from: fromAddress,
                to: normalizedTo,
                subject: 'Codigo de recuperacion de contrasena',
                text: [
                    `Hola ${payload.fullName || 'usuario'},`,
                    '',
                    `Tu codigo de recuperacion es: ${payload.code}`,
                    `Este codigo vence en ${payload.expiresInMinutes} minutos.`,
                    '',
                    'Si no solicitaste este cambio, ignora este mensaje.',
                ].join('\n'),
                html: `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
            <p>Hola <strong>${this.escapeHtml(payload.fullName || 'usuario')}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contrasena.</p>
            <p style="margin: 24px 0;">
              <span style="display: inline-block; padding: 12px 18px; font-size: 24px; font-weight: 700; letter-spacing: 6px; background: #f3f4f6; border-radius: 12px;">
                ${this.escapeHtml(payload.code)}
              </span>
            </p>
            <p>Este codigo vence en <strong>${payload.expiresInMinutes} minutos</strong>.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Fallo el envio del correo de recuperacion a ${normalizedTo}.`, error instanceof Error ? error.stack : undefined);
            throw this.mapEmailError(error);
        }
        return {
            deliveryMode: 'email',
        };
    }
    getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: this.smtpHost,
                port: this.smtpPort,
                secure: this.smtpSecure,
                auth: {
                    user: this.smtpUser,
                    pass: this.smtpPass,
                },
            });
        }
        return this.transporter;
    }
    escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    mapEmailError(error) {
        const smtpError = error;
        if ((smtpError === null || smtpError === void 0 ? void 0 : smtpError.code) === 'EAUTH' || (smtpError === null || smtpError === void 0 ? void 0 : smtpError.responseCode) === 535) {
            return new common_1.ServiceUnavailableException('No fue posible autenticar la cuenta de Gmail que envia el codigo. Verifica el correo remitente y la contrasena de aplicacion.');
        }
        if ((smtpError === null || smtpError === void 0 ? void 0 : smtpError.code) === 'ETIMEDOUT' ||
            (smtpError === null || smtpError === void 0 ? void 0 : smtpError.code) === 'ESOCKET' ||
            (smtpError === null || smtpError === void 0 ? void 0 : smtpError.code) === 'ECONNECTION') {
            return new common_1.ServiceUnavailableException('No fue posible conectar con el servidor de correo. Revisa la configuracion SMTP e intenta nuevamente.');
        }
        return new common_1.ServiceUnavailableException('No fue posible enviar el correo de recuperacion. Intenta nuevamente en unos minutos.');
    }
};
exports.PasswordRecoveryEmailService = PasswordRecoveryEmailService;
exports.PasswordRecoveryEmailService = PasswordRecoveryEmailService = PasswordRecoveryEmailService_1 = __decorate([
    (0, common_1.Injectable)()
], PasswordRecoveryEmailService);
//# sourceMappingURL=PasswordRecoveryEmailService.js.map