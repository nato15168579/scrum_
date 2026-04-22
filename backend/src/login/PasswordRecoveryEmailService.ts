import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface RecoveryEmailPayload {
  to: string;
  fullName: string;
  code: string;
  expiresInMinutes: number;
}

@Injectable()
export class PasswordRecoveryEmailService {
  private readonly logger = new Logger(PasswordRecoveryEmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private get smtpHost() {
    return String(process.env.SMTP_HOST || '').trim();
  }

  private get smtpUser() {
    return String(process.env.SMTP_USER || '').trim();
  }

  private get smtpPass() {
    return String(process.env.SMTP_PASS || '').trim();
  }

  private get smtpFrom() {
    return String(process.env.SMTP_FROM || '').trim();
  }

  private get smtpPort() {
    const port = Number(process.env.SMTP_PORT || 0);
    if (Number.isFinite(port) && port > 0) {
      return port;
    }

    return this.smtpSecure ? 465 : 587;
  }

  private get smtpSecure() {
    return String(process.env.SMTP_SECURE || 'false')
      .trim()
      .toLowerCase() === 'true';
  }

  private get allowConsoleFallback() {
    const explicitFlag = String(
      process.env.PASSWORD_RECOVERY_ALLOW_CONSOLE_FALLBACK || '',
    )
      .trim()
      .toLowerCase();

    if (explicitFlag) {
      return explicitFlag === 'true';
    }

    return String(process.env.NODE_ENV || 'development').trim() !== 'production';
  }

  async sendRecoveryCodeEmail(payload: RecoveryEmailPayload) {
    const normalizedTo = String(payload.to || '').trim().toLowerCase();

    if (!normalizedTo) {
      throw new ServiceUnavailableException(
        'No fue posible enviar el codigo de recuperacion.',
      );
    }

    if (!this.smtpHost || !this.smtpUser || !this.smtpPass) {
      if (!this.allowConsoleFallback) {
        throw new ServiceUnavailableException(
          'El servicio de correo no esta configurado.',
        );
      }

      this.logger.warn(
        `SMTP no configurado. Se registra el codigo temporal en consola para ${normalizedTo}.`,
      );
      this.logger.log(
        `[PasswordRecovery] Codigo para ${normalizedTo}: ${payload.code} (expira en ${payload.expiresInMinutes} minutos)`,
      );

      return {
        deliveryMode: 'console' as const,
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
    } catch (error) {
      this.logger.error(
        `Fallo el envio del correo de recuperacion a ${normalizedTo}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw this.mapEmailError(error);
    }

    return {
      deliveryMode: 'email' as const,
    };
  }

  private getTransporter() {
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

  private escapeHtml(value: string) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private mapEmailError(error: unknown) {
    const smtpError = error as {
      code?: string;
      responseCode?: number;
      message?: string;
    };

    if (smtpError?.code === 'EAUTH' || smtpError?.responseCode === 535) {
      return new ServiceUnavailableException(
        'No fue posible autenticar la cuenta de Gmail que envia el codigo. Verifica el correo remitente y la contrasena de aplicacion.',
      );
    }

    if (
      smtpError?.code === 'ETIMEDOUT' ||
      smtpError?.code === 'ESOCKET' ||
      smtpError?.code === 'ECONNECTION'
    ) {
      return new ServiceUnavailableException(
        'No fue posible conectar con el servidor de correo. Revisa la configuracion SMTP e intenta nuevamente.',
      );
    }

    return new ServiceUnavailableException(
      'No fue posible enviar el correo de recuperacion. Intenta nuevamente en unos minutos.',
    );
  }
}
