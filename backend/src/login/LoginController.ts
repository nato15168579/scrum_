/**
 * LoginController
 * ---------------
 * Controlador de autenticacion basica.
 *
 * Rutas:
 * - POST /auth/login
 * - POST /auth/send-recovery-code
 * - POST /auth/verify-code
 * - POST /auth/reset-password
 *
 * Nota de seguridad:
 * - En produccion, este modulo deberia emitir un token (JWT) o manejar sesion
 *   en servidor. Actualmente retorna datos del usuario para consumo del frontend.
 */
import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './LoginService';
import { PasswordRecoveryService } from './PasswordRecoveryService';

interface LoginRequestBody {
  cedula: string;
  pass: string;
}

interface PasswordRecoveryRequestBody {
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

@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginRequestBody) {
    return this.loginService.validarUsuario(body.cedula, body.pass);
  }

  @Post('send-recovery-code')
  async sendRecoveryCode(@Body() body: PasswordRecoveryRequestBody) {
    return this.passwordRecoveryService.requestRecoveryCode(body);
  }

  @Post('verify-code')
  async verifyCode(@Body() body: VerifyRecoveryCodeBody) {
    return this.passwordRecoveryService.verifyRecoveryCode(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordBody) {
    return this.passwordRecoveryService.resetPassword(body);
  }
}
