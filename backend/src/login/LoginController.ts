import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './LoginService';

interface LoginRequestBody {
  cedula: string;
  pass: string;
}

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async login(@Body() body: LoginRequestBody) {
    // se recibe la cédula y la contraseña desde el frontend
    return this.loginService.validarUsuario(body.cedula, body.pass);
  }
}
